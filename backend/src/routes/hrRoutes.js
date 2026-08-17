import express from 'express'
import { ApprovalService } from '../services/approvalService.js'
import { requireSupabaseAuth } from '../auth/supabaseAuth.js'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabaseClient.js'

import { sendApprovalEmail } from '../services/emailService.js'
import { RagService } from '../services/ragService.js'
import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()

router.use(requireSupabaseAuth)


async function getEmployeeEmail(employeeId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('email')
    .eq('id', employeeId)
    .maybeSingle()

  if (error) return null
  return data?.email || null
}


async function sendEmailBestEffort({ toEmail, status, reason }) {
  try {
    if (!toEmail) return
    await sendApprovalEmail(toEmail, status, reason)
  } catch (err) {
    console.error('EMAIL_SEND_FAILED', {
      toEmail,
      status,
      reason,
      message: err?.message,
      stack: err?.stack
    })
  }
}

function requireHR(req, res, next) {
  // req.supabaseUser is available from requireSupabaseAuth
  // We enforce HR role via profiles.role.
  const userId = req.supabaseUser?.id
  if (!userId) return res.status(401).json({ error: 'UNAUTHORIZED' })

  ;(async () => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (error || !data) return res.status(403).json({ error: 'FORBIDDEN' })
    if (data.role !== 'hr') return res.status(403).json({ error: 'FORBIDDEN' })
    next()
  })().catch(() => res.status(403).json({ error: 'FORBIDDEN' }))
}

// Required API (match spec)
router.get('/pending-employees', requireHR, async (_req, res) => {
  const list = await ApprovalService.listPending()
  res.json({ employees: list })
})


router.patch('/approve/:employeeId', async (req, res) => {
  const ok = await ApprovalService.approveEmployee({
    userId: req.params.employeeId,
    reviewerId: req.supabaseUser.id
  })


  if (!ok) return res.status(404).json({ error: 'NOT_FOUND_OR_NOT_PENDING' })

  const toEmail = await getEmployeeEmail(req.params.employeeId)
  await sendEmailBestEffort({ toEmail, status: 'APPROVED' })

  return res.json({ ok: true })
})

router.patch('/decline/:employeeId', async (req, res) => {
  const body = z.object({ declineReason: z.string().optional() }).safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: 'INVALID_PAYLOAD' })

  const ok = await ApprovalService.declineEmployee({
    userId: req.params.employeeId,
    reviewerId: req.supabaseUser.id,
    reason: body.data.declineReason
  })


  if (!ok) return res.status(404).json({ error: 'NOT_FOUND_OR_NOT_PENDING' })

  const toEmail = await getEmployeeEmail(req.params.employeeId)
  await sendEmailBestEffort({ toEmail, status: 'DECLINED', reason: body.data.declineReason })

  return res.json({ ok: true })
})

// Backwards-compatible routes (existing frontend may already call these)
router.get('/approvals', async (_req, res) => {
  const list = await ApprovalService.listPending()
  res.json({ pending: list })
})

const approveSchema = z.object({ reviewerId: z.string().optional() })
const declineSchema = z.object({ reason: z.string().optional(), reviewerId: z.string().optional() })

router.post('/approvals/:userId/approve', async (req, res) => {
  const body = approveSchema.safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: 'INVALID_PAYLOAD' })

  const ok = await ApprovalService.approveEmployee({
    userId: req.params.userId,
    reviewerId: req.supabaseUser.id
  })


  if (!ok) return res.status(404).json({ error: 'NOT_FOUND_OR_NOT_PENDING' })

  const toEmail = await getEmployeeEmail(req.params.userId)
  await sendEmailBestEffort({ toEmail, status: 'APPROVED' })

  return res.json({ ok: true })
})

router.post('/approvals/:userId/decline', async (req, res) => {
  const body = declineSchema.safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: 'INVALID_PAYLOAD' })

  const ok = await ApprovalService.declineEmployee({
    userId: req.params.userId,
    reviewerId: req.supabaseUser.id,
    reason: body.data.reason
  })


  if (!ok) return res.status(404).json({ error: 'NOT_FOUND_OR_NOT_PENDING' })

  const toEmail = await getEmployeeEmail(req.params.userId)
  await sendEmailBestEffort({ toEmail, status: 'DECLINED', reason: body.data.reason })

  return res.json({ ok: true })
})

router.post('/upload', requireHR, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'NO_FILE' })
  const result = await RagService.processDocument(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
    req.supabaseUser.id
  )
  if (!result.success) return res.status(500).json({ error: result.error })
  res.json({ ok: true, documentId: result.documentId })
})

