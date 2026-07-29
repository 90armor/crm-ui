import { useState } from 'react'
import type { Contact } from '@/types/domain'

// Docked bottom-right like a Messenger/FB chat popup — shifts left to sit
// beside the dept breakdown (DetailPanel) instead of hiding behind it when open.
export function NotesPanel({
  contact, dockedNextToPane, onClose, onAddNote,
}: {
  contact: Contact; dockedNextToPane: boolean; onClose: () => void; onAddNote: (text: string) => void
}) {
  const [text, setText] = useState('')
  const notes = contact.notes ?? []

  const handleAdd = () => {
    if (!text.trim()) return
    onAddNote(text.trim())
    setText('')
  }

  return (
    <div
      className={`fixed bottom-0 z-50 transition-[right] duration-150 ${dockedNextToPane ? 'right-[326px]' : 'right-4'}`}
    >
      <div className="bg-white rounded-t-2xl shadow-2xl border border-gray-200 border-b-0 w-[320px] max-h-[65vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60 shrink-0">
          <div className="min-w-0">
            <h2 className="text-[13px] font-semibold text-gray-900 truncate">Notes · {contact.name}</h2>
            <p className="text-[10.5px] text-gray-400 mt-0.5">Internal notes — not visible to the patient</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-xl leading-none shrink-0 ml-2">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {notes.length === 0 ? (
            <p className="text-[12px] text-gray-400 text-center py-8">No notes yet. Add the first one below.</p>
          ) : (
            notes.map(n => (
              <div key={n.id} className="flex gap-2.5">
                <span className="w-1 rounded-full bg-blue-100 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-gray-800">{n.author}</span>
                    <span className="text-[10px] text-gray-400">{n.timestamp}</span>
                  </div>
                  <p className="text-[13px] text-gray-600 mt-0.5 whitespace-pre-wrap break-words">{n.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-gray-100 flex items-end gap-2 shrink-0">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAdd()
              }
            }}
            rows={2}
            placeholder="Write a note…"
            className="flex-1 text-[13px] border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <button
            disabled={!text.trim()}
            onClick={handleAdd}
            className="px-4 py-2 text-[13px] font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors shrink-0"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
