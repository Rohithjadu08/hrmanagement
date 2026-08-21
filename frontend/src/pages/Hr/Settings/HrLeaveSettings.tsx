import { useEffect, useState } from 'react'
import HrSettingsLayout from '../../../components/layout/HrSettingsLayout'
import { api } from '../../../shared/api/client'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'

export default function HrLeaveSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [leaveTypes, setLeaveTypes] = useState<any[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [form, setForm] = useState({
    name: '',
    allowance: 0,
    requires_approval: true,
    is_active: true
  })

  const fetchLeaves = async () => {
    try {
      const data = await api.settingsHrLeaveTypesGet()
      setLeaveTypes(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  const handleOpenNew = () => {
    setEditingId(null)
    setForm({ name: '', allowance: 0, requires_approval: true, is_active: true })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (type: any) => {
    setEditingId(type.id)
    setForm({
      name: type.name,
      allowance: type.allowance,
      requires_approval: type.requires_approval,
      is_active: type.is_active
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      if (editingId) {
        await api.settingsHrLeaveTypesUpdate(editingId, form)
      } else {
        await api.settingsHrLeaveTypesCreate(form)
      }
      setSuccess(true)
      setIsModalOpen(false)
      fetchLeaves()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save leave type')
    } finally {
      setSaving(false)
    }
  }

  return (
    <HrSettingsLayout title="Leave Settings">
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Leave Settings</h1>
            <p className="text-white/50">Manage leave types, allowances, and approval rules.</p>
          </div>
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Leave Type
          </button>
        </div>

        {error && !isModalOpen && (
          <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20">
            Leave types updated successfully!
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-white/5 rounded-xl w-full"></div>
            <div className="h-16 bg-white/5 rounded-xl w-full"></div>
            <div className="h-16 bg-white/5 rounded-xl w-full"></div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-4 font-medium text-white">Leave Type</th>
                  <th className="px-6 py-4 font-medium text-white">Allowance (Days)</th>
                  <th className="px-6 py-4 font-medium text-white">Requires Approval</th>
                  <th className="px-6 py-4 font-medium text-white">Status</th>
                  <th className="px-6 py-4 font-medium text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {leaveTypes.map((type) => (
                  <tr key={type.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-medium text-white">{type.name}</td>
                    <td className="px-6 py-4">{type.allowance}</td>
                    <td className="px-6 py-4">
                      {type.requires_approval ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        type.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {type.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenEdit(type)} className="text-white/50 hover:text-indigo-400 transition-colors p-1">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0A0B] p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-white">{editingId ? 'Edit Leave Type' : 'New Leave Type'}</h3>
              
              {error && isModalOpen && (
                <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Leave Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Yearly Allowance (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.allowance}
                    onChange={e => setForm({...form, allowance: parseInt(e.target.value) || 0})}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="requires_approval"
                    checked={form.requires_approval}
                    onChange={e => setForm({...form, requires_approval: e.target.checked})}
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-900"
                  />
                  <label htmlFor="requires_approval" className="text-sm font-medium text-white/70">
                    HR Approval Required
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active}
                    onChange={e => setForm({...form, is_active: e.target.checked})}
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-900"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-white/70">
                    Is Active
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Type'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </HrSettingsLayout>
  )
}
