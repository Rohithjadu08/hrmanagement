import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../shared/api/client'

export default function EmployeePendingPage() {
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [declineReason, setDeclineReason] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const me = await api.me()
        if (!active) return
        const user = me?.user
        if (user?.accountType !== 'EMPLOYEE') return nav('/login')
        if (user?.status === 'APPROVED') return nav('/dashboard')
        if (user?.status === 'DECLINED') {
          setDeclineReason(user?.declineReason || 'DECLINED')
          return
        }
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>
  }

  if (declineReason) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-xl font-bold text-offwhite">Your request was declined</h1>
          <p className="mt-3 text-sm text-white/70">Reason: {declineReason}</p>
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-bold text-offwhite">Awaiting HR approval</h1>
        <p className="mt-3 text-sm text-white/70">
          Your account is pending. HR will review your details. Once approved, you’ll be able to access the dashboard.
        </p>
        <div className="mt-6 text-sm text-white/60">Tip: Ask HR to approve you from “Pending Approvals”.</div>
        <button
          className="mt-6 w-full rounded-xl bg-white/10 px-4 py-2.5 text-offwhite font-semibold hover:bg-white/20 transition"
          onClick={() => nav('/login')}
        >
          Go to login
        </button>
      </div>
    </div>
  )
}

