import { Link, useLocation } from 'react-router-dom'
import EmployeeDashboardLayout from './EmployeeDashboardLayout'
import Topbar from './Topbar'
import { useAuth } from '../../shared/AuthContext'
import {
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  ClockIcon,
  CalendarDaysIcon,
  SparklesIcon,
  LockClosedIcon,
  PaintBrushIcon,
  ArrowLeftIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

const settingsNav = [
  { name: 'Back to Dashboard', href: '/dashboard', icon: ArrowLeftIcon },
  { name: 'My Profile', href: '/dashboard/settings/profile', icon: UserIcon },
  { name: 'Account & Security', href: '/dashboard/settings/security', icon: ShieldCheckIcon },
  { name: 'Notifications', href: '/dashboard/settings/notifications', icon: BellIcon },
  { name: 'Attendance', href: '/dashboard/settings/attendance', icon: ClockIcon },
  { name: 'Leave', href: '/dashboard/settings/leaves', icon: CalendarDaysIcon },
  { name: 'AI Assistant', href: '/dashboard/settings/ai', icon: SparklesIcon },
  { name: 'Privacy', href: '/dashboard/settings/privacy', icon: LockClosedIcon },
  { name: 'Appearance', href: '/dashboard/settings/appearance', icon: PaintBrushIcon }
]

export default function EmployeeSettingsLayout({
  children,
  title
}: {
  children: React.ReactNode
  title: string
}) {
  const location = useLocation()
  const { logout } = useAuth()

  // We reuse the Employee side navigation concept but split it for settings.
  // We'll create a custom layout here to avoid deeply nested sidebars.

  const employeeNav = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Attendance', href: '/dashboard/attendance', icon: ClockIcon },
    { name: 'Leave Requests', href: '/dashboard/leaves', icon: CalendarDaysIcon },
    { name: 'Tasks', href: '/dashboard/tasks', icon: ClockIcon },
    { name: 'AI Assistant', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon },
  ]

  return (
    <div className="flex h-screen w-full bg-[#0A0A0B] font-sans text-[#F8FAFC]">
      
      {/* Primary Employee Sidebar */}
      <div className="w-64 flex flex-col bg-[#0B1020] border-r border-[#172033] h-full sticky top-0 hidden lg:flex">
        <div className="h-16 flex items-center px-6 border-b border-[#172033]">
          <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-lg">
            <span className="text-xl">🤖</span> HRX
          </div>
        </div>
        <div className="flex-1 py-4 px-3 flex flex-col gap-1">
          {employeeNav.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#94A3B8] hover:bg-[#111827] hover:text-[#F8FAFC] transition-colors"
            >
              <item.icon className="w-5 h-5 text-[#94A3B8]" />
              {item.name}
            </Link>
          ))}
        </div>
        <div className="p-3 border-t border-[#172033]">
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-500/10 text-indigo-400 transition-colors w-full text-left"
          >
            <PaintBrushIcon className="w-5 h-5 text-indigo-400" />
            Settings
          </Link>
        </div>
      </div>

      {/* Secondary Settings Sidebar */}
      <div className="w-64 border-r border-white/10 bg-[#0B1020]/50 overflow-y-auto hidden md:block">
        <div className="p-6 pb-2">
          <h2 className="text-lg font-bold">Settings</h2>
        </div>
        <div className="flex flex-col gap-1 p-3">
          {settingsNav.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-white/50'}`} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-4xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
