import type { RequestStatus } from '@/types/domain'

// The colored progress bar + count pills repeated at the top of every
// request-list page (Reservations, Documents, Medicines, Support), each with
// its own copy of BAR_COLOR and the same left-to-right segment order so a
// single dominant status reads clearly and several non-zero ones split
// proportionally.
const BAR_COLOR: Record<RequestStatus, string> = { Pending: 'bg-orange-500', Open: 'bg-red-500', Resolved: 'bg-emerald-500' }
const SEGMENT_ORDER: RequestStatus[] = ['Pending', 'Open', 'Resolved']

export function RequestStatusOverview({
  title,
  counts,
}: {
  title: string
  counts: { Total: number; Open: number; Pending: number; Resolved: number }
}) {
  const barSegments = SEGMENT_ORDER.map(status => ({ status, count: counts[status] })).filter(s => s.count > 0)

  return (
    <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-5 mb-5">
      <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</p>
      <div className="w-full h-9 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex">
        {barSegments.map(seg => (
          <div
            key={seg.status}
            style={{ width: `${(seg.count / counts.Total) * 100}%` }}
            className={`flex items-center justify-center text-white text-[12px] font-semibold whitespace-nowrap ${BAR_COLOR[seg.status]}`}
          >
            {seg.status} {seg.count}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-[12px] font-semibold text-gray-700 dark:text-gray-300">
          Total <span className="font-bold">{counts.Total}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-[12px] font-semibold text-gray-700 dark:text-gray-300">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Open <span className="font-bold">{counts.Open}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-[12px] font-semibold text-gray-700 dark:text-gray-300">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Pending <span className="font-bold">{counts.Pending}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-[12px] font-semibold text-gray-700 dark:text-gray-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Resolved <span className="font-bold">{counts.Resolved}</span>
        </span>
      </div>
    </div>
  )
}
