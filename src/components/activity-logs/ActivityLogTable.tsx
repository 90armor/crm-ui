import { HUE, ACTIVITY_LOG_TYPE_HUE } from '@/theme/hue'
import type { ActivityLogRecord } from '@/types/domain'

export function ActivityLogTable({ logs }: { logs: ActivityLogRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-100">
            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5 whitespace-nowrap">Timestamp</th>
            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">User</th>
            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Type</th>
            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Activity</th>
            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5 whitespace-nowrap">IP Address</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
              <td className="px-4 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">{log.timestamp}</td>
              <td className="px-4 py-3.5 text-[13px] font-semibold text-gray-900 whitespace-nowrap">{log.user}</td>
              <td className="px-4 py-3.5">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${HUE[ACTIVITY_LOG_TYPE_HUE[log.type]].pill}`}>
                  {log.type}
                </span>
              </td>
              <td className="px-4 py-3.5 text-[13px] max-w-[360px] truncate" title={`${log.action} — ${log.details}`}>
                <span className="font-semibold text-gray-900">{log.action}</span>
                <span className="text-gray-400"> — {log.details}</span>
              </td>
              <td className="px-4 py-3.5 text-[12px] text-gray-400 font-mono whitespace-nowrap">{log.ip}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-gray-400">No activity logs match these filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
