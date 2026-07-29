import { STATUS_STYLE } from '@/theme/hue'
import type { Status } from '@/types/domain'

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLE[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${s.pill}`}>
      {status}
    </span>
  )
}
