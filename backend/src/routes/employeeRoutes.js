import express from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()

// Middleware to require Employee role
const requireEmployee = async (req, res, next) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' })
  
  const { data: authData, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !authData?.user) return res.status(401).json({ error: 'UNAUTHORIZED' })

  // Verify employee role
  if (authData.user.user_metadata?.account_type !== 'employee') {
    return res.status(403).json({ error: 'FORBIDDEN' })
  }

  req.user = authData.user
  next()
}

router.get('/tasks', requireEmployee, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('assignee_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Fetch creators manually to avoid PostgREST foreign key join issues
    const creatorIds = [...new Set(data.map(t => t.created_by))]
    let creators = {}
    if (creatorIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', creatorIds)
      
      profiles?.forEach(p => {
        creators[p.id] = p
      })
    }

    const tasksWithCreator = data.map(t => ({
      ...t,
      creator: creators[t.created_by] || null
    }))

    res.json({ tasks: tasksWithCreator })
  } catch (err) {
    console.error('Error fetching employee tasks:', err)
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
  }
})

const updateTaskSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'completed', 'overdue'])
})

router.patch('/tasks/:id', requireEmployee, async (req, res) => {
  const body = updateTaskSchema.safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: 'INVALID_PAYLOAD' })

  try {
    const { id } = req.params

    // First ensure the task belongs to the user
    const { data: existingTask, error: fetchErr } = await supabaseAdmin
      .from('tasks')
      .select('id')
      .eq('id', id)
      .eq('assignee_id', req.user.id)
      .single()

    if (fetchErr || !existingTask) {
      return res.status(404).json({ error: 'Task not found or unauthorized' })
    }

    let updateData = { status: body.data.status }
    if (body.data.status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    } else {
      updateData.completed_at = null
    }

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    res.json({ task: data })
  } catch (err) {
    console.error('Error updating task:', err)
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
  }
})

router.post('/tasks/:id/submit', requireEmployee, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params
    const notes = req.body.notes || ''

    // Ensure the task belongs to the user
    const { data: existingTask, error: fetchErr } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('assignee_id', req.user.id)
      .single()

    if (fetchErr || !existingTask) {
      return res.status(404).json({ error: 'Task not found or unauthorized' })
    }

    let fileUrl = null
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop()
      const fileName = `${id}_${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
        .from('task_files')
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype })

      if (uploadErr) {
        console.error('Upload error:', uploadErr)
        return res.status(500).json({ error: 'Failed to upload file' })
      }
      
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('task_files')
        .getPublicUrl(fileName)
        
      fileUrl = publicUrlData.publicUrl
    }

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        submission_file_url: fileUrl,
        submission_notes: notes,
        hr_approval_status: 'pending',
        hr_feedback: null
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    // Notify HR
    if (existingTask.created_by) {
      await supabaseAdmin.from('notifications').insert({
        user_id: existingTask.created_by,
        title: '✅ Task Submitted',
        message: `Employee submitted task: "${existingTask.title}" and is pending your review.`,
        type: 'task_review'
      })
    }

    res.json({ task: data })
  } catch (err) {
    console.error('Error submitting task:', err)
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
  }
})

export { router as employeeRoutes }
