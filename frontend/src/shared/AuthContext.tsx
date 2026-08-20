import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api/client'

type User = {
  id: string
  name: string
  email: string
  accountType: 'EMPLOYEE' | 'HR'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  employeeId?: string
  department?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    setIsLoading(true)
    try {
      const res = await api.me()
      setUser(res?.user || null)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const logout = async () => {
    try {
      await api.logout()
    } catch {
      // ignore
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
