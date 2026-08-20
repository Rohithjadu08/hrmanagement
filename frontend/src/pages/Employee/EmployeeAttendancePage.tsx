import { useEffect, useState } from 'react'
import { api } from '../../shared/api/client'
import EmployeeDashboardLayout from '../../components/layout/EmployeeDashboardLayout'
import { TableSkeleton } from '../../components/ui/Skeleton'

export default function EmployeeAttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchAttendance = async () => {
    try {
      const data = await api.employeeGetAttendance()
      setAttendance(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  const handleCheckIn = async () => {
    try {
      setActionLoading(true)
      setError('')
      await api.employeeCheckIn()
      await fetchAttendance()
    } catch (err: any) {
      setError(err.message || 'Failed to check in')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setActionLoading(true)
      setError('')
      await api.employeeCheckOut()
      await fetchAttendance()
    } catch (err: any) {
      setError(err.message || 'Failed to check out')
    } finally {
      setActionLoading(false)
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const todayRecord = attendance.find(a => a.date === todayStr)

  return (
    <EmployeeDashboardLayout title="My Attendance">
      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-medium text-white/50">Total Present</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">
            {attendance.filter(a => a.status === 'Present').length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-medium text-white/50">Total Late</p>
          <p className="mt-2 text-3xl font-bold text-orange-400">
            {attendance.filter(a => a.status === 'Late').length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-medium text-white/50">Total Absent</p>
          <p className="mt-2 text-3xl font-bold text-red-400">
            {attendance.filter(a => a.status === 'Absent').length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-medium text-white/50">On Leave</p>
          <p className="mt-2 text-3xl font-bold text-blue-400">
            {attendance.filter(a => a.status === 'Leave').length}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Today's Status</h3>
          <p className="text-sm text-white/50">
            {todayRecord ? (
              todayRecord.check_out ? 'You have checked out for the day.' : 'You are currently checked in.'
            ) : (
              'You have not checked in today.'
            )}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleCheckIn}
            disabled={!!todayRecord || actionLoading}
            className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading && !todayRecord ? 'Processing...' : 'Check In'}
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!todayRecord || !!todayRecord.check_out || actionLoading}
            className="rounded-xl border border-white/10 bg-transparent px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading && todayRecord && !todayRecord.check_out ? 'Processing...' : 'Check Out'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={4} />
        ) : attendance.length === 0 ? (
          <div className="p-8 text-center text-white/50">No attendance records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-4 font-medium text-white">Date</th>
                  <th className="px-6 py-4 font-medium text-white">Check In</th>
                  <th className="px-6 py-4 font-medium text-white">Check Out</th>
                  <th className="px-6 py-4 font-medium text-white">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {attendance.map((record) => (
                  <tr key={record.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4">{record.date}</td>
                    <td className="px-6 py-4">
                      {record.check_in ? new Date(record.check_in).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {record.check_out ? new Date(record.check_out).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400' :
                        record.status === 'Absent' ? 'bg-red-500/10 text-red-400' :
                        record.status === 'Late' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </EmployeeDashboardLayout>
  )
}
