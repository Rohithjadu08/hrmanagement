import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../../shared/api/client'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PlusIcon, XMarkIcon, FunnelIcon, MagnifyingGlassIcon, DocumentTextIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { TableSkeleton } from '../../components/ui/Skeleton'

type Task = {
  id: string
  title: string
  description?: string
  priority: string
  status: string
  due_date?: string
  category?: string
  notes?: string
  created_at: string
  completed_at?: string
  submission_file_url?: string
  submission_notes?: string
  hr_approval_status?: 'pending' | 'approved' | 'rejected'
  hr_feedback?: string
  assignee?: {
    id: string
    full_name: string
    email: string
  }
}

export default function TasksPage() {
  const location = useLocation()
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee_id: '',
    priority: 'medium',
    due_date: '',
    category: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Review Modal State
  const [reviewTask, setReviewTask] = useState<Task | null>(null)
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    loadData()
    if (location.search.includes('action=new')) {
      setShowModal(true)
    }
  }, [location])

  async function loadData() {
    try {
      const [tasksRes, empRes] = await Promise.all([
        api.hrTasks(),
        api.hrAllEmployees()
      ])
      
      const processedTasks = (tasksRes?.tasks || []).map((t: Task) => {
        if (t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date()) {
          return { ...t, status: 'overdue' }
        }
        return t
      })
      
      setTasks(processedTasks)
      setEmployees((empRes?.employees || []).filter((e: any) => e.role === 'employee' && e.approval_status === 'approved'))
    } finally {
      setLoading(false)
    }
  }

  async function handleAssignTask(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!formData.title.trim() || !formData.description.trim() || !formData.assignee_id || !formData.due_date) {
      setError('Please fill out all required fields.')
      return
    }

    setSubmitting(true)
    try {
      await api.hrCreateTask({
        title: formData.title,
        description: formData.description,
        assignee_id: formData.assignee_id,
        priority: formData.priority,
        due_date: formData.due_date,
        category: formData.category,
        notes: formData.notes
      })
      
      const assignedEmployee = employees.find(emp => emp.id === formData.assignee_id)
      setSuccess(`Task assigned successfully to ${assignedEmployee?.full_name || 'Employee'}.`)
      
      setFormData({
        title: '',
        description: '',
        assignee_id: '',
        priority: 'medium',
        due_date: '',
        category: '',
        notes: ''
      })
      
      loadData()
      setTimeout(() => {
        setSuccess('')
        setShowModal(false)
      }, 2000)
    } catch (err: any) {
      console.error(err)
      setError('Unable to assign task. Please check the details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReviewTask(status: 'approved' | 'rejected') {
    if (!reviewTask) return
    setReviewError('')
    setReviewing(true)
    try {
      await api.hrReviewTask(reviewTask.id, status, reviewFeedback)
      setReviewTask(null)
      loadData()
    } catch (err: any) {
      setReviewError(err.message || 'Failed to review task')
    } finally {
      setReviewing(false)
    }
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.assignee?.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight uppercase">Task Management</h1>
            <p className="text-sm text-[#94A3B8] mt-1">Manage employee tasks, deadlines and progress.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-[#6366F1]/20"
          >
            <PlusIcon className="w-5 h-5" /> Assign Task
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-[#111827] border border-[#172033] p-5 rounded-2xl">
            <div className="text-sm text-[#94A3B8] mb-1">Total Tasks</div>
            <div className="text-2xl font-bold text-[#F8FAFC]">{stats.total}</div>
          </div>
          <div className="bg-[#111827] border border-[#172033] p-5 rounded-2xl">
            <div className="text-sm text-[#94A3B8] mb-1">To Do</div>
            <div className="text-2xl font-bold text-[#F8FAFC]">{stats.todo}</div>
          </div>
          <div className="bg-[#111827] border border-[#172033] p-5 rounded-2xl">
            <div className="text-sm text-[#94A3B8] mb-1">In Progress</div>
            <div className="text-2xl font-bold text-[#F8FAFC]">{stats.inProgress}</div>
          </div>
          <div className="bg-[#111827] border border-[#172033] p-5 rounded-2xl">
            <div className="text-sm text-[#94A3B8] mb-1">Completed</div>
            <div className="text-2xl font-bold text-[#F8FAFC]">{stats.completed}</div>
          </div>
          <div className="bg-[#111827] border border-[#172033] p-5 rounded-2xl">
            <div className="text-sm text-[#94A3B8] mb-1">Overdue</div>
            <div className="text-2xl font-bold text-[#EF4444]">{stats.overdue}</div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-[#111827] border border-[#172033] rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#172033] flex flex-col md:flex-row gap-4 justify-between bg-[#0B1020]/50">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input 
                type="text" 
                placeholder="Search tasks or employees..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#111827] border border-[#172033] text-[#F8FAFC] pl-10 pr-4 py-2 rounded-xl outline-none focus:border-[#6366F1]"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <FunnelIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <select 
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-[#111827] border border-[#172033] text-[#F8FAFC] pl-9 pr-8 py-2 rounded-xl outline-none focus:border-[#6366F1] appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#172033]/30 text-[#94A3B8] text-sm">
                  <th className="px-6 py-4 font-medium border-b border-[#172033]">Task</th>
                  <th className="px-6 py-4 font-medium border-b border-[#172033]">Employee</th>
                  <th className="px-6 py-4 font-medium border-b border-[#172033]">Due Date</th>
                  <th className="px-6 py-4 font-medium border-b border-[#172033]">Status</th>
                  <th className="px-6 py-4 font-medium border-b border-[#172033]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172033]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-0 border-none">
                      <TableSkeleton rows={4} />
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[#94A3B8]">No tasks found.</td>
                  </tr>
                ) : (
                  filteredTasks.map(task => (
                    <tr key={task.id} className="hover:bg-[#172033]/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#F8FAFC]">{task.title}</div>
                        <div className="text-xs text-[#94A3B8] mt-1 max-w-xs truncate">{task.description}</div>
                        
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            task.priority === 'urgent' ? 'bg-[#EF4444]/20 text-[#EF4444]' :
                            task.priority === 'high' ? 'bg-[#EF4444]/10 text-[#EF4444]' :
                            task.priority === 'medium' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                            'bg-[#22C55E]/10 text-[#22C55E]'
                          }`}>
                            {task.priority === 'urgent' ? '🚨 ' : ''}{task.priority}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#F8FAFC]">
                        {task.assignee?.full_name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#94A3B8]">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex flex-col gap-1 items-start`}>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                            task.status === 'in_progress' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' :
                            task.status === 'overdue' ? 'bg-[#EF4444]/10 text-[#EF4444]' :
                            'bg-[#F59E0B]/10 text-[#F59E0B]'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          
                          {task.status === 'completed' && task.hr_approval_status && (
                            <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              task.hr_approval_status === 'approved' ? 'text-emerald-400 bg-emerald-500/10' :
                              task.hr_approval_status === 'rejected' ? 'text-red-400 bg-red-500/10' :
                              'text-yellow-400 bg-yellow-500/10 animate-pulse'
                            }`}>
                              HR: {task.hr_approval_status}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {task.status === 'completed' && task.hr_approval_status === 'pending' && (
                          <button 
                            onClick={() => {
                              setReviewTask(task)
                              setReviewFeedback('')
                            }}
                            className="text-xs font-medium bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors border border-indigo-500/30 shadow-sm shadow-indigo-500/20 flex items-center gap-1.5"
                          >
                            <DocumentTextIcon className="w-3.5 h-3.5" />
                            Review Task
                          </button>
                        )}
                        {task.status === 'completed' && task.hr_approval_status !== 'pending' && (
                          <button 
                            onClick={() => {
                              setReviewTask(task)
                              setReviewFeedback(task.hr_feedback || '')
                            }}
                            className="text-xs font-medium bg-white/5 text-white/60 hover:bg-white/10 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <DocumentTextIcon className="w-3.5 h-3.5" />
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ASSIGN TASK MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] border border-[#172033] rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#172033]">
              <h2 className="text-xl font-bold text-[#F8FAFC]">Assign New Task</h2>
              <button onClick={() => setShowModal(false)} className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              {error && <div className="mb-4 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm">{error}</div>}
              {success && <div className="mb-4 p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-sm flex items-center gap-2"><span>✓</span> {success}</div>}

              <form id="task-form" onSubmit={handleAssignTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">Task Title <span className="text-[#EF4444]">*</span></label>
                  <input 
                    type="text" required
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#0B1020] border border-[#172033] text-[#F8FAFC] px-4 py-2.5 rounded-xl outline-none focus:border-[#6366F1]"
                    placeholder="e.g., Monthly HR Report"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">Description <span className="text-[#EF4444]">*</span></label>
                  <textarea required rows={3}
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#0B1020] border border-[#172033] text-[#F8FAFC] px-4 py-2.5 rounded-xl outline-none focus:border-[#6366F1] resize-none"
                    placeholder="Detailed task description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1">Assign To <span className="text-[#EF4444]">*</span></label>
                    <select required
                      value={formData.assignee_id} onChange={e => setFormData({...formData, assignee_id: e.target.value})}
                      className="w-full bg-[#0B1020] border border-[#172033] text-[#F8FAFC] px-4 py-2.5 rounded-xl outline-none focus:border-[#6366F1] appearance-none"
                    >
                      <option value="">Select Employee ▼</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.department})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1">Priority <span className="text-[#EF4444]">*</span></label>
                    <select required
                      value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                      className="w-full bg-[#0B1020] border border-[#172033] text-[#F8FAFC] px-4 py-2.5 rounded-xl outline-none focus:border-[#6366F1] appearance-none"
                    >
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🔴 High</option>
                      <option value="urgent">🚨 Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1">Due Date <span className="text-[#EF4444]">*</span></label>
                    <input type="date" required
                      value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})}
                      className="w-full bg-[#0B1020] border border-[#172033] text-[#F8FAFC] px-4 py-2.5 rounded-xl outline-none focus:border-[#6366F1]"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1">Category (Optional)</label>
                    <select 
                      value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-[#0B1020] border border-[#172033] text-[#F8FAFC] px-4 py-2.5 rounded-xl outline-none focus:border-[#6366F1] appearance-none"
                    >
                      <option value="">None</option>
                      <option value="Engineering">Engineering</option>
                      <option value="HR">HR</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Design">Design</option>
                      <option value="Training">Training</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">Additional Notes (Optional)</label>
                  <textarea rows={2}
                    value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full bg-[#0B1020] border border-[#172033] text-[#F8FAFC] px-4 py-2.5 rounded-xl outline-none focus:border-[#6366F1] resize-none"
                    placeholder="Any extra instructions..."
                  />
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-[#172033] bg-[#0B1020]/50 flex justify-end gap-3 rounded-b-2xl">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" form="task-form"
                disabled={submitting}
                className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? 'Assigning...' : 'Assign Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW TASK MODAL */}
      {reviewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] border border-[#172033] rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#172033]">
              <h2 className="text-xl font-bold text-[#F8FAFC]">Review Task Submission</h2>
              <button onClick={() => setReviewTask(null)} className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-6">
              {reviewError && <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm">{reviewError}</div>}
              
              <div>
                <h3 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Task Information</h3>
                <div className="bg-[#0B1020] border border-[#172033] rounded-xl p-4">
                  <div className="font-semibold text-white text-lg">{reviewTask.title}</div>
                  <div className="text-sm text-[#94A3B8] mt-1">Completed by {reviewTask.assignee?.full_name}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Submission Details</h3>
                <div className="bg-[#0B1020] border border-[#172033] rounded-xl p-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-[#94A3B8]">Submission Notes</label>
                    <p className="text-sm text-white mt-1 whitespace-pre-wrap">
                      {reviewTask.submission_notes || <span className="text-white/30 italic">No notes provided.</span>}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-[#94A3B8]">Attached File</label>
                    {reviewTask.submission_file_url ? (
                      <a 
                        href={reviewTask.submission_file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors text-sm font-medium"
                      >
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        Download Submission File
                      </a>
                    ) : (
                      <p className="text-sm text-white/30 italic mt-1">No file attached.</p>
                    )}
                  </div>
                </div>
              </div>

              {reviewTask.hr_approval_status === 'pending' ? (
                <div>
                  <h3 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider mb-2">HR Action</h3>
                  <textarea
                    rows={3}
                    placeholder="Provide feedback to the employee (optional)..."
                    value={reviewFeedback}
                    onChange={e => setReviewFeedback(e.target.value)}
                    className="w-full bg-[#0B1020] border border-[#172033] text-[#F8FAFC] px-4 py-3 rounded-xl outline-none focus:border-[#6366F1] resize-none"
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider mb-2">HR Feedback Given</h3>
                  <div className={`p-4 rounded-xl border ${
                    reviewTask.hr_approval_status === 'approved' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    <div className="font-medium mb-1">
                      {reviewTask.hr_approval_status === 'approved' ? '✅ Task Approved' : '❌ Task Rejected'}
                    </div>
                    <div className="text-sm opacity-80 whitespace-pre-wrap">
                      {reviewTask.hr_feedback || 'No feedback provided.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {reviewTask.hr_approval_status === 'pending' && (
              <div className="p-5 border-t border-[#172033] bg-[#0B1020]/50 flex justify-end gap-3 rounded-b-2xl">
                <button 
                  onClick={() => handleReviewTask('rejected')}
                  disabled={reviewing}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Reject & Return
                </button>
                <button 
                  onClick={() => handleReviewTask('approved')}
                  disabled={reviewing}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Approve Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
