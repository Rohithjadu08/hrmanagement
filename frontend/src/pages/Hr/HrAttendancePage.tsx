import { useEffect, useState } from 'react'
import { api } from '../../shared/api/client'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { TableSkeleton } from '../../components/ui/Skeleton'

export default function HrAttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [attData, statsData] = await Promise.all([
        api.hrGetAttendance(filterDate),
        api.hrGetAttendanceStats(filterDate)
      ])
      setAttendance(attData || [])
      setStats(statsData)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterDate])

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Management</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">Monitor and manage employee attendance records.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-white/70">Filter Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-medium text-white/50">Total Employees</p>
            <p className="mt-2 text-3xl font-bold text-white">{stats.Total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 border-b-4 border-b-emerald-500">
            <p className="text-sm font-medium text-white/50">Present</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">{stats.Present}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 border-b-4 border-b-orange-500">
            <p className="text-sm font-medium text-white/50">Late</p>
            <p className="mt-2 text-3xl font-bold text-orange-400">{stats.Late}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 border-b-4 border-b-red-500">
            <p className="text-sm font-medium text-white/50">Absent</p>
            <p className="mt-2 text-3xl font-bold text-red-400">{stats.Absent}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 border-b-4 border-b-blue-500">
            <p className="text-sm font-medium text-white/50">On Leave</p>
            <p className="mt-2 text-3xl font-bold text-blue-400">{stats.Leave}</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-lg font-bold text-white">Attendance Records</h2>
        </div>
        {loading ? (
          <TableSkeleton rows={4} />
        ) : attendance.length === 0 ? (
          <div className="p-8 text-center text-white/50">No attendance records found for this date.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-4 font-medium text-white">Employee Name</th>
                  <th className="px-6 py-4 font-medium text-white">Department</th>
                  <th className="px-6 py-4 font-medium text-white">Date</th>
                  <th className="px-6 py-4 font-medium text-white">Check In</th>
                  <th className="px-6 py-4 font-medium text-white">Check Out</th>
                  <th className="px-6 py-4 font-medium text-white">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {attendance.map((record) => (
                  <tr key={record.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-medium text-white">{record.profiles?.full_name}</td>
                    <td className="px-6 py-4">{record.profiles?.department}</td>
                    <td className="px-6 py-4">{record.date}</td>
                    <td className="px-6 py-4">
                      {record.check_in ? new Date(record.check_in).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {record.check_out ? new Date(record.check_out).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
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
    </DashboardLayout>
  )
}
