import HrSettingsLayout from '../../../components/layout/HrSettingsLayout'
import { Link } from 'react-router-dom'
import {
  BuildingOfficeIcon,
  UsersIcon,
  ClockIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  BellIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const settingsModules = [
  { name: 'Organization', description: 'Manage company details, working hours, and time zones.', icon: BuildingOfficeIcon, href: '/hr/settings/organization' },
  { name: 'Employees', description: 'Configure employee onboarding and management rules.', icon: UsersIcon, href: '/hr/settings/employees' },
  { name: 'Attendance', description: 'Set late thresholds and attendance tracking policies.', icon: ClockIcon, href: '/hr/settings/attendance' },
  { name: 'Leaves', description: 'Create and manage leave types and allowances.', icon: CalendarDaysIcon, href: '/hr/settings/leaves' },
  { name: 'Tasks', description: 'Configure default priorities and task workflows.', icon: ClipboardDocumentCheckIcon, href: '/hr/settings/tasks' },
  { name: 'Notifications', description: 'Set up global email and in-app notification alerts.', icon: BellIcon, href: '/hr/settings/notifications' },
  { name: 'AI & RAG', description: 'Monitor AI assistant status and system health.', icon: SparklesIcon, href: '/hr/settings/ai' },
  { name: 'Security', description: 'Manage authentication rules and security policies.', icon: ShieldCheckIcon, href: '/hr/settings/security' }
]

export default function HrSettingsOverview() {
  return (
    <HrSettingsLayout title="Settings Overview">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Settings Overview</h1>
        <p className="text-white/50 mb-8">Manage the global configuration for the Reckon HR platform.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsModules.map((module) => (
            <Link
              key={module.name}
              to={module.href}
              className="flex flex-col p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <module.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{module.name}</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {module.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </HrSettingsLayout>
  )
}
