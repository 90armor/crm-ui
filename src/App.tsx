import { useState, useRef, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Dept = 'Nurse (OPD)' | 'Nurse (OBGYN)' | 'MC' | 'MA (IPD)' | 'MA (PED)' | 'Pharmacy'
type ViewAs = 'PFSD' | Dept
type Status = 'Open' | 'Pending' | 'Closed'
type Priority = 'Normal' | 'Prio'
type PharmacyType = 'Question' | 'Medicine only'
type ChainEntryStatus = 'waiting' | 'active' | 'completed' | 'returned'

interface ChainEntry {
  dept: Dept
  comment: string
  returnComment: string
  entryStatus: ChainEntryStatus
  pharmacyType?: PharmacyType
}

interface Contact {
  id: string
  name: string
  initials: string
  color: string
  source: 'Facebook' | 'Telegram' | 'Manual'
  hnNumber?: string
  phone?: string
  lastMessage: string
  firstContact: string
  status: Status
  priority: Priority
  chain: ChainEntry[]
  currentChainIndex: number
  lastActive: string
  activityLog: string[]
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const INIT: Contact[] = [
  {
    id: '1', name: 'Thanawat N.', initials: 'TN', color: '#3b82f6',
    source: 'Telegram', lastMessage: 'សួស្តី ខ្ញុំចង់សួរអំពីថ្នាំ',
    firstContact: '08 Jul 2026', status: 'Open', priority: 'Normal',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 10, 03:55 AM',
    activityLog: ['Inquiry logged from Telegram · 3h ago', 'Status set to Pending · 3h ago'],
  },
  {
    id: '2', name: 'Wyan Phang M.', initials: 'WP', color: '#f97316',
    source: 'Telegram', lastMessage: 'ចង់ណាត់ជួបគ្រូពេទ្យបន្ទាន់',
    firstContact: '03 Jul 2026', status: 'Open', priority: 'Prio',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 10, 4:25 AM',
    activityLog: ['Priority set to Prio · 1h ago', 'Inquiry logged from Telegram · 2h ago'],
  },
  {
    id: '3', name: 'Muait Phang M.', initials: 'MP', color: '#8b5cf6',
    source: 'Telegram', lastMessage: 'How are you doing?',
    firstContact: '01 Jul 2026', status: 'Pending', priority: 'Normal',
    chain: [
      { dept: 'Nurse (OPD)', comment: 'Check vitals and initial assessment', returnComment: '', entryStatus: 'active' },
      { dept: 'Pharmacy', comment: 'Dispense prescribed medication after nurse review', returnComment: '', entryStatus: 'waiting', pharmacyType: 'Medicine only' },
    ],
    currentChainIndex: 0, lastActive: 'Jul 15, 11:00 AM',
    activityLog: ['Assigned to Nurse (OPD) · 2h ago', 'Status set to Pending · 5h ago', 'Inquiry logged from Telegram · 5h ago'],
  },
  {
    id: '4', name: 'Danuri T.', initials: 'DT', color: '#10b981',
    source: 'Facebook', lastMessage: 'អ្នកជំងឺបានទទួលការព្យាបាលធម្មតាហើយ',
    firstContact: '10 Jul 2026', status: 'Closed', priority: 'Normal',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 11, 4:17 PM',
    activityLog: ['Case closed · 1d ago', 'Pharmacy completed · 1d ago', 'Assigned to Pharmacy · 2d ago'],
  },
  {
    id: '5', name: 'Suda K.', initials: 'SK', color: '#06b6d4',
    source: 'Facebook', lastMessage: 'ចង់សួរអំពីការណាត់ជួប',
    firstContact: '10 Jul 2026', status: 'Open', priority: 'Normal',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 10, 3:10 PM',
    activityLog: ['Inquiry logged from Facebook · 4h ago'],
  },
  {
    id: '6', name: 'Arun P.', initials: 'AP', color: '#ec4899',
    source: 'Telegram', hnNumber: 'HN00123', phone: '0891234567', lastMessage: 'Inquired about post-op care',
    firstContact: '12 Jul 2026', status: 'Pending', priority: 'Prio',
    chain: [
      { dept: 'MA (IPD)', comment: 'Handle post-op care inquiry and coordinate with nurse', returnComment: '', entryStatus: 'active' },
      { dept: 'Nurse (OPD)', comment: 'Follow up on post-op status and wound check', returnComment: '', entryStatus: 'waiting' },
    ],
    currentChainIndex: 0, lastActive: 'Jul 12, 10:00 AM',
    activityLog: ['Assigned to MA (IPD) · 1h ago', 'Priority set to Prio · 2h ago', 'Inquiry logged from Manual · 8h ago'],
  },
  {
    id: '7', name: 'Somsak W.', initials: 'SW', color: '#f59e0b',
    source: 'Facebook', lastMessage: 'ចង់សួរអំពីថ្នាំដែលត្រូវលេប',
    firstContact: '15 Jul 2026', status: 'Pending', priority: 'Normal',
    chain: [
      { dept: 'Pharmacy', comment: 'Please check medication for this patient', returnComment: 'ថ្នាំនេះត្រូវការការអនុម័តពីគ្រូពេទ្យសិន មិនអាចចែកឱ្យបានទេ', entryStatus: 'returned', pharmacyType: 'Question' },
    ],
    currentChainIndex: 0, lastActive: 'Jul 16, 9:00 AM',
    activityLog: ['Returned to PFSD by Pharmacy · 30m ago', 'Assigned to Pharmacy · 2h ago', 'Inquiry logged from Facebook · 6h ago'],
  },
  {
    id: '8', name: 'Nattaya B.', initials: 'NB', color: '#6366f1',
    source: 'Facebook', lastMessage: 'សូមសួរអំពីលទ្ធផលឈាម',
    firstContact: '18 Jul 2026', status: 'Open', priority: 'Normal',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 18, 8:30 AM',
    activityLog: ['Inquiry logged from Facebook · 30m ago'],
  },
]

const ALL_DEPTS: Dept[] = ['Nurse (OPD)', 'Nurse (OBGYN)', 'MC', 'MA (IPD)', 'MA (PED)', 'Pharmacy']
const ALL_VIEWS: ViewAs[] = ['PFSD', ...ALL_DEPTS]

// ─── Style maps ───────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<Status, { pill: string }> = {
  'Open':    { pill: 'bg-sky-100 text-sky-700' },
  'Pending': { pill: 'bg-amber-100 text-amber-700' },
  'Closed':  { pill: 'bg-emerald-100 text-emerald-700' },
}

const ENTRY_BADGE: Record<ChainEntryStatus, string> = {
  waiting:   'bg-gray-100 text-gray-500 border-gray-200',
  active:    'bg-amber-100 text-amber-700 border-amber-300',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  returned:  'bg-red-100 text-red-700 border-red-200',
}

// Dot + text tone for the Handoff Chain column — status reads from a small dot
// and matching text color instead of a filled chip. "Up next" (current pointer,
// still 'waiting') gets its own amber tone via CURRENT_WAITING_TONE so it reads
// differently from a dept further down the chain that hasn't been reached yet.
const ENTRY_TONE: Record<ChainEntryStatus, { dot: string; text: string }> = {
  waiting:   { dot: 'bg-gray-300',    text: 'text-gray-400' },
  active:    { dot: 'bg-blue-500',    text: 'text-blue-700' },
  completed: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  returned:  { dot: 'bg-red-500',     text: 'text-red-700' },
}
const CURRENT_WAITING_TONE = { dot: 'bg-amber-500', text: 'text-amber-700' }

// 'Nurse (OPD)' -> 'OPD', 'MA (IPD)' -> 'IPD'; depts without a parenthetical
// abbreviation ('MC', 'Pharmacy') are already short and pass through as-is.
function deptShortLabel(dept: Dept): string {
  const match = dept.match(/\(([^)]+)\)/)
  return match ? match[1] : dept
}

