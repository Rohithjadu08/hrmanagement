import { useEffect, useState } from 'react'
import HrSettingsLayout from '../../../components/layout/HrSettingsLayout'
import { api } from '../../../shared/api/client'
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function HrSystemSettings() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [error, setError] = useState('')

  const fetchStatus = async () => {
    try {
      setRefreshing(true)
      const data = await api.settingsHrSystemGet()
      setStatus(data)
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const StatusItem = ({ label, state }: { label: string, state: string }) => {
    const isOk = state === 'connected' || state === 'operational'
    return (
      <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
        <span className="text-white/80 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {isOk ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
          ) : (
            <XCircleIcon className="w-5 h-5 text-red-400" />
          )}
          <span className={`text-sm font-medium ${isOk ? 'text-emerald-400' : 'text-red-400'}`}>
            {state.toUpperCase()}
          </span>
        </div>
      </div>
    )
  }

  return (
    <HrSettingsLayout title="System Status">
      <div className="max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">System Status</h1>
            <p className="text-white/50">Monitor backend connectivity and third-party services.</p>
          </div>
          <button
            onClick={fetchStatus}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-white/5 rounded-xl w-full"></div>
            <div className="h-16 bg-white/5 rounded-xl w-full"></div>
            <div className="h-16 bg-white/5 rounded-xl w-full"></div>
          </div>
        ) : status ? (
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
            <h2 className="text-lg font-bold text-white mb-4">Service Health</h2>
            
            <div className="grid gap-3">
              <StatusItem label="Node.js Backend API" state={status.backend} />
              <StatusItem label="Supabase Connection" state={status.supabase} />
              <StatusItem label="PostgreSQL Database" state={status.database} />
              <StatusItem label="RAG Knowledge Base" state={status.rag} />
              <StatusItem label="OpenAI API" state={status.ai_provider} />
              <StatusItem label="Notification Worker" state={status.notifications} />
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 text-xs text-white/30 text-right">
              Last checked: {new Date(status.last_checked).toLocaleString()}
            </div>
          </div>
        ) : null}
      </div>
    </HrSettingsLayout>
  )
}
