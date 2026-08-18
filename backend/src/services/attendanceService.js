import { supabaseAdmin } from '../db/initDb.js';

export async function checkIn(employeeId) {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if already checked in
  const { data: existing } = await supabaseAdmin
    .from('attendance')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('date', today)
    .single();

  if (existing) {
    throw new Error('ALREADY_CHECKED_IN');
  }

  const { data, error } = await supabaseAdmin
    .from('attendance')
    .insert({
      employee_id: employeeId,
      date: today,
      check_in: new Date().toISOString(),
      status: 'Present' // Simplification: in a real app, determine 'Late' based on time
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function checkOut(employeeId) {
  const today = new Date().toISOString().split('T')[0];
  
  // Get today's record
  const { data: record, error: fetchErr } = await supabaseAdmin
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('date', today)
    .single();

  if (fetchErr || !record) {
    throw new Error('NOT_CHECKED_IN');
  }

  if (record.check_out) {
    throw new Error('ALREADY_CHECKED_OUT');
  }

  const { data, error } = await supabaseAdmin
    .from('attendance')
    .update({ check_out: new Date().toISOString() })
    .eq('id', record.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getEmployeeAttendance(employeeId) {
  const { data, error } = await supabaseAdmin
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllAttendance(date) {
  let query = supabaseAdmin
    .from('attendance')
    .select(`
      *,
      profiles!attendance_employee_id_fkey(full_name, department)
    `)
    .order('date', { ascending: false });

  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getAttendanceStats(date) {
  let query = supabaseAdmin
    .from('attendance')
    .select('status');

  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query;
  if (error) throw error;

  const stats = { Present: 0, Late: 0, Absent: 0, Leave: 0, Holiday: 0 };
  data.forEach(row => {
    if (stats[row.status] !== undefined) {
      stats[row.status]++;
    }
  });
  
  // also get total employees
  const { count } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employee');
  
  return { ...stats, Total: count || 0 };
}
