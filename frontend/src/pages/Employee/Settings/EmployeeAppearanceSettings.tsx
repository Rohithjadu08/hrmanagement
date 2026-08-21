import { useEffect, useState } from 'react'
import EmployeeSettingsLayout from '../../../components/layout/EmployeeSettingsLayout'
import { api } from '../../../shared/api/client'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'

export default function EmployeeAppearanceSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [theme, setTheme] = useState('system')
  const [density, setDensity] = useState('Comfortable')

  useEffect(() => {
    api.settingsEmployeePreferencesGet().then(data => {
      if (data) {
        if (data.theme) setTheme(data.theme)
        if (data.density) setDensity(data.density)
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
      await api.settingsEmployeePreferencesUpdate({ theme, density })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update appearance')
    } finally {
      setSaving(false)
    }
  }

  const ThemeOption = ({ value, label, Icon }: { value: string, label: string, Icon: any }) => {
    const isSelected = theme === value
    return (
      <button
        type="button"
        onClick={() => setTheme(value)}
        className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${
          isSelected 
            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
            : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
        }`}
      >
        <Icon className="w-8 h-8" />
        <span className="font-medium text-sm">{label}</span>
      </button>
    )
  }

  return (
    <EmployeeSettingsLayout title="Appearance Settings">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Appearance</h1>
        <p className="text-white/50 mb-8">Customize how Reckon HR looks on your device.</p>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20">
            Appearance settings saved successfully!
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-white/5 rounded-xl w-full"></div>
            <div className="h-24 bg-white/5 rounded-xl w-full"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Theme</h2>
              <div className="grid grid-cols-3 gap-4">
                <ThemeOption value="light" label="Light" Icon={SunIcon} />
                <ThemeOption value="dark" label="Dark" Icon={MoonIcon} />
                <ThemeOption value="system" label="System" Icon={ComputerDesktopIcon} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Layout Density</h2>
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                <select
                  value={density}
                  onChange={e => setDensity(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Comfortable">Comfortable</option>
                  <option value="Compact">Compact</option>
                </select>
                <p className="text-xs text-white/40 mt-3">
                  Compact mode reduces whitespace in tables and lists, allowing you to see more information on screen at once.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-500 px-8 py-3 text-sm font-bold text-white hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        )}
      </div>
    </EmployeeSettingsLayout>
  )
}
