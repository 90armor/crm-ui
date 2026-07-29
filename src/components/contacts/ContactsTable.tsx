import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ManualSourceBadge } from '@/components/ui/ManualSourceBadge'
import { SourceIcon, ChatBubbleIcon, PhoneIcon, ActivityLogIcon, ChatIcon, ChevronDownIcon } from '@/icons'
import { ENTRY_TONE, ENTRY_STATUS_LABEL, HUE } from '@/theme/hue'
import { deptShortLabel, CURRENT_ADMIN_NAME, formatNoteTimestamp } from '@/lib/format'
import { MessagePanel } from '@/components/contacts/MessagePanel'
import { NotesPanel } from '@/components/contacts/NotesPanel'
import type { Contact, ViewAs, ContactNote, Priority } from '@/types/domain'

function ContactsTable({
  contacts,
  viewAs,
  paneContact,
  onRowClick,
  updateContact,
  handleStart,
  handleWaitingPatient,
  handleResume,
  handleMarkComplete,
  onReturn,
  onOpenActivityLog,
  useIconActions = false,
  bare = false,
  lastMessageColumnLabel = 'Last Message',
}: {
  contacts: Contact[]
  viewAs: ViewAs
  paneContact: Contact | null
  onRowClick: (c: Contact) => void
  updateContact: (c: Contact) => void
  handleStart: (c: Contact) => void
  handleWaitingPatient: (c: Contact) => void
  handleResume: (c: Contact) => void
  handleMarkComplete: (c: Contact) => void
  onReturn: (c: Contact) => void
  onOpenActivityLog?: (c: Contact) => void
  useIconActions?: boolean
  // Skips its own card chrome (border/shadow/rounded corners) when the caller
  // already wraps it in one, so filters + table can share a single card.
  bare?: boolean
  lastMessageColumnLabel?: string
}) {
  const [messageContact, setMessageContact] = useState<Contact | null>(null)

  const [expandedNotes, setIsExpandedNotes] = useState<Set<string>>(new Set())
  const isNoteExpanded = (id: string) => expandedNotes.has(id)
  const toggleNote = (id: string) =>
    setIsExpandedNotes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const [notesContactId, setNotesContactId] = useState<string | null>(null)
  const notesContact = contacts.find(c => c.id === notesContactId) ?? null

  const handleAddNote = (text: string) => {
    if (!notesContact) return
    const note: ContactNote = { id: `note-${Date.now()}`, author: CURRENT_ADMIN_NAME, text, timestamp: formatNoteTimestamp(new Date()) }
    updateContact({ ...notesContact, notes: [...(notesContact.notes ?? []), note] })
  }

  return (
    <div className={bare ? '' : 'bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm'}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-100">
              <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Contact</th>
              <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">{lastMessageColumnLabel}</th>
              <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5 whitespace-nowrap">First Contact</th>
              <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Status</th>
              {viewAs === 'PFSD' && (
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5 whitespace-nowrap">Assignees</th>
              )}
              {viewAs !== 'PFSD' && (
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5 whitespace-nowrap min-w-[220px]">PFSD Note</th>
              )}
              {viewAs === 'Pharmacy' && (
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Type</th>
              )}
              <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Priority</th>
              <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5 whitespace-nowrap">Last Active</th>
              {viewAs !== 'PFSD' && (
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {contacts.map(contact => {
              const activeEntry = contact.chain[contact.currentChainIndex]
              const activeTone = activeEntry && ENTRY_TONE[activeEntry.entryStatus]
              const pharmEntry = contact.chain.find(e => e.dept === 'Pharmacy')
              const isSelected = paneContact?.id === contact.id

              return (
                <tr
                  key={contact.id}
                  onClick={() => viewAs === 'PFSD' && onRowClick(contact)}
                  className={`border-b border-gray-50 transition-colors ${
                    viewAs === 'PFSD' ? 'cursor-pointer' : ''
                  } ${isSelected ? 'bg-blue-50/70 shadow-[inset_3px_0_0_0_#3b82f6]' : 'hover:bg-gray-50/70'}`}
                >
                  {/* Contact */}
                  <td className="px-4 py-3.5">
                    {useIconActions ? (
                      <div className="flex items-center gap-3">
                        <Avatar initials={contact.initials} color={contact.color} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-semibold text-gray-900">{contact.name}</span>
                            <SourceIcon source={contact.source} className="w-3.5 h-3.5 shrink-0" />
                            {contact.priority === 'Prio' && (
                              <span className="text-[10px] px-1.5 py-px rounded font-bold bg-orange-100 text-orange-600 leading-none">PRIO</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2.5 mt-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setMessageContact(contact)}
                              title="Message"
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                            >
                              <ChatBubbleIcon className="w-4 h-4" />
                            </button>
                            <span className="text-emerald-500">
                              <PhoneIcon className="w-4 h-4" />
                            </span>
                            {viewAs !== 'PFSD' && (
                              <button
                                onClick={() => onOpenActivityLog?.(contact)}
                                title="Activity Log"
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <ActivityLogIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Avatar initials={contact.initials} color={contact.color} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-semibold text-gray-900">{contact.name}</span>
                            {contact.source === 'Manual' && <ManualSourceBadge />}
                          {contact.priority === 'Prio' && (
                              <span className="text-[10px] px-1.5 py-px rounded font-bold bg-orange-100 text-orange-600 leading-none">PRIO</span>
                            )}
                          </div>
                          {contact.source === 'Manual' ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <button
                              onClick={e => { e.stopPropagation(); setNotesContactId(contact.id) }}
                              className="inline-flex items-center justify-center w-5 h-5 rounded text-blue-500 hover:bg-blue-50 transition-colors"
                              title="Notes"
                            >
                              <ChatIcon />
                            </button>
                            {contact.phone && <span className="text-[11px] text-gray-400">{contact.phone}</span>}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 mt-0.5">
                              <span className={`text-[11px] px-1.5 py-px rounded font-medium ${contact.source === 'Telegram' ? 'bg-blue-50 text-blue-500' : 'bg-indigo-50 text-indigo-500'}`}>{contact.source}</span>
                              {contact.hnNumber && <span className="text-[11px] text-gray-400">{contact.hnNumber}</span>}
                              {contact.phone && <span className="text-[11px] text-gray-300">· {contact.phone}</span>}
                            </div>
                          )}
                      </div>
                      </div>
                    )}
                  </td>

                  {/* Last message */}
                  <td className="px-4 py-3.5 max-w-[130px]">
                    <p className="text-[13px] text-gray-600 truncate">{contact.lastMessage}</p>
                  </td>

                  {/* First contact */}
                  <td className="px-4 py-3.5 text-[12px] text-gray-500 whitespace-nowrap">{contact.firstContact}</td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={contact.status} />
                  </td>

                  {/* Handoff chain (PFSD) — clean, no comments */}
                  {viewAs === 'PFSD' && (
                    <td className="px-4 py-3.5">
                      {contact.chain.length === 0 ? (
                        <span className="text-[12px] text-gray-300 italic">No chain set</span>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {contact.chain.map((entry, idx) => {
                              // 'pending' (up next, hasn't clicked Start yet) already carries its
                              // own amber tone, distinct from 'queued' (not yet reached). Only the
                              // dot encodes status; the pill and text stay neutral throughout.
                              const tone = ENTRY_TONE[entry.entryStatus]
                              return (
                                <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tone.dot}`} />
                                  {deptShortLabel(entry.dept)}
                                </span>
                              )
                            })}
                          </div>
                          {activeEntry && activeTone ? (
                            <p className={`mt-1.5 text-[11px] whitespace-nowrap ${activeTone.text}`}>
                              {activeEntry.entryStatus === 'returned'
                                ? `Return from ${activeEntry.dept}`
                                : `${ENTRY_STATUS_LABEL[activeEntry.entryStatus]} at ${activeEntry.dept}`}
                            </p>
                          ) : contact.chain.every(e => e.entryStatus === 'completed') && (
                            <p className={`mt-1.5 text-[11px] whitespace-nowrap ${HUE.emerald.text}`}>
                              All departments completed
                            </p>
                          )}
                        </>
                      )}
                    </td>
                  )}

                  {/* PFSD note (dept view) */}
                  {viewAs !== 'PFSD' && (
                    <td className="px-4 py-3.5 min-w-[220px] max-w-[280px]">
                      {activeEntry?.comment ? (
                        <div className="relative group">
                          <p className={`flex items-start gap-1.5 text-[12px] text-gray-700 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg leading-relaxed ${activeEntry.comment.length > 80 ? 'pb-4' : ''}`}>
                            <ChatBubbleIcon className="w-3 h-3 mt-0.5 text-blue-400 shrink-0" />
                            <span className={isNoteExpanded(contact.id) ? '' : 'line-clamp-2'}>{activeEntry.comment}</span>
                          </p>
                          {/* Only long notes need it — short ones already fit in two lines,
                              so the toggle would just be visual noise for those rows. Tucked
                              into the corner and hidden until hover so it doesn't compete
                              with the note text itself. */}
                          {activeEntry.comment.length > 80 && (
                            <button
                              onClick={() => toggleNote(contact.id)}
                              className="absolute bottom-1 right-1.5 text-[10px] font-semibold text-blue-600 bg-blue-50 px-1 rounded opacity-0 group-hover:opacity-100 hover:text-blue-800 transition-opacity"
                            >
                              {isNoteExpanded(contact.id) ? 'Show less' : 'Show more'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[12px] text-gray-300">No note from PFSD</span>
                      )}
                    </td>
                  )}

                  {/* Pharmacy type */}
                  {viewAs === 'Pharmacy' && (
                    <td className="px-4 py-3.5">
                      {pharmEntry?.pharmacyType ? (
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${pharmEntry.pharmacyType === 'Question' ? 'bg-violet-100 text-violet-700' : 'bg-teal-100 text-teal-700'}`}>
                          {pharmEntry.pharmacyType}
                        </span>
                      ) : <span className="text-gray-200 text-[12px]">—</span>}
                    </td>
                  )}

                  {/* Priority */}
                  <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                    <div className="relative inline-block">
                      <select
                        value={contact.priority}
                        onChange={e => updateContact({ ...contact, priority: e.target.value as Priority })}
                        className={`text-[12px] border rounded-lg pl-2 pr-6 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white font-medium cursor-pointer appearance-none ${contact.priority === 'Prio' ? 'border-orange-300 text-orange-600 bg-orange-50' : 'border-gray-200 text-gray-600'}`}
                      >
                        <option value="Normal">Normal</option>
                        <option value="Prio">Prio</option>
                      </select>
                      <ChevronDownIcon className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                  </td>

                  {/* Last active */}
                  <td className="px-4 py-3.5 text-[12px] text-gray-500 whitespace-nowrap">{contact.lastActive}</td>

                  {/* Actions (dept view only) — driven by the current entry's own status */}
                  {viewAs !== 'PFSD' && (
                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        {activeEntry?.entryStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStart(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                            >
                              Start
                            </button>
                            {/* Return before Start too — PFSD can mis-assign a department,
                                so the dept shouldn't have to start work just to send it back. */}
                            <button
                              onClick={() => onReturn(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Return
                            </button>
                          </>
                        )}
                        {activeEntry?.entryStatus === 'active' && (
                          <>
                            <button
                              onClick={() => handleWaitingPatient(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-purple-50 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors whitespace-nowrap"
                            >
                              Waiting patient
                            </button>
                            <button
                              onClick={() => handleMarkComplete(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
                            >
                              Mark complete
                            </button>
                            <button
                              onClick={() => onReturn(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Return
                            </button>
                          </>
                        )}
                        {activeEntry?.entryStatus === 'waitingPatient' && (
                          <>
                            <button
                              onClick={() => handleResume(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                            >
                              Resume
                            </button>
                            <button
                              onClick={() => handleMarkComplete(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
                            >
                              Mark complete
                            </button>
                            <button
                              onClick={() => onReturn(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Return
                            </button>
                          </>
                        )}
                        {activeEntry?.entryStatus === 'returned' && (
                          <span className="text-[11px] text-gray-400 italic">Waiting on PFSD</span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}

            {contacts.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-16 text-center text-[13px] text-gray-400">
                  {viewAs !== 'PFSD'
                    ? `No active cases assigned to ${viewAs} at this time.`
                    : 'No records match the current filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {messageContact && (
        <MessagePanel contact={messageContact} onClose={() => setMessageContact(null)} />
      )}

      {notesContact && (
        <NotesPanel
          contact={notesContact}
          dockedNextToPane={paneContact !== null && viewAs === 'PFSD'}
          onClose={() => setNotesContactId(null)}
          onAddNote={handleAddNote}
        />
      )}
    </div>
  )
}

export { ContactsTable }
