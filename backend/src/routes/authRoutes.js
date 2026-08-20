import express from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { createClient } from '@supabase/supabase-js'
import { notifyHRNewSignup } from '../services/emailService.js'

const router = express.Router()

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  department: z.string().min(1),
  employeeId: z.string().min(1),
  password: z.string().min(8)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  accountType: z.enum(['EMPLOYEE', 'HR']).optional().default('EMPLOYEE')
})

function setAuthCookie(res, accessToken) {
  // Supabase issues short-lived access tokens; cookie keeps it for backend verification.
  res.cookie('token', accessToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true, // required when frontend and backend are on different domains
    path: '/',
    maxAge: 1000 * 60 * 60 * 8
  })
}

router.post('/signup', async (req, res) => {
  const body = signupSchema.safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: 'INVALID_PAYLOAD' })

  const { name, email, role, department, employeeId, password } = body.data

  try {
    // Create Supabase auth user via Admin API to bypass email confirmation and validation
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        account_type: role.toLowerCase() === 'hr' ? 'hr' : 'employee'
      }
    })

    if (error) {
      if (String(error.message || '').toLowerCase().includes('already')) {
        return res.status(409).json({ error: 'EMAIL_ALREADY_EXISTS' })
      }
      return res.status(500).json({ error: error.message })
    }

    const userId = data?.user?.id
    if (!userId) return res.status(500).json({ error: 'SIGNUP_FAILED_NO_USER' })

    // Insert matching employee profile row (status pending)
    const { error: insertErr } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        full_name: name,
        email,
        role: role.toLowerCase() === 'hr' ? 'hr' : 'employee',
        department,
        employee_id: employeeId,
        approval_status: 'pending'
      })

    if (insertErr) return res.status(500).json({ error: insertErr.message })

    // Try to notify HR, but don't fail the whole signup if email fails
    try {
      await notifyHRNewSignup(name, email, department, role)
    } catch (emailErr) {
      console.error('Failed to send HR notification email:', emailErr.message)
    }

    // Create a short-lived session by signing in immediately with email/password
    const tempClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    })
    const { data: signInData, error: signInErr } = await tempClient.auth.signInWithPassword({
      email,
      password
    })

    if (!signInErr && signInData?.session?.access_token) {
      setAuthCookie(res, signInData.session.access_token)
    }

    return res.status(201).json({ status: 'PENDING' })
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'SIGNUP_FAILED' })
  }
})

router.post('/login', async (req, res) => {
  const body = loginSchema.safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: 'INVALID_PAYLOAD' })

  const { email, password } = body.data

  // Sign in via a fresh client so we don't mutate the global admin client
  const tempClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  })

  const { data: signInData, error: signInErr } = await tempClient.auth.signInWithPassword({
    email,
    password
  })

  if (signInErr || !signInData?.session?.access_token) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS' })
  }

  const accessToken = signInData.session.access_token

  // Lookup profile status with service role to enforce current behavior
  const { data: userRow, error: rowErr } = await supabaseAdmin
    .from('profiles')
    .select('approval_status')
    .eq('email', email)
    .maybeSingle()

  if (rowErr) return res.status(500).json({ error: rowErr.message })
  if (!userRow) return res.status(401).json({ error: 'INVALID_CREDENTIALS' })

  if (userRow.approval_status !== 'approved') {
    return res.status(200).json({ status: userRow.approval_status.toUpperCase() })
  }

  setAuthCookie(res, accessToken)
  return res.json({ status: userRow.approval_status.toUpperCase() })
})

router.get('/me', async (req, res) => {
  try {
    const accessToken = req.cookies?.token
    if (!accessToken) return res.status(401).json({ error: 'UNAUTHENTICATED' })

    const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(accessToken)
    if (authErr || !authData?.user?.id) return res.status(401).json({ error: 'UNAUTHENTICATED' })

    const { data: userRow, error: rowErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (rowErr) return res.status(500).json({ error: rowErr.message })
    if (!userRow) return res.status(401).json({ error: 'UNAUTHENTICATED' })

    // Keep response shape expected by frontend (snake_case -> camelCase)
    const user = {
      ...userRow,
      name: userRow.full_name,
      employeeId: userRow.employee_id,
      accountType: userRow.role.toUpperCase(),
      status: userRow.approval_status.toUpperCase()
    }

    return res.json({ user })
  } catch {
    return res.status(401).json({ error: 'UNAUTHENTICATED' })
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/'
  })
  return res.json({ ok: true })
})

export { router as authRouter }
