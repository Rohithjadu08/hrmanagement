import { supabaseAdmin } from '../db/initDb.js';

export async function applyLeave(employeeId, data) {
  const { leave_type, start_date, end_date, reason, additional_notes } = data;
  
  // Calculate total days
  const start = new Date(start_date);
  const end = new Date(end_date);
  const diffTime = Math.abs(end - start);
  const total_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Prevent double-submit / overlapping leaves
  const { data: existingLeaves } = await supabaseAdmin
    .from('leave_requests')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('start_date', start_date)
    .eq('end_date', end_date);

  if (existingLeaves && existingLeaves.length > 0) {
    throw new Error('A leave request for these exact dates already exists.');
  }

  const { data: request, error } = await supabaseAdmin
    .from('leave_requests')
    .insert({
      employee_id: employeeId,
      leave_type,
      start_date,
      end_date,
      total_days,
      reason,
      additional_notes
    })
    .select()
    .single();

  if (error) throw error;

  // Notify HR
  // For simplicity, we create a notification for HR users
  const { data: hrUsers } = await supabaseAdmin.from('profiles').select('id').eq('role', 'hr');
  
  if (hrUsers) {
    const { data: employeeData } = await supabaseAdmin.from('profiles').select('full_name').eq('id', employeeId).single();
    const notifications = hrUsers.map(hr => ({
      user_id: hr.id,
      title: '📝 New Leave Request',
      message: `${employeeData?.full_name || 'An employee'} requested ${total_days} days of ${leave_type}.`,
      type: 'leave'
    }));
    await supabaseAdmin.from('notifications').insert(notifications);
  }

  return request;
}

export async function getEmployeeLeaves(employeeId) {
  const { data, error } = await supabaseAdmin
    .from('leave_requests')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllLeaves() {
  const { data, error } = await supabaseAdmin
    .from('leave_requests')
    .select(`
      *,
      profiles!leave_requests_employee_id_fkey(full_name, department)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function approveLeave(id, reviewerId) {
  const { data: request, error: fetchErr } = await supabaseAdmin
    .from('leave_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !request) throw new Error('NOT_FOUND');

  const { data, error } = await supabaseAdmin
    .from('leave_requests')
    .update({
      status: 'Approved',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Insert attendance records for the leave days
  const start = new Date(request.start_date);
  const end = new Date(request.end_date);
  const attendanceRecords = [];
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    attendanceRecords.push({
      employee_id: request.employee_id,
      date: dateStr,
      status: 'Leave'
    });
  }

  // We use upsert so if they somehow checked in, it overwrites or ignores based on unique constraint
  // Upsert by unique employee_id and date
  await supabaseAdmin.from('attendance').upsert(attendanceRecords, { onConflict: 'employee_id,date' });

  // Notify Employee
  await supabaseAdmin.from('notifications').insert({
    user_id: request.employee_id,
    title: '✅ Leave Approved',
    message: `Your ${request.leave_type} request for ${request.start_date} to ${request.end_date} has been approved.`,
    type: 'leave_response'
  });

  return data;
}

export async function rejectLeave(id, reviewerId, rejectionReason) {
  const { data: request, error: fetchErr } = await supabaseAdmin
    .from('leave_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !request) throw new Error('NOT_FOUND');

  const { data, error } = await supabaseAdmin
    .from('leave_requests')
    .update({
      status: 'Rejected',
      rejection_reason: rejectionReason,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Notify Employee
  await supabaseAdmin.from('notifications').insert({
    user_id: request.employee_id,
    title: '❌ Leave Rejected',
    message: `Your ${request.leave_type} request for ${request.start_date} to ${request.end_date} was rejected. Reason: ${rejectionReason}`,
    type: 'leave_response'
  });

  return data;
}
