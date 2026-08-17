import { supabaseAdmin } from '../../config/supabaseClient.js'

export const ApprovalService = {
  async listPending() {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'employee')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map((r) => ({
      ...r,
      name: r.full_name,
      employeeId: r.employee_id,
      requestedAt: r.created_at,
      status: r.approval_status.toUpperCase(),
      accountType: 'EMPLOYEE'
    }))
  },

  async listByStatus({ status }) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'employee')
      .eq('approval_status', status.toLowerCase())
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map((r) => ({
      ...r,
      name: r.full_name,
      employeeId: r.employee_id,
      requestedAt: r.created_at,
      status: r.approval_status.toUpperCase(),
      accountType: 'EMPLOYEE'
    }))
  },

  async approveEmployee({ userId, reviewerId }) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        approval_status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('role', 'employee')
      .eq('approval_status', 'pending')
      .select('id')

    if (error) throw error
    return Boolean(data && data.length > 0)
  },

  async declineEmployee({ userId, reviewerId, reason }) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        approval_status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('role', 'employee')
      .eq('approval_status', 'pending')
      .select('id')

    if (error) throw error
    return Boolean(data && data.length > 0)
  }
}
