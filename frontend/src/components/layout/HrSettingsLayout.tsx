import { Link, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import {
  UserIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ClockIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  BellIcon,
  SparklesIcon,
  ShieldCheckIcon,
  DocumentMagnifyingGlassIcon,
  ServerIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

const settingsNav = [
  { name: 'Overview', href: '/hr/settings', icon: ArrowLeftIcon },
  { name: 'My Profile', href: '/hr/settings/profile', icon: UserIcon },
  { name: 'Organization', href: '/hr/settings/organization', icon: BuildingOfficeIcon },
  { name: 'Employees', href: '/hr/settings/employees', icon: UsersIcon },
  { name: 'Attendance', href: '/hr/settings/attendance', icon: ClockIcon },
  { name: 'Leave Management', href: '/hr/settings/leaves', icon: CalendarDaysIcon },
  { name: 'Task Management', href: '/hr/settings/tasks', icon: ClipboardDocumentCheckIcon },
  { name: 'Notifications', href: '/hr/settings/notifications', icon: BellIcon },
  { name: 'AI & RAG', href: '/hr/settings/ai', icon: SparklesIcon },
  { name: 'Security', href: '/hr/settings/security', icon: ShieldCheckIcon },
  { name: 'Audit Logs', href: '/hr/settings/audit-logs', icon: DocumentMagnifyingGlassIcon },
  { name: 'System', href: '/hr/settings/system', icon: ServerIcon }
]

export default function HrSettingsLayout({
  children,
  title
}: {
  children: React.ReactNode
  title: string
}) {
  const location = useLocation()

  return (
    <div className="flex h-screen w-full bg-[#0A0A0B] font-sans text-[#F8FAFC]">
      <Sidebar />
      
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
