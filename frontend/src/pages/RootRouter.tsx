import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../shared/api/client'

export function RequireAuth({
  children,
  allowedAccountType
}: {
  children: React.ReactNode
  allowedAccountType?: 'EMPLOYEE' | 'HR'
}) {
  const [state, setState] = useState<'loading' | 'ok' | 'unauth'>('loading')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const me = await api.me()
        if (!active) return
        const u = me?.user
        if (allowedAccountType && u?.accountType !== allowedAccountType) {
          setState('unauth')
          return
        }
        setUser(u)
        setState('ok')
      } catch {
        if (!active) return
        setState('unauth')
      }
    })()
    return () => {
      active = false
    }
  }, [allowedAccountType])

  if (state === 'loading') return <div className="min-h-screen flex items-center justify-center">Loading…</div>
  if (state === 'unauth') return <Navigate to="/login" replace />

  return <>{children}</>
}

