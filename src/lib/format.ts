import type { ChainEntryStatus, Dept } from '@/types/domain'

// 'Nurse (OPD)' -> 'OPD', 'MA (IPD)' -> 'IPD'; depts without a parenthetical
// abbreviation ('MC', 'Pharmacy') are already short and pass through as-is.
export function deptShortLabel(dept: Dept): string {
  const match = dept.match(/\(([^)]+)\)/)
  return match ? match[1] : dept
}

// Seed dates are free-text ('08 Jul 2026', 'Jul 10, 03:55 AM' — the latter has
// no year at all), so an exact Date comparison against a <input type="date">
// value isn't reliable. Matching month+day only sidesteps that inconsistency.
export function matchesLooseDate(dateStr: string, isoDate: string): boolean {
  if (!isoDate) return true
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return true
  const [, month, day] = isoDate.split('-')
  return String(d.getMonth() + 1).padStart(2, '0') === month && String(d.getDate()).padStart(2, '0') === day
}

export function stepLabelClass(status: ChainEntryStatus, isCurrent: boolean): string {
  if (isCurrent) return 'font-bold text-gray-900'
  if (status === 'completed') return 'font-medium text-gray-500'
  return 'font-medium text-gray-400'
}

// Activity log entries are plain strings (no structured event type), so this is a
// display-only heuristic on the message text — good enough to let PFSD skim for
// consequential events (returned/closed) without a data-model change.
export function activityLogTone(log: string): string {
  if (log.includes('Returned') || log.includes('closed')) return 'bg-red-400'
  if (log.toLowerCase().includes('complete')) return 'bg-emerald-400'
  return 'bg-gray-300'
}

export const CURRENT_ADMIN_NAME = 'PFSD Admin'

export function formatNoteTimestamp(d: Date): string {
  return d.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function initialsFor(name: string, patientId: string): string {
  const trimmed = name.trim()
  if (!trimmed) return patientId.slice(0, 2).toUpperCase()
  const parts = trimmed.split(/\s+/)
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase()
}
