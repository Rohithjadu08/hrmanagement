import { useEffect, useState } from 'react'
import { api } from '../../shared/api/client'
import DashboardLayout from '../../components/layout/DashboardLayout'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.hrAllEmployees().then(res => {
      setEmployees(res?.employees || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#F8FAFC]">All Employees</h1>
        </div>

        <div className="bg-[#111827] border border-[#172033] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[#94A3B8]">Loading...</div>
          ) : employees.length === 0 ? (
            <div className="p-10 text-center">
              <span className="text-4xl mb-3">👥</span>
              <h3 className="text-lg font-medium text-[#F8FAFC]">No employees yet</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#94A3B8]">
                <thead className="bg-[#0B1020] text-[#F8FAFC] border-b border-[#172033]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Role / Dept</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172033]">
                  {employees.map(e => (
                    <tr key={e.id} className="hover:bg-[#172033]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#F8FAFC]">{e.full_name}</div>
                        <div className="text-xs">{e.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="capitalize">{e.role}</div>
                        <div className="text-xs">{e.department}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          e.approval_status === 'approved' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                          e.approval_status === 'pending' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                          'bg-[#EF4444]/10 text-[#EF4444]'
                        }`}>
                          {e.approval_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
