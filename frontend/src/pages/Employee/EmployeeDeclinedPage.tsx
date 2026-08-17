import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../shared/api/client'

export default function EmployeeDeclinedPage() {
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState<string>('DECLINED')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const me = await api.me()
        if (!active) return
        const u = me?.user
        if (u?.accountType !== 'EMPLOYEE') return nav('/login')
        if (u?.status === 'APPROVED') return nav('/dashboard')
        if (u?.status === 'PENDING') return nav('/pending')
        setReason(u?.declineReason || 'DECLINED')
      } catch {
        nav('/login')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [nav])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-bold text-offwhite">Your request was declined</h1>
        <p className="mt-3 text-sm text-white/70">Reason: {reason}</p>
        <button
          className="mt-6 w-full rounded-xl bg-white/10 px-4 py-2.5 text-offwhite font-semibold hover:bg-white/20 transition"
          onClick={() => nav('/login')}
        >
          Back to login
        </button>
      </div>
    </div>
  )
}

