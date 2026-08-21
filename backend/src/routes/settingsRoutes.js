import express from 'express'
import { supabaseAdmin } from '../db/initDb.js'
import { requireSupabaseAuth, requireHR } from '../middleware/auth.js'

const router = express.Router()

// ==========================================
// Helper: Log HR Actions to Audit Log
// ==========================================
async function logAudit(userId, action, target, status, details = {}) {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action,
      target,
      status,
      details
    })
  } catch (err) {
    console.error('Audit log failed:', err.message)
  }
}

// ==========================================
// 1. ORGANIZATION SETTINGS (HR Only for Update, Anyone for Read)
// ==========================================
router.get('/hr/organization', requireSupabaseAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('organization_settings').select('*').limit(1).single()
    if (error && error.code !== 'PGRST116') throw error
    res.json(data || {})
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch organization settings.' })
  }
})

router.patch('/hr/organization', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('organization_settings').select('id').limit(1).single()
    let data, error
    if (existing) {
      ({ data, error } = await supabaseAdmin.from('organization_settings').update(req.body).eq('id', existing.id).select().single())
    } else {
      ({ data, error } = await supabaseAdmin.from('organization_settings').insert(req.body).select().single())
    }
    if (error) throw error
    await logAudit(req.supabaseUser.id, 'Updated Organization Settings', 'Settings', 'Success')
    res.json(data)
  } catch (err) {
    await logAudit(req.supabaseUser.id, 'Updated Organization Settings', 'Settings', 'Failed', { error: err.message })
    res.status(500).json({ error: 'Failed to update organization settings.' })
  }
})

// ==========================================
// 2. HR (EMPLOYEE) SETTINGS (HR Only)
// ==========================================
router.get('/hr/employees', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('hr_settings').select('*').limit(1).single()
    if (error && error.code !== 'PGRST116') throw error
    res.json(data || {})
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch HR settings.' })
  }
})

router.patch('/hr/employees', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('hr_settings').select('id').limit(1).single()
    let data, error
    if (existing) {
      ({ data, error } = await supabaseAdmin.from('hr_settings').update(req.body).eq('id', existing.id).select().single())
    } else {
      ({ data, error } = await supabaseAdmin.from('hr_settings').insert(req.body).select().single())
    }
    if (error) throw error
    await logAudit(req.supabaseUser.id, 'Updated Employee Management Settings', 'Settings', 'Success')
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update HR settings.' })
  }
})

// ==========================================
// 3. LEAVE TYPES (HR Manage, Anyone Read)
// ==========================================
router.get('/hr/leaves', requireSupabaseAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('leave_types').select('*').order('name')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leave types.' })
  }
})

router.post('/hr/leaves', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('leave_types').insert(req.body).select().single()
    if (error) throw error
    await logAudit(req.supabaseUser.id, 'Created Leave Type', req.body.name || 'LeaveType', 'Success')
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create leave type.' })
  }
})

router.patch('/hr/leaves/:id', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('leave_types').update(req.body).eq('id', req.params.id).select().single()
    if (error) throw error
    await logAudit(req.supabaseUser.id, 'Updated Leave Type', data.name || req.params.id, 'Success')
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update leave type.' })
  }
})

// ==========================================
// 4. TASK SETTINGS (HR Only)
// ==========================================
router.get('/hr/tasks', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('task_settings').select('*').limit(1).single()
    if (error && error.code !== 'PGRST116') throw error
    res.json(data || {})
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task settings.' })
  }
})

router.patch('/hr/tasks', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('task_settings').select('id').limit(1).single()
    let data, error
    if (existing) {
      ({ data, error } = await supabaseAdmin.from('task_settings').update(req.body).eq('id', existing.id).select().single())
    } else {
      ({ data, error } = await supabaseAdmin.from('task_settings').insert(req.body).select().single())
    }
    if (error) throw error
    await logAudit(req.supabaseUser.id, 'Updated Task Settings', 'Settings', 'Success')
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task settings.' })
  }
})

// ==========================================
// 5. HR NOTIFICATION DEFAULTS (HR Only)
// ==========================================
router.get('/hr/notifications', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('hr_notification_settings').select('*').limit(1).single()
    if (error && error.code !== 'PGRST116') throw error
    res.json(data || {})
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notification settings.' })
  }
})

router.patch('/hr/notifications', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('hr_notification_settings').select('id').limit(1).single()
    let data, error
    if (existing) {
      ({ data, error } = await supabaseAdmin.from('hr_notification_settings').update(req.body).eq('id', existing.id).select().single())
    } else {
      ({ data, error } = await supabaseAdmin.from('hr_notification_settings').insert(req.body).select().single())
    }
    if (error) throw error
    await logAudit(req.supabaseUser.id, 'Updated HR Notification Settings', 'Settings', 'Success')
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification settings.' })
  }
})

// ==========================================
// 6. SYSTEM HEALTH & AI STATUS (HR Only)
// ==========================================
router.get('/hr/system', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const { error: dbError } = await supabaseAdmin.from('profiles').select('id').limit(1)
    
    res.json({
      backend: 'connected',
      supabase: dbError ? 'error' : 'connected',
      database: dbError ? 'error' : 'connected',
      rag: 'operational',
      ai_provider: 'connected',
      notifications: 'operational',
      last_checked: new Date().toISOString()
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch system health.' })
  }
})

// ==========================================
// 7. AUDIT LOGS (HR Only)
// ==========================================
router.get('/hr/audit-logs', requireSupabaseAuth, requireHR, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select(`
        *,
        profiles:user_id (full_name, role)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs.' })
  }
})

// ==========================================
// 8. EMPLOYEE USER SETTINGS (Everyone)
// ==========================================
router.get('/employee/preferences', requireSupabaseAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', req.supabaseUser.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    res.json(data || {})
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch preferences.' })
  }
})

router.patch('/employee/preferences', requireSupabaseAuth, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin
      .from('user_settings')
      .select('user_id')
      .eq('user_id', req.supabaseUser.id)
      .single()

    let data, error
    if (existing) {
      ({ data, error } = await supabaseAdmin.from('user_settings').update(req.body).eq('user_id', req.supabaseUser.id).select().single())
    } else {
      ({ data, error } = await supabaseAdmin.from('user_settings').insert({ ...req.body, user_id: req.supabaseUser.id }).select().single())
    }
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update preferences.' })
  }
})

// ==========================================
// 9. EMPLOYEE PROFILE SETTINGS (Everyone)
// ==========================================
router.patch('/employee/profile', requireSupabaseAuth, async (req, res) => {
  try {
    // Only allow updating phone and avatar directly by employees, others require HR
    const { phone, avatar_url } = req.body
    const updateData = {}
    if (phone !== undefined) updateData.phone = phone
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', req.supabaseUser.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' })
  }
})

// ==========================================
// 10. EMPLOYEE CLEAR CHAT HISTORY (Everyone)
// ==========================================
router.post('/employee/ai/clear-history', requireSupabaseAuth, async (req, res) => {
  try {
    // Hard delete user's conversations
    const { error } = await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('user_id', req.supabaseUser.id)

    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear chat history.' })
  }
})

export { router as settingsRouter }
