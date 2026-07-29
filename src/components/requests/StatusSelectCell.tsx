import { HUE, REQUEST_STATUS_HUE } from '@/theme/hue'
import { ChevronDownIcon } from '@/icons'
import type { RequestStatus } from '@/types/domain'

export function StatusSelectCell({
  status,
  onChange,
}: {
  status: RequestStatus
  onChange: (status: RequestStatus) => void
}) {
  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={e => onChange(e.target.value as RequestStatus)}
        className={`appearance-none pl-3 pr-7 py-1 rounded-full text-[12px] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${HUE[REQUEST_STATUS_HUE[status]].pill}`}
      >
        <option value="Open">Open</option>
        <option value="Pending">Pending</option>
        <option value="Resolved">Resolved</option>
      </select>
      <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
    </div>
  )
}
