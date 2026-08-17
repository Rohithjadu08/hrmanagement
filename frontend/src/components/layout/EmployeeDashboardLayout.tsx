import EmployeeSidebar from './EmployeeSidebar'
import Topbar from './Topbar'

interface EmployeeDashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function EmployeeDashboardLayout({ children, title, subtitle }: EmployeeDashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0B]">
      {/* Sidebar - Fixed */}
      <EmployeeSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar - Fixed at top of main area */}
        <Topbar />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-8 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
            </div>
            
            <div className="relative">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
