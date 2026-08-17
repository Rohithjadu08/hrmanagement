import { MagnifyingGlassIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { api } from '../../shared/api/client'

export default function Topbar() {
  const [userName, setUserName] = useState('HR Admin')

  useEffect(() => {
    api.me().then((res) => {
      if (res?.user?.name) {
        setUserName(res.user.name)
      }
    }).catch(() => {})
  }, [])

  return (
    <div className="h-16 bg-[#0B1020] border-b border-[#172033] flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h2 className="text-[#F8FAFC] font-semibold">Good evening, {userName.split(' ')[0]} 👋</h2>
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
        <button className="relative text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-1">
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
