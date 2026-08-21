import { useMemo, useState } from 'react'
import type { ChatMessage, ChatRole, OnboardingStage } from './chatTypes'

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

export function useChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [role, setRole] = useState<ChatRole>('Engineering')
  const [stage, setStage] = useState<OnboardingStage>('Day 1')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const now = Date.now()
    return [
      {
        id: uid(),
        sender: 'bot',
        text:
          'Hi! I’m Virtual HR. Tell me your question—or pick a quick reply.\n\nTip: answers are personalized by your role and onboarding stage.',
        createdAt: now
      }
    ]
  })

  const quickReplies = useMemo(() => {
    return [
      'First-day checklist',
      'Documents needed',
      'IT setup',
      'Leave policy'
    ]
  }, [])

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMsg: ChatMessage = {
      id: uid(),
      sender: 'user',
      text: trimmed,
      createdAt: Date.now()
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed })
      })
      if (!res.ok) throw new Error('Failed to send message')
      const data = await res.json()

      const botMsg: ChatMessage = {
        id: uid(),
        sender: 'bot',
        text: data.answer || 'Sorry, I could not process your request.',
        createdAt: Date.now()
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      console.error('Chat error:', err)
      const errorMsg: ChatMessage = {
        id: uid(),
        sender: 'bot',
        text: 'Sorry, I encountered an error connecting to the server.',
        createdAt: Date.now()
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  return {
    isOpen,
    setIsOpen,
    role,
    setRole,
    stage,
    setStage,
    isTyping,
    messages,
    quickReplies,
    sendMessage,
    formatTime
  }
}

function getMockBotResponse(input: { role: ChatRole; stage: OnboardingStage; question: string }) {
  const { role, stage, question } = input
  const q = question.toLowerCase()

  const header = `For ${stage} (${role}):`

  if (q.includes('first') || q.includes('day')) {
    return `${header} Welcome! Here’s your first-day checklist:
- Confirm your manager & team channels
- Review company handbook + security basics
- Set up required accounts (email, HR portal)
- Complete mandatory onboarding forms

If you want, ask: “What documents do I need?”`
  }

  if (q.includes('document')) {
    return `${header} Typical documents to collect (may vary by policy):
- ID verification
- Offer letter / employment contract
- Bank details for payroll
- Address proof (if required)
- Any role-specific certifications

Want a copy-ready checklist you can share internally?`
  }

  if (q.includes('it') || q.includes('setup') || q.includes('laptop')) {
    return `${header} IT setup checklist:
- Laptop & core access (email, SSO)
- VPN + password manager
- Required tools for your role (repo/IDE/tools)
- Access to internal docs + onboarding wiki

Reply “Generate my tasks” to turn this into a step-by-step plan.`
  }

  if (q.includes('leave')) {
    return `${header} Leave policy essentials:
- How to request (HR portal / ticket / email)
- Approval timeline
- Sick vs. casual leave rules
- Holidays & calendar expectations

For your exact policy, the admin can update FAQs in the dashboard (scaffolded).`
  }

  return `${header} I can help with onboarding questions. Try one of these:
- First-day checklist
- Documents needed
- IT setup
- Leave policy

Or ask your own question—I'll tailor the answer to your role & stage.`
}