router.get('/stats', requireHR, async (req, res) => {
  try {
    const [{ count: totalEmployees }, { count: pendingApprovals }, { count: documentsCount }] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employee'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employee').eq('approval_status', 'pending'),
      supabaseAdmin.from('documents').select('*', { count: 'exact', head: true })
    ]);

    res.json({
      totalEmployees: totalEmployees || 0,
      pendingApprovals: pendingApprovals || 0,
      totalDocuments: documentsCount || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/documents', requireHR, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      if (error.code === '42P01') {
         return res.json({ documents: [] });
      }
      throw error;
    }
    res.json({ documents: data || [] });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/employees', requireHR, async (req, res) => {
  const { data, error } = await supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json({ employees: data || [] })
})

router.get('/tasks', requireHR, async (req, res) => {
  const { data, error } = await supabaseAdmin.from('tasks').select('*').order('created_at', { ascending: false })
  if (error && error.code === '42P01') return res.json({ tasks: [] })
  if (error) return res.status(500).json({ error: error.message })
  
  const assigneeIds = [...new Set(data.filter(t => t.assignee_id).map(t => t.assignee_id))]
  let assignees = {}
  if (assigneeIds.length > 0) {
    const { data: profiles } = await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', assigneeIds)
    profiles?.forEach(p => { assignees[p.id] = p })
  }

  const tasksWithAssignee = data.map(t => ({
    ...t,
    assignee: t.assignee_id ? assignees[t.assignee_id] || null : null
  }))

  res.json({ tasks: tasksWithAssignee })
})

router.post('/tasks', requireHR, async (req, res) => {
  const { title, description, assignee_id, priority, due_date, category, notes } = req.body
  const { data, error } = await supabaseAdmin.from('tasks').insert({
    title, 
    description, 
    assignee_id: assignee_id || null, 
    priority, 
    due_date: due_date || null,
    category: category || null,
    notes: notes || null,
    created_by: req.supabaseUser.id
  }).select().single()
  
  if (error) return res.status(500).json({ error: error.message })
  
  if (data && assignee_id) {
    const formattedDate = due_date ? new Date(due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
    await supabaseAdmin.from('notifications').insert({
      user_id: assignee_id,
      title: '📋 New Task Assigned',
      message: `HR assigned you a new task: "${title}". ${formattedDate ? `Due on: ${formattedDate}.` : ''}`,
      type: 'task'
    })
  }
  
  res.json({ ok: true, task: data })
})

router.patch('/tasks/:id', requireHR, async (req, res) => {
  const { status } = req.body
  const { error } = await supabaseAdmin.from('tasks').update({ status }).eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

router.post('/tasks/:id/review', requireHR, async (req, res) => {
  const { hr_approval_status, hr_feedback } = req.body
  
  const { data: task, error: fetchErr } = await supabaseAdmin.from('tasks').select('*').eq('id', req.params.id).single()
  if (fetchErr || !task) return res.status(404).json({ error: 'Task not found' })

  const updateData = { hr_approval_status, hr_feedback }
  
  // If rejected, set status back to in_progress so employee can fix it
  if (hr_approval_status === 'rejected') {
    updateData.status = 'in_progress'
    updateData.completed_at = null
  }

  const { error } = await supabaseAdmin.from('tasks').update(updateData).eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })

  if (task.assignee_id) {
    const statusText = hr_approval_status === 'approved' ? '✅ Approved' : '❌ Rejected'
    await supabaseAdmin.from('notifications').insert({
      user_id: task.assignee_id,
      title: `Task Review: ${statusText}`,
      message: `HR has ${hr_approval_status} your submission for task: "${task.title}". ${hr_feedback ? `Feedback: ${hr_feedback}` : ''}`,
      type: 'task_review'
    })
  }

  res.json({ ok: true })
})

router.get('/notifications', requireHR, async (req, res) => {
  const { data, error } = await supabaseAdmin.from('notifications').select('*').eq('user_id', req.supabaseUser.id).order('created_at', { ascending: false })
  if (error && error.code === '42P01') return res.json({ notifications: [] })
  if (error) return res.status(500).json({ error: error.message })
  res.json({ notifications: data || [] })
})

router.patch('/notifications/read', requireHR, async (req, res) => {
  const { error } = await supabaseAdmin.from('notifications').update({ is_read: true }).eq('user_id', req.supabaseUser.id).eq('is_read', false)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

export { router as hrRouter }





