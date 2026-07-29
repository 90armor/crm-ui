import { useState } from 'react'
import { ConfirmModal } from '@/components/contacts/ConfirmModal'
import { StepDot } from '@/components/ui/StepDot'
import { NoteIcon, MinusCircleIcon } from '@/icons'
import { ENTRY_STATUS_LABEL, HUE, CURRENT_ENTRY_TONE } from '@/theme/hue'
import { stepLabelClass, activityLogTone } from '@/lib/format'
import type { Contact, ChainEntryStatus, PharmacyType } from '@/types/domain'

function DetailPanel({
  contact,
  onClose,
  onUpdate,
  onOpenAssign,
  onOpenReassign,
  onMarkComplete,
}: {
  contact: Contact
  onClose: () => void
  onUpdate: (c: Contact) => void
  onOpenAssign: () => void
  onOpenReassign: () => void
  onMarkComplete: (c: Contact) => void
}) {
  const returnedEntry = contact.chain.find(e => e.entryStatus === 'returned')

  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false)
  const handleClose = () => {
    onUpdate({ ...contact, status: 'Closed', chain: [], currentChainIndex: -1, activityLog: ['Case closed by PFSD · just now', ...contact.activityLog] })
    setIsConfirmCloseOpen(false)
    onClose()
  }

  const [removeIndex, setRemoveIndex] = useState<number | null>(null)
  const confirmRemoveDept = () => {
    if (removeIndex === null) return
    const wasCurrent = removeIndex === contact.currentChainIndex
    const newChain = contact.chain.filter((_, j) => j !== removeIndex)
    // Removing the current dept hands the baton to whichever dept now sits at
    // that index — same "next becomes pending" handoff as handleMarkComplete.
    const noMore = wasCurrent && removeIndex >= newChain.length
    if (wasCurrent && !noMore) newChain[removeIndex] = { ...newChain[removeIndex], entryStatus: 'pending' }
    const newCurrentChainIndex = wasCurrent
      ? (noMore ? -1 : removeIndex)
      : (removeIndex < contact.currentChainIndex ? contact.currentChainIndex - 1 : contact.currentChainIndex)
    onUpdate({
      ...contact,
      chain: newChain,
      currentChainIndex: newCurrentChainIndex,
      status: noMore ? 'Pending' : contact.status,
    })
    setRemoveIndex(null)
  }

  // At most one note popover open at a time; keying by contact id + chain index
  // means switching to a different contact naturally closes it again.
  const [openNoteKey, setOpenNoteKey] = useState<string | null>(null)

  // Activity log starts collapsed to a standard preview count; keyed by contact id
  // so switching contacts naturally re-collapses it.
  const ACTIVITY_PREVIEW_COUNT = 3
  const [expandedActivityLogs, setIsExpandedActivityLogs] = useState<Set<string>>(new Set())
  const isActivityExpanded = expandedActivityLogs.has(contact.id)
  const toggleActivityLog = () =>
    setIsExpandedActivityLogs(prev => {
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
    <>
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={onClose}>
    <div className="w-[440px] max-w-full bg-white flex flex-col h-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
      {/* Pane header */}
      <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Viewing</p>
          </div>
          <p className="text-[14px] font-semibold text-gray-900 mt-0.5 truncate">{contact.name}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{contact.source}{contact.hnNumber ? ` · ${contact.hnNumber}` : ''} · {contact.lastActive}</p>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-xl leading-none shrink-0 ml-2">×</button>
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
                onClick={() => onMarkComplete(contact)}
                className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-[12px] font-semibold hover:bg-emerald-700 transition-colors"
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
              const isOrigin = step.key === 'pfsd'
              // "Current" is whichever step is holding the baton right now — the dept
              // at currentChainIndex (even before it clicks Start, i.e. still 'pending'),
              // or PFSD's own step when nothing is assigned/everything has wrapped up.
              const isCurrent = isOrigin ? step.status === 'active' : step.chainIndex === contact.currentChainIndex
              const removable = step.chainIndex !== undefined && (step.status === 'queued' || step.status === 'pending')
              const labelClass = stepLabelClass(step.status, isCurrent)
              const comment = step.chainIndex !== undefined ? contact.chain[step.chainIndex].comment : ''
              const commentKey = `${contact.id}-${step.chainIndex}`
              const isCommentOpen = !!comment && openNoteKey === commentKey
              // PFSD isn't a department, so "In Progress" reads oddly for its two very
              // different "active" moments — reword just for that row; dept rows keep
              // the shared ENTRY_STATUS_LABEL vocabulary.
              const statusLabel = isOrigin
                ? (contact.chain.length === 0 ? 'Needs assignment' : 'Ready to close')
                : ENTRY_STATUS_LABEL[step.status]
              const showCurrentBadge = isCurrent
              // Origin's badge/dot use indigo (not the shared blue "in progress" tone)
              // so its "active" reads as "waiting on admin", distinct from a department
              // actively working the case.
              const badgeTone = isOrigin && step.status === 'active'
                ? { badge: HUE.indigo.pill, dot: HUE.indigo.dot }
                : CURRENT_ENTRY_TONE[step.status]
              return (
                <div key={step.key} className="relative flex gap-3">
                  {!isLast && (
                    <span className={`absolute left-[9px] top-5 bottom-0 w-0.5 ${step.status === 'completed' ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                  )}
                  <StepDot status={step.status} isCurrent={isCurrent} isOrigin={isOrigin} />
                  <div className={`flex-1 min-w-0 ${isLast ? 'pb-0.5' : 'pb-5'}`}>
                    <div className="relative flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-[12.5px] truncate ${labelClass}`}>
                          {step.label}
                        </span>
                        {/* Marks this row as the admin/origin step, not a real department,
                            since it's the only one PFSD staff might mistake for one. */}
                        {isOrigin && (
                          <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-100 px-1.5 py-px rounded">
                            Admin
                          </span>
                        )}
                        {/* PFSD's note lives right on the dept it's about, as a small
                            popover — a comment can run long, so it floats over the
                            layout instead of pushing every row below it down. Anchored
                            to the row (not the icon) so it can't run past the pane's
                            edge regardless of how long the department label is. */}
                        {comment && (
                          <button
                            onClick={() => setOpenNoteKey(k => k === commentKey ? null : commentKey)}
                            title={isCommentOpen ? 'Hide PFSD note' : 'View PFSD note'}
                            className={`flex items-center justify-center w-5 h-5 rounded-md shrink-0 transition-colors ${
                              isCommentOpen ? 'text-blue-600 bg-blue-50' : 'text-gray-300 hover:text-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            <NoteIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </span>
                      {isCommentOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenNoteKey(null)} />
                          <div className="absolute left-0 top-full mt-1.5 z-50 w-56 max-w-full bg-white border border-gray-100 rounded-2xl shadow-2xl p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <NoteIcon className="w-3 h-3 text-gray-400" />
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PFSD Note</p>
                            </div>
                            <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                              {comment}
                            </p>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status, right-aligned in the row — current gets a live pulsing badge,
                            an unreached department is explicitly called "Queued". */}
                        {showCurrentBadge && (
                          <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${badgeTone.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${badgeTone.dot}`} />
                            {statusLabel}
                          </span>
                        )}
                        {step.status === 'queued' && !showCurrentBadge && (
                          <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 bg-gray-100 text-gray-400">
                            Queued
                          </span>
                        )}
                        {/* Remove is shown for a uniform status rail on dept rows — enabled (red) only
                            for a department PFSD hasn't reached yet, disabled (faint gray) otherwise.
                            Origin is never removable, so it's skipped instead of shown disabled. */}
                        {!isOrigin && (
                        <button
                          onClick={() => removable && setRemoveIndex(step.chainIndex!)}
                          disabled={!removable}
                          title={removable ? `Remove ${step.label}` : `${step.label} can't be removed`}
                          className={`flex items-center justify-center shrink-0 transition-colors ${
                            removable ? 'text-red-400 hover:text-red-600 cursor-pointer' : 'text-gray-300 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <MinusCircleIcon className="w-3.5 h-3.5" />
                        </button>
                        )}
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
          onClick={() => setIsConfirmCloseOpen(true)}
          disabled={contact.status === 'Closed'}
          className="flex-1 py-2 rounded-xl bg-gray-900 text-white text-[12px] font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40 text-center"
        >
          Close case
        </button>
      </div>
    </div>
    </div>

    {isConfirmCloseOpen && (
      <ConfirmModal
        title="Close case"
        message={`Close this case for ${contact.name}? This clears the assignment chain and marks the case as Closed.`}
        confirmLabel="Close case"
        tone="gray"
        onClose={() => setIsConfirmCloseOpen(false)}
        onConfirm={handleClose}
      />
    )}

    {removeIndex !== null && (
      <ConfirmModal
        title="Remove department"
        message={`Remove ${contact.chain[removeIndex].dept} from the assignment chain?`}
        confirmLabel="Remove"
        tone="red"
        onClose={() => setRemoveIndex(null)}
        onConfirm={confirmRemoveDept}
      />
    )}
    </>
  )
}

export { DetailPanel }
