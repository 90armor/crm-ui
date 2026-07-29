import { useState, useRef, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { PencilIcon } from '@/icons'
import { ENTRY_BADGE, ENTRY_STATUS_LABEL } from '@/theme/hue'
import { ALL_DEPTS } from '@/data/contacts'
import type { Contact, ChainEntry, ChainEntryStatus, PharmacyType, Dept } from '@/types/domain'

function AssignModal({
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

  // Opening the popup via "Reassign" (from the Return Details card) is always
  // about that one returned dept — jump straight into its note instead of
  // making PFSD find and click into the right entry themselves.
  useEffect(() => {
    if (mode === 'reassign' && contact.currentChainIndex >= 0) {
      setFocusTargetIndex(contact.currentChainIndex)
    }
  }, [])

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

  // An entry is editable while PFSD hasn't handed it off yet — status 'queued'
  // (further down the chain, not yet reached) or 'pending' (up next, Start not
  // clicked) — so its note, position, and presence in the chain can still change.
  // Reassign also unlocks the returned entry itself (currentChainIndex), so PFSD
  // can redirect it the same way they'd build the chain in the first place.
  // Anything being actively worked (active/waitingPatient) or already completed
  // stays locked.
  const isEntryEditable = (entry: ChainEntry, i: number) =>
    entry.entryStatus === 'queued' || entry.entryStatus === 'pending' ||
    (mode === 'reassign' && i === contact.currentChainIndex && entry.entryStatus === 'returned')

  const updateComment = (i: number, v: string) =>
    setChain(p => p.map((e, j) => j === i ? { ...e, comment: v } : e))

  const updatePharmType = (i: number, v: PharmacyType) =>
    setChain(p => p.map((e, j) => j === i ? { ...e, pharmacyType: v } : e))

  const addDept = (dept: Dept) => {
    const newIndex = chain.length
    setChain(p => [...p, { dept, comment: '', returnComment: '', entryStatus: 'queued' }])
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
    // No baton held (-1) can mean a fresh chain, or every prior dept already
    // completed with new depts freshly added after them — either way, the
    // current position is the first entry PFSD hasn't finished, not index 0.
    const newIdx = contact.currentChainIndex === -1
      ? chain.findIndex(e => e.entryStatus !== 'completed')
      : contact.currentChainIndex
    // Editable entries resolve to 'pending' at the current position (it's that
    // dept's turn now) and 'queued' everywhere else (not reached yet).
    const updatedChain = chain.map((e, i) => {
      if (!isEntryEditable(e, i)) return e
      return { ...e, entryStatus: (i === newIdx ? 'pending' : 'queued') as ChainEntryStatus }
    })
    onSave(updatedChain, newIdx)
    onClose()
  }

  const usedDepts = new Set(chain.map(e => e.dept))
  const available = ALL_DEPTS.filter(d => !usedDepts.has(d))
  // Pharmacy inquiry type is required, but only for entries PFSD can still edit here —
  // a locked (already active/completed) entry has no picker on screen to fix it with,
  // so blocking save on those would create a dead end instead of a useful nudge.
  const missingPharmacyType = chain.some((e, i) => e.dept === 'Pharmacy' && isEntryEditable(e, i) && !e.pharmacyType)

  return (
    <Modal
      title={mode === 'reassign' ? 'Reassign Department' : 'Sequential Assignment'}
      subtitle={`${contact.name} · ${mode === 'reassign' ? 'Redirect the returned department or adjust the chain' : 'Build the handoff chain in order'}`}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={missingPharmacyType}
            title={missingPharmacyType ? 'Set a pharmacy inquiry type for every pharmacy entry first' : undefined}
          >
            {mode === 'reassign' ? 'Reassign' : 'Assign Chain'} ({chain.length} dept{chain.length !== 1 ? 's' : ''})
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {chain.length === 0 && (
            <p className="text-[13px] text-gray-400 italic text-center py-8">No departments yet. Add one below.</p>
          )}

          {chain.map((entry, i) => {
            const isLocked = !isEntryEditable(entry, i)
            const isDraggable = !isLocked
            // A dept that's still queued or pending starts with its note collapsed to a
            // label; any other editable entry (e.g. the returned dept during reassign)
            // keeps the note open, since it's already mid-flow rather than freshly queued.
            const isFreshEditable = !isLocked && (entry.entryStatus === 'queued' || entry.entryStatus === 'pending')
            const isEditingNote = editingComments.has(i)
            const showNoteEditor = !isLocked && (!isFreshEditable || isEditingNote)
            return (
              <div
                key={i}
                draggable={isDraggable}
                onDragStart={() => isDraggable && handleDragStart(i)}
                onDragOver={e => isDraggable && handleDragOver(e, i)}
                onDrop={handleDrop}
                className={`rounded-xl border p-4 space-y-3 transition-all ${
                  entry.entryStatus === 'active'         ? 'border-blue-300 bg-blue-50/40' :
                  entry.entryStatus === 'waitingPatient' ? 'border-purple-300 bg-purple-50/40' :
                  entry.entryStatus === 'completed'      ? 'border-gray-200 bg-gray-50/60 opacity-70' :
                  entry.entryStatus === 'returned'       ? 'border-red-200 bg-red-50/40' :
                  // Pending (next up, Start not yet clicked) gets the same amber accent
                  // as its badge/dot elsewhere — it deserves the same visual weight as
                  // active/waiting/returned. Queued (not yet reached) stays neutral.
                  entry.entryStatus === 'pending'        ? 'border-amber-300 bg-amber-50/40' :
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
                    {ENTRY_STATUS_LABEL[entry.entryStatus]}
                  </span>
                  {isLocked
                    ? <span className="ml-auto text-[11px] text-gray-400">Read-only</span>
                    : (
                      <button onClick={() => removeDept(i)} className="ml-auto text-gray-300 hover:text-red-400 text-[13px] font-bold">✕</button>
                    )
                  }
                </div>

                {/* PFSD note — a queued/pending dept shows it as a label with a pencil to
                    edit; any other editable entry keeps the textarea open directly. */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PFSD note to {entry.dept} <span className="normal-case font-medium text-gray-300">(optional)</span></label>
                    {isFreshEditable && (
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
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Pharmacy inquiry type <span className="text-red-400 normal-case font-medium">(required)</span>
                    </label>
                    {showNoteEditor ? (
                      <>
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
                        {!entry.pharmacyType && (
                          <p className="mt-1.5 text-[11px] text-red-500">Select an inquiry type before assigning this entry.</p>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 mt-1.5">
                        {entry.pharmacyType ? (
                          <span className="px-3 py-1 rounded-full text-[12px] font-semibold border bg-violet-600 text-white border-violet-600">
                            {entry.pharmacyType}
                          </span>
                        ) : isLocked ? (
                          <span className="text-[12px] text-gray-300 italic">Not set</span>
                        ) : (
                          <span className="text-[12px] text-red-500 italic">Not set — click ✎ above to choose one</span>
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
    </Modal>
  )
}

export { AssignModal }
