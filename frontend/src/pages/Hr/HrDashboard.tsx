import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../shared/api/client'
import DashboardLayout from '../../components/layout/DashboardLayout'
import {
  UsersIcon,
  DocumentCheckIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { CardSkeleton } from '../../components/ui/Skeleton'

type PendingEmployee = {
  id: string
  name: string
  email: string
  role: string
  department: string
  employeeId: string
  status: string
  requestedAt: number
}

export default function HrDashboard() {
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<PendingEmployee[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [stats, setStats] = useState({ totalEmployees: 0, pendingApprovals: 0, totalDocuments: 0 })
  const [documents, setDocuments] = useState<any[]>([])
  const [declineReason, setDeclineReason] = useState<Record<string, string>>({})
  const [error, setError] = useState<string>('')

  async function refresh() {
    try {
      const [empRes, statsRes, docsRes, tasksRes] = await Promise.all([
        api.hrPendingEmployees(),
        api.hrStats(),
        api.hrDocuments(),
        api.hrTasks()
      ])
      setEmployees(empRes?.employees || [])
      setStats(statsRes || { totalEmployees: 0, pendingApprovals: 0, totalDocuments: 0 })
      setDocuments(docsRes?.documents || [])
      setTasks(tasksRes?.tasks || [])
    } catch (e) {
      console.error('Failed to refresh dashboard data:', e)
    }
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const me = await api.me()
        if (!active) return
        if (me?.user?.accountType !== 'HR') return nav('/login')
        await refresh()
      } catch {
        if (active) nav('/login')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [nav])

  async function onApprove(id: string) {
    setError('')
    try {
      await api.hrApprove(id)
      await refresh()
    } catch (e: any) {
      setError(e?.error || 'APPROVE_FAILED')
    }
  }

  async function onDecline(id: string) {
    setError('')
    try {
      await api.hrDecline(id, declineReason[id] || undefined)
      await refresh()
    } catch (e: any) {
      setError(e?.error || 'DECLINE_FAILED')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="space-y-8">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111827] to-[#172033] p-6 rounded-2xl border border-[#172033]">
          <div>
            <h1 className="text-2xl font-bold text-[#F8FAFC]">HR ADMIN PANEL</h1>
            <p className="mt-1 text-sm text-[#94A3B8]">Monitor your workforce, tasks, approvals, and AI knowledge system from one place.</p>
          </div>
          <button onClick={() => nav('/hr/chat')} className="flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-[#6366F1]/20 whitespace-nowrap">
            🤖 Ask HR AI
          </button>
        </div>

        {/* STATISTICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111827] border border-[#172033] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#6366F1]/10 text-[#6366F1] rounded-lg"><UsersIcon className="w-5 h-5" /></div>
              <h3 className="text-[#94A3B8] text-sm font-medium">Total Employees</h3>
            </div>
            <div className="text-3xl font-bold text-[#F8FAFC]">{stats.totalEmployees}</div>
            <p className="text-xs text-[#22C55E] mt-2">Active</p>
          </div>

          <div className="bg-[#111827] border border-[#172033] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#F59E0B]/10 text-[#F59E0B] rounded-lg"><DocumentCheckIcon className="w-5 h-5" /></div>
              <h3 className="text-[#94A3B8] text-sm font-medium">Pending Approvals</h3>
            </div>
            <div className="text-3xl font-bold text-[#F8FAFC]">{stats.pendingApprovals}</div>
            <p className="text-xs text-[#F59E0B] mt-2">{stats.pendingApprovals > 0 ? 'Needs attention' : 'All caught up'}</p>
          </div>

          <div className="bg-[#111827] border border-[#172033] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#EF4444]/10 text-[#EF4444] rounded-lg"><ClipboardDocumentListIcon className="w-5 h-5" /></div>
              <h3 className="text-[#94A3B8] text-sm font-medium">Active Tasks</h3>
            </div>
            <div className="text-3xl font-bold text-[#F8FAFC]">{tasks.filter(t => t.status !== 'completed').length}</div>
            <p className="text-xs text-[#94A3B8] mt-2">{tasks.length === 0 ? 'No tasks assigned' : 'Tasks in progress'}</p>
          </div>

          <div className="bg-[#111827] border border-[#172033] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#22C55E]/10 text-[#22C55E] rounded-lg"><BookOpenIcon className="w-5 h-5" /></div>
              <h3 className="text-[#94A3B8] text-sm font-medium">Knowledge Base</h3>
            </div>
            <div className="text-3xl font-bold text-[#F8FAFC]">{stats.totalDocuments}</div>
            <p className="text-xs text-[#22C55E] mt-2">Indexed documents</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Approvals & Tasks */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* PENDING APPROVALS */}
            <div className="bg-[#111827] border border-[#172033] rounded-2xl flex flex-col">
              <div className="p-5 border-b border-[#172033] flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#F8FAFC]">Pending Approvals</h2>
                <button onClick={() => nav('/hr/employees')} className="text-sm text-[#6366F1] hover:text-[#F8FAFC] transition-colors">View All &rarr;</button>
              </div>
              
              <div className="p-5 flex-1">
                {error && <div className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] rounded-lg text-sm">{error}</div>}
                
                {employees.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <span className="text-4xl mb-3">🎉</span>
                    <h3 className="text-lg font-medium text-[#F8FAFC]">You're all caught up!</h3>
                    <p className="text-sm text-[#94A3B8] mt-1">There are no employee approval requests waiting for review.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {employees.map((e) => (
                      <div key={e.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#172033] bg-[#0B1020]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#172033] flex items-center justify-center text-[#F8FAFC] font-semibold">
                            {e.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#F8FAFC]">{e.name}</div>
                            <div className="text-xs text-[#94A3B8]">{e.role} • {e.department}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Decline reason..."
                            className="bg-[#111827] border border-[#172033] text-sm text-[#F8FAFC] px-3 py-1.5 rounded-lg outline-none focus:border-[#6366F1] w-32 md:w-auto"
                            value={declineReason[e.id] || ''}
                            onChange={(ev) => setDeclineReason(p => ({ ...p, [e.id]: ev.target.value }))}
                          />
                          <button onClick={() => onDecline(e.id)} className="px-3 py-1.5 text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors">Reject</button>
                          <button onClick={() => onApprove(e.id)} className="px-3 py-1.5 text-sm font-medium bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 rounded-lg transition-colors">Approve</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RECENT TASKS */}
            <div className="bg-[#111827] border border-[#172033] rounded-2xl flex flex-col">
              <div className="p-5 border-b border-[#172033] flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#F8FAFC]">Recent Tasks</h2>
                <button onClick={() => nav('/hr/tasks')} className="text-sm text-[#6366F1] hover:text-[#F8FAFC] transition-colors">View All &rarr;</button>
              </div>
              <div className="p-5 flex-1">
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <span className="text-4xl mb-3">📋</span>
                    <h3 className="text-lg font-medium text-[#F8FAFC]">No tasks yet</h3>
                    <p className="text-sm text-[#94A3B8] mt-1">Create or assign your first task.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex justify-between items-center p-4 rounded-xl border border-[#172033] bg-[#0B1020]">
                        <div>
                          <div className="text-sm font-semibold text-[#F8FAFC]">{task.title}</div>
                          <div className="text-xs text-[#94A3B8] mt-1">Assigned to: {task.assignee?.full_name || 'Unassigned'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-medium ${
                            task.status === 'completed' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                            task.status === 'in_progress' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' :
                            task.status === 'overdue' ? 'bg-[#EF4444]/10 text-[#EF4444]' :
                            'bg-[#F59E0B]/10 text-[#F59E0B]'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: AI & Knowledge Base */}
          <div className="space-y-8">
            
            {/* QUICK ACTIONS */}
            <div className="bg-[#111827] border border-[#172033] rounded-2xl flex flex-col p-5">
              <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button onClick={() => nav('/hr/tasks?action=new')} className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-[#172033] hover:border-[#6366F1]/50 transition-colors text-left group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📋</span>
                    <div>
                      <div className="text-sm font-medium text-[#F8FAFC]">Assign Task</div>
                      <div className="text-xs text-[#94A3B8]">Assign work to an employee</div>
                    </div>
                  </div>
                  <span className="text-[#94A3B8] group-hover:text-[#6366F1]">→</span>
                </button>
                <button onClick={() => nav('/hr/employees')} className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-[#172033] hover:border-[#6366F1]/50 transition-colors text-left group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">👥</span>
                    <div>
                      <div className="text-sm font-medium text-[#F8FAFC]">Manage Employees</div>
                      <div className="text-xs text-[#94A3B8]">View all staff records</div>
                    </div>
                  </div>
                  <span className="text-[#94A3B8] group-hover:text-[#6366F1]">→</span>
                </button>
                <button onClick={() => nav('/hr/attendance')} className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-[#172033] hover:border-[#6366F1]/50 transition-colors text-left group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🕒</span>
                    <div>
                      <div className="text-sm font-medium text-[#F8FAFC]">Attendance Log</div>
                      <div className="text-xs text-[#94A3B8]">Monitor daily check-ins</div>
                    </div>
                  </div>
                  <span className="text-[#94A3B8] group-hover:text-[#6366F1]">→</span>
                </button>
                <button onClick={() => nav('/hr/leaves')} className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-[#172033] hover:border-[#6366F1]/50 transition-colors text-left group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📅</span>
                    <div>
                      <div className="text-sm font-medium text-[#F8FAFC]">Leave Requests</div>
                      <div className="text-xs text-[#94A3B8]">Review pending leaves</div>
                    </div>
                  </div>
                  <span className="text-[#94A3B8] group-hover:text-[#6366F1]">→</span>
                </button>
              </div>
            </div>

            {/* AI ASSISTANT HERO */}
            <div onClick={() => nav('/hr/chat')} className="bg-gradient-to-br from-[#111827] to-[#172033] border border-[#6366F1]/30 rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:border-[#6366F1] transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ChatBubbleLeftRightIcon className="w-24 h-24 text-[#6366F1]" />
              </div>
              <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2 mb-2">
                <span className="text-xl">🤖</span> HR AI ASSISTANT
              </h2>
              <p className="text-sm text-[#94A3B8] mb-6 relative z-10">
                Ask questions about company policies, HR procedures, benefits, and employee guidelines.
              </p>
              <div className="bg-[#0B1020] border border-[#172033] rounded-xl p-3 flex justify-between items-center text-[#94A3B8] text-sm group-hover:border-[#6366F1]/50 transition-colors relative z-10">
                <span>Ask HR AI anything...</span>
                <span>➤</span>
              </div>
              <div className="mt-4 text-[10px] text-[#94A3B8] font-medium tracking-wide uppercase">
                Powered by RAG • Knowledge Base • Verified Answers
              </div>
            </div>

            {/* KNOWLEDGE BASE */}
            <div className="bg-[#111827] border border-[#172033] rounded-2xl flex flex-col">
              <div className="p-5 border-b border-[#172033] flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#F8FAFC]">Knowledge Base</h2>
                <button onClick={() => nav('/hr/knowledge')} className="text-sm text-[#6366F1] hover:text-[#F8FAFC] transition-colors">View All &rarr;</button>
              </div>
              <div className="p-5">
                {documents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <span className="text-3xl mb-2">📚</span>
                    <h3 className="text-sm font-medium text-[#F8FAFC]">Knowledge base is empty</h3>
                    <p className="text-xs text-[#94A3B8] mt-1">Upload HR documents to enable RAG answers.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.slice(0, 4).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-[#172033]">
                        <div className="flex items-center gap-3">
                          <div className="text-xl">📄</div>
                          <div>
                            <div className="text-sm font-medium text-[#F8FAFC] truncate max-w-[150px]">{doc.title}</div>
                            <div className="text-xs text-[#94A3B8]">{(doc.file_type || '').split('/')[1] || 'PDF'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {doc.status === 'ready' ? (
                            <><span className="w-2 h-2 rounded-full bg-[#22C55E]"></span><span className="text-xs text-[#94A3B8]">Indexed</span></>
                          ) : (
                            <><span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span><span className="text-xs text-[#94A3B8]">Processing...</span></>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RAG STATUS */}
            <div className="bg-[#111827] border border-[#172033] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                <h2 className="text-sm font-semibold text-[#F8FAFC]">AI Knowledge System</h2>
              </div>
              <p className="text-xs text-[#94A3B8] mb-4">Operational</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[#94A3B8] text-xs">Documents</div>
                  <div className="text-[#F8FAFC] font-medium">{stats.totalDocuments}</div>
                </div>
                <div>
                  <div className="text-[#94A3B8] text-xs">Coverage</div>
                  <div className="text-[#F8FAFC] font-medium">98%</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
