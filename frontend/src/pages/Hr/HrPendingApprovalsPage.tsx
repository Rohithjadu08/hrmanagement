import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../shared/api/client'

type PendingEmployee = {
  id: string
  name: string
  email: string
  role: string
  department: string
  employeeId: string
  status: string
  requestedAt: number
}

export default function HrPendingApprovalsPage() {
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<PendingEmployee[]>([])
  const [declineReason, setDeclineReason] = useState<Record<string, string>>({})
  const [error, setError] = useState<string>('')

  async function refresh() {
    const res = await api.hrPendingEmployees()
    setEmployees(res?.employees || [])
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const me = await api.me()
        if (!active) return
        if (me?.user?.accountType !== 'HR') return nav('/login')
        await refresh()
      } catch {
        if (active) nav('/login')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [nav])

  async function onApprove(id: string) {
    setError('')
    try {
      await api.hrApprove(id)
      await refresh()
    } catch (e: any) {
      setError(e?.error || 'APPROVE_FAILED')
    }
  }

  async function onDecline(id: string) {
    setError('')
    try {
      await api.hrDecline(id, declineReason[id] || undefined)
      await refresh()
    } catch (e: any) {
      setError(e?.error || 'DECLINE_FAILED')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>

  return (
    <div className="min-h-screen px-4 py-10 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-offwhite">Pending Approvals</h1>
              <p className="mt-2 text-sm text-white/70">Approve or decline employee onboarding requests.</p>
            </div>
            <button
              className="rounded-xl bg-white/10 px-4 py-2 text-offwhite font-semibold hover:bg-white/20 transition"
              onClick={() => nav('/')}
            >
              Back to landing
            </button>
          </div>

          {error ? <div className="mt-4 text-sm text-rose-300">{error}</div> : null}

          <div className="mt-6 space-y-3">
            {employees.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                No pending employees.
              </div>
            ) : null}

            {employees.map((e) => (
              <div key={e.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-sm font-semibold text-offwhite">{e.name}</div>
                    <div className="text-sm text-white/70">{e.email}</div>
                    <div className="mt-2 text-sm text-white/70">
                      Role: {e.role} · Dept: {e.department} · Employee ID: {e.employeeId}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-xl bg-amber2 px-4 py-2 text-ink font-semibold hover:opacity-95 transition"
                      onClick={() => void onApprove(e.id)}
                    >
                      Approve
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex gap-2 flex-wrap items-center">
                  <input
                    value={declineReason[e.id] || ''}
                    onChange={(ev) => setDeclineReason((p) => ({ ...p, [e.id]: ev.target.value }))}
                    placeholder="Decline reason (optional)"
                    className="flex-1 min-w-[220px] rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-offwhite outline-none"
                  />
                  <button
                    className="rounded-xl bg-white/10 px-4 py-2 text-offwhite font-semibold hover:bg-white/20 transition"
                    onClick={() => void onDecline(e.id)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

