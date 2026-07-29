import type { ChainEntryStatus, Status, RequestStatus, ActivityLogType } from '@/types/domain'

// Single source of truth for every status-adjacent color in the app. Each hue
// spells out every literal Tailwind class it needs (Tailwind's JIT scanner
// requires literal class names, so nothing here is built from a template
// string). Every stat card, pill, badge, and dot in the app is derived from
// this table via STATUS_HUE / ENTRY_HUE — change a hue here and every place
// that status shows up updates together, instead of drifting the way the
// "Open" pill once did (sky here, red on its KPI stat card).
export interface HueTokens {
  pill: string       // bg-*-100 text-*-700 — flat badge/pill
  border: string      // border-*-200 — pairs with `pill` for a bordered badge
  dot: string           // bg-*-500 — small status dot
  text: string           // text-*-700 — paired with `dot` in inline "Pending at X" copy
  cardBorder: string       // border-l-*-500 — KPI stat card left accent
  iconBg: string             // bg-*-50 — KPI stat card icon chip background
  iconText: string            // text-*-500 — KPI stat card icon glyph color
}
export type Hue = 'gray' | 'amber' | 'blue' | 'purple' | 'red' | 'emerald' | 'violet' | 'indigo'

export const HUE: Record<Hue, HueTokens> = {
  gray:    { pill: 'bg-gray-100 text-gray-500',       border: 'border-gray-200',    dot: 'bg-gray-300',   text: 'text-gray-400',   cardBorder: 'border-l-gray-400',    iconBg: 'bg-gray-50',    iconText: 'text-gray-500' },
  amber:   { pill: 'bg-amber-100 text-amber-700',     border: 'border-amber-200',   dot: 'bg-amber-500',  text: 'text-amber-700',  cardBorder: 'border-l-amber-500',   iconBg: 'bg-amber-50',   iconText: 'text-amber-500' },
  blue:    { pill: 'bg-blue-100 text-blue-700',       border: 'border-blue-200',    dot: 'bg-blue-500',   text: 'text-blue-700',   cardBorder: 'border-l-blue-500',    iconBg: 'bg-blue-50',    iconText: 'text-blue-500' },
  purple:  { pill: 'bg-purple-100 text-purple-700',   border: 'border-purple-200',  dot: 'bg-purple-500', text: 'text-purple-700', cardBorder: 'border-l-purple-500',  iconBg: 'bg-purple-50',  iconText: 'text-purple-500' },
  red:     { pill: 'bg-red-100 text-red-700',         border: 'border-red-200',     dot: 'bg-red-500',    text: 'text-red-700',    cardBorder: 'border-l-red-500',     iconBg: 'bg-red-50',     iconText: 'text-red-500' },
  emerald: { pill: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700', cardBorder: 'border-l-emerald-500', iconBg: 'bg-emerald-50', iconText: 'text-emerald-500' },
  violet:  { pill: 'bg-violet-100 text-violet-700',   border: 'border-violet-200',  dot: 'bg-violet-500', text: 'text-violet-700', cardBorder: 'border-l-violet-500',  iconBg: 'bg-violet-50',  iconText: 'text-violet-500' },
  indigo:  { pill: 'bg-indigo-100 text-indigo-700',   border: 'border-indigo-200',  dot: 'bg-indigo-500', text: 'text-indigo-700', cardBorder: 'border-l-indigo-500',  iconBg: 'bg-indigo-50',  iconText: 'text-indigo-500' },
}

// Main case status (Contact.status) — the table's Status pill and the
// Open/Pending/Closed KPI stat cards both read from this.
export const STATUS_HUE: Record<Status, Hue> = { Open: 'red', Pending: 'amber', Closed: 'emerald' }

// Department-level (sub) status — the handoff chain's badges/dots/pills.
// 'pending' intentionally reuses the same amber as the main "Pending" status:
// both mean "action needed, nothing urgent yet". 'queued' and 'returned' each
// intentionally share a hue with a main status too (gray↔nothing, red↔Open) —
// see the note above STATUS_HUE. Open and Returned both being red is fine
// because they never appear in the same row: a contact only reads "Open"
// before any department has been assigned yet.
export const ENTRY_HUE: Record<ChainEntryStatus, Hue> = {
  queued: 'gray', pending: 'amber', active: 'blue', waitingPatient: 'purple', returned: 'red', completed: 'emerald',
}

export function mapEntryHue<T>(pick: (h: HueTokens) => T): Record<ChainEntryStatus, T> {
  const out = {} as Record<ChainEntryStatus, T>
  for (const status of Object.keys(ENTRY_HUE) as ChainEntryStatus[]) {
    out[status] = pick(HUE[ENTRY_HUE[status]])
  }
  return out
}

export const STATUS_STYLE: Record<Status, { pill: string }> = {
  Open:    { pill: HUE[STATUS_HUE.Open].pill },
  Pending: { pill: HUE[STATUS_HUE.Pending].pill },
  Closed:  { pill: HUE[STATUS_HUE.Closed].pill },
}

export const ENTRY_BADGE: Record<ChainEntryStatus, string> = mapEntryHue(h => `${h.pill} border ${h.border}`)

// Dot + text tone for the Handoff Chain column — status reads from a small dot
// and matching text color instead of a filled chip.
export const ENTRY_TONE: Record<ChainEntryStatus, { dot: string; text: string }> = mapEntryHue(h => ({ dot: h.dot, text: h.text }))

// Used only for the "current" (isCurrent) badge/dot in DetailPanel's breakdown —
// 'queued' entries are never current (by definition they haven't been reached
// yet), so that row is unused but keeps the Record total so class strings stay
// literal for Tailwind's JIT scanner.
export const CURRENT_ENTRY_TONE: Record<ChainEntryStatus, { badge: string; dot: string }> = mapEntryHue(h => ({ badge: h.pill, dot: h.dot }))

export const ENTRY_STATUS_LABEL: Record<ChainEntryStatus, string> = {
  queued:         'Queued',
  pending:        'Pending',
  active:         'In Progress',
  waitingPatient: 'Waiting for Patient',
  completed:      'Completed',
  returned:       'Returned',
}

export const REQUEST_STATUS_HUE: Record<RequestStatus, Hue> = { Open: 'red', Pending: 'amber', Resolved: 'emerald' }

export const ACTIVITY_LOG_TYPE_HUE: Record<ActivityLogType, Hue> = {
  'User Management': 'indigo',
  Login: 'emerald',
  Logout: 'gray',
}
