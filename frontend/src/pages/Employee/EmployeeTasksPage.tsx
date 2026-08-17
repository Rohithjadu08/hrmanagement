import { useEffect, useState, useRef } from 'react'
import { api } from '../../shared/api/client'
import EmployeeDashboardLayout from '../../components/layout/EmployeeDashboardLayout'
import { XMarkIcon, PaperClipIcon } from '@heroicons/react/24/outline'

type Task = {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  due_date?: string
  category?: string
  notes?: string
  hr_approval_status?: 'pending' | 'approved' | 'rejected'
  hr_feedback?: string
  submission_file_url?: string
  submission_notes?: string
  creator?: {
    full_name: string
    email: string
  }
}

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  
  // Submit Modal State
  const [submitModalTask, setSubmitModalTask] = useState<Task | null>(null)
  const [submitNotes, setSubmitNotes] = useState('')
  const [submitFile, setSubmitFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      const { tasks } = await api.employeeTasks()
      const processedTasks = (tasks || []).map((t: Task) => {
        if (t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date()) {
          return { ...t, status: 'overdue' }
        }
        return t
      })
      setTasks(processedTasks)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(taskId: string, newStatus: string) {
    if (newStatus === 'completed') {
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        setSubmitModalTask(task)
        setSubmitNotes('')
        setSubmitFile(null)
        setSubmitError('')
      }
      return
    }

    setUpdating(taskId)
    try {
      await api.employeeUpdateTask(taskId, newStatus)
      await loadTasks()
    } catch (e) {
      console.error(e)
    } finally {
      setUpdating(null)
    }
  }

  async function handleSubmitTask(e: React.FormEvent) {
    e.preventDefault()
    if (!submitModalTask) return
    
    setSubmitting(true)
    setSubmitError('')
    
    try {
      await api.employeeSubmitTask(submitModalTask.id, submitFile, submitNotes)
      setSubmitModalTask(null)
      await loadTasks()
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit task. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <EmployeeDashboardLayout title="My Tasks">
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      </EmployeeDashboardLayout>
    )
  }

  return (
    <EmployeeDashboardLayout title="My Tasks" subtitle="Tasks assigned to you by HR.">
      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center flex flex-col items-center">
          <span className="text-4xl mb-4">🎉</span>
          <p className="text-white font-medium text-lg">No tasks assigned to you right now.</p>
          <p className="text-white/60 text-sm mt-1">Great job staying on top of your work!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/[0.07]">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                  {task.description && (
                    <p className="mt-2 text-sm text-white/70 max-w-2xl">{task.description}</p>
                  )}
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${
                      task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                      task.priority === 'medium' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-green-500/10 text-green-400'
                    }`}>
                      {task.priority === 'urgent' ? '🚨 ' : ''}{task.priority}
                    </span>
                    
                    {task.due_date && (
                      <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/70">
                        📅 Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}

                    {task.category && (
                      <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400">
                        🏷️ {task.category}
                      </span>
                    )}
                  </div>

                  {/* HR Approval Feedback Display */}
                  {task.status === 'completed' && task.hr_approval_status && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
                        task.hr_approval_status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        task.hr_approval_status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {task.hr_approval_status === 'approved' ? '✅ HR Approved' :
                         task.hr_approval_status === 'rejected' ? '❌ HR Rejected' :
                         '⏳ Pending HR Review'}
                      </span>
                      {task.hr_feedback && (
                        <span className="text-sm text-white/60">
                          Feedback: {task.hr_feedback}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Show rejection feedback if moved back to in_progress from rejected */}
                  {task.status === 'in_progress' && task.hr_approval_status === 'rejected' && task.hr_feedback && (
                    <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 max-w-xl">
                      <p className="text-sm text-red-400 font-medium">HR rejected your previous submission:</p>
                      <p className="text-sm text-white/80 mt-1">{task.hr_feedback}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:items-end gap-3">
                  {task.status === 'completed' ? (
                    <div className="px-3 py-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                      Completed
                    </div>
                  ) : (
                    <select
                      disabled={updating === task.id}
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium outline-none transition-colors appearance-none pr-8 ${
                        task.status === 'overdue'
                          ? 'border-red-500/30 bg-red-500/10 text-red-400'
                          : task.status === 'in_progress'
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                          : 'border-white/10 bg-white/5 text-white'
                      }`}
                    >
                      <option value="todo" className="bg-gray-900">To Do</option>
                      <option value="in_progress" className="bg-gray-900">In Progress</option>
                      <option value="completed" className="bg-gray-900 text-emerald-400 font-semibold">Submit for Review...</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Task Modal */}
      {submitModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-gray-900 p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Submit Task</h3>
              <button 
                onClick={() => setSubmitModalTask(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <p className="text-sm font-medium text-white mb-2">Task: {submitModalTask.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Submission File (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-500/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-400 hover:file:bg-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Submission Notes
                </label>
                <textarea
                  value={submitNotes}
                  onChange={(e) => setSubmitNotes(e.target.value)}
                  placeholder="Add any comments or links for HR..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-indigo-500 min-h-[100px]"
                />
              </div>

              {submitError && (
                <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                  {submitError}
                </div>
              )}

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setSubmitModalTask(null)}
                  className="rounded-xl px-4 py-2 font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit to HR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </EmployeeDashboardLayout>
  )
}
