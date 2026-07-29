import type { ReactNode } from 'react'
import { SourceIcon, BuildingIcon, UserIcon, CalendarIcon, PhoneIcon, MapPinIcon, IdCardIcon, PencilIcon, FileTextIcon, ClockIcon } from '@/icons'
import type { Reservation } from '@/types/domain'

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-[13px] text-gray-500 shrink-0">
        <span className="text-blue-400 shrink-0">{icon}</span>
        {label}
      </span>
      <span className="text-[13px] font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}

// A modal-style overlay (dims the whole app), distinct from ActivityLogDrawer's
// in-flow docked panel — this is the "detail" pane, that's the "history" pane;
// only one row's worth of either is ever open at a time, but they're
// independent so both can be open together if the icon and a row are clicked.
export function ReservationDetailPanel({ reservation, onClose }: { reservation: Reservation; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={onClose}>
      <div
        className="w-[440px] max-w-full h-full bg-white shadow-2xl overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[18px] font-semibold text-gray-900">{reservation.contact.name}</h2>
              <SourceIcon source={reservation.contact.source} className="w-4 h-4 shrink-0" />
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                {reservation.visitorType}
              </span>
            </div>
            <span className="inline-block mt-2 text-[12px] px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 font-medium">
              {reservation.appointmentType}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-xl leading-none shrink-0 ml-2">×</button>
        </div>

        <div className="px-6 py-5">
          <DetailSection title="Patient Information">
            <DetailRow icon={<BuildingIcon className="w-4 h-4" />} label="Hospital" value={reservation.hospital} />
            <DetailRow icon={<UserIcon className="w-4 h-4" />} label="Full Name" value={reservation.fullName} />
            <DetailRow icon={<CalendarIcon className="w-4 h-4" />} label="Date of Birth" value={reservation.dateOfBirth} />
            <DetailRow icon={<PhoneIcon className="w-4 h-4" />} label="Phone" value={reservation.contact.phone ?? '-'} />
            <DetailRow icon={<MapPinIcon className="w-4 h-4" />} label="Address" value={reservation.address} />
            <DetailRow icon={<IdCardIcon className="w-4 h-4" />} label="National ID / Passport No." value={reservation.nationalId} />
          </DetailSection>

          <DetailSection title="Request Details">
            <DetailRow icon={<PencilIcon className="w-4 h-4" />} label="Purpose" value={reservation.purpose} />
            <DetailRow icon={<FileTextIcon className="w-4 h-4" />} label="Health Package" value={reservation.healthPackage} />
            <DetailRow icon={<CalendarIcon className="w-4 h-4" />} label="Preferred Date" value={reservation.scheduleDate} />
            <DetailRow icon={<ClockIcon className="w-4 h-4" />} label="Preferred Time" value={reservation.scheduleTime} />
          </DetailSection>

          <DetailSection title="Created">
            <DetailRow icon={<CalendarIcon className="w-4 h-4" />} label="Created" value={reservation.createdDate} />
          </DetailSection>
        </div>
      </div>
    </div>
  )
}
