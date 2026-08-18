import { useEffect, useState } from 'react'
import { api } from '../../shared/api/client'
import EmployeeDashboardLayout from '../../components/layout/EmployeeDashboardLayout'
import { useNavigate } from 'react-router-dom'
import { ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function EmployeeChatHistoryPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await api.chatConversations()
        setConversations(data.conversations || [])
      } catch (err: any) {
        setError(err.message || 'Failed to fetch conversations')
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [])

  const filteredConversations = conversations.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <EmployeeDashboardLayout title="Chat History" subtitle="Review your past conversations with the AI Assistant">
      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        {loading ? (
          <div className="text-center text-white/50 py-8">Loading...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center text-white/50 py-8">No conversations found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConversations.map(conv => (
              <div 
                key={conv.id} 
                onClick={() => nav(`/dashboard/chat?id=${conv.id}`)}
                className="group cursor-pointer relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.06] hover:border-indigo-500/30"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {conv.title || 'New Conversation'}
                    </h3>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {new Date(conv.updated_at).toLocaleDateString(undefined, { 
                        year: 'numeric', month: 'short', day: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </EmployeeDashboardLayout>
  )
}
