import { useEffect, useState, useRef } from 'react'
import { api } from '../../shared/api/client'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadDocs() {
    try {
      const res = await api.hrDocuments()
      setDocuments(res?.documents || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocs()
  }, [])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      await api.uploadDocument(file)
      await loadDocs()
    } catch (e: any) {
      setError(e.message || 'Failed to upload document')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#F8FAFC]">Knowledge Base</h1>
            <p className="text-sm text-[#94A3B8] mt-1">Manage documents used by the AI Assistant.</p>
          </div>
          
          <div className="relative">
            <input 
              type="file" 
              accept=".pdf,.txt" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>

        {error && <div className="p-4 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 rounded-xl text-sm">{error}</div>}

        <div className="bg-[#111827] border border-[#172033] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[#94A3B8]">Loading...</div>
          ) : documents.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#172033] m-4 rounded-xl">
              <span className="text-4xl mb-3">📚</span>
              <h3 className="text-lg font-medium text-[#F8FAFC]">Knowledge base is empty</h3>
              <p className="text-sm text-[#94A3B8] mt-1">Upload your first HR document to enable RAG-powered answers.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#94A3B8]">
                <thead className="bg-[#0B1020] text-[#F8FAFC] border-b border-[#172033]">
                  <tr>
                    <th className="px-6 py-4 font-medium">File Name</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Date Uploaded</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172033]">
                  {documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-[#172033]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#F8FAFC]">{doc.title}</td>
                      <td className="px-6 py-4">{(doc.file_type || 'Unknown').split('/')[1]?.toUpperCase() || 'PDF'}</td>
                      <td className="px-6 py-4">{new Date(doc.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          doc.status === 'ready' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                        }`}>
                          {doc.status === 'ready' ? 'Indexed' : 'Processing...'}
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
