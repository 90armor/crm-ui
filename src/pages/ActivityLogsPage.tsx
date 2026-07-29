import { useState, useMemo } from 'react'
import { useFilteredList } from '@/hooks/useFilteredList'
import { matchesLooseDate } from '@/lib/format'
import { DateFilterInput } from '@/components/ui/DateFilterInput'
import { SearchIcon, RefreshIcon } from '@/icons'
import { HUE, ACTIVITY_LOG_TYPE_HUE } from '@/theme/hue'
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
    if (search) {
      const q = search.toLowerCase()
      const matches = l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.details.toLowerCase().includes(q)
      if (!matches) return false
    }
    return true
  }, [typeTab, dateFilter, search])

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Activity Logs</h1>
          <p className="text-[11px] text-gray-400">CRM System · Mon, 20 Jul 2026 · Visible to IT Staff only</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center select-none">IT</div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                {(['All', 'User Management', 'Login', 'Logout'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTypeTab(tab)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors whitespace-nowrap ${
                      typeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                    <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${typeTab === tab ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {counts[tab]}
                    </span>
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-gray-400 whitespace-nowrap">{visible.length} results</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label htmlFor="log-filter-search" className="text-[11px] font-semibold text-gray-500">User / Action</label>
                <div className="relative mt-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  <input
                    id="log-filter-search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search user or action"
                    className="w-full text-[13px] border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="log-filter-date" className="text-[11px] font-semibold text-gray-500">Date</label>
                <DateFilterInput id="log-filter-date" value={dateFilter} onChange={setDateFilter} />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-orange-500 bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  <RefreshIcon className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5 whitespace-nowrap">Timestamp</th>
                  <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">User</th>
                  <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Type</th>
                  <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Action</th>
                  <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Details</th>
                  <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5 whitespace-nowrap">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(log => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3.5 text-[13px] font-semibold text-gray-900 whitespace-nowrap">{log.user}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${HUE[ACTIVITY_LOG_TYPE_HUE[log.type]].pill}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">{log.action}</td>
                    <td className="px-4 py-3.5 text-[13px] text-gray-500 max-w-[280px] truncate" title={log.details}>{log.details}</td>
                    <td className="px-4 py-3.5 text-[12px] text-gray-400 font-mono whitespace-nowrap">{log.ip}</td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-gray-400">No activity logs match these filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
