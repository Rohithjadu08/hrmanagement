import { useEffect, useState } from 'react'
import { api } from '../../shared/api/client'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadNotifications() {
    try {
      const res = await api.hrNotifications()
      setNotifications(res?.notifications || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  async function markAllAsRead() {
    await api.hrReadNotifications()
    loadNotifications()
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Notifications</h1>
          <button 
            onClick={markAllAsRead}
            className="text-sm font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors"
          >
            Mark all as read
          </button>
        </div>

        <div className="bg-[#111827] border border-[#172033] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[#94A3B8]">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#0B1020] flex items-center justify-center mb-4">
                <BellIcon className="w-8 h-8 text-[#94A3B8]" />
              </div>
              <h3 className="text-lg font-medium text-[#F8FAFC]">No notifications</h3>
              <p className="text-sm text-[#94A3B8] mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-[#172033]">
              {notifications.map(n => (
                <div key={n.id} className={`p-4 flex gap-4 hover:bg-[#172033]/50 transition-colors ${!n.is_read ? 'bg-[#0B1020]' : ''}`}>
                  <div className="mt-1">
                    <CheckCircleIcon className={`w-6 h-6 ${!n.is_read ? 'text-[#6366F1]' : 'text-[#94A3B8]'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-sm ${!n.is_read ? 'font-semibold text-[#F8FAFC]' : 'font-medium text-[#94A3B8]'}`}>
                        {n.title}
                      </h4>
                      <span className="text-xs text-[#94A3B8]">{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    <p className={`text-sm mt-1 ${!n.is_read ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'}`}>
                      {n.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
