import { useEffect, useState } from 'react'
import { api } from '../../shared/api/client'
import EmployeeDashboardLayout from '../../components/layout/EmployeeDashboardLayout'
import { TableSkeleton } from '../../components/ui/Skeleton'

export default function EmployeeLeavePage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'Annual',
    start_date: '',
    end_date: '',
    reason: '',
    additional_notes: ''
  })
  const [formLoading, setFormLoading] = useState(false)

  const [leaveTypes, setLeaveTypes] = useState<any[]>([])

  const fetchLeaves = async () => {
    try {
      const data = await api.employeeGetLeaves()
      setLeaves(data || [])
      
      const types = await api.settingsHrLeaveTypesGet()
      // Only show active leave types
      const activeTypes = (types || []).filter((t: any) => t.is_active)
      setLeaveTypes(activeTypes)
      
      if (activeTypes.length > 0 && !leaveForm.leave_type) {
        setLeaveForm(prev => ({ ...prev, leave_type: activeTypes[0].name }))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaves')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    try {
      await api.employeeApplyLeave(leaveForm)
      setIsModalOpen(false)
      setLeaveForm({ leave_type: 'Annual', start_date: '', end_date: '', reason: '', additional_notes: '' })
      await fetchLeaves()
    } catch (err: any) {
      setError(err.message || 'Failed to apply for leave')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <EmployeeDashboardLayout title="My Leaves">
      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 min-w-[200px]">
            <p className="text-sm font-medium text-white/50">Total Approved</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {leaves.filter(l => l.status === 'Approved').length}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 min-w-[200px]">
            <p className="text-sm font-medium text-white/50">Pending Requests</p>
            <p className="mt-2 text-3xl font-bold text-orange-400">
              {leaves.filter(l => l.status === 'Pending').length}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-600"
        >
          Apply for Leave
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={4} />
        ) : leaves.length === 0 ? (
          <div className="p-8 text-center text-white/50">No leave requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-4 font-medium text-white">Type</th>
                  <th className="px-6 py-4 font-medium text-white">Start Date</th>
                  <th className="px-6 py-4 font-medium text-white">End Date</th>
                  <th className="px-6 py-4 font-medium text-white">Days</th>
                  <th className="px-6 py-4 font-medium text-white">Status</th>
                  <th className="px-6 py-4 font-medium text-white">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4">{leave.leave_type}</td>
                    <td className="px-6 py-4">{leave.start_date}</td>
                    <td className="px-6 py-4">{leave.end_date}</td>
                    <td className="px-6 py-4">{leave.total_days}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        leave.status === 'Rejected' ? 'bg-red-500/10 text-red-400' :
                        'bg-orange-500/10 text-orange-400'
                      }`}>
                        {leave.status}
                      </span>
                      {leave.status === 'Rejected' && (
                        <div className="mt-1 text-xs text-red-400">Reason: {leave.rejection_reason}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 truncate max-w-xs">{leave.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-white">Apply for Leave</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">Leave Type</label>
                <select
                  value={leaveForm.leave_type}
                  onChange={e => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  {leaveTypes.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                  {leaveTypes.length === 0 && <option value="Annual">Annual Leave</option>}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">Start Date</label>
                  <input
                    type="date"
                    value={leaveForm.start_date}
                    onChange={e => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">End Date</label>
                  <input
                    type="date"
                    value={leaveForm.end_date}
                    onChange={e => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    min={leaveForm.start_date}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">Reason</label>
                <textarea
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </EmployeeDashboardLayout>
  )
}
