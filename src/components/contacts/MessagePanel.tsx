import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { SourceIcon, HelpCircleIcon, ExpandIcon, MinimizeIcon, CloseXIcon, CheckIcon, PaperclipIcon, SendIcon } from '@/icons'
import type { Contact, ChatMessage } from '@/types/domain'

export function MessagePanel({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: 'contact', text: contact.lastMessage, time: contact.lastActive },
    { from: 'staff', sender: 'Bot (auto-reply)', text: 'Thanks for reaching out — our team will get back to you shortly.', time: 'Just now' },
  ])
  const [draft, setDraft] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSend = () => {
    if (!draft.trim()) return
    setMessages(prev => [...prev, { from: 'staff', sender: 'Admin', text: draft.trim(), time: 'Just now' }])
    setDraft('')
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        title={`Restore chat with ${contact.name}`}
        className="fixed bottom-5 right-5 z-50 rounded-full hover:scale-105 transition-transform"
      >
        <div className="relative w-14 h-14 rounded-full shadow-2xl ring-4 ring-white">
          <Avatar initials={contact.initials} color={contact.color} size={56} />
          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm">
            <SourceIcon source={contact.source} className="w-4 h-4" />
          </span>
        </div>
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden ${
        isExpanded ? 'w-[400px] h-[600px]' : 'w-[340px] h-[480px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <Avatar initials={contact.initials} color={contact.color} size={32} />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
              <SourceIcon source={contact.source} className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="min-w-0 flex items-center gap-1">
            <p className="text-[13px] font-semibold truncate">{contact.name}</p>
            <HelpCircleIcon className="w-3.5 h-3.5 text-white/70 shrink-0" />
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button onClick={() => setIsExpanded(v => !v)} title={isExpanded ? 'Shrink' : 'Expand'} className="text-white/80 hover:text-white transition-colors">
            <ExpandIcon className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsMinimized(true)} title="Minimize" className="text-white/80 hover:text-white transition-colors">
            <MinimizeIcon className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} title="Close" className="text-white/80 hover:text-white transition-colors">
            <CloseXIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 bg-white dark:bg-gray-900">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.from === 'staff' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
              m.from === 'staff' ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-bl-sm'
            }`}>
              {m.text}
            </div>
            <p className="mt-1 text-[10.5px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
              {m.sender && <span className="font-semibold text-gray-500 dark:text-gray-400">{m.sender} ·</span>}
              {m.time}
              {m.from === 'staff' && <CheckIcon className="w-3 h-3 text-blue-400 dark:text-blue-500" />}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 shrink-0">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
          placeholder="Type a message…"
          className="flex-1 text-[13px] px-2 py-1.5 focus:outline-none bg-white dark:bg-gray-900 dark:text-gray-100"
        />
        <PaperclipIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
        <button onClick={handleSend} disabled={!draft.trim()} title="Send" className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:text-gray-300 dark:disabled:text-gray-600 transition-colors shrink-0">
          <SendIcon className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  )
}