// Used only for the "current" (isCurrent) badge/dot in DetailPane's breakdown —
// 'completed' entries are never current, so that row is unused but keeps the
// Record total so class strings stay literal for Tailwind's JIT scanner.
const CURRENT_ENTRY_TONE: Record<ChainEntryStatus, { badge: string; dot: string }> = {
  waiting:   { badge: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  active:    { badge: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
  completed: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  returned:  { badge: 'bg-red-100 text-red-700',        dot: 'bg-red-500' },
}

const ENTRY_STATUS_LABEL: Record<ChainEntryStatus, string> = {
  waiting:   'Pending',
  active:    'In Progress',
  completed: 'Complete',
  returned:  'Return',
}

// ─── Shared components ────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0 select-none"
    >
      {initials}
    </div>
  )
}

function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLE[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${s.pill}`}>
      {status}
    </span>
  )
}

// Destination-dot marker for the department breakdown timeline. The "current"
// node pulses — that's the one PFSD needs to see, whether it's actively being
// worked (active/returned) or just handed off and waiting on the dept to start.
function StepDot({ status, isCurrent }: { status: ChainEntryStatus; isCurrent: boolean }) {
  if (status === 'completed') {
    return (
      <span className="relative z-10 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold leading-none">
        ✓
      </span>
    )
  }
  if (status === 'active') {
    return (
      <span className="relative z-10 w-5 h-5 flex items-center justify-center shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60 animate-ping" />
        <span className="relative w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-100" />
      </span>
    )
  }
  if (status === 'returned') {
    return (
      <span className="relative z-10 w-5 h-5 flex items-center justify-center shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping" />
        <span className="relative w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-100" />
      </span>
    )
  }
  if (isCurrent) {
    return (
      <span className="relative z-10 w-5 h-5 flex items-center justify-center shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 animate-ping" />
        <span className="relative w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100" />
      </span>
    )
  }
  return <span className="relative z-10 w-5 h-5 rounded-full bg-white border-2 border-gray-300 shrink-0" />
}

function stepLabelClass(status: ChainEntryStatus, isCurrent: boolean): string {
  if (isCurrent) return 'font-bold text-gray-900'
  if (status === 'completed') return 'font-medium text-gray-500'
  return 'font-medium text-gray-400'
}

// Activity log entries are plain strings (no structured event type), so this is a
// display-only heuristic on the message text — good enough to let PFSD skim for
// consequential events (returned/closed) without a data-model change.
function activityLogTone(log: string): string {
  if (log.includes('Returned') || log.includes('closed')) return 'bg-red-400'
  if (log.toLowerCase().includes('complete')) return 'bg-emerald-400'
  return 'bg-gray-300'
}

function MinusCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="10" cy="10" r="8" />
      <line x1="6.5" y1="10" x2="13.5" y2="10" strokeLinecap="round" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13.5 3.5l3 3L6 17l-4 1 1-4L13.5 3.5z" />
    </svg>
  )
}

// ─── Sequential Assignment Popup ─────────────────────────────────────────────

function AssignPopup({
  contact,
  mode = 'assign',
  onClose,
  onSave,
}: {
  contact: Contact
  mode?: 'assign' | 'reassign'
  onClose: () => void
  onSave: (chain: ChainEntry[], currentIdx: number) => void
}) {
  const [chain, setChain] = useState<ChainEntry[]>(contact.chain)
  const dragIdx = useRef<number | null>(null)
  const dragOverIdx = useRef<number | null>(null)

  const textareaRefs = useRef<Map<number, HTMLTextAreaElement>>(new Map())
  const [focusTargetIndex, setFocusTargetIndex] = useState<number | null>(null)
  useEffect(() => {
    if (focusTargetIndex === null) return
    const el = textareaRefs.current.get(focusTargetIndex)
    el?.focus()
    el?.setSelectionRange(el.value.length, el.value.length)
    setFocusTargetIndex(null)
  }, [focusTargetIndex])

  // For a still-waiting dept, the note (and Pharmacy inquiry type) start collapsed
  // behind a pencil — PFSD sees the note as a label and opts into editing it, and
  // opening it (either via the pencil or fresh from "Add to chain") grabs focus,
  // since PFSD is presumably about to type a note right away.
  const [editingComments, setEditingComments] = useState<Set<number>>(new Set())
  const toggleEditComment = (i: number) =>
    setEditingComments(prev => {
      const next = new Set(prev)
      if (next.has(i)) {
        next.delete(i)
      } else {
        next.add(i)
        setFocusTargetIndex(i)
      }
      return next
    })
  // Reindex the editing-set the same way an index-shifting chain op (remove/reorder)
  // reindexes `chain`, so a still-open note stays pinned to the right entry.
  const remapEditing = (transform: (i: number) => number | null) =>
    setEditingComments(prev => {
      const next = new Set<number>()
      prev.forEach(i => {
        const t = transform(i)
        if (t !== null) next.add(t)
      })
      return next
    })

  // Reassign unlocks the returned entry itself (currentChainIndex), instead of
  // only what comes after it, so PFSD can redirect it — edit its note, swap it
  // out, or reorder — the same way they'd build the chain in the first place.
  const firstEditable = mode === 'reassign' ? contact.currentChainIndex : contact.currentChainIndex + 1

  const updateComment = (i: number, v: string) =>
    setChain(p => p.map((e, j) => j === i ? { ...e, comment: v } : e))

  const updatePharmType = (i: number, v: PharmacyType) =>
    setChain(p => p.map((e, j) => j === i ? { ...e, pharmacyType: v } : e))

  const addDept = (dept: Dept) => {
    const newIndex = chain.length
    setChain(p => [...p, { dept, comment: '', returnComment: '', entryStatus: 'waiting' }])
    setEditingComments(prev => new Set(prev).add(newIndex))
    setFocusTargetIndex(newIndex)
  }

  const removeDept = (i: number) => {
    setChain(p => p.filter((_, j) => j !== i))
    remapEditing(j => {
      if (j === i) return null
      if (j > i) return j - 1
      return j
    })
  }

  const handleDragStart = (i: number) => { dragIdx.current = i }
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    dragOverIdx.current = i
  }
  const handleDrop = () => {
    const from = dragIdx.current
    const to = dragOverIdx.current
    if (from === null || to === null || from === to) return
    const next = [...chain]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setChain(next)
    remapEditing(j => {
      if (j === from) return to
      if (from < to && j > from && j <= to) return j - 1
      if (from > to && j >= to && j < from) return j + 1
      return j
    })
    dragIdx.current = null
    dragOverIdx.current = null
  }

  const handleSave = () => {
    const updatedChain = chain.map((e, i) => {
      if (i < firstEditable) return e
      return { ...e, entryStatus: 'waiting' as ChainEntryStatus }
    })
    const newIdx = contact.currentChainIndex === -1 && updatedChain.length > 0 ? 0 : contact.currentChainIndex
    onSave(updatedChain, newIdx)
    onClose()
  }

  const usedDepts = new Set(chain.map(e => e.dept))
  const available = ALL_DEPTS.filter(d => !usedDepts.has(d))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[580px] max-h-[88vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">{mode === 'reassign' ? 'Reassign Department' : 'Sequential Assignment'}</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {contact.name} · {mode === 'reassign' ? 'Redirect the returned department or adjust the chain' : 'Build the handoff chain in order'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {chain.length === 0 && (
            <p className="text-[13px] text-gray-400 italic text-center py-8">No departments yet. Add one below.</p>
          )}

          {chain.map((entry, i) => {
            const isLocked = i < firstEditable
            const isDraggable = !isLocked
            // A dept that's still waiting starts with its note collapsed to a label;
            // any other editable entry (e.g. the returned dept during reassign) keeps
            // the note open, since it's already mid-flow rather than freshly queued.
            const isWaitingEditable = !isLocked && entry.entryStatus === 'waiting'
            const isEditingNote = editingComments.has(i)
            const showNoteEditor = !isLocked && (!isWaitingEditable || isEditingNote)
            return (
              <div
                key={i}
                draggable={isDraggable}
                onDragStart={() => isDraggable && handleDragStart(i)}
                onDragOver={e => isDraggable && handleDragOver(e, i)}
                onDrop={handleDrop}
                className={`rounded-xl border p-4 space-y-3 transition-all ${
                  entry.entryStatus === 'active'    ? 'border-amber-300 bg-amber-50/40' :
                  entry.entryStatus === 'completed' ? 'border-gray-200 bg-gray-50/60 opacity-70' :
                  entry.entryStatus === 'returned'  ? 'border-red-200 bg-red-50/40' :
                  'border-gray-200 bg-white'
                } ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {isDraggable && (
                    <span className="text-gray-300 text-[13px] select-none">⠿</span>
                  )}
                  <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[11px] flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                  <span className="text-[13px] font-semibold text-gray-900">{entry.dept}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${ENTRY_BADGE[entry.entryStatus]}`}>
                    {entry.entryStatus}
                  </span>
                  {isLocked
                    ? <span className="ml-auto text-[11px] text-gray-400">Read-only</span>
                    : (
                      <button onClick={() => removeDept(i)} className="ml-auto text-gray-300 hover:text-red-400 text-[13px] font-bold">✕</button>
                    )
                  }
                </div>

                {/* PFSD note — a waiting dept shows it as a label with a pencil to edit;
                    any other editable entry keeps the textarea open directly. */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PFSD note to {entry.dept} <span className="normal-case font-medium text-gray-300">(optional)</span></label>
                    {isWaitingEditable && (
                      <button
                        onClick={() => toggleEditComment(i)}
                        title={isEditingNote ? 'Done editing' : 'Edit note'}
                        className="text-gray-300 hover:text-blue-500 transition-colors shrink-0"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {showNoteEditor ? (
                    <textarea
                      ref={el => {
                        if (el) textareaRefs.current.set(i, el)
                        else textareaRefs.current.delete(i)
                      }}
                      value={entry.comment}
                      onChange={e => updateComment(i, e.target.value)}
                      rows={2}
                      placeholder={`Instructions for ${entry.dept}… (optional)`}
                      className="mt-1 w-full text-[13px] border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                  ) : (
                    <p className="mt-1 text-[13px] text-gray-700 bg-white border border-gray-100 rounded-lg px-3 py-2 min-h-[38px]">
                      {entry.comment || <span className="text-gray-300 italic">No note</span>}
                    </p>
                  )}
                </div>

                {/* Return note from dept (read-only, info only) */}
                {entry.returnComment && (
                  <div>
                    <label className="text-[10px] font-bold text-red-400 uppercase tracking-wider">↩ Return note from {entry.dept}</label>
                    <p className="mt-1 text-[12px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">{entry.returnComment}</p>
                  </div>
                )}

                {/* Pharmacy inquiry type — collapsed shows only the chosen pill, in the same
                    style as the selected choice below, so the two states read as one control */}
                {entry.dept === 'Pharmacy' && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pharmacy inquiry type</label>
                    {showNoteEditor ? (
                      <div className="flex gap-2 mt-1.5">
                        {(['Question', 'Medicine only'] as PharmacyType[]).map(t => (
                          <button
                            key={t}
                            disabled={isLocked}
                            onClick={() => !isLocked && updatePharmType(i, t)}
                            className={`px-3 py-1 rounded-full text-[12px] font-semibold border transition-colors ${
                              entry.pharmacyType === t
                                ? 'bg-violet-600 text-white border-violet-600'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-600'
                            } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-1.5">
                        {entry.pharmacyType ? (
                          <span className="px-3 py-1 rounded-full text-[12px] font-semibold border bg-violet-600 text-white border-violet-600">
                            {entry.pharmacyType}
                          </span>
                        ) : (
                          <span className="text-[12px] text-gray-300 italic">Not set</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Add dept */}
          {available.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Add to chain</p>
              <div className="flex flex-wrap gap-2">
                {available.map(d => (
                  <button
                    key={d}
                    onClick={() => addDept(d)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    + {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-800">Cancel</button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-[13px] font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            {mode === 'reassign' ? 'Reassign' : 'Assign Chain'} ({chain.length} dept{chain.length !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Return Modal (dept view) ─────────────────────────────────────────────────

function ReturnModal({
  contact, dept, onClose, onReturn,
}: {
  contact: Contact; dept: Dept; onClose: () => void; onReturn: (note: string) => void
}) {
  const [note, setNote] = useState('')
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px]">
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">Return to PFSD</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">{contact.name} · from {dept}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-[13px] text-gray-600">Describe why you are returning this case. PFSD admin will see this note.</p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={4}
            placeholder="Reason for returning…"
            className="w-full text-[13px] border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-800">Cancel</button>
          <button
            disabled={!note.trim()}
            onClick={() => note.trim() && onReturn(note.trim())}
            className="px-5 py-2 text-[13px] font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-40 transition-colors"
          >
            Return to PFSD
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Right Pane (PFSD view) ───────────────────────────────────────────────────

function DetailPane({
  contact,
  onClose,
  onUpdate,
  onOpenAssign,
  onOpenReassign,
}: {
  contact: Contact
  onClose: () => void
  onUpdate: (c: Contact) => void
  onOpenAssign: () => void
  onOpenReassign: () => void
}) {
  const returnedEntry = contact.chain.find(e => e.entryStatus === 'returned')

  const handleMarkResolved = () => {
    // Re-activate the returned dept — continue the task
    const newChain = contact.chain.map(e =>
      e.entryStatus === 'returned' ? { ...e, entryStatus: 'active' as ChainEntryStatus, returnComment: e.returnComment } : e
    )
    onUpdate({ ...contact, status: 'Pending', chain: newChain, activityLog: [`PFSD resolved return from ${returnedEntry?.dept} · just now`, ...contact.activityLog] })
  }

  const handleClose = () => {
    onUpdate({ ...contact, status: 'Closed', chain: [], currentChainIndex: -1, activityLog: ['Case closed by PFSD · just now', ...contact.activityLog] })
    onClose()
  }

  const removeDeptFromChain = (i: number) => {
    const dept = contact.chain[i].dept
    if (!window.confirm(`Remove ${dept} from the assignment chain?`)) return
    const newChain = contact.chain.filter((_, j) => j !== i)
    onUpdate({ ...contact, chain: newChain })
  }

  // Comment sections start collapsed; keying by contact id + chain index means
  // switching to a different contact naturally shows everything collapsed again.
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const toggleComment = (key: string) =>
    setExpandedComments(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  // Activity log starts collapsed to a standard preview count; keyed by contact id
  // so switching contacts naturally re-collapses it.
  const ACTIVITY_PREVIEW_COUNT = 3
  const [expandedActivityLogs, setExpandedActivityLogs] = useState<Set<string>>(new Set())
  const isActivityExpanded = expandedActivityLogs.has(contact.id)
  const toggleActivityLog = () =>
    setExpandedActivityLogs(prev => {
      const next = new Set(prev)
      if (next.has(contact.id)) next.delete(contact.id)
      else next.add(contact.id)
      return next
    })
  const visibleActivityLog = isActivityExpanded ? contact.activityLog : contact.activityLog.slice(0, ACTIVITY_PREVIEW_COUNT)

  // Dept breakdown for pane — PFSD is the origin, not a department, so it never
  // carries the "current" pulse itself: it reads as handed-off (completed) whenever
  // a department is actively holding the case (including one that just returned it),
  // or once the case is closed (PFSD's part is done, nothing pulses), and as PFSD's
  // own turn (active) only when nothing is assigned yet or everything has finished
  // and the case is back — still open — for PFSD to close.
  const pfsdStatus: ChainEntryStatus =
    contact.status === 'Closed' || (contact.chain.length > 0 && contact.currentChainIndex >= 0) ? 'completed' : 'active'

  const steps: { key: string; label: string; status: ChainEntryStatus; pharmacyType?: PharmacyType; chainIndex?: number }[] = [
    { key: 'pfsd', label: 'PFSD', status: pfsdStatus },
    ...contact.chain.map((e, i) => ({ key: `dept-${i}`, label: e.dept, status: e.entryStatus, pharmacyType: e.pharmacyType, chainIndex: i })),
  ]

  return (
    <div className="w-[310px] shrink-0 bg-white border-l-[3px] border-blue-500 flex flex-col h-full shadow-lg overflow-hidden">
      {/* Pane header */}
      <div className="flex items-start justify-between px-4 py-4 border-b border-gray-100">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Viewing</p>
          </div>
          <p className="text-[14px] font-semibold text-gray-900 mt-0.5 truncate">{contact.name}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{contact.source}{contact.hnNumber ? ` · ${contact.hnNumber}` : ''} · {contact.lastActive}</p>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-lg leading-none shrink-0 ml-2 mt-0.5">×</button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Return details */}
        {returnedEntry && (
          <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold text-red-700 uppercase tracking-wide">Return Details</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 font-semibold">Returned</span>
            </div>
            <p className="text-[12px] font-semibold text-gray-800">{returnedEntry.dept}</p>
            <p className="text-[12px] text-gray-600 leading-relaxed">{returnedEntry.returnComment}</p>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleMarkResolved}
                className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-[12px] font-semibold hover:bg-red-700 transition-colors"
              >
                Mark complete
              </button>
              <button
                onClick={onOpenReassign}
                className="flex-1 py-1.5 rounded-lg bg-white text-red-700 border border-red-300 text-[12px] font-semibold hover:bg-red-100 transition-colors"
              >
                Reassign
              </button>
            </div>
          </div>
        )}

        {/* Department breakdown — destination-dot timeline, in handoff order */}
        <div className="px-4 pt-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Department Breakdown</p>
          <div>
            {steps.map((step, idx) => {
              const isLast = idx === steps.length - 1
              // "Current" is whichever step is holding the baton right now — the dept
              // at currentChainIndex (even before it clicks Start, i.e. still 'waiting'),
              // or PFSD's own step when nothing is assigned/everything has wrapped up.
              const isCurrent = step.key === 'pfsd' ? step.status === 'active' : step.chainIndex === contact.currentChainIndex
              const removable = step.chainIndex !== undefined && step.status === 'waiting'
              const labelClass = stepLabelClass(step.status, isCurrent)
              const comment = step.chainIndex !== undefined ? contact.chain[step.chainIndex].comment : ''
              const commentKey = `${contact.id}-${step.chainIndex}`
              const isCommentOpen = !!comment && expandedComments.has(commentKey)
              // PFSD isn't a department, so "In Progress" reads oddly for its two very
              // different "active" moments — reword just for that row; dept rows keep
              // the shared ENTRY_STATUS_LABEL vocabulary.
              const statusLabel = step.key === 'pfsd'
                ? (contact.chain.length === 0 ? 'Needs assignment' : 'Ready to close')
                : ENTRY_STATUS_LABEL[step.status]
              // The Return Details card above already states dept + reason in full for
              // the returned entry — the row keeps its red pulsing dot but skips the
              // redundant "Return" text pill.
              const showCurrentBadge = isCurrent && step.status !== 'returned'
              return (
                <div key={step.key} className="relative flex gap-3">
                  {!isLast && (
                    <span className={`absolute left-[9px] top-5 bottom-0 w-0.5 ${step.status === 'completed' ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                  )}
                  <StepDot status={step.status} isCurrent={isCurrent} />
                  <div className={`flex-1 min-w-0 ${isLast ? 'pb-0.5' : 'pb-5'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[12.5px] truncate ${labelClass}`}>
                        {step.label}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status, right-aligned in the row — current gets a live pulsing badge,
                            an unreached department is explicitly called "Not started". */}
                        {showCurrentBadge && (
                          <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${CURRENT_ENTRY_TONE[step.status].badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${CURRENT_ENTRY_TONE[step.status].dot}`} />
                            {statusLabel}
                          </span>
                        )}
                        {!isCurrent && step.status === 'waiting' && (
                          <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 bg-gray-100 text-gray-400">
                            Not started
                          </span>
                        )}
                        {/* Comment toggle sits after the status */}
                        {comment && (
                          <button
                            onClick={() => toggleComment(commentKey)}
                            className="flex items-center justify-center w-5 h-5 rounded text-blue-400 hover:text-blue-700 hover:bg-blue-50 shrink-0 transition-colors text-[11px] leading-none"
                            title={isCommentOpen ? 'Hide PFSD note' : 'Show PFSD note'}
                          >
                            {isCommentOpen ? '▲' : '▼'}
                          </button>
                        )}
                        {/* Remove is always shown, for a uniform status rail — enabled (red) only
                            for a department PFSD hasn't reached yet; disabled (faint gray) otherwise. */}
                        <button
                          onClick={() => removable && removeDeptFromChain(step.chainIndex!)}
                          disabled={!removable}
                          title={removable ? `Remove ${step.label}` : `${step.label} can't be removed`}
                          className={`flex items-center justify-center shrink-0 transition-colors ${
                            removable ? 'text-red-400 hover:text-red-600 cursor-pointer' : 'text-gray-300 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <MinusCircleIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Pharmacy inquiry type, shown under the dept name — same pattern as the Telegram/Facebook source tag in the contact list */}
                    {step.pharmacyType && (
                      <span className={`inline-block mt-0.5 text-[11px] px-1.5 py-px rounded font-medium ${step.pharmacyType === 'Question' ? 'bg-violet-100 text-violet-700' : 'bg-teal-100 text-teal-700'}`}>
                        {step.pharmacyType}
                      </span>
                    )}
                    {/* Empty-state hint — PFSD is the only row and nothing's been routed yet.
                        Not shown once closed: an empty chain there means "already handled," not "not yet." */}
                    {step.key === 'pfsd' && contact.chain.length === 0 && contact.status !== 'Closed' && (
                      <p className="mt-0.5 text-[11px] text-gray-400">Not yet assigned to a department</p>
                    )}
                    {isCommentOpen && (
                      <p className="mt-1.5 text-[11.5px] text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 leading-relaxed">
                        {comment}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity log — visually separated from the breakdown above with a divider + tinted panel */}
        <div className="mt-4 border-t border-gray-100 bg-gray-50/50 px-4 pt-4 pb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Activity Log</p>
          {contact.activityLog.length === 0 ? (
            <p className="text-[12px] text-gray-300 italic">No activity yet</p>
          ) : (
            <div className="space-y-1.5">
              {visibleActivityLog.map((log, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className={`w-1 h-1 rounded-full shrink-0 mt-[6px] ${activityLogTone(log)}`} />
                  <p className="text-[12px] text-gray-500 leading-relaxed">{log}</p>
                </div>
              ))}
            </div>
          )}
          {contact.activityLog.length > ACTIVITY_PREVIEW_COUNT && (
            <button
              onClick={toggleActivityLog}
              className="mt-2 text-[11px] font-semibold text-blue-500 hover:text-blue-700 transition-colors"
            >
              {isActivityExpanded ? 'Show less' : `Show more (${contact.activityLog.length - ACTIVITY_PREVIEW_COUNT})`}
            </button>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2">
        <button
          onClick={onOpenAssign}
          className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 transition-colors text-center"
        >
          Assign to dept.
        </button>
        <button
          onClick={handleClose}
          disabled={contact.status === 'Closed'}
          className="flex-1 py-2 rounded-xl bg-gray-900 text-white text-[12px] font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40 text-center"
        >
          Close case
        </button>
      </div>
    </div>
  )
}

// ─── Contacts Table (shared by Inbox and Manual pages) ───────────────────────

function ContactsTable({
  contacts,
  viewAs,
  paneContact,
  onRowClick,
  updateContact,
  handleStart,
  handleMarkComplete,
  onReturn,
}: {
  contacts: Contact[]
  viewAs: ViewAs
  paneContact: Contact | null
  onRowClick: (c: Contact) => void
  updateContact: (c: Contact) => void
  handleStart: (c: Contact) => void
  handleMarkComplete: (c: Contact) => void
  onReturn: (c: Contact) => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3">Contact</th>
              <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3">Last Message</th>
              <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">First Contact</th>
              <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3">Status</th>
              {viewAs === 'PFSD' && (
                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Assignees</th>
              )}
              {viewAs !== 'PFSD' && (
                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">PFSD Note</th>
              )}
              {viewAs === 'Pharmacy' && (
                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3">Type</th>
              )}
              <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3">Priority</th>
              <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Last Active</th>
              {viewAs !== 'PFSD' && (
                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, ri) => {
              const activeEntry = contact.chain[contact.currentChainIndex]
              // Same tone rule as the Handoff Chain dots, so the two stay in sync.
              const activeTone = activeEntry && (activeEntry.entryStatus === 'waiting' ? CURRENT_WAITING_TONE : ENTRY_TONE[activeEntry.entryStatus])
              // Mirrors DetailPane's pfsdStatus: PFSD reads as handed-off (green) whenever
              // a dept is holding the case (including one that just returned it), and as
              // PFSD's own turn (blue) otherwise.
              const pfsdStatus: ChainEntryStatus = contact.currentChainIndex >= 0 ? 'completed' : 'active'
              const pharmEntry = contact.chain.find(e => e.dept === 'Pharmacy')
              const isSelected = paneContact?.id === contact.id

              return (
                <tr
                  key={contact.id}
                  onClick={() => viewAs === 'PFSD' && onRowClick(contact)}
                  className={`border-b border-gray-50 transition-colors ${
                    viewAs === 'PFSD' ? 'cursor-pointer' : ''
                  } ${isSelected ? 'bg-blue-50/70 shadow-[inset_3px_0_0_0_#3b82f6]' : ri % 2 === 0 ? 'hover:bg-gray-50/60' : 'bg-gray-50/30 hover:bg-gray-100/40'}`}
                >
                  {/* Contact */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={contact.initials} color={contact.color} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-semibold text-gray-900">{contact.name}</span>
                          {contact.priority === 'Prio' && (
                            <span className="text-[10px] px-1.5 py-px rounded font-bold bg-orange-100 text-orange-600 leading-none">PRIO</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[11px] px-1.5 py-px rounded font-medium ${contact.source === 'Telegram' ? 'bg-blue-50 text-blue-500' : contact.source === 'Facebook' ? 'bg-indigo-50 text-indigo-500' : 'bg-gray-100 text-gray-500'}`}>{contact.source}</span>
                          {contact.hnNumber && <span className="text-[11px] text-gray-400">{contact.hnNumber}</span>}
                          {contact.phone && <span className="text-[11px] text-gray-300">· {contact.phone}</span>}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Last message */}
                  <td className="px-4 py-3 max-w-[180px]">
                    <p className="text-[13px] text-gray-600 truncate">{contact.lastMessage}</p>
                  </td>

                  {/* First contact */}
                  <td className="px-4 py-3 text-[12px] text-gray-500 whitespace-nowrap">{contact.firstContact}</td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={contact.status} />
                  </td>

                  {/* Handoff chain (PFSD) — clean, no comments */}
                  {viewAs === 'PFSD' && (
                    <td className="px-4 py-3">
                      {contact.chain.length === 0 ? (
                        <span className="text-[12px] text-gray-300 italic">No chain set</span>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold text-[11px]">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ENTRY_TONE[pfsdStatus].dot}`} />
                              {'PFSD'}
                            </span>
                            {contact.chain.map((entry, idx) => {
                              // Up-next dept (current pointer, hasn't clicked Start yet) gets its
                              // own amber tone so it's visibly distinct from a not-yet-reached dept
                              // further down the chain — both are 'waiting' under the hood. Only the
                              // dot encodes status; the pill and text stay neutral throughout.
                              const isCurrentWaiting = idx === contact.currentChainIndex && entry.entryStatus === 'waiting'
                              const tone = isCurrentWaiting ? CURRENT_WAITING_TONE : ENTRY_TONE[entry.entryStatus]
                              return (
                                <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tone.dot}`} />
                                  {deptShortLabel(entry.dept)}
                                </span>
                              )
                            })}
                          </div>
                          {activeEntry && activeTone && (
                            <p className={`mt-1.5 text-[11px] whitespace-nowrap ${activeTone.text}`}>
                              {activeEntry.entryStatus === 'returned'
                                ? `Return from ${activeEntry.dept}`
                                : `${ENTRY_STATUS_LABEL[activeEntry.entryStatus]} at ${activeEntry.dept}`}
                            </p>
                          )}
                        </>
                      )}
                    </td>
                  )}

                  {/* PFSD note (dept view) */}
                  {viewAs !== 'PFSD' && (
                    <td className="px-4 py-3 max-w-[200px]">
                      {activeEntry?.comment ? (
                        <p className="text-[12px] text-gray-700 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg leading-relaxed line-clamp-2" title={activeEntry.comment}>
                          {activeEntry.comment}
                        </p>
                      ) : (
                        <span className="text-[12px] text-gray-300">No note from PFSD</span>
                      )}
                    </td>
                  )}

                  {/* Pharmacy type */}
                  {viewAs === 'Pharmacy' && (
                    <td className="px-4 py-3">
                      {pharmEntry?.pharmacyType ? (
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${pharmEntry.pharmacyType === 'Question' ? 'bg-violet-100 text-violet-700' : 'bg-teal-100 text-teal-700'}`}>
                          {pharmEntry.pharmacyType}
                        </span>
                      ) : <span className="text-gray-200 text-[12px]">—</span>}
                    </td>
                  )}

                  {/* Priority */}
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <select
                      value={contact.priority}
                      onChange={e => updateContact({ ...contact, priority: e.target.value as Priority })}
                      className={`text-[12px] border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white font-medium cursor-pointer ${contact.priority === 'Prio' ? 'border-orange-300 text-orange-600 bg-orange-50' : 'border-gray-200 text-gray-600'}`}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Prio">Prio</option>
                    </select>
                  </td>

                  {/* Last active */}
                  <td className="px-4 py-3 text-[12px] text-gray-500 whitespace-nowrap">{contact.lastActive}</td>

                  {/* Actions (dept view only) — driven by the current entry's own status */}
                  {viewAs !== 'PFSD' && (
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        {activeEntry?.entryStatus === 'waiting' && (
                          <button
                            onClick={() => handleStart(contact)}
                            className="px-2.5 py-1.5 text-[11px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                          >
                            Start
                          </button>
                        )}
                        {activeEntry?.entryStatus === 'active' && (
                          <>
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
    </div>
  )
}

// ─── Manual Registration Form ─────────────────────────────────────────────────

interface ManualFormData {
  patientId: string
  name: string
  phone: string
  comment: string
}

function ManualFormModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (data: ManualFormData) => void
}) {
  const [patientId, setPatientId] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [comment, setComment] = useState('')

  const isValid = patientId.trim() !== '' && phone.trim() !== '' && comment.trim() !== ''

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) return
    onAdd({ patientId: patientId.trim(), name: name.trim(), phone: phone.trim(), comment: comment.trim() })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[460px] max-h-[88vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">Create Manual Inquiry</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              For patients who contact by phone · same workflow as Telegram/Facebook
            </p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl leading-none">×</button>
        </div>

        <form id="manual-inquiry-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label htmlFor="manual-patient-id" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Patient ID <span className="text-red-500">*</span>
            </label>
            <input
              id="manual-patient-id"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              placeholder="e.g. HN00123"
              autoFocus
              className="mt-1.5 w-full text-[13px] border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
            />
          </div>

          <div>
            <label htmlFor="manual-name" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Name</label>
            <input
              id="manual-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Patient full name (optional)"
              className="mt-1.5 w-full text-[13px] border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
            />
          </div>

          <div>
            <label htmlFor="manual-phone" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="manual-phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 0812345678"
              className="mt-1.5 w-full text-[13px] border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
            />
          </div>

          <div>
            <label htmlFor="manual-comment" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              id="manual-comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              placeholder="Describe the patient's inquiry…"
              className="mt-1.5 w-full text-[13px] border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300 resize-none"
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-800">Cancel</button>
          <button
            type="submit"
            form="manual-inquiry-form"
            disabled={!isValid}
            className="px-5 py-2 text-[13px] font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Submit Inquiry
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Manual Page ──────────────────────────────────────────────────────────────

function ManualPage({
  contacts,
  onAdd,
  paneContact,
  onRowClick,
  updateContact,
  handleStart,
  handleMarkComplete,
  onReturn,
}: {
  contacts: Contact[]
  onAdd: (data: ManualFormData) => void
  paneContact: Contact | null
  onRowClick: (c: Contact) => void
  updateContact: (c: Contact) => void
  handleStart: (c: Contact) => void
  handleMarkComplete: (c: Contact) => void
  onReturn: (c: Contact) => void
}) {
  const manualContacts = contacts.filter(c => c.source === 'Manual')
  const [filterTab, setFilterTab] = useState<'All' | 'Needs Reply' | 'Assigned' | 'Prio'>('All')
  const [search, setSearch] = useState('')

  const visible = manualContacts.filter(c => {
    if (filterTab === 'Prio' && c.priority !== 'Prio') return false
    if (filterTab === 'Needs Reply' && c.status !== 'Open') return false
    if (filterTab === 'Assigned' && (c.chain.length === 0 || c.status === 'Closed')) return false
    if (search) {
      const q = search.toLowerCase()
      const matches = c.name.toLowerCase().includes(q) || (c.hnNumber ?? '').toLowerCase().includes(q) || (c.phone ?? '').includes(q)
      if (!matches) return false
    }
    return true
  })

  const counts = {
    Open: manualContacts.filter(c => c.status === 'Open').length,
    Pending: manualContacts.filter(c => c.status === 'Pending').length,
    Closed: manualContacts.filter(c => c.status === 'Closed').length,
    Prio: manualContacts.filter(c => c.priority === 'Prio').length,
  }

  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const handleAdd = (data: ManualFormData) => {
    onAdd(data)
    setShowForm(false)
    setToast(`Inquiry created for ${data.patientId}`)
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 shrink-0">
        <div>
          <h1 className="text-[15px] font-semibold text-gray-900">Manual</h1>
          <p className="text-[11px] text-gray-400">CRM System · Mon, 20 Jul 2026</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-colors"
          >
            <span className="text-[15px] leading-none">+</span> New Manual Inquiry
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center select-none">AP</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {toast && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-[12px] font-medium text-emerald-700">{toast}</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-3 mb-5 flex-wrap">
          {[
            { label: 'Open',    count: counts.Open,    bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200' },
            { label: 'Pending', count: counts.Pending, bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
            { label: 'Closed',  count: counts.Closed,  bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
            { label: 'Prio',    count: counts.Prio,    bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
          ].map(s => (
            <div key={s.label} className={`flex flex-col items-center px-5 py-2.5 rounded-xl border ${s.bg} ${s.border} min-w-[80px]`}>
              <span className={`text-xl font-bold ${s.text}`}>{s.count}</span>
              <span className={`text-[11px] font-medium mt-0.5 ${s.text} whitespace-nowrap`}>{s.label}</span>
            </div>
          ))}
        </div>

        <p className="text-[13px] text-gray-400 mb-4">Manual inquiries registered by phone, in the same workflow as Telegram/Facebook.</p>

        {/* Filters */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            {(['All', 'Needs Reply', 'Assigned', 'Prio'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${filterTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="text-[13px] border border-gray-200 rounded-lg px-3 py-1.5 w-44 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
            <span className="text-[11px] text-gray-400 whitespace-nowrap">{visible.length} results</span>
          </div>
        </div>

        <ContactsTable
          contacts={visible}
          viewAs="PFSD"
          paneContact={paneContact}
          onRowClick={onRowClick}
          updateContact={updateContact}
          handleStart={handleStart}
          handleMarkComplete={handleMarkComplete}
          onReturn={onReturn}
        />
      </div>

      {showForm && <ManualFormModal onClose={() => setShowForm(false)} onAdd={handleAdd} />}
    </>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#3b82f6', '#f97316', '#8b5cf6', '#10b981', '#06b6d4', '#ec4899', '#f59e0b', '#6366f1']

function initialsFor(name: string, patientId: string): string {
  const trimmed = name.trim()
  if (!trimmed) return patientId.slice(0, 2).toUpperCase()
  const parts = trimmed.split(/\s+/)
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>(INIT)
  const [page, setPage] = useState<'Inbox' | 'Manual'>('Inbox')
  const [viewAs, setViewAs] = useState<ViewAs>('PFSD')
  const [paneContact, setPaneContact] = useState<Contact | null>(null)
  const [assignContact, setAssignContact] = useState<Contact | null>(null)
  const [assignMode, setAssignMode] = useState<'assign' | 'reassign'>('assign')
  const [returnContact, setReturnContact] = useState<Contact | null>(null)
  const [filterTab, setFilterTab] = useState<'All' | 'Needs Reply' | 'Assigned' | 'Prio'>('All')
  const [pharmFilter, setPharmFilter] = useState<'All' | PharmacyType>('All')
  const [search, setSearch] = useState('')
  const [viewOpen, setViewOpen] = useState(false)

  const updateContact = (updated: Contact) => {
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c))
    if (paneContact?.id === updated.id) setPaneContact(updated)
  }

  const handleStart = (contact: Contact) => {
    const newChain = contact.chain.map((e, i) =>
      i === contact.currentChainIndex ? { ...e, entryStatus: 'active' as ChainEntryStatus } : e
    )
    const log = `${contact.chain[contact.currentChainIndex]?.dept} started working · just now`
    updateContact({ ...contact, chain: newChain, activityLog: [log, ...contact.activityLog] })
  }

  const handleMarkComplete = (contact: Contact) => {
    const next = contact.currentChainIndex + 1
    const newChain = contact.chain.map((e, i) =>
      i === contact.currentChainIndex ? { ...e, entryStatus: 'completed' as ChainEntryStatus } : e
    )
    const noMore = next >= contact.chain.length
    const log = `${contact.chain[contact.currentChainIndex]?.dept} marked complete · just now`
    updateContact({
      ...contact,
      chain: newChain,
      currentChainIndex: noMore ? -1 : next,
      status: noMore ? 'Pending' : contact.status,
      activityLog: [log, ...contact.activityLog],
    })
  }

  const handleReturn = (contact: Contact, dept: Dept, note: string) => {
    const newChain = contact.chain.map((e, i) =>
      i === contact.currentChainIndex ? { ...e, entryStatus: 'returned' as ChainEntryStatus, returnComment: note } : e
    )
    const log = `Returned to PFSD by ${dept} · just now`
    updateContact({ ...contact, status: 'Pending', chain: newChain, activityLog: [log, ...contact.activityLog] })
    setReturnContact(null)
  }

  const addManualContact = (data: ManualFormData) => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    const newContact: Contact = {
      id: `manual-${now.getTime()}`,
      name: data.name || data.patientId,
      initials: initialsFor(data.name, data.patientId),
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      source: 'Manual',
      hnNumber: data.patientId,
      phone: data.phone,
      lastMessage: data.comment,
      firstContact: dateStr,
      status: 'Open',
      priority: 'Normal',
      chain: [],
      currentChainIndex: -1,
      lastActive: `${dateStr}, ${timeStr}`,
      activityLog: [`Inquiry logged from Manual · just now`],
    }
    setContacts(prev => [newContact, ...prev])
  }

  // ── Filtering ──────────────────────────────────────────────────────────────
  const visible = contacts.filter(c => {
    if (viewAs !== 'PFSD') {
      if (c.status === 'Closed') return false
      const active = c.chain[c.currentChainIndex]
      if (!active || active.dept !== viewAs) return false
    }
    if (filterTab === 'Prio' && c.priority !== 'Prio') return false
    if (filterTab === 'Needs Reply' && c.status !== 'Open') return false
    if (filterTab === 'Assigned' && (c.chain.length === 0 || c.status === 'Closed')) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    if (viewAs === 'Pharmacy' && pharmFilter !== 'All') {
      const pe = c.chain.find(e => e.dept === 'Pharmacy')
      if (pe?.pharmacyType !== pharmFilter) return false
    }
    return true
  })

  const counts = {
    Open: contacts.filter(c => c.status === 'Open').length,
    Pending: contacts.filter(c => c.status === 'Pending').length,
    Closed: contacts.filter(c => c.status === 'Closed').length,
    Prio: contacts.filter(c => c.priority === 'Prio').length,
  }

  const viewLabel = viewAs === 'PFSD' ? 'Admin PFSD' : viewAs

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-56 bg-[#111827] text-white flex flex-col shrink-0">
        <div className="flex items-center gap-2.5 px-4 py-[18px] border-b border-white/10">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-[11px] font-black">C</div>
          <span className="font-semibold text-[13px] tracking-tight">CRM System</span>
        </div>
        <nav className="flex-1 px-2.5 py-4 overflow-y-auto space-y-0.5">
          {[
            { label: 'Dashboard', icon: '⊞' },
            { label: 'Inbox', icon: '✉', badge: 3 },
            { label: 'Manual', icon: '✍' },
            { label: 'Reservations', icon: '📅', badge: 3 },
            { label: 'Medicines', icon: '💊' },
            { label: 'Support', icon: '🛟', badge: 2 },
          ].map(item => {
            const isNavigable = item.label === 'Inbox' || item.label === 'Manual'
            const isActive = isNavigable && item.label === page
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (!isNavigable) return
                  setPage(item.label as 'Inbox' | 'Manual')
                  setPaneContact(null)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'}`}
              >
                <span className="flex items-center gap-2.5">{item.icon} {item.label}</span>
                {item.badge != null && <span className="bg-blue-500 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold">{item.badge}</span>}
              </button>
            )
          })}
          <div className="pt-5 pb-1.5 px-3">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Admin</span>
          </div>
          {['Members', 'User Mgmt', 'Scheduled Tasks', 'Pulse'].map(l => (
            <button key={l} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-white/60 hover:bg-white/8 hover:text-white transition-colors">◈ {l}</button>
          ))}
        </nav>
      </aside>

      {/* ── Main + Pane wrapper ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {page === 'Manual' ? (
          <ManualPage
            contacts={contacts}
            onAdd={addManualContact}
            paneContact={paneContact}
            onRowClick={c => setPaneContact(paneContact?.id === c.id ? null : c)}
            updateContact={updateContact}
            handleStart={handleStart}
            handleMarkComplete={handleMarkComplete}
            onReturn={c => setReturnContact(c)}
          />
        ) : (
        <>
          {/* Top bar */}
          <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 shrink-0">
            <div>
              <h1 className="text-[15px] font-semibold text-gray-900">Inbox</h1>
              <p className="text-[11px] text-gray-400">CRM System · Mon, 20 Jul 2026</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <button
                  onClick={() => setViewOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${viewAs === 'PFSD' ? 'bg-blue-500' : 'bg-violet-500'}`} />
                  {viewLabel}
                  <span className="text-gray-400 text-[10px]">▾</span>
                </button>
                {viewOpen && (
                  <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 min-w-[200px] py-1.5">
                    <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Switch view</p>
                    {ALL_VIEWS.map(v => (
                      <button
                        key={v}
                        onClick={() => { setViewAs(v); setViewOpen(false); setPaneContact(null) }}
                        className={`w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 flex items-center gap-2.5 ${viewAs === v ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${v === 'PFSD' ? 'bg-blue-400' : 'bg-violet-400'}`} />
                        {v === 'PFSD' ? 'Admin PFSD' : v}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center select-none">
                {viewAs === 'PFSD' ? 'AP' : viewAs.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Stats */}
            <div className="flex gap-3 mb-5 flex-wrap">
              {[
                { label: 'Open',    count: counts.Open,    bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200' },
                { label: 'Pending', count: counts.Pending, bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
                { label: 'Closed',  count: counts.Closed,  bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
                { label: 'Prio',    count: counts.Prio,    bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
              ].map(s => (
                <div key={s.label} className={`flex flex-col items-center px-5 py-2.5 rounded-xl border ${s.bg} ${s.border} min-w-[80px]`}>
                  <span className={`text-xl font-bold ${s.text}`}>{s.count}</span>
                  <span className={`text-[11px] font-medium mt-0.5 ${s.text} whitespace-nowrap`}>{s.label}</span>
                </div>
              ))}
            </div>

            <p className="text-[13px] text-gray-400 mb-4">Manage customer messages, assignments, and handoffs in one workspace.</p>

            {/* Filters */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-1 flex-wrap">
                {(['All', 'Needs Reply', 'Assigned', 'Prio'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${filterTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
                  >
                    {tab}
                  </button>
                ))}
                {viewAs === 'Pharmacy' && (
                  <div className="flex items-center gap-1 ml-3 pl-3 border-l border-gray-200">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mr-1">Type:</span>
                    {(['All', 'Question', 'Medicine only'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setPharmFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${pharmFilter === f ? 'bg-violet-600 text-white' : 'text-gray-500 hover:bg-violet-50 hover:text-violet-700'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="text-[13px] border border-gray-200 rounded-lg px-3 py-1.5 w-44 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
                <span className="text-[11px] text-gray-400 whitespace-nowrap">{visible.length} results</span>
              </div>
            </div>

            {/* Table */}
            <ContactsTable
              contacts={visible}
              viewAs={viewAs}
              paneContact={paneContact}
              onRowClick={c => setPaneContact(paneContact?.id === c.id ? null : c)}
              updateContact={updateContact}
              handleStart={handleStart}
              handleMarkComplete={handleMarkComplete}
              onReturn={c => setReturnContact(c)}
            />
          </div>
        </>
        )}
        </main>

        {/* ── Right Pane (PFSD only) ────────────────────────────────────────── */}
        {paneContact && (viewAs === 'PFSD' || page === 'Manual') && (
          <DetailPane
            contact={paneContact}
            onClose={() => setPaneContact(null)}
            onUpdate={updateContact}
            onOpenAssign={() => { setAssignContact(paneContact); setAssignMode('assign') }}
            onOpenReassign={() => { setAssignContact(paneContact); setAssignMode('reassign') }}
          />
        )}
      </div>

      {/* ── Sequential Assignment / Reassignment Popup ────────────────────── */}
      {assignContact && (
        <AssignPopup
          contact={assignContact}
          mode={assignMode}
          onClose={() => setAssignContact(null)}
          onSave={(chain, currentIdx) => {
            const log = assignMode === 'reassign' ? 'Reassigned by PFSD · just now' : 'Chain updated · just now'
            updateContact({ ...assignContact, chain, currentChainIndex: currentIdx, status: chain.length > 0 && assignContact.status === 'Open' ? 'Pending' : assignContact.status, activityLog: [log, ...assignContact.activityLog] })
            setAssignContact(null)
          }}
        />
      )}

      {/* ── Return Modal (dept view) ──────────────────────────────────────── */}
      {returnContact && viewAs !== 'PFSD' && (
        <ReturnModal
          contact={returnContact}
          dept={viewAs as Dept}
          onClose={() => setReturnContact(null)}
          onReturn={note => handleReturn(returnContact, viewAs as Dept, note)}
        />
      )}

      {/* Click-outside to close view dropdown */}
      {viewOpen && <div className="fixed inset-0 z-40" onClick={() => setViewOpen(false)} />}
    </div>
  )
}
