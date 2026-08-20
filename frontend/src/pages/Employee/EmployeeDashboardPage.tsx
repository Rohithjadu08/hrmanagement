import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../shared/api/client'
import EmployeeDashboardLayout from '../../components/layout/EmployeeDashboardLayout'
import { CheckCircleIcon, ClockIcon, ChatBubbleLeftEllipsisIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { CardSkeleton } from '../../components/ui/Skeleton'

export default function EmployeeDashboardPage() {
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string>('')
  const [stats, setStats] = useState({ todo: 0, inProgress: 0, completed: 0 })
  const [attendanceToday, setAttendanceToday] = useState<any>(null)
  const [leaveBalance, setLeaveBalance] = useState({ pending: 0, approved: 0 })

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const me = await api.me()
        if (!active) return
        const u = me?.user
        if (u?.accountType !== 'EMPLOYEE') return nav('/login')
        if (u?.status !== 'APPROVED') {
          if (u?.status === 'PENDING') return nav('/pending')
          if (u?.status === 'DECLINED') return nav('/declined')
          return nav('/login')
        }
        setUserName(u?.name || '')

        // Fetch task stats
        const { tasks } = await api.employeeTasks()
        if (active && tasks) {
          setStats({
            todo: tasks.filter((t: any) => t.status === 'todo').length,
            inProgress: tasks.filter((t: any) => t.status === 'in_progress').length,
            completed: tasks.filter((t: any) => t.status === 'completed').length,
          })
        }

        // Fetch attendance for today
        const attendanceData = await api.employeeGetAttendance().catch(() => [])
        if (active && attendanceData.length > 0) {
          const todayStr = new Date().toISOString().split('T')[0]
          const today = attendanceData.find((a: any) => a.date === todayStr)
          setAttendanceToday(today || null)
        }

        // Fetch leave balance
        const leavesData = await api.employeeGetLeaves().catch(() => [])
        if (active && leavesData.length > 0) {
          setLeaveBalance({
            pending: leavesData.filter((l: any) => l.status === 'Pending').length,
            approved: leavesData.filter((l: any) => l.status === 'Approved').length,
          })
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
    return (
      <EmployeeDashboardLayout title="Welcome back!" subtitle="Loading your workspace...">
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </EmployeeDashboardLayout>
    )
  }

  return (
    <EmployeeDashboardLayout 
      title="Welcome back!" 
      subtitle={`Here's a quick overview of your workspace, ${userName}.`}
    >
      
      {/* Quick Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/[0.07]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/50">To Do</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.todo}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
              <ClockIcon className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/[0.07]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/50">In Progress</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.inProgress}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
              <ClockIcon className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/[0.07]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/50">Completed</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.completed}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/dashboard/attendance" className="relative overflow-hidden rounded-2xl border border-white/10 bg-indigo-500/10 p-6 transition-all hover:bg-indigo-500/20 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-300">Today's Attendance</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {attendanceToday 
                  ? (attendanceToday.check_out ? 'Checked Out' : 'Checked In') 
                  : 'Not Checked In'}
              </p>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-indigo-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
          </div>
        </Link>
        <Link to="/dashboard/leaves" className="relative overflow-hidden rounded-2xl border border-white/10 bg-fuchsia-500/10 p-6 transition-all hover:bg-fuchsia-500/20 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-fuchsia-300">Leaves</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {leaveBalance.pending} Pending / {leaveBalance.approved} Approved
              </p>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-fuchsia-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <h2 className="mb-4 text-lg font-bold text-white tracking-tight">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/dashboard/tasks" className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-indigo-500/10 to-transparent p-6 transition-all hover:border-indigo-500/30">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20">
                <CheckSquare className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">View My Tasks</h3>
              <p className="mt-1 text-sm text-white/50">See all tasks assigned to you by HR and update their progress.</p>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-white/20 transition-all group-hover:translate-x-1 group-hover:text-indigo-400" />
          </div>
        </Link>

        <Link to="/dashboard/chat" className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-fuchsia-500/10 to-transparent p-6 transition-all hover:border-fuchsia-500/30">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-500/20">
                <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-fuchsia-400" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">Ask AI Assistant</h3>
              <p className="mt-1 text-sm text-white/50">Have a question about HR policies? Chat with our AI to get instant answers.</p>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-white/20 transition-all group-hover:translate-x-1 group-hover:text-fuchsia-400" />
          </div>
        </Link>
      </div>

    </EmployeeDashboardLayout>
  )
}

function CheckSquare(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"></polyline>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
  )
}
