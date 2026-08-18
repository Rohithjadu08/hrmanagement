import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../shared/api/client'

type AccountType = 'EMPLOYEE' | 'HR'

type LoginForm = {
  email: string
  password: string
  accountType: AccountType
}

export default function LoginPage() {
  const nav = useNavigate()
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
    accountType: 'EMPLOYEE'
  })
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    setStatus('')
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('')
    try {
      const res = await api.login({
        email: form.email,
        password: form.password,
        accountType: form.accountType
      })

      if (res?.status === 'APPROVED') {
        if (form.accountType === 'HR') return nav('/hr')
        return nav('/dashboard')
      }

      if (res?.status === 'PENDING') {
        return nav('/pending')
      }

      if (res?.status === 'DECLINED') {
        return nav('/declined')
      }

      // default
      nav('/')
    } catch (err: any) {
      if (err?.status === 504 || err?.message?.includes('504')) {
        setStatus('Backend server is unreachable. Please ensure the backend is running.')
      } else {
        setStatus(err?.error || 'LOGIN_FAILED')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-bold text-offwhite">Login</h1>
        <p className="mt-1 text-sm text-white/60">Use your account credentials.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-white/70">Account type</span>
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-offwhite outline-none"
              value={form.accountType}
              onChange={(e) => setForm((p) => ({ ...p, accountType: e.target.value as AccountType }))}
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="HR">HR</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-white/70">Email</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-offwhite outline-none"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              type="email"
              autoComplete="off"
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
              minLength={1}
            />
          </label>

          {status ? <div className="text-sm text-rose-300">{status}</div> : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-amber2 px-4 py-2.5 text-ink font-semibold hover:opacity-95 transition"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-sm text-white/60">
          No account?{' '}
          <Link className="text-amber2 hover:underline" to="/signup">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}

