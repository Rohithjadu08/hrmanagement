import { useEffect, useState, useRef } from 'react'
import { api } from '../../shared/api/client'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await api.chatMessage(userMessage)
      setMessages(prev => [...prev, { role: 'assistant', content: res.answer }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error answering that.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#F8FAFC]">🤖 HR AI Assistant</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Ask questions about policies, procedures, and knowledge base documents.</p>
        </div>

        <div className="flex-1 bg-[#111827] border border-[#172033] rounded-2xl flex flex-col overflow-hidden min-h-[500px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-[#94A3B8]">
                <span className="text-4xl mb-4">💬</span>
                <p>Hello! I am your HR AI Assistant.</p>
                <p className="text-sm mt-2">I can answer questions based on the uploaded Knowledge Base documents.</p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  m.role === 'user' 
                    ? 'bg-[#6366F1] text-white rounded-br-none' 
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
            <form onSubmit={sendMessage} className="relative">
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
      </div>
    </DashboardLayout>
  )
}
