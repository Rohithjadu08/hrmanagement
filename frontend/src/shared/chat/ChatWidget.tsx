import { useEffect, useMemo, useRef, useState } from 'react'
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { useChatWidget } from './useChatWidget'
import type { OnboardingStage } from './chatTypes'

export default function ChatWidget() {
  const {
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
  } = useChatWidget()

  const [draft, setDraft] = useState('')
  const panelRef = useRef<HTMLDivElement | null>(null)

  const stageOptions: OnboardingStage[] = useMemo(() => ['Day 1', 'Week 1', 'Month 1'], [])
  const roleOptions = useMemo(() => ['Engineering', 'Sales', 'HR', 'Design', 'Other'] as const, [])

  useEffect(() => {
    if (!isOpen) return
    panelRef.current?.scrollTo({ top: panelRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isOpen, isTyping])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = draft
    setDraft('')
    void sendMessage(text)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={
          isOpen
            ? 'hidden'
            : 'group inline-flex items-center gap-2 rounded-full bg-amber2 px-5 py-4 shadow-soft ring-1 ring-amber2/30 transition hover:opacity-95'
        }
        aria-label="Open chat"
      >
        <ChatBubbleLeftRightIcon className="h-5 w-5 text-ink" />
        <span className="text-sm font-semibold text-ink">HR Bot</span>
        <span className="hidden text-xs font-semibold text-ink/80 sm:inline">Chat</span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="w-[92vw] max-w-[440px]">
          <div className="rounded-3xl border border-white/10 bg-white/5 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-amber2" />
                </div>
                <div>
                  <div className="text-sm font-bold text-offwhite">Virtual HR Assistant</div>
                  <div className="text-xs text-white/60">Role-based onboarding support</div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-offwhite transition"
              >
                Close
              </button>
            </div>

            {/* Personalization controls */}
            <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="text-xs font-semibold text-white/70">
                  Role
                  <select
                    className="mt-1 w-full rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-offwhite outline-none focus:ring-2 focus:ring-amber2/40"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                  >
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-semibold text-white/70">
                  Onboarding stage
                  <select
                    className="mt-1 w-full rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-offwhite outline-none focus:ring-2 focus:ring-amber2/40"
                    value={stage}
                    onChange={(e) => setStage(e.target.value as OnboardingStage)}
                  >
                    {stageOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div
              ref={panelRef}
              className="max-h-[340px] overflow-auto px-4 pb-3 pt-1"
              aria-live="polite"
            >
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={m.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                    <div className={m.sender === 'user' ? 'max-w-[85%]' : 'max-w-[85%]'}>
                      <div
                        className={
                          m.sender === 'user'
                            ? 'rounded-2xl rounded-tr-none bg-amber2/90 px-4 py-2 text-ink'
                            : 'rounded-2xl rounded-tl-none bg-white/5 px-4 py-2'
                        }
                      >
                        <div className={m.sender === 'bot' ? 'text-xs font-semibold text-amber2' : 'hidden'}>
                          Virtual HR
                        </div>
                        <div className="mt-1 whitespace-pre-wrap text-sm text-offwhite/90">
                          {m.text}
                        </div>
                      </div>
                      <div className="mt-1 flex justify-end">
                        <span className={m.sender === 'user' ? 'text-[10px] text-ink/70' : 'hidden'}>
                          {formatTime(m.createdAt)}
                        </span>
                        <span className={m.sender === 'bot' ? 'text-[10px] text-white/40' : 'hidden'}>
                          {formatTime(m.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-white/60">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-emerald" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '0.15s' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '0.3s' }} />
                    <span className="text-xs">Typing…</span>
                  </div>
                )}

                {!isTyping && messages.length <= 1 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {quickReplies.map((c) => (
                      <button
                        key={c}
                        onClick={() => void sendMessage(c)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10 transition"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 px-4 py-3">
              <form onSubmit={onSubmit} className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={1}
                  className="min-h-[44px] w-full resize-none rounded-2xl border border-white/10 bg-ink px-3 py-2 text-sm text-offwhite outline-none focus:ring-2 focus:ring-amber2/40"
                  placeholder="Ask about documents, leave policy, IT setup…"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-2xl bg-amber2 text-ink shadow-soft hover:opacity-95 disabled:opacity-50 transition"
                  aria-label="Send message"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>

              <div className="mt-2 flex flex-wrap gap-2">
                {quickReplies.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => void sendMessage(c)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/65 hover:bg-white/10 transition"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Animations wrapper */}
          <style>{`
            @media (prefers-reduced-motion: no-preference) {
              .${'chat-panel-anim'} { animation: chatPanelIn 180ms ease-out both; }
            }
            @keyframes chatPanelIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          `}</style>
        </div>
      )}
    </div>
  )
}

