import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, API_BASE } from '../../shared/api/client'

export default function SignupPage() {
  const nav = useNavigate()
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)


  const [form, setForm] = useState({
    name: '',
    role: 'Engineering',
    department: '',
    employeeId: '',
    password: ''
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setStatus('')

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => {
      controller.abort()
    }, 12000)

    try {
      // Use fetch directly so we can apply a timeout.
      // (api.signup uses fetch without a timeout, which can otherwise feel like a hang.)
      const payload = {
        ...form,
        email: form.employeeId // Use work email (employeeId) as the auth email
      }

      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      const text = await res.text()
      const data = text ? (() => {
        try {
          return JSON.parse(text)
        } catch {
          return text
        }
      })() : null

      if (!res.ok) {
        let msg = (data && typeof data === 'object' && 'error' in data && (data as any).error) || res.statusText
        
        // If msg is still empty, it's likely a proxy error (e.g., backend is not running and Vite returns HTML)
        if (!msg) {
          msg = typeof data === 'string' && data.includes('<html') 
            ? 'Backend server is unreachable. Please ensure the backend is running.' 
            : 'SIGNUP_FAILED'
        }
        throw new Error(msg)
      }

      nav('/pending-confirmation', { replace: true, state: { email: form.email } })
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setStatus('Signup timed out. Please try again.')
      } else {
        setStatus(err?.message || 'Signup failed, please try again.')
      }
    } finally {
      window.clearTimeout(timeoutId)
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-bold text-offwhite">Employee signup</h1>
        <p className="mt-1 text-sm text-white/60">Create your account. HR approval is required.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-white/70">Full name</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-offwhite outline-none"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </label>



          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-white/70">Role</span>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-offwhite outline-none"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-white/70">Department</span>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-offwhite outline-none"
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-white/70">Work Email (Employee ID)</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-offwhite outline-none"
              value={form.employeeId}
              onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
              type="email"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-white/70">Password</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-offwhite outline-none"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>

          {status ? <div className="text-sm text-rose-300">{status}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber2 px-4 py-2.5 text-ink font-semibold hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>

        </form>

        <div className="mt-4 text-sm text-white/60">
          Already have an account?{' '}
          <Link className="text-amber2 hover:underline" to="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

