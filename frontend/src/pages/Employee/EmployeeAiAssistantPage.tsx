import { useEffect, useState, useRef } from 'react'
import { api } from '../../shared/api/client'
import EmployeeDashboardLayout from '../../components/layout/EmployeeDashboardLayout'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { useSearchParams } from 'react-router-dom'

export default function EmployeeAiAssistantPage() {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const cid = searchParams.get('id')
    if (cid) {
      setConversationId(cid)
      api.chatMessages(cid).then(data => {
        if (data.messages) {
          setMessages(data.messages.map((m: any) => ({ role: m.role, content: m.content })))
        }
      }).catch(console.error)
    } else {
      setMessages([])
      setConversationId(undefined)
    }
  }, [searchParams])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(e?: React.FormEvent, overrideText?: string) {
    if (e) e.preventDefault()
    const userMessage = (overrideText || input).trim()
    if (!userMessage || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await api.chatMessage(userMessage, conversationId)
      if (res.conversationId && !conversationId) {
        setConversationId(res.conversationId)
      }
      setMessages(prev => [...prev, { role: 'assistant', content: res.answer }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error answering that.' }])
    } finally {
      setLoading(false)
    }
  }

  const suggestedQuestions = [
    "What is the policy for annual leave?",
    "How do I submit an expense report?",
    "What are the working hours?",
    "Can you explain the IT security guidelines?"
  ]

  return (
    <EmployeeDashboardLayout title="🤖 HR AI Assistant" subtitle="Ask questions about policies, procedures, and knowledge base documents.">
      <div className="flex-1 bg-[#111827] border border-[#172033] rounded-2xl flex flex-col overflow-hidden min-h-[500px] h-[calc(100vh-200px)]">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-[#94A3B8]">
              <span className="text-4xl mb-4">💬</span>
              <p className="font-medium text-lg text-white">Hello! I am your HR AI Assistant.</p>
              <p className="text-sm mt-2 text-white/50 text-center max-w-md">I can answer questions based on the uploaded Knowledge Base documents.</p>
              
              <div className="mt-8 w-full max-w-lg">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3 text-center">Suggested Questions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(undefined, q)}
                      className="text-left rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                m.role === 'user' 
                  ? 'bg-indigo-500 text-white rounded-br-none' 
                  : 'bg-[#172033] text-[#F8FAFC] rounded-bl-none border border-[#172033]'
              }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#172033] rounded-2xl rounded-bl-none px-5 py-3 flex gap-2 border border-[#172033]">
                <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 bg-[#0B1020] border-t border-[#172033]">
          <form onSubmit={(e) => sendMessage(e)} className="relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full bg-[#111827] border border-[#172033] rounded-xl pl-4 pr-12 py-3.5 text-[#F8FAFC] outline-none focus:border-[#6366F1]"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#6366F1] hover:text-[#4F46E5] disabled:opacity-50 transition-colors"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </EmployeeDashboardLayout>
  )
}
