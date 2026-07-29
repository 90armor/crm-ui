import { activityLogTone } from '@/lib/format'
import type { Contact, Dept } from '@/types/domain'

export function ActivityLogDrawer({ contact, dept, onClose }: { contact: Contact; dept?: Dept; onClose: () => void }) {
  // Department view only sees its own activity, not other departments' — the
  // shared log is a flat string list with no owner field, so a dept's own
  // entries are identified by the dept's name appearing in the message (every
  // dept-authored template — "started working", "Assigned to X", "Returned to
  // PFSD by X", etc. — includes the dept name). PFSD-only/admin entries (case
  // closed, priority set, chain reassigned...) never name a dept and are
  // filtered out here, since those belong to the admin-level view, not this one.
  // The standalone request modules (Reservations/Documents/Medicine/Support)
  // have no department concept at all, so they pass no `dept` and see the
  // full, unfiltered log.
  const visibleLog = dept ? contact.activityLog.filter(log => log.includes(dept)) : contact.activityLog

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={onClose}>
      <div className="w-[440px] max-w-full h-full bg-white shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Activity Log{dept ? ` · ${dept}` : ''}</p>
            </div>
            <p className="text-[14px] font-semibold text-gray-900 mt-0.5 truncate">{contact.name}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{contact.source}{contact.hnNumber ? ` · ${contact.hnNumber}` : ''} · {contact.lastActive}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-xl leading-none shrink-0 ml-2">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {visibleLog.length === 0 ? (
            <p className="text-[12px] text-gray-300 italic">No activity yet{dept ? ` for ${dept}` : ''}</p>
          ) : (
            <div className="space-y-2.5">
              {visibleLog.map((log, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className={`w-1 h-1 rounded-full shrink-0 mt-[6px] ${activityLogTone(log)}`} />
                  <p className="text-[12px] text-gray-500 leading-relaxed">{log}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
