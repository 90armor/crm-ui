import { useState, useMemo } from 'react'
import { useFilteredList } from '@/hooks/useFilteredList'
import { matchesLooseDate } from '@/lib/format'
import { DateFilterInput } from '@/components/ui/DateFilterInput'
import { ActivityLogTable } from '@/components/activity-logs/ActivityLogTable'
import { SearchIcon, RefreshIcon } from '@/icons'
import { IT_ACTIVITY_LOGS } from '@/data/activity-logs'
import type { ActivityLogType } from '@/types/domain'

// IT Staff only. Mock audit trail — no backing auth/logging system yet, see
// IT_ACTIVITY_LOGS above.
export function ActivityLogsPage() {
  const [typeTab, setTypeTab] = useState<'All' | ActivityLogType>('All')
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const clearFilters = () => {
    setTypeTab('All')
    setSearch('')
    setDateFilter('')
  }

  const counts: Record<'All' | ActivityLogType, number> = useMemo(() => ({
    All: IT_ACTIVITY_LOGS.length,
    'User Management': IT_ACTIVITY_LOGS.filter(l => l.type === 'User Management').length,
    Login: IT_ACTIVITY_LOGS.filter(l => l.type === 'Login').length,
    Logout: IT_ACTIVITY_LOGS.filter(l => l.type === 'Logout').length,
  }), [])

  const visible = useFilteredList(IT_ACTIVITY_LOGS, l => {
    if (typeTab !== 'All' && l.type !== typeTab) return false
    if (!matchesLooseDate(l.timestamp, dateFilter)) return false
    if (search && !l.user.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }, [typeTab, dateFilter, search])

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Activity Logs</h1>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">CRM System · Mon, 20 Jul 2026 · Visible to IT Staff only</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center select-none">IT</div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
                {(['All', 'User Management', 'Login', 'Logout'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTypeTab(tab)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors whitespace-nowrap ${
                      typeTab === tab ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab}
                    <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${typeTab === tab ? 'bg-gray-900 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      {counts[tab]}
                    </span>
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{visible.length} results</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label htmlFor="log-filter-search" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">User</label>
                <div className="relative mt-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600 pointer-events-none" />
                  <input
                    id="log-filter-search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search user"
                    className="w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="log-filter-date" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Date</label>
                <DateFilterInput id="log-filter-date" value={dateFilter} onChange={setDateFilter} />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950/60 transition-colors"
                >
                  <RefreshIcon className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            </div>
          </div>

          <ActivityLogTable logs={visible} />
        </div>
      </div>
    </>
  )
}
