import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const mainNav = [
  { name: 'Dashboard', href: '/hr', icon: HomeIcon },
  { name: 'Employees', href: '/hr/employees', icon: UsersIcon },
  { name: 'Attendance', href: '/hr/attendance', icon: ClipboardDocumentListIcon },
  { name: 'Leave Requests', href: '/hr/leaves', icon: ClipboardDocumentCheckIcon },
  { name: 'Approvals', href: '/hr', icon: ClipboardDocumentCheckIcon },
  { name: 'Tasks', href: '/hr/tasks', icon: ClipboardDocumentListIcon },
  { name: 'AI Assistant', href: '/hr/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Knowledge Base', href: '/hr/knowledge', icon: BookOpenIcon },
  { name: 'Notifications', href: '/hr/notifications', icon: BellIcon }
]

export default function Sidebar() {
  const location = useLocation()
  const nav = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    nav('/login')
  }

  return (
    <div className="w-64 flex flex-col bg-[#0B1020] border-r border-[#172033] h-full h-screen sticky top-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[#172033]">
        <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-lg">
          <span className="text-xl">🤖</span> HRX
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {mainNav.map((item) => {
          const isActive = location.pathname === item.href && item.href !== '#'
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#6366F1]/10 text-[#6366F1]'
                  : 'text-[#94A3B8] hover:bg-[#111827] hover:text-[#F8FAFC]'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[#6366F1]' : 'text-[#94A3B8]'}`} />
              {item.name}
            </Link>
          )
        })}
      </div>

      {/* Footer Nav */}
      <div className="p-3 border-t border-[#172033] flex flex-col gap-1">
        <Link
          to="#"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#94A3B8] hover:bg-[#111827] hover:text-[#F8FAFC] transition-colors"
        >
          <Cog6ToothIcon className="w-5 h-5 text-[#94A3B8]" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors w-full"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-[#EF4444]" />
          Logout
        </button>
      </div>
    </div>
  )
}
