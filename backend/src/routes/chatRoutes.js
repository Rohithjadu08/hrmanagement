import express from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { RagService } from '../services/ragService.js'

const router = express.Router()

const messageSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().uuid().optional()
})

// Authentication middleware using JWT
router.use(async (req, res, next) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' })
  const { data: authData, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !authData?.user) return res.status(401).json({ error: 'UNAUTHORIZED' })
  req.user = authData.user
  next()
})

router.post('/message', async (req, res) => {
  const body = messageSchema.safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: 'INVALID_PAYLOAD' })

  const { message, conversationId } = body.data
  let convId = conversationId

  try {
    // 1. Ensure conversation exists
    if (!convId) {
      const { data: conv, error: convErr } = await supabaseAdmin
        .from('conversations')
        .insert({ user_id: req.user.id, title: message.substring(0, 30) + '...' })
        .select('id')
        .single()
      if (convErr) throw convErr
      convId = conv.id
    }

    // 2. Save user message
    await supabaseAdmin.from('messages').insert({
      conversation_id: convId,
      user_id: req.user.id,
      role: 'user',
      content: message
    })

    // 3. Ask RAG
    const ragResult = await RagService.askQuestion(message, req.user.id)

    // 4. Save assistant message
    await supabaseAdmin.from('messages').insert({
      conversation_id: convId,
      user_id: req.user.id,
      role: 'assistant',
      content: ragResult.answer,
      sources: ragResult.sources
    })

    return res.json({
      conversationId: convId,
      answer: ragResult.answer,
      sources: ragResult.sources
    })
  } catch (err) {
    console.error('Chat error:', err)
    return res.status(500).json({ error: 'CHAT_PROCESSING_FAILED' })
  }
})

router.get('/conversations', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('user_id', req.user.id)
    .order('updated_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json({ conversations: data })
})

export { router as chatRoutes }
