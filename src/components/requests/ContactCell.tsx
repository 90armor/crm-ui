import type { ReactNode } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { SourceIcon, ChatBubbleIcon, PhoneIcon, ActivityLogIcon } from '@/icons'
import type { Contact } from '@/types/domain'

// The "who this request is about" cell repeated across every request-list
// table (Reservations, Documents, Medicines, Support): avatar, name, source
// glyph, an optional patient-id line, the created date, and the
// message/phone/activity-log action row.
export function ContactCell({
  contact,
  patientId,
  createdDate,
  badge,
  onMessage,
  onActivityLog,
}: {
  contact: Contact
  patientId?: string
  createdDate: string
  badge?: ReactNode
  onMessage: () => void
  onActivityLog: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar initials={contact.initials} color={contact.color} />
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-gray-900">{contact.name}</span>
          <SourceIcon source={contact.source} className="w-3.5 h-3.5 shrink-0" />
          {badge}
        </div>
        {patientId && (
          <p className="text-[11px] text-gray-400 mt-0.5">
            PID/Ph: <span className="text-blue-500 font-medium">{patientId}</span>
          </p>
        )}
        <p className="text-[11px] text-gray-400 mt-0.5">
          Created: <span className="text-blue-500 font-medium">{createdDate}</span>
        </p>
        <div className="flex items-center gap-2.5 mt-1" onClick={e => e.stopPropagation()}>
          <button onClick={onMessage} title="Message" className="text-blue-500 hover:text-blue-700 transition-colors">
            <ChatBubbleIcon className="w-4 h-4" />
          </button>
          <span className="text-emerald-500">
            <PhoneIcon className="w-4 h-4" />
          </span>
          <button onClick={onActivityLog} title="Activity Log" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ActivityLogIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
