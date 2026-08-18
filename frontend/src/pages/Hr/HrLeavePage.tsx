import { useEffect, useState } from 'react'
import { api } from '../../shared/api/client'
import DashboardLayout from '../../components/layout/DashboardLayout'

export default function HrLeavePage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchLeaves = async () => {
    try {
      const data = await api.hrGetLeaves()
      setLeaves(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaves')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  const handleAction = async (action: 'Approve' | 'Reject') => {
    if (!selectedLeave) return
    if (action === 'Reject' && !rejectionReason.trim()) {
      alert('Rejection reason is required')
      return
    }

    setActionLoading(true)
    try {
      if (action === 'Approve') {
        await api.hrApproveLeave(selectedLeave.id)
      } else {
        await api.hrRejectLeave(selectedLeave.id, rejectionReason)
      }
      setIsModalOpen(false)
      setSelectedLeave(null)
      setRejectionReason('')
      await fetchLeaves()
    } catch (err: any) {
      alert(err.message || `Failed to ${action.toLowerCase()} leave`)
    } finally {
      setActionLoading(false)
    }
  }

  const openReviewModal = (leave: any) => {
    setSelectedLeave(leave)
    setRejectionReason('')
    setIsModalOpen(true)
  }

  const pending = leaves.filter(l => l.status === 'Pending').length
  const approved = leaves.filter(l => l.status === 'Approved').length
  const rejected = leaves.filter(l => l.status === 'Rejected').length

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Leave Requests</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">Review and manage employee leave applications.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 border-b-4 border-b-orange-500">
          <p className="text-sm font-medium text-white/50">Pending Review</p>
          <p className="mt-2 text-3xl font-bold text-orange-400">{pending}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 border-b-4 border-b-emerald-500">
          <p className="text-sm font-medium text-white/50">Total Approved</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{approved}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 border-b-4 border-b-red-500">
          <p className="text-sm font-medium text-white/50">Total Rejected</p>
          <p className="mt-2 text-3xl font-bold text-red-400">{rejected}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/50">Loading...</div>
        ) : leaves.length === 0 ? (
          <div className="p-8 text-center text-white/50">No leave requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-4 font-medium text-white">Employee</th>
                  <th className="px-6 py-4 font-medium text-white">Type</th>
                  <th className="px-6 py-4 font-medium text-white">Dates</th>
                  <th className="px-6 py-4 font-medium text-white">Days</th>
                  <th className="px-6 py-4 font-medium text-white">Status</th>
                  <th className="px-6 py-4 font-medium text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-medium text-white">{leave.profiles?.full_name}</td>
                    <td className="px-6 py-4">{leave.leave_type}</td>
                    <td className="px-6 py-4 text-xs">
                      {leave.start_date} <br/>to {leave.end_date}
                    </td>
                    <td className="px-6 py-4">{leave.total_days}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        leave.status === 'Rejected' ? 'bg-red-500/10 text-red-400' :
                        'bg-orange-500/10 text-orange-400'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openReviewModal(leave)}
                        className="rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-white">Review Leave Request</h3>
            
            <div className="mb-6 space-y-3 rounded-xl bg-white/5 p-4 text-sm text-white/70">
              <p><strong className="text-white">Employee:</strong> {selectedLeave.profiles?.full_name}</p>
              <p><strong className="text-white">Type:</strong> {selectedLeave.leave_type}</p>
              <p><strong className="text-white">Dates:</strong> {selectedLeave.start_date} to {selectedLeave.end_date} ({selectedLeave.total_days} days)</p>
              <p><strong className="text-white">Reason:</strong> {selectedLeave.reason}</p>
              {selectedLeave.additional_notes && (
                <p><strong className="text-white">Notes:</strong> {selectedLeave.additional_notes}</p>
              )}
            </div>

            {selectedLeave.status === 'Pending' ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">Rejection Reason (only if rejecting)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    rows={3}
                    placeholder="Provide a reason if rejecting..."
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAction('Reject')}
                    disabled={actionLoading || !rejectionReason.trim()}
                    className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-all disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction('Approve')}
                    disabled={actionLoading}
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-all disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
