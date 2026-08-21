import { useEffect, useState } from 'react'
import HrSettingsLayout from '../../../components/layout/HrSettingsLayout'
import { api } from '../../../shared/api/client'

export default function HrOrgSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    company_name: '',
    company_email: '',
    phone: '',
    office_location: '',
    time_zone: '',
    working_hours_start: '',
    working_hours_end: ''
  })

  useEffect(() => {
    api.settingsHrOrgGet().then(data => {
      if (data) {
        setForm({
          company_name: data.company_name || '',
          company_email: data.company_email || '',
          phone: data.phone || '',
          office_location: data.office_location || '',
          time_zone: data.time_zone || 'Asia/Kolkata',
          working_hours_start: data.working_hours_start || '09:00:00',
          working_hours_end: data.working_hours_end || '18:00:00'
        })
      }
      setLoading(false)
    }).catch(err => {
      setError(err.message)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await api.settingsHrOrgUpdate(form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update organization settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <HrSettingsLayout title="Organization Settings">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Organization Settings</h1>
        <p className="text-white/50 mb-8">Manage the global configuration for the Reckon HR platform.</p>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20">
            Settings updated successfully!
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-white/5 rounded-xl w-full"></div>
            <div className="h-12 bg-white/5 rounded-xl w-full"></div>
            <div className="h-12 bg-white/5 rounded-xl w-full"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
              <h2 className="text-lg font-bold text-white mb-4">Company Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Company Name</label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={e => setForm({...form, company_name: e.target.value})}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Support Email</label>
                  <input
                    type="email"
                    value={form.company_email}
                    onChange={e => setForm({...form, company_email: e.target.value})}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Office Location</label>
                <input
                  type="text"
                  value={form.office_location}
                  onChange={e => setForm({...form, office_location: e.target.value})}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
              <h2 className="text-lg font-bold text-white mb-4">Time & Attendance</h2>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Time Zone</label>
                <select
                  value={form.time_zone}
                  onChange={e => setForm({...form, time_zone: e.target.value})}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Working Hours Start</label>
                  <input
                    type="time"
                    value={form.working_hours_start}
                    onChange={e => setForm({...form, working_hours_start: e.target.value})}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Working Hours End</label>
                  <input
                    type="time"
                    value={form.working_hours_end}
                    onChange={e => setForm({...form, working_hours_end: e.target.value})}
                    className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-500 px-8 py-3 text-sm font-bold text-white hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </HrSettingsLayout>
  )
}
