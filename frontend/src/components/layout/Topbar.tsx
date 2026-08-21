import { MagnifyingGlassIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/AuthContext'

export default function Topbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const userName = user?.name || 'HR Admin'

  const hour = new Date().getHours()
  let timeOfDay = 'morning'
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon'
  else if (hour >= 17) timeOfDay = 'evening'

  return (
    <div className="h-16 bg-[#0B1020] border-b border-[#172033] flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h2 className="text-[#F8FAFC] font-semibold">Good {timeOfDay}, {userName.split(' ')[0]} 👋</h2>
        <p className="text-xs text-[#94A3B8]">Here's what's happening with your organization today.</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <MagnifyingGlassIcon className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 bg-[#111827] border border-[#172033] rounded-lg pl-9 pr-4 py-1.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none focus:border-[#6366F1] transition-colors"
          />
        </div>

        {/* Notifications */}
        <button 
          onClick={() => {
            if (user?.accountType === 'HR') {
              navigate('/hr/notifications')
            } else {
              alert('No new notifications')
            }
          }}
          className="relative text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-1"
        >
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-[#0B1020]"></span>
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors pl-2 border-l border-[#172033]">
          <UserCircleIcon className="w-7 h-7" />
          <span className="text-sm font-medium hidden sm:block">{userName}</span>
        </button>
      </div>
    </div>
  )
}
