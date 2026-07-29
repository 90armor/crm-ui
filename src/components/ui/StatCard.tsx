import type { ReactNode } from 'react'

export function StatCard({
  icon,
  label,
  count,
  borderClass,
}: {
  icon: ReactNode
  label: string
  count: number
  borderClass: string
}) {
  return (
    <div className={`flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 border-l-4 ${borderClass} shadow-sm px-4 py-3 w-[190px] shrink-0`}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide whitespace-nowrap">{label}</p>
        <p className="text-[18px] font-bold text-gray-900 dark:text-gray-100 leading-tight">{count}</p>
      </div>
    </div>
  )
}
