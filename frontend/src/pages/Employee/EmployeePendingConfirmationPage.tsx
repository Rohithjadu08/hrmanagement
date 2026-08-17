import { useLocation, useNavigate } from 'react-router-dom'

function PendingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-amber2">
      <path
        d="M12 8v4l2.5 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12a9 9 0 1 1-3.25-6.93"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M21 3v6h-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function EmployeePendingConfirmationPage() {
  const nav = useNavigate()
  const location = useLocation()
  const email = (location.state as any)?.email as string | undefined

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-start gap-4">
          <PendingIcon />
          <div>
            <h1 className="text-xl font-bold text-offwhite">Account created successfully!</h1>
            <p className="mt-2 text-sm text-white/70">
              Your access request is pending HR approval. Once approved, you’ll be able to log in using this email:
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-semibold text-white/60">Email</div>
          <div className="mt-1 break-all text-sm font-semibold text-offwhite">{email || '—'}</div>
        </div>

        <button
          className="mt-6 w-full rounded-xl bg-white/10 px-4 py-2.5 text-offwhite font-semibold hover:bg-white/20 transition"
          onClick={() => nav('/login', { replace: true })}
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}

