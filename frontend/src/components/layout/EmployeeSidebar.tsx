import { Link, useLocation } from 'react-router-dom'
import { Squares2X2Icon, ClipboardDocumentCheckIcon, ChatBubbleLeftEllipsisIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { api } from '../../shared/api/client'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'

import { ClockIcon, CalendarDaysIcon, ClockIcon as HistoryIcon } from '@heroicons/react/24/outline'

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Squares2X2Icon },
  { name: 'Attendance', path: '/dashboard/attendance', icon: ClockIcon },
  { name: 'Leaves', path: '/dashboard/leaves', icon: CalendarDaysIcon },
  { name: 'My Tasks', path: '/dashboard/tasks', icon: ClipboardDocumentCheckIcon },
  { name: 'AI Assistant', path: '/dashboard/chat', icon: ChatBubbleLeftEllipsisIcon },
  { name: 'Chat History', path: '/dashboard/chat/history', icon: HistoryIcon },
]

export default function EmployeeSidebar() {
  const location = useLocation()
  const nav = useNavigate()

  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    nav('/login')
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r border-white/5 bg-gray-950 px-4 py-6">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
          <span className="text-lg font-bold text-white">R</span>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Reckon<span className="text-indigo-400">HR</span></span>
      </div>

      <div className="mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-white/40">
        Employee Portal
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-white/40 group-hover:text-white/60'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer (Logout) */}
      <div className="mt-auto border-t border-white/5 pt-4">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-red-400"
        >
          <ArrowRightStartOnRectangleIcon className="h-5 w-5 text-white/40 group-hover:text-red-400" />
          Logout
        </button>
      </div>
    </div>
  )
}
