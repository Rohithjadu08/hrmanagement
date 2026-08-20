import { Navigate } from 'react-router-dom'
import { useAuth } from '../shared/AuthContext'

export function RequireAuth({
  children,
  allowedAccountType
}: {
  children: React.ReactNode
  allowedAccountType?: 'EMPLOYEE' | 'HR'
}) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white/50">Loading session…</div>
  
  if (!user) return <Navigate to="/login" replace />

  if (allowedAccountType && user.accountType !== allowedAccountType) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
