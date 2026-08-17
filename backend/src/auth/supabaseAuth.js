import { supabaseAdmin } from '../../config/supabaseClient.js'

const COOKIE_NAME = 'token'

export async function getSupabaseUserFromRequest(req) {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) return { error: 'UNAUTHORIZED' }

  // Verify JWT using Supabase Auth (service role / admin client)
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error) return { error: 'UNAUTHORIZED' }
  return { user: data?.user }
}

export function requireSupabaseAuth(req, res, next) {
  getSupabaseUserFromRequest(req)
    .then(({ user, error }) => {
      if (error || !user) return res.status(401).json({ error: 'UNAUTHORIZED' })
      req.supabaseUser = user
      next()
    })
    .catch(() => res.status(401).json({ error: 'UNAUTHORIZED' }))
}

