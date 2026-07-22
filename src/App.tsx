import { useState, useRef, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Dept = 'Nurse (OPD)' | 'Nurse (OBGYN)' | 'MC' | 'MA (IPD)' | 'MA (PED)' | 'Pharmacy'
type ViewAs = 'PFSD' | Dept
type Status = 'Open' | 'Pending' | 'Closed'
type Priority = 'Normal' | 'Prio'
type PharmacyType = 'Question' | 'Medicine only'
type ChainEntryStatus = 'queued' | 'pending' | 'active' | 'waitingPatient' | 'returned' | 'completed'

interface ChainEntry {
  dept: Dept
  comment: string
  returnComment: string
  entryStatus: ChainEntryStatus
  pharmacyType?: PharmacyType
}

interface ContactNote {
  id: string
  author: string
  text: string
  timestamp: string
}

interface Contact {
  id: string
  name: string
  initials: string
  color: string
  source: 'Facebook' | 'Telegram' | 'Manual'
  hnNumber?: string
  phone?: string
  lastMessage: string
  firstContact: string
  status: Status
  priority: Priority
  chain: ChainEntry[]
  currentChainIndex: number
  lastActive: string
  activityLog: string[]
  notes?: ContactNote[]
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const INIT: Contact[] = [
  {
    id: '1', name: 'Thanawat N.', initials: 'TN', color: '#3b82f6',
    source: 'Telegram', lastMessage: 'សួស្តី ខ្ញុំចង់សួរអំពីថ្នាំ',
    firstContact: '08 Jul 2026', status: 'Open', priority: 'Normal',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 10, 03:55 AM',
    activityLog: ['Inquiry logged from Telegram · 3h ago', 'Status set to Pending · 3h ago'],
  },
  {
    id: '2', name: 'Wyan Phang M.', initials: 'WP', color: '#f97316',
    source: 'Telegram', lastMessage: 'ចង់ណាត់ជួបគ្រូពេទ្យបន្ទាន់',
    firstContact: '03 Jul 2026', status: 'Open', priority: 'Prio',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 10, 4:25 AM',
    activityLog: ['Priority set to Prio · 1h ago', 'Inquiry logged from Telegram · 2h ago'],
  },
  {
    id: '3', name: 'Muait Phang M.', initials: 'MP', color: '#8b5cf6',
    source: 'Telegram', lastMessage: 'How are you doing?',
    firstContact: '01 Jul 2026', status: 'Pending', priority: 'Normal',
    chain: [
      { dept: 'Nurse (OPD)', comment: 'Check vitals and initial assessment', returnComment: '', entryStatus: 'active' },
      { dept: 'Pharmacy', comment: 'Dispense prescribed medication after nurse review', returnComment: '', entryStatus: 'queued', pharmacyType: 'Medicine only' },
    ],
    currentChainIndex: 0, lastActive: 'Jul 15, 11:00 AM',
    activityLog: ['Assigned to Nurse (OPD) · 2h ago', 'Status set to Pending · 5h ago', 'Inquiry logged from Telegram · 5h ago'],
  },
  {
    id: '4', name: 'Danuri T.', initials: 'DT', color: '#10b981',
    source: 'Facebook', lastMessage: 'អ្នកជំងឺបានទទួលការព្យាបាលធម្មតាហើយ',
    firstContact: '10 Jul 2026', status: 'Closed', priority: 'Normal',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 11, 4:17 PM',
    activityLog: ['Case closed · 1d ago', 'Pharmacy completed · 1d ago', 'Assigned to Pharmacy · 2d ago'],
  },
  {
    id: '5', name: 'Suda K.', initials: 'SK', color: '#06b6d4',
    source: 'Facebook', lastMessage: 'ចង់សួរអំពីការណាត់ជួប',
    firstContact: '10 Jul 2026', status: 'Open', priority: 'Normal',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 10, 3:10 PM',
    activityLog: ['Inquiry logged from Facebook · 4h ago'],
  },
  {
    id: '6', name: 'Arun P.', initials: 'AP', color: '#ec4899',
    source: 'Manual', hnNumber: 'HN00123', phone: '0891234567', lastMessage: 'Inquired about post-op care',
    firstContact: '12 Jul 2026', status: 'Pending', priority: 'Prio',
    chain: [
      { dept: 'MA (IPD)', comment: 'Handle post-op care inquiry and coordinate with nurse', returnComment: '', entryStatus: 'active' },
      { dept: 'Nurse (OPD)', comment: 'Follow up on post-op status and wound check', returnComment: '', entryStatus: 'queued' },
    ],
    currentChainIndex: 0, lastActive: 'Jul 12, 10:00 AM',
    activityLog: ['Assigned to MA (IPD) · 1h ago', 'Priority set to Prio · 2h ago', 'Inquiry logged from Manual · 8h ago'],
  },
  {
    id: '7', name: 'Somsak W.', initials: 'SW', color: '#f59e0b',
    source: 'Facebook', lastMessage: 'ចង់សួរអំពីថ្នាំដែលត្រូវលេប',
    firstContact: '15 Jul 2026', status: 'Pending', priority: 'Normal',
    chain: [
      { dept: 'Pharmacy', comment: 'Please check medication for this patient', returnComment: 'ថ្នាំនេះត្រូវការការអនុម័តពីគ្រូពេទ្យសិន មិនអាចចែកឱ្យបានទេ', entryStatus: 'returned', pharmacyType: 'Question' },
    ],
    currentChainIndex: 0, lastActive: 'Jul 16, 9:00 AM',
    activityLog: ['Returned to PFSD by Pharmacy · 30m ago', 'Assigned to Pharmacy · 2h ago', 'Inquiry logged from Facebook · 6h ago'],
  },
  {
    id: '8', name: 'Nattaya B.', initials: 'NB', color: '#6366f1',
    source: 'Facebook', lastMessage: 'សូមសួរអំពីលទ្ធផលឈាម',
    firstContact: '18 Jul 2026', status: 'Open', priority: 'Normal',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 18, 8:30 AM',
    activityLog: ['Inquiry logged from Facebook · 30m ago'],
  },
]

const ALL_DEPTS: Dept[] = ['Nurse (OPD)', 'Nurse (OBGYN)', 'MC', 'MA (IPD)', 'MA (PED)', 'Pharmacy']
const ALL_VIEWS: ViewAs[] = ['PFSD', ...ALL_DEPTS]

// ─── Style maps ───────────────────────────────────────────────────────────────

// Single source of truth for every status-adjacent color in the app. Each hue
// spells out every literal Tailwind class it needs (Tailwind's JIT scanner
// requires literal class names, so nothing here is built from a template
// string). Every stat card, pill, badge, and dot below is derived from this
// table via STATUS_HUE / ENTRY_HUE — change a hue here and every place that
// status shows up updates together, instead of drifting the way the "Open"
// pill once did (sky here, red on its KPI stat card).
interface HueTokens {
  pill: string       // bg-*-100 text-*-700 — flat badge/pill
  border: string      // border-*-200 — pairs with `pill` for a bordered badge
  dot: string           // bg-*-500 — small status dot
  text: string           // text-*-700 — paired with `dot` in inline "Pending at X" copy
  cardBorder: string       // border-l-*-500 — KPI stat card left accent
  iconBg: string             // bg-*-50 — KPI stat card icon chip background
  iconText: string            // text-*-500 — KPI stat card icon glyph color
}
type Hue = 'gray' | 'amber' | 'blue' | 'purple' | 'red' | 'emerald' | 'violet' | 'indigo'

const HUE: Record<Hue, HueTokens> = {
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
const STATUS_HUE: Record<Status, Hue> = { Open: 'red', Pending: 'amber', Closed: 'emerald' }

// Department-level (sub) status — the handoff chain's badges/dots/pills.
// 'pending' intentionally reuses the same amber as the main "Pending" status:
// both mean "action needed, nothing urgent yet". 'queued' and 'returned' each
// intentionally share a hue with a main status too (gray↔nothing, red↔Open) —
// see the note above STATUS_HUE. Open and Returned both being red is fine
// because they never appear in the same row: a contact only reads "Open"
// before any department has been assigned yet.
const ENTRY_HUE: Record<ChainEntryStatus, Hue> = {
  queued: 'gray', pending: 'amber', active: 'blue', waitingPatient: 'purple', returned: 'red', completed: 'emerald',
}

function mapEntryHue<T>(pick: (h: HueTokens) => T): Record<ChainEntryStatus, T> {
  const out = {} as Record<ChainEntryStatus, T>
  for (const status of Object.keys(ENTRY_HUE) as ChainEntryStatus[]) {
    out[status] = pick(HUE[ENTRY_HUE[status]])
  }
  return out
}

const STATUS_STYLE: Record<Status, { pill: string }> = {
  Open:    { pill: HUE[STATUS_HUE.Open].pill },
  Pending: { pill: HUE[STATUS_HUE.Pending].pill },
  Closed:  { pill: HUE[STATUS_HUE.Closed].pill },
}

const ENTRY_BADGE: Record<ChainEntryStatus, string> = mapEntryHue(h => `${h.pill} border ${h.border}`)

// Dot + text tone for the Handoff Chain column — status reads from a small dot
// and matching text color instead of a filled chip.
const ENTRY_TONE: Record<ChainEntryStatus, { dot: string; text: string }> = mapEntryHue(h => ({ dot: h.dot, text: h.text }))

// 'Nurse (OPD)' -> 'OPD', 'MA (IPD)' -> 'IPD'; depts without a parenthetical
// abbreviation ('MC', 'Pharmacy') are already short and pass through as-is.
function deptShortLabel(dept: Dept): string {
  const match = dept.match(/\(([^)]+)\)/)
  return match ? match[1] : dept
}

// Seed dates are free-text ('08 Jul 2026', 'Jul 10, 03:55 AM' — the latter has
// no year at all), so an exact Date comparison against a <input type="date">
// value isn't reliable. Matching month+day only sidesteps that inconsistency.
function matchesLooseDate(dateStr: string, isoDate: string): boolean {
  if (!isoDate) return true
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return true
  const [, month, day] = isoDate.split('-')
  return String(d.getMonth() + 1).padStart(2, '0') === month && String(d.getDate()).padStart(2, '0') === day
}

// Used only for the "current" (isCurrent) badge/dot in DetailPane's breakdown —
// 'queued' entries are never current (by definition they haven't been reached
// yet), so that row is unused but keeps the Record total so class strings stay
// literal for Tailwind's JIT scanner.
const CURRENT_ENTRY_TONE: Record<ChainEntryStatus, { badge: string; dot: string }> = mapEntryHue(h => ({ badge: h.pill, dot: h.dot }))

const ENTRY_STATUS_LABEL: Record<ChainEntryStatus, string> = {
  queued:         'Queued',
  pending:        'Pending',
  active:         'In Progress',
  waitingPatient: 'Waiting for Patient',
  completed:      'Completed',
  returned:       'Returned',
}

// ─── Shared components ────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0 select-none shadow-sm"
    >
      {initials}
    </div>
  )
}

// Small round source marker shown next to the contact name — same idea as a
// Telegram/Facebook app badge, but for phone-registered ("Manual") contacts.
function ManualSourceBadge() {
  return (
    <span className="inline-flex items-center justify-center w-[15px] h-[15px] rounded-full bg-blue-500 shrink-0" title="Manual (phone) inquiry">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    </span>
  )
}

function ChatIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLE[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${s.pill}`}>
      {status}
    </span>
  )
}

// Destination-dot marker for the department breakdown timeline. The "current"
// node pulses — that's the one PFSD needs to see, whether it's actively being
// worked (active/returned) or just handed off and waiting on the dept to start.
function StepDot({ status, isCurrent, isOrigin }: { status: ChainEntryStatus; isCurrent: boolean; isOrigin?: boolean }) {
  if (status === 'completed') {
    return (
      <span className={`relative z-10 w-5 h-5 rounded-full text-white flex items-center justify-center shrink-0 text-[10px] font-bold leading-none ${isOrigin ? 'bg-slate-400' : 'bg-emerald-500'}`}>
        ✓
      </span>
    )
  }
  if (status === 'active') {
    // Origin (PFSD) gets an indigo pulse instead of blue, so its "active" reads
    // as "waiting on admin" rather than "a department is actively working it".
    return (
      <span className="relative z-10 w-5 h-5 flex items-center justify-center shrink-0">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${isOrigin ? 'bg-indigo-400' : 'bg-blue-400'}`} />
        <span className={`relative w-2.5 h-2.5 rounded-full ring-4 ${isOrigin ? 'bg-indigo-500 ring-indigo-100' : 'bg-blue-500 ring-blue-100'}`} />
      </span>
    )
  }
  if (status === 'waitingPatient') {
    return (
      <span className="relative z-10 w-5 h-5 flex items-center justify-center shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-60 animate-ping" />
        <span className="relative w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-purple-100" />
      </span>
    )
  }
  if (status === 'returned') {
    return (
      <span className="relative z-10 w-5 h-5 flex items-center justify-center shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping" />
        <span className="relative w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-100" />
      </span>
    )
  }
  if (status === 'pending' || isCurrent) {
    return (
      <span className="relative z-10 w-5 h-5 flex items-center justify-center shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 animate-ping" />
        <span className="relative w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100" />
      </span>
    )
  }
  // 'queued' — not yet reached, hollow marker
  return <span className="relative z-10 w-5 h-5 rounded-full bg-white border-2 border-gray-300 shrink-0" />
}

function stepLabelClass(status: ChainEntryStatus, isCurrent: boolean): string {
  if (isCurrent) return 'font-bold text-gray-900'
  if (status === 'completed') return 'font-medium text-gray-500'
  return 'font-medium text-gray-400'
}

// Activity log entries are plain strings (no structured event type), so this is a
// display-only heuristic on the message text — good enough to let PFSD skim for
// consequential events (returned/closed) without a data-model change.
function activityLogTone(log: string): string {
  if (log.includes('Returned') || log.includes('closed')) return 'bg-red-400'
  if (log.toLowerCase().includes('complete')) return 'bg-emerald-400'
  return 'bg-gray-300'
}

function MinusCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="10" cy="10" r="8" />
      <line x1="6.5" y1="10" x2="13.5" y2="10" strokeLinecap="round" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13.5 3.5l3 3L6 17l-4 1 1-4L13.5 3.5z" />
    </svg>
  )
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9.6c0-3.6 3.13-6.5 7-6.5s7 2.9 7 6.5-3.13 6.5-7 6.5c-.86 0-1.68-.14-2.43-.4L4 17l1.1-3.13A6.16 6.16 0 013 9.6z" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6.5 3.5c.3 0 .58.18.7.46l1 2.3c.11.26.07.55-.1.77l-1.1 1.4a9 9 0 004.6 4.6l1.4-1.1c.22-.17.51-.21.77-.1l2.3 1c.28.12.46.4.46.7v2.2c0 .8-.7 1.42-1.49 1.31A13.5 13.5 0 013 5c-.11-.79.51-1.5 1.31-1.5h2.2z" />
    </svg>
  )
}

function TelegramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <circle cx="10" cy="10" r="10" fill="#29A9EB" />
      <path d="M4.7 9.9l10.6-4.3c.5-.2 1 .2.8.8l-1.8 8.6c-.1.5-.7.7-1.1.4l-2.6-2-1.3 1.3c-.3.3-.7.1-.8-.3l-.4-2.5-2.6-1.1c-.5-.2-.5-.9.2-1.1z" fill="#fff" />
    </svg>
  )
}

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <circle cx="10" cy="10" r="10" fill="#1877F2" />
      <path d="M12.5 6.5h-1.2c-.4 0-.8.3-.8.9v1.3h2l-.3 2h-1.7v5h-2v-5H7v-2h1.5V7.1c0-1.5 1-2.6 2.5-2.6h1.5v2z" fill="#fff" />
    </svg>
  )
}

function SourceIcon({ source, className }: { source: Contact['source']; className?: string }) {
  if (source === 'Telegram') return <TelegramGlyph className={className} />
  if (source === 'Facebook') return <FacebookGlyph className={className} />
  return null
}

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="8" />
      <path d="M7.8 7.6a2.2 2.2 0 014.2.9c0 1.5-2.2 1.6-2.2 3.1" />
      <circle cx="10" cy="14.2" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.5 3h4.5v4.5M7.5 17H3v-4.5M17 3l-5.5 5.5M3 17l5.5-5.5" />
    </svg>
  )
}

function MinimizeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <line x1="4" y1="14" x2="16" y2="14" />
    </svg>
  )
}

function CloseXIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <line x1="5" y1="5" x2="15" y2="15" />
      <line x1="15" y1="5" x2="5" y2="15" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  )
}

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 7.2l-6 6a2.3 2.3 0 003.3 3.3l6.2-6.2a3.9 3.9 0 00-5.5-5.5l-6.3 6.3a5.5 5.5 0 007.8 7.8" />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2.3 10.1L17 3.6c.8-.35 1.6.35 1.3 1.15l-2.6 12.4c-.18.86-1.15 1.25-1.9.75l-3.5-2.35-1.75 1.85c-.42.44-1.13.2-1.22-.4l-.55-3.6-3.5-1.55c-.72-.32-.75-1.32.08-1.75z" />
    </svg>
  )
}

// ─── Inbox stat-card + filter icons ──────────────────────────────────────────

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="7.5" cy="6.5" r="2.5" />
      <path d="M2.8 16c.4-2.6 2.4-4.3 4.7-4.3s4.3 1.7 4.7 4.3" />
      <circle cx="14" cy="7" r="2" />
      <path d="M13 11.8c1.9.3 3.4 1.8 3.7 4" />
    </svg>
  )
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="7" r="3" />
      <path d="M2.5 16.5c.5-3 2.7-5 5.5-5s5 2 5.5 5" />
      <path d="M15.5 5.5v5M13 8h5" />
    </svg>
  )
}

function UserXIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="7" r="3" />
      <path d="M2.5 16.5c.5-3 2.7-5 5.5-5s5 2 5.5 5" />
      <path d="M13.5 5.5l4 4M17.5 5.5l-4 4" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 5.8V10l3 2" />
    </svg>
  )
}

function HourglassIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 3h10M5 17h10" />
      <path d="M6 3c0 3 2 4.5 4 5 2-.5 4-2 4-5M6 17c0-3 2-4.5 4-5 2 .5 4 2 4 5" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M6.8 10.2l2.2 2.2 4.2-4.8" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8.5" cy="8.5" r="5.5" />
      <line x1="16.5" y1="16.5" x2="12.7" y2="12.7" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4.5" width="14" height="12" rx="1.5" />
      <path d="M3 8.2h14M6.5 2.5v3M13.5 2.5v3" />
    </svg>
  )
}

// Replaces the browser's default <select> arrow, which sits flush against the
// edge with almost no breathing room — this one gets real spacing via the
// select's own pr-8 instead.
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5.5 8l4.5 4.5L14.5 8" />
    </svg>
  )
}

function SidebarToggleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="14" height="12" rx="2" />
      <line x1="8" y1="4" x2="8" y2="16" />
    </svg>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 10a6 6 0 0110-4.2M16 10a6 6 0 01-10 4.2" />
      <path d="M14 3v3h-3M6 17v-3h3" />
    </svg>
  )
}

// ─── Sidebar module icons ─────────────────────────────────────────────────────

function DashboardGridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className={className}>
      <rect x="2.8" y="2.8" width="6.2" height="6.2" rx="1.3" />
      <rect x="11" y="2.8" width="6.2" height="6.2" rx="1.3" />
      <rect x="2.8" y="11" width="6.2" height="6.2" rx="1.3" />
      <rect x="11" y="11" width="6.2" height="6.2" rx="1.3" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2.3" y="4.5" width="15.4" height="11" rx="1.6" />
      <path d="M3 5.5l7 6 7-6" />
    </svg>
  )
}

function PillIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <g transform="rotate(-45 10 10)">
        <rect x="3.2" y="7" width="13.6" height="6" rx="3" />
        <line x1="10" y1="7" x2="10" y2="13" />
      </g>
    </svg>
  )
}

function LifeBuoyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="7.2" />
      <circle cx="10" cy="10" r="3.1" />
      <path d="M4.9 4.9l2.9 2.9M15.1 4.9l-2.9 2.9M4.9 15.1l2.9-2.9M15.1 15.1l-2.9-2.9" />
    </svg>
  )
}

function UserGearIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="7.3" cy="6.8" r="3" />
      <path d="M2.5 16.3c.5-2.9 2.5-4.8 4.8-4.8.7 0 1.35.17 1.93.47" />
      <circle cx="14.7" cy="13.7" r="2.1" />
      <path d="M14.7 10.7v.9M14.7 15.8v.9M17.7 13.7h-.9M12.6 13.7h-.9M16.6 11.6l-.65.65M13.45 14.75l-.65.65M16.6 15.8l-.65-.65M13.45 12.65l-.65-.65" />
    </svg>
  )
}

function ActivityPulseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 10.5h3l1.8-4.8 3 9 1.8-4.2h4.4" />
    </svg>
  )
}

// Date filter that only accepts a value through the native picker — typing is
// blocked, and the picker indicator is stretched invisibly over the whole
// field (WebKit-only pseudo-element; Firefox falls back to its own icon on
// the right, typing still blocked there too) so clicking anywhere opens it.
// A real "Pick a date" placeholder is shown in its place since date inputs
// don't support one natively.
function DateFilterInput({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative mt-1">
      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
      {!value && (
        <span className="absolute left-9 top-1/2 -translate-y-1/2 text-[13px] text-gray-300 pointer-events-none select-none">
          Pick a date
        </span>
      )}
      <input
        id={id}
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.preventDefault()}
        className={`w-full text-[13px] border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${value ? 'text-gray-700' : 'text-transparent'}`}
      />
    </div>
  )
}

function IconChip({ tone, Icon }: { tone: Hue; Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${HUE[tone].iconBg}`}>
      <Icon className={`w-[18px] h-[18px] ${HUE[tone].iconText}`} />
    </div>
  )
}

function StatCard({
  icon,
  label,
  count,
  borderClass,
}: {
  icon: React.ReactNode
  label: string
  count: number
  borderClass: string
}) {
  return (
    <div className={`flex items-center gap-3 bg-white rounded-xl border border-gray-100 border-l-4 ${borderClass} shadow-sm px-4 py-3 w-[190px] shrink-0`}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{label}</p>
        <p className="text-[18px] font-bold text-gray-900 leading-tight">{count}</p>
      </div>
    </div>
  )
}

// ─── Message Box Popup (Inbox contact list) ──────────────────────────────────

interface ChatMessage {
  from: 'contact' | 'staff'
  sender?: string
  text: string
  time: string
}

function MessageBoxModal({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: 'contact', text: contact.lastMessage, time: contact.lastActive },
    { from: 'staff', sender: 'Bot (auto-reply)', text: 'Thanks for reaching out — our team will get back to you shortly.', time: 'Just now' },
  ])
  const [draft, setDraft] = useState('')
  const [minimized, setMinimized] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleSend = () => {
    if (!draft.trim()) return
    setMessages(prev => [...prev, { from: 'staff', sender: 'Admin', text: draft.trim(), time: 'Just now' }])
    setDraft('')
  }

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        title={`Restore chat with ${contact.name}`}
        className="fixed bottom-5 right-5 z-50 rounded-full hover:scale-105 transition-transform"
      >
        <div className="relative w-14 h-14 rounded-full shadow-2xl ring-4 ring-white">
          <Avatar initials={contact.initials} color={contact.color} size={56} />
          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
            <SourceIcon source={contact.source} className="w-4 h-4" />
          </span>
        </div>
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden ${
        expanded ? 'w-[400px] h-[600px]' : 'w-[340px] h-[480px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <Avatar initials={contact.initials} color={contact.color} size={32} />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
              <SourceIcon source={contact.source} className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="min-w-0 flex items-center gap-1">
            <p className="text-[13px] font-semibold truncate">{contact.name}</p>
            <HelpCircleIcon className="w-3.5 h-3.5 text-white/70 shrink-0" />
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button onClick={() => setExpanded(v => !v)} title={expanded ? 'Shrink' : 'Expand'} className="text-white/80 hover:text-white transition-colors">
            <ExpandIcon className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setMinimized(true)} title="Minimize" className="text-white/80 hover:text-white transition-colors">
            <MinimizeIcon className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} title="Close" className="text-white/80 hover:text-white transition-colors">
            <CloseXIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 bg-white">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.from === 'staff' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
              m.from === 'staff' ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-700 rounded-bl-sm'
            }`}>
              {m.text}
            </div>
            <p className="mt-1 text-[10.5px] text-gray-400 flex items-center gap-1">
              {m.sender && <span className="font-semibold text-gray-500">{m.sender} ·</span>}
              {m.time}
              {m.from === 'staff' && <CheckIcon className="w-3 h-3 text-blue-400" />}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 shrink-0">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
          placeholder="Type a message…"
          className="flex-1 text-[13px] px-2 py-1.5 focus:outline-none"
        />
        <PaperclipIcon className="w-4 h-4 text-gray-400 shrink-0" />
        <button onClick={handleSend} disabled={!draft.trim()} title="Send" className="text-blue-500 hover:text-blue-700 disabled:text-gray-300 transition-colors shrink-0">
          <SendIcon className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Sequential Assignment Popup ─────────────────────────────────────────────

function AssignPopup({
  contact,
  mode = 'assign',
  onClose,
  onSave,
}: {
  contact: Contact
  mode?: 'assign' | 'reassign'
  onClose: () => void
  onSave: (chain: ChainEntry[], currentIdx: number) => void
}) {
  const [chain, setChain] = useState<ChainEntry[]>(contact.chain)
  const dragIdx = useRef<number | null>(null)
  const dragOverIdx = useRef<number | null>(null)

  const textareaRefs = useRef<Map<number, HTMLTextAreaElement>>(new Map())
  const [focusTargetIndex, setFocusTargetIndex] = useState<number | null>(null)
  useEffect(() => {
    if (focusTargetIndex === null) return
    const el = textareaRefs.current.get(focusTargetIndex)
    el?.focus()
    el?.setSelectionRange(el.value.length, el.value.length)
    setFocusTargetIndex(null)
  }, [focusTargetIndex])

  // Opening the popup via "Reassign" (from the Return Details card) is always
  // about that one returned dept — jump straight into its note instead of
  // making PFSD find and click into the right entry themselves.
  useEffect(() => {
    if (mode === 'reassign' && contact.currentChainIndex >= 0) {
      setFocusTargetIndex(contact.currentChainIndex)
    }
  }, [])

  // For a still-waiting dept, the note (and Pharmacy inquiry type) start collapsed
  // behind a pencil — PFSD sees the note as a label and opts into editing it, and
  // opening it (either via the pencil or fresh from "Add to chain") grabs focus,
  // since PFSD is presumably about to type a note right away.
  const [editingComments, setEditingComments] = useState<Set<number>>(new Set())
  const toggleEditComment = (i: number) =>
    setEditingComments(prev => {
      const next = new Set(prev)
      if (next.has(i)) {
        next.delete(i)
      } else {
        next.add(i)
        setFocusTargetIndex(i)
      }
      return next
    })
  // Reindex the editing-set the same way an index-shifting chain op (remove/reorder)
  // reindexes `chain`, so a still-open note stays pinned to the right entry.
  const remapEditing = (transform: (i: number) => number | null) =>
    setEditingComments(prev => {
      const next = new Set<number>()
      prev.forEach(i => {
        const t = transform(i)
        if (t !== null) next.add(t)
      })
      return next
    })

  // An entry is editable while PFSD hasn't handed it off yet — status 'queued'
  // (further down the chain, not yet reached) or 'pending' (up next, Start not
  // clicked) — so its note, position, and presence in the chain can still change.
  // Reassign also unlocks the returned entry itself (currentChainIndex), so PFSD
  // can redirect it the same way they'd build the chain in the first place.
  // Anything being actively worked (active/waitingPatient) or already completed
  // stays locked.
  const isEntryEditable = (entry: ChainEntry, i: number) =>
    entry.entryStatus === 'queued' || entry.entryStatus === 'pending' ||
    (mode === 'reassign' && i === contact.currentChainIndex && entry.entryStatus === 'returned')

  const updateComment = (i: number, v: string) =>
    setChain(p => p.map((e, j) => j === i ? { ...e, comment: v } : e))

  const updatePharmType = (i: number, v: PharmacyType) =>
    setChain(p => p.map((e, j) => j === i ? { ...e, pharmacyType: v } : e))

  const addDept = (dept: Dept) => {
    const newIndex = chain.length
    setChain(p => [...p, { dept, comment: '', returnComment: '', entryStatus: 'queued' }])
    setEditingComments(prev => new Set(prev).add(newIndex))
    setFocusTargetIndex(newIndex)
  }

  const removeDept = (i: number) => {
    setChain(p => p.filter((_, j) => j !== i))
    remapEditing(j => {
      if (j === i) return null
      if (j > i) return j - 1
      return j
    })
  }

  const handleDragStart = (i: number) => { dragIdx.current = i }
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    dragOverIdx.current = i
  }
  const handleDrop = () => {
    const from = dragIdx.current
    const to = dragOverIdx.current
    if (from === null || to === null || from === to) return
    const next = [...chain]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setChain(next)
    remapEditing(j => {
      if (j === from) return to
      if (from < to && j > from && j <= to) return j - 1
      if (from > to && j >= to && j < from) return j + 1
      return j
    })
    dragIdx.current = null
    dragOverIdx.current = null
  }

  const handleSave = () => {
    const newIdx = contact.currentChainIndex === -1 && chain.length > 0 ? 0 : contact.currentChainIndex
    // Editable entries resolve to 'pending' at the current position (it's that
    // dept's turn now) and 'queued' everywhere else (not reached yet).
    const updatedChain = chain.map((e, i) => {
      if (!isEntryEditable(e, i)) return e
      return { ...e, entryStatus: (i === newIdx ? 'pending' : 'queued') as ChainEntryStatus }
    })
    onSave(updatedChain, newIdx)
    onClose()
  }

  const usedDepts = new Set(chain.map(e => e.dept))
  const available = ALL_DEPTS.filter(d => !usedDepts.has(d))
  // Pharmacy inquiry type is required, but only for entries PFSD can still edit here —
  // a locked (already active/completed) entry has no picker on screen to fix it with,
  // so blocking save on those would create a dead end instead of a useful nudge.
  const missingPharmacyType = chain.some((e, i) => e.dept === 'Pharmacy' && isEntryEditable(e, i) && !e.pharmacyType)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[580px] max-h-[88vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">{mode === 'reassign' ? 'Reassign Department' : 'Sequential Assignment'}</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {contact.name} · {mode === 'reassign' ? 'Redirect the returned department or adjust the chain' : 'Build the handoff chain in order'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {chain.length === 0 && (
            <p className="text-[13px] text-gray-400 italic text-center py-8">No departments yet. Add one below.</p>
          )}

          {chain.map((entry, i) => {
            const isLocked = !isEntryEditable(entry, i)
            const isDraggable = !isLocked
            // A dept that's still queued or pending starts with its note collapsed to a
            // label; any other editable entry (e.g. the returned dept during reassign)
            // keeps the note open, since it's already mid-flow rather than freshly queued.
            const isFreshEditable = !isLocked && (entry.entryStatus === 'queued' || entry.entryStatus === 'pending')
            const isEditingNote = editingComments.has(i)
            const showNoteEditor = !isLocked && (!isFreshEditable || isEditingNote)
            return (
              <div
                key={i}
                draggable={isDraggable}
                onDragStart={() => isDraggable && handleDragStart(i)}
                onDragOver={e => isDraggable && handleDragOver(e, i)}
                onDrop={handleDrop}
                className={`rounded-xl border p-4 space-y-3 transition-all ${
                  entry.entryStatus === 'active'         ? 'border-blue-300 bg-blue-50/40' :
                  entry.entryStatus === 'waitingPatient' ? 'border-purple-300 bg-purple-50/40' :
                  entry.entryStatus === 'completed'      ? 'border-gray-200 bg-gray-50/60 opacity-70' :
                  entry.entryStatus === 'returned'       ? 'border-red-200 bg-red-50/40' :
                  'border-gray-200 bg-white'
                } ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {isDraggable && (
                    <span className="text-gray-300 text-[13px] select-none">⠿</span>
                  )}
                  <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[11px] flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                  <span className="text-[13px] font-semibold text-gray-900">{entry.dept}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${ENTRY_BADGE[entry.entryStatus]}`}>
                    {ENTRY_STATUS_LABEL[entry.entryStatus]}
                  </span>
                  {isLocked
                    ? <span className="ml-auto text-[11px] text-gray-400">Read-only</span>
                    : (
                      <button onClick={() => removeDept(i)} className="ml-auto text-gray-300 hover:text-red-400 text-[13px] font-bold">✕</button>
                    )
                  }
                </div>

                {/* PFSD note — a queued/pending dept shows it as a label with a pencil to
                    edit; any other editable entry keeps the textarea open directly. */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PFSD note to {entry.dept} <span className="normal-case font-medium text-gray-300">(optional)</span></label>
                    {isFreshEditable && (
                      <button
                        onClick={() => toggleEditComment(i)}
                        title={isEditingNote ? 'Done editing' : 'Edit note'}
                        className="text-gray-300 hover:text-blue-500 transition-colors shrink-0"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {showNoteEditor ? (
                    <textarea
                      ref={el => {
                        if (el) textareaRefs.current.set(i, el)
                        else textareaRefs.current.delete(i)
                      }}
                      value={entry.comment}
                      onChange={e => updateComment(i, e.target.value)}
                      rows={2}
                      placeholder={`Instructions for ${entry.dept}… (optional)`}
                      className="mt-1 w-full text-[13px] border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                  ) : (
                    <p className="mt-1 text-[13px] text-gray-700 bg-white border border-gray-100 rounded-lg px-3 py-2 min-h-[38px]">
                      {entry.comment || <span className="text-gray-300 italic">No note</span>}
                    </p>
                  )}
                </div>

                {/* Return note from dept (read-only, info only) */}
                {entry.returnComment && (
                  <div>
                    <label className="text-[10px] font-bold text-red-400 uppercase tracking-wider">↩ Return note from {entry.dept}</label>
                    <p className="mt-1 text-[12px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">{entry.returnComment}</p>
                  </div>
                )}

                {/* Pharmacy inquiry type — collapsed shows only the chosen pill, in the same
                    style as the selected choice below, so the two states read as one control */}
                {entry.dept === 'Pharmacy' && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Pharmacy inquiry type <span className="text-red-400 normal-case font-medium">(required)</span>
                    </label>
                    {showNoteEditor ? (
                      <>
                        <div className="flex gap-2 mt-1.5">
                          {(['Question', 'Medicine only'] as PharmacyType[]).map(t => (
                            <button
                              key={t}
                              disabled={isLocked}
                              onClick={() => !isLocked && updatePharmType(i, t)}
                              className={`px-3 py-1 rounded-full text-[12px] font-semibold border transition-colors ${
                                entry.pharmacyType === t
                                  ? 'bg-violet-600 text-white border-violet-600'
                                  : 'bg-white text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-600'
                              } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                        {!entry.pharmacyType && (
                          <p className="mt-1.5 text-[11px] text-red-500">Select an inquiry type before assigning this entry.</p>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 mt-1.5">
                        {entry.pharmacyType ? (
                          <span className="px-3 py-1 rounded-full text-[12px] font-semibold border bg-violet-600 text-white border-violet-600">
                            {entry.pharmacyType}
                          </span>
                        ) : isLocked ? (
                          <span className="text-[12px] text-gray-300 italic">Not set</span>
                        ) : (
                          <span className="text-[12px] text-red-500 italic">Not set — click ✎ above to choose one</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Add dept */}
          {available.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Add to chain</p>
              <div className="flex flex-wrap gap-2">
                {available.map(d => (
                  <button
                    key={d}
                    onClick={() => addDept(d)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    + {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-800">Cancel</button>
          <button
            onClick={handleSave}
            disabled={missingPharmacyType}
            title={missingPharmacyType ? 'Set a pharmacy inquiry type for every pharmacy entry first' : undefined}
            className="px-5 py-2 text-[13px] font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-colors"
          >
            {mode === 'reassign' ? 'Reassign' : 'Assign Chain'} ({chain.length} dept{chain.length !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Return Modal (dept view) ─────────────────────────────────────────────────

function ReturnModal({
  contact, dept, onClose, onReturn,
}: {
  contact: Contact; dept: Dept; onClose: () => void; onReturn: (note: string) => void
}) {
  const [note, setNote] = useState('')
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px]">
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">Return to PFSD</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">{contact.name} · from {dept}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-[13px] text-gray-600">Describe why you are returning this case. PFSD admin will see this note.</p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={4}
            placeholder="Reason for returning…"
            className="w-full text-[13px] border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-800">Cancel</button>
          <button
            disabled={!note.trim()}
            onClick={() => note.trim() && onReturn(note.trim())}
            className="px-5 py-2 text-[13px] font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-40 transition-colors"
          >
            Return to PFSD
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Confirm Modal (generic yes/no, no comment box) ───────────────────────────

function ConfirmModal({
  title, message, confirmLabel, tone = 'red', onClose, onConfirm,
}: {
  title: string; message: string; confirmLabel: string; tone?: 'red' | 'gray'; onClose: () => void; onConfirm: () => void
}) {
  const confirmClass = tone === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-gray-700'
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px]">
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-6">
          <p className="text-[13px] text-gray-600 leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-800">Cancel</button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-[13px] font-semibold text-white rounded-xl transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Right Pane (PFSD view) ───────────────────────────────────────────────────

function DetailPane({
  contact,
  onClose,
  onUpdate,
  onOpenAssign,
  onOpenReassign,
  onMarkComplete,
}: {
  contact: Contact
  onClose: () => void
  onUpdate: (c: Contact) => void
  onOpenAssign: () => void
  onOpenReassign: () => void
  onMarkComplete: (c: Contact) => void
}) {
  const returnedEntry = contact.chain.find(e => e.entryStatus === 'returned')

  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false)
  const handleClose = () => {
    onUpdate({ ...contact, status: 'Closed', chain: [], currentChainIndex: -1, activityLog: ['Case closed by PFSD · just now', ...contact.activityLog] })
    setConfirmCloseOpen(false)
    onClose()
  }

  const [removeIndex, setRemoveIndex] = useState<number | null>(null)
  const confirmRemoveDept = () => {
    if (removeIndex === null) return
    const newChain = contact.chain.filter((_, j) => j !== removeIndex)
    onUpdate({ ...contact, chain: newChain })
    setRemoveIndex(null)
  }

  // Comment sections start collapsed; keying by contact id + chain index means
  // switching to a different contact naturally shows everything collapsed again.
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const toggleComment = (key: string) =>
    setExpandedComments(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  // Activity log starts collapsed to a standard preview count; keyed by contact id
  // so switching contacts naturally re-collapses it.
  const ACTIVITY_PREVIEW_COUNT = 3
  const [expandedActivityLogs, setExpandedActivityLogs] = useState<Set<string>>(new Set())
  const isActivityExpanded = expandedActivityLogs.has(contact.id)
  const toggleActivityLog = () =>
    setExpandedActivityLogs(prev => {
      const next = new Set(prev)
      if (next.has(contact.id)) next.delete(contact.id)
      else next.add(contact.id)
      return next
    })
  const visibleActivityLog = isActivityExpanded ? contact.activityLog : contact.activityLog.slice(0, ACTIVITY_PREVIEW_COUNT)

  // Dept breakdown for pane — PFSD is the origin, not a department, so it never
  // carries the "current" pulse itself: it reads as handed-off (completed) whenever
  // a department is actively holding the case (including one that just returned it),
  // or once the case is closed (PFSD's part is done, nothing pulses), and as PFSD's
  // own turn (active) only when nothing is assigned yet or everything has finished
  // and the case is back — still open — for PFSD to close.
  const pfsdStatus: ChainEntryStatus =
    contact.status === 'Closed' || (contact.chain.length > 0 && contact.currentChainIndex >= 0) ? 'completed' : 'active'

  const steps: { key: string; label: string; status: ChainEntryStatus; pharmacyType?: PharmacyType; chainIndex?: number }[] = [
    { key: 'pfsd', label: 'PFSD', status: pfsdStatus },
    ...contact.chain.map((e, i) => ({ key: `dept-${i}`, label: e.dept, status: e.entryStatus, pharmacyType: e.pharmacyType, chainIndex: i })),
  ]

  return (
    <>
    <div className="w-[310px] shrink-0 bg-white border-l-[3px] border-blue-500 flex flex-col h-full shadow-lg overflow-hidden">
      {/* Pane header */}
      <div className="flex items-start justify-between px-4 py-4 border-b border-gray-100">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Viewing</p>
          </div>
          <p className="text-[14px] font-semibold text-gray-900 mt-0.5 truncate">{contact.name}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{contact.source}{contact.hnNumber ? ` · ${contact.hnNumber}` : ''} · {contact.lastActive}</p>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-lg leading-none shrink-0 ml-2 mt-0.5">×</button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Return details */}
        {returnedEntry && (
          <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold text-red-700 uppercase tracking-wide">Return Details</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 font-semibold">Returned</span>
            </div>
            <p className="text-[12px] font-semibold text-gray-800">{returnedEntry.dept}</p>
            <p className="text-[12px] text-gray-600 leading-relaxed">{returnedEntry.returnComment}</p>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => onMarkComplete(contact)}
                className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-[12px] font-semibold hover:bg-emerald-700 transition-colors"
              >
                Mark complete
              </button>
              <button
                onClick={onOpenReassign}
                className="flex-1 py-1.5 rounded-lg bg-white text-red-700 border border-red-300 text-[12px] font-semibold hover:bg-red-100 transition-colors"
              >
                Reassign
              </button>
            </div>
          </div>
        )}

        {/* Department breakdown — destination-dot timeline, in handoff order */}
        <div className="px-4 pt-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Department Breakdown</p>
          <div>
            {steps.map((step, idx) => {
              const isLast = idx === steps.length - 1
              const isOrigin = step.key === 'pfsd'
              // "Current" is whichever step is holding the baton right now — the dept
              // at currentChainIndex (even before it clicks Start, i.e. still 'pending'),
              // or PFSD's own step when nothing is assigned/everything has wrapped up.
              const isCurrent = isOrigin ? step.status === 'active' : step.chainIndex === contact.currentChainIndex
              const removable = step.chainIndex !== undefined && (step.status === 'queued' || step.status === 'pending')
              const labelClass = stepLabelClass(step.status, isCurrent)
              const comment = step.chainIndex !== undefined ? contact.chain[step.chainIndex].comment : ''
              const commentKey = `${contact.id}-${step.chainIndex}`
              const isCommentOpen = !!comment && expandedComments.has(commentKey)
              // PFSD isn't a department, so "In Progress" reads oddly for its two very
              // different "active" moments — reword just for that row; dept rows keep
              // the shared ENTRY_STATUS_LABEL vocabulary.
              const statusLabel = isOrigin
                ? (contact.chain.length === 0 ? 'Needs assignment' : 'Ready to close')
                : ENTRY_STATUS_LABEL[step.status]
              const showCurrentBadge = isCurrent
              // Origin's badge/dot use indigo (not the shared blue "in progress" tone)
              // so its "active" reads as "waiting on admin", distinct from a department
              // actively working the case.
              const badgeTone = isOrigin && step.status === 'active'
                ? { badge: HUE.indigo.pill, dot: HUE.indigo.dot }
                : CURRENT_ENTRY_TONE[step.status]
              return (
                <div key={step.key} className="relative flex gap-3">
                  {!isLast && (
                    <span className={`absolute left-[9px] top-5 bottom-0 w-0.5 ${step.status === 'completed' ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                  )}
                  <StepDot status={step.status} isCurrent={isCurrent} isOrigin={isOrigin} />
                  <div className={`flex-1 min-w-0 ${isLast ? 'pb-0.5' : 'pb-5'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-[12.5px] truncate ${labelClass}`}>
                          {step.label}
                        </span>
                        {/* Marks this row as the admin/origin step, not a real department,
                            since it's the only one PFSD staff might mistake for one. */}
                        {isOrigin && (
                          <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-100 px-1.5 py-px rounded">
                            Admin
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status, right-aligned in the row — current gets a live pulsing badge,
                            an unreached department is explicitly called "Queued". */}
                        {showCurrentBadge && (
                          <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${badgeTone.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${badgeTone.dot}`} />
                            {statusLabel}
                          </span>
                        )}
                        {step.status === 'queued' && (
                          <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 bg-gray-100 text-gray-400">
                            Queued
                          </span>
                        )}
                        {/* Comment toggle sits after the status */}
                        {comment && (
                          <button
                            onClick={() => toggleComment(commentKey)}
                            className="flex items-center justify-center w-5 h-5 rounded text-blue-400 hover:text-blue-700 hover:bg-blue-50 shrink-0 transition-colors text-[11px] leading-none"
                            title={isCommentOpen ? 'Hide PFSD note' : 'Show PFSD note'}
                          >
                            {isCommentOpen ? '▲' : '▼'}
                          </button>
                        )}
                        {/* Remove is shown for a uniform status rail on dept rows — enabled (red) only
                            for a department PFSD hasn't reached yet, disabled (faint gray) otherwise.
                            Origin is never removable, so it's skipped instead of shown disabled. */}
                        {!isOrigin && (
                        <button
                          onClick={() => removable && setRemoveIndex(step.chainIndex!)}
                          disabled={!removable}
                          title={removable ? `Remove ${step.label}` : `${step.label} can't be removed`}
                          className={`flex items-center justify-center shrink-0 transition-colors ${
                            removable ? 'text-red-400 hover:text-red-600 cursor-pointer' : 'text-gray-300 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <MinusCircleIcon className="w-3.5 h-3.5" />
                        </button>
                        )}
                      </div>
                    </div>
                    {/* Pharmacy inquiry type, shown under the dept name — same pattern as the Telegram/Facebook source tag in the contact list */}
                    {step.pharmacyType && (
                      <span className={`inline-block mt-0.5 text-[11px] px-1.5 py-px rounded font-medium ${step.pharmacyType === 'Question' ? 'bg-violet-100 text-violet-700' : 'bg-teal-100 text-teal-700'}`}>
                        {step.pharmacyType}
                      </span>
                    )}
                    {/* Empty-state hint — PFSD is the only row and nothing's been routed yet.
                        Not shown once closed: an empty chain there means "already handled," not "not yet." */}
                    {step.key === 'pfsd' && contact.chain.length === 0 && contact.status !== 'Closed' && (
                      <p className="mt-0.5 text-[11px] text-gray-400">Not yet assigned to a department</p>
                    )}
                    {isCommentOpen && (
                      <p className="mt-1.5 text-[11.5px] text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 leading-relaxed">
                        {comment}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity log — visually separated from the breakdown above with a divider + tinted panel */}
        <div className="mt-4 border-t border-gray-100 bg-gray-50/50 px-4 pt-4 pb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Activity Log</p>
          {contact.activityLog.length === 0 ? (
            <p className="text-[12px] text-gray-300 italic">No activity yet</p>
          ) : (
            <div className="space-y-1.5">
              {visibleActivityLog.map((log, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className={`w-1 h-1 rounded-full shrink-0 mt-[6px] ${activityLogTone(log)}`} />
                  <p className="text-[12px] text-gray-500 leading-relaxed">{log}</p>
                </div>
              ))}
            </div>
          )}
          {contact.activityLog.length > ACTIVITY_PREVIEW_COUNT && (
            <button
              onClick={toggleActivityLog}
              className="mt-2 text-[11px] font-semibold text-blue-500 hover:text-blue-700 transition-colors"
            >
              {isActivityExpanded ? 'Show less' : `Show more (${contact.activityLog.length - ACTIVITY_PREVIEW_COUNT})`}
            </button>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2">
        <button
          onClick={onOpenAssign}
          className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 transition-colors text-center"
        >
          Assign to dept.
        </button>
        <button
          onClick={() => setConfirmCloseOpen(true)}
          disabled={contact.status === 'Closed'}
          className="flex-1 py-2 rounded-xl bg-gray-900 text-white text-[12px] font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40 text-center"
        >
          Close case
        </button>
      </div>
    </div>

    {confirmCloseOpen && (
      <ConfirmModal
        title="Close case"
        message={`Close this case for ${contact.name}? This clears the assignment chain and marks the case as Closed.`}
        confirmLabel="Close case"
        tone="gray"
        onClose={() => setConfirmCloseOpen(false)}
        onConfirm={handleClose}
      />
    )}

    {removeIndex !== null && (
      <ConfirmModal
        title="Remove department"
        message={`Remove ${contact.chain[removeIndex].dept} from the assignment chain?`}
        confirmLabel="Remove"
        tone="red"
        onClose={() => setRemoveIndex(null)}
        onConfirm={confirmRemoveDept}
      />
    )}
    </>
  )
}

// ─── Notes Modal (internal admin notes, not a two-way patient chat) ──────────

const CURRENT_ADMIN_NAME = 'PFSD Admin'

function formatNoteTimestamp(d: Date): string {
  return d.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// Docked bottom-right like a Messenger/FB chat popup — shifts left to sit
// beside the dept breakdown (DetailPane) instead of hiding behind it when open.
function NotesModal({
  contact, dockedNextToPane, onClose, onAddNote,
}: {
  contact: Contact; dockedNextToPane: boolean; onClose: () => void; onAddNote: (text: string) => void
}) {
  const [text, setText] = useState('')
  const notes = contact.notes ?? []

  const handleAdd = () => {
    if (!text.trim()) return
    onAddNote(text.trim())
    setText('')
  }

  return (
    <div
      className={`fixed bottom-0 z-50 transition-[right] duration-150 ${dockedNextToPane ? 'right-[326px]' : 'right-4'}`}
    >
      <div className="bg-white rounded-t-2xl shadow-2xl border border-gray-200 border-b-0 w-[320px] max-h-[65vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60 shrink-0">
          <div className="min-w-0">
            <h2 className="text-[13px] font-semibold text-gray-900 truncate">Notes · {contact.name}</h2>
            <p className="text-[10.5px] text-gray-400 mt-0.5">Internal notes — not visible to the patient</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-xl leading-none shrink-0 ml-2">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {notes.length === 0 ? (
            <p className="text-[12px] text-gray-400 text-center py-8">No notes yet. Add the first one below.</p>
          ) : (
            notes.map(n => (
              <div key={n.id} className="flex gap-2.5">
                <span className="w-1 rounded-full bg-blue-100 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-gray-800">{n.author}</span>
                    <span className="text-[10px] text-gray-400">{n.timestamp}</span>
                  </div>
                  <p className="text-[13px] text-gray-600 mt-0.5 whitespace-pre-wrap break-words">{n.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-gray-100 flex items-end gap-2 shrink-0">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAdd()
              }
            }}
            rows={2}
            placeholder="Write a note…"
            className="flex-1 text-[13px] border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <button
            disabled={!text.trim()}
            onClick={handleAdd}
            className="px-4 py-2 text-[13px] font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors shrink-0"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Contacts Table (shared by Inbox and Manual pages) ───────────────────────

function ContactsTable({
  contacts,
  viewAs,
  paneContact,
  onRowClick,
  updateContact,
  handleStart,
  handleWaitingPatient,
  handleResume,
  handleMarkComplete,
  onReturn,
  useIconActions = false,
  bare = false,
  lastMessageColumnLabel = 'Last Message',
}: {
  contacts: Contact[]
  viewAs: ViewAs
  paneContact: Contact | null
  onRowClick: (c: Contact) => void
  updateContact: (c: Contact) => void
  handleStart: (c: Contact) => void
  handleWaitingPatient: (c: Contact) => void
  handleResume: (c: Contact) => void
  handleMarkComplete: (c: Contact) => void
  onReturn: (c: Contact) => void
  useIconActions?: boolean
  // Skips its own card chrome (border/shadow/rounded corners) when the caller
  // already wraps it in one, so filters + table can share a single card.
  bare?: boolean
  lastMessageColumnLabel?: string
}) {
  const [messageContact, setMessageContact] = useState<Contact | null>(null)

  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const isNoteExpanded = (id: string) => expandedNotes.has(id)
  const toggleNote = (id: string) =>
    setExpandedNotes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const [notesContactId, setNotesContactId] = useState<string | null>(null)
  const notesContact = contacts.find(c => c.id === notesContactId) ?? null

  const handleAddNote = (text: string) => {
    if (!notesContact) return
    const note: ContactNote = { id: `note-${Date.now()}`, author: CURRENT_ADMIN_NAME, text, timestamp: formatNoteTimestamp(new Date()) }
    updateContact({ ...notesContact, notes: [...(notesContact.notes ?? []), note] })
  }

  return (
    <div className={bare ? '' : 'bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm'}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-100">
              <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Contact</th>
              <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">{lastMessageColumnLabel}</th>
              <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5 whitespace-nowrap">First Contact</th>
              <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Status</th>
              {viewAs === 'PFSD' && (
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5 whitespace-nowrap">Assignees</th>
              )}
              {viewAs !== 'PFSD' && (
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5 whitespace-nowrap min-w-[220px]">PFSD Note</th>
              )}
              {viewAs === 'Pharmacy' && (
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Type</th>
              )}
              <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Priority</th>
              <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5 whitespace-nowrap">Last Active</th>
              {viewAs !== 'PFSD' && (
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {contacts.map(contact => {
              const activeEntry = contact.chain[contact.currentChainIndex]
              const activeTone = activeEntry && ENTRY_TONE[activeEntry.entryStatus]
              const pharmEntry = contact.chain.find(e => e.dept === 'Pharmacy')
              const isSelected = paneContact?.id === contact.id

              return (
                <tr
                  key={contact.id}
                  onClick={() => viewAs === 'PFSD' && onRowClick(contact)}
                  className={`border-b border-gray-50 transition-colors ${
                    viewAs === 'PFSD' ? 'cursor-pointer' : ''
                  } ${isSelected ? 'bg-blue-50/70 shadow-[inset_3px_0_0_0_#3b82f6]' : 'hover:bg-gray-50/70'}`}
                >
                  {/* Contact */}
                  <td className="px-4 py-3.5">
                    {useIconActions ? (
                      <div className="flex items-center gap-3">
                        <Avatar initials={contact.initials} color={contact.color} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-semibold text-gray-900">{contact.name}</span>
                            <SourceIcon source={contact.source} className="w-3.5 h-3.5 shrink-0" />
                            {contact.priority === 'Prio' && (
                              <span className="text-[10px] px-1.5 py-px rounded font-bold bg-orange-100 text-orange-600 leading-none">PRIO</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2.5 mt-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setMessageContact(contact)}
                              title="Message"
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                            >
                              <ChatBubbleIcon className="w-4 h-4" />
                            </button>
                            <span className="text-emerald-500">
                              <PhoneIcon className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Avatar initials={contact.initials} color={contact.color} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-semibold text-gray-900">{contact.name}</span>
                            {contact.source === 'Manual' && <ManualSourceBadge />}
                          {contact.priority === 'Prio' && (
                              <span className="text-[10px] px-1.5 py-px rounded font-bold bg-orange-100 text-orange-600 leading-none">PRIO</span>
                            )}
                          </div>
                          {contact.source === 'Manual' ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <button
                              onClick={e => { e.stopPropagation(); setNotesContactId(contact.id) }}
                              className="inline-flex items-center justify-center w-5 h-5 rounded text-blue-500 hover:bg-blue-50 transition-colors"
                              title="Notes"
                            >
                              <ChatIcon />
                            </button>
                            {contact.phone && <span className="text-[11px] text-gray-400">{contact.phone}</span>}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 mt-0.5">
                              <span className={`text-[11px] px-1.5 py-px rounded font-medium ${contact.source === 'Telegram' ? 'bg-blue-50 text-blue-500' : 'bg-indigo-50 text-indigo-500'}`}>{contact.source}</span>
                              {contact.hnNumber && <span className="text-[11px] text-gray-400">{contact.hnNumber}</span>}
                              {contact.phone && <span className="text-[11px] text-gray-300">· {contact.phone}</span>}
                            </div>
                          )}
                      </div>
                      </div>
                    )}
                  </td>

                  {/* Last message */}
                  <td className="px-4 py-3.5 max-w-[130px]">
                    <p className="text-[13px] text-gray-600 truncate">{contact.lastMessage}</p>
                  </td>

                  {/* First contact */}
                  <td className="px-4 py-3.5 text-[12px] text-gray-500 whitespace-nowrap">{contact.firstContact}</td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={contact.status} />
                  </td>

                  {/* Handoff chain (PFSD) — clean, no comments */}
                  {viewAs === 'PFSD' && (
                    <td className="px-4 py-3.5">
                      {contact.chain.length === 0 ? (
                        <span className="text-[12px] text-gray-300 italic">No chain set</span>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {contact.chain.map((entry, idx) => {
                              // 'pending' (up next, hasn't clicked Start yet) already carries its
                              // own amber tone, distinct from 'queued' (not yet reached). Only the
                              // dot encodes status; the pill and text stay neutral throughout.
                              const tone = ENTRY_TONE[entry.entryStatus]
                              return (
                                <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tone.dot}`} />
                                  {deptShortLabel(entry.dept)}
                                </span>
                              )
                            })}
                          </div>
                          {activeEntry && activeTone ? (
                            <p className={`mt-1.5 text-[11px] whitespace-nowrap ${activeTone.text}`}>
                              {activeEntry.entryStatus === 'returned'
                                ? `Return from ${activeEntry.dept}`
                                : `${ENTRY_STATUS_LABEL[activeEntry.entryStatus]} at ${activeEntry.dept}`}
                            </p>
                          ) : contact.chain.every(e => e.entryStatus === 'completed') && (
                            <p className={`mt-1.5 text-[11px] whitespace-nowrap ${HUE.emerald.text}`}>
                              All departments completed
                            </p>
                          )}
                        </>
                      )}
                    </td>
                  )}

                  {/* PFSD note (dept view) */}
                  {viewAs !== 'PFSD' && (
                    <td className="px-4 py-3.5 min-w-[220px] max-w-[280px]">
                      {activeEntry?.comment ? (
                        <div className="relative group">
                          <p className={`flex items-start gap-1.5 text-[12px] text-gray-700 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg leading-relaxed ${activeEntry.comment.length > 80 ? 'pb-4' : ''}`}>
                            <ChatBubbleIcon className="w-3 h-3 mt-0.5 text-blue-400 shrink-0" />
                            <span className={isNoteExpanded(contact.id) ? '' : 'line-clamp-2'}>{activeEntry.comment}</span>
                          </p>
                          {/* Only long notes need it — short ones already fit in two lines,
                              so the toggle would just be visual noise for those rows. Tucked
                              into the corner and hidden until hover so it doesn't compete
                              with the note text itself. */}
                          {activeEntry.comment.length > 80 && (
                            <button
                              onClick={() => toggleNote(contact.id)}
                              className="absolute bottom-1 right-1.5 text-[10px] font-semibold text-blue-600 bg-blue-50 px-1 rounded opacity-0 group-hover:opacity-100 hover:text-blue-800 transition-opacity"
                            >
                              {isNoteExpanded(contact.id) ? 'Show less' : 'Show more'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[12px] text-gray-300">No note from PFSD</span>
                      )}
                    </td>
                  )}

                  {/* Pharmacy type */}
                  {viewAs === 'Pharmacy' && (
                    <td className="px-4 py-3.5">
                      {pharmEntry?.pharmacyType ? (
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${pharmEntry.pharmacyType === 'Question' ? 'bg-violet-100 text-violet-700' : 'bg-teal-100 text-teal-700'}`}>
                          {pharmEntry.pharmacyType}
                        </span>
                      ) : <span className="text-gray-200 text-[12px]">—</span>}
                    </td>
                  )}

                  {/* Priority */}
                  <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                    <div className="relative inline-block">
                      <select
                        value={contact.priority}
                        onChange={e => updateContact({ ...contact, priority: e.target.value as Priority })}
                        className={`text-[12px] border rounded-lg pl-2 pr-6 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white font-medium cursor-pointer appearance-none ${contact.priority === 'Prio' ? 'border-orange-300 text-orange-600 bg-orange-50' : 'border-gray-200 text-gray-600'}`}
                      >
                        <option value="Normal">Normal</option>
                        <option value="Prio">Prio</option>
                      </select>
                      <ChevronDownIcon className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                  </td>

                  {/* Last active */}
                  <td className="px-4 py-3.5 text-[12px] text-gray-500 whitespace-nowrap">{contact.lastActive}</td>

                  {/* Actions (dept view only) — driven by the current entry's own status */}
                  {viewAs !== 'PFSD' && (
                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        {activeEntry?.entryStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStart(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                            >
                              Start
                            </button>
                            {/* Return before Start too — PFSD can mis-assign a department,
                                so the dept shouldn't have to start work just to send it back. */}
                            <button
                              onClick={() => onReturn(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Return
                            </button>
                          </>
                        )}
                        {activeEntry?.entryStatus === 'active' && (
                          <>
                            <button
                              onClick={() => handleWaitingPatient(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-purple-50 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors whitespace-nowrap"
                            >
                              Waiting patient
                            </button>
                            <button
                              onClick={() => handleMarkComplete(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
                            >
                              Mark complete
                            </button>
                            <button
                              onClick={() => onReturn(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Return
                            </button>
                          </>
                        )}
                        {activeEntry?.entryStatus === 'waitingPatient' && (
                          <>
                            <button
                              onClick={() => handleResume(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                            >
                              Resume
                            </button>
                            <button
                              onClick={() => handleMarkComplete(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
                            >
                              Mark complete
                            </button>
                            <button
                              onClick={() => onReturn(contact)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Return
                            </button>
                          </>
                        )}
                        {activeEntry?.entryStatus === 'returned' && (
                          <span className="text-[11px] text-gray-400 italic">Waiting on PFSD</span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}

            {contacts.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-16 text-center text-[13px] text-gray-400">
                  {viewAs !== 'PFSD'
                    ? `No active cases assigned to ${viewAs} at this time.`
                    : 'No records match the current filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {messageContact && (
        <MessageBoxModal contact={messageContact} onClose={() => setMessageContact(null)} />
      )}

      {notesContact && (
        <NotesModal
          contact={notesContact}
          dockedNextToPane={paneContact !== null && viewAs === 'PFSD'}
          onClose={() => setNotesContactId(null)}
          onAddNote={handleAddNote}
        />
      )}
    </div>
  )
}

// ─── Manual Registration Form ─────────────────────────────────────────────────

interface ManualFormData {
  patientId: string
  name: string
  phone: string
  comment: string
}

function ManualFormModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (data: ManualFormData) => void
}) {
  const [patientId, setPatientId] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [comment, setComment] = useState('')

  const isValid = comment.trim() !== ''

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) return
    onAdd({ patientId: patientId.trim(), name: name.trim(), phone: phone.trim(), comment: comment.trim() })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[460px] max-h-[88vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">Create Manual Inquiry</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              For patients who contact by phone · same workflow as Telegram/Facebook
            </p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl leading-none">×</button>
        </div>

        <form id="manual-inquiry-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label htmlFor="manual-patient-id" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Patient ID
            </label>
            <input
              id="manual-patient-id"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              placeholder="e.g. HN00123 (optional)"
              autoFocus
              className="mt-1.5 w-full text-[13px] border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
            />
          </div>

          <div>
            <label htmlFor="manual-name" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Name</label>
            <input
              id="manual-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Patient full name (optional)"
              className="mt-1.5 w-full text-[13px] border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
            />
          </div>

          <div>
            <label htmlFor="manual-phone" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Phone Number
            </label>
            <input
              id="manual-phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 0812345678 (optional)"
              className="mt-1.5 w-full text-[13px] border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
            />
          </div>

          <div>
            <label htmlFor="manual-comment" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              id="manual-comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              placeholder="Describe the patient's inquiry…"
              className="mt-1.5 w-full text-[13px] border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300 resize-none"
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-800">Cancel</button>
          <button
            type="submit"
            form="manual-inquiry-form"
            disabled={!isValid}
            className="px-5 py-2 text-[13px] font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Submit Inquiry
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Manual Page ──────────────────────────────────────────────────────────────

function ManualPage({
  contacts,
  onAdd,
  paneContact,
  onRowClick,
  updateContact,
  handleStart,
  handleWaitingPatient,
  handleResume,
  handleMarkComplete,
  onReturn,
}: {
  contacts: Contact[]
  onAdd: (data: ManualFormData) => void
  paneContact: Contact | null
  onRowClick: (c: Contact) => void
  updateContact: (c: Contact) => void
  handleStart: (c: Contact) => void
  handleWaitingPatient: (c: Contact) => void
  handleResume: (c: Contact) => void
  handleMarkComplete: (c: Contact) => void
  onReturn: (c: Contact) => void
}) {
  const manualContacts = contacts.filter(c => c.source === 'Manual')
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All')
  const [assigneeFilter, setAssigneeFilter] = useState<'All' | 'Unassigned' | Dept>('All')
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All')
  const [firstContactDateFilter, setFirstContactDateFilter] = useState('')
  const [lastActiveDateFilter, setLastActiveDateFilter] = useState('')
  const [search, setSearch] = useState('')

  const clearFilters = () => {
    setStatusFilter('All')
    setAssigneeFilter('All')
    setPriorityFilter('All')
    setFirstContactDateFilter('')
    setLastActiveDateFilter('')
    setSearch('')
  }

  const visible = manualContacts.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false
    if (assigneeFilter === 'Unassigned' && c.chain.length > 0) return false
    if (assigneeFilter !== 'All' && assigneeFilter !== 'Unassigned') {
      const active = c.chain[c.currentChainIndex]
      if (!active || active.dept !== assigneeFilter) return false
    }
    if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false
    if (!matchesLooseDate(c.firstContact, firstContactDateFilter)) return false
    if (!matchesLooseDate(c.lastActive, lastActiveDateFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      const matches = c.name.toLowerCase().includes(q) || (c.hnNumber ?? '').toLowerCase().includes(q) || (c.phone ?? '').includes(q)
      if (!matches) return false
    }
    return true
  })

  const counts = {
    Total: manualContacts.length,
    NewContacts: manualContacts.filter(c => c.activityLog.length <= 1).length,
    Unassigned: manualContacts.filter(c => c.chain.length === 0).length,
    Open: manualContacts.filter(c => c.status === 'Open').length,
    Pending: manualContacts.filter(c => c.status === 'Pending').length,
    Closed: manualContacts.filter(c => c.status === 'Closed').length,
  }

  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const handleAdd = (data: ManualFormData) => {
    onAdd(data)
    setShowForm(false)
    setToast(`Inquiry created for ${data.patientId.trim() || data.name.trim() || 'new contact'}`)
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Manual</h1>
          <p className="text-[11px] text-gray-400">CRM System · Mon, 20 Jul 2026</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-colors"
          >
            <span className="text-[15px] leading-none">+</span> New Manual Inquiry
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center select-none">AP</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {toast && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-[12px] font-medium text-emerald-700">{toast}</p>
          </div>
        )}

        {/* Stat badges */}
        <div className="flex flex-wrap gap-3 mb-5">
          <StatCard
            borderClass={HUE.violet.cardBorder}
            label="Total"
            count={counts.Total}
            icon={<IconChip tone="violet" Icon={UsersIcon} />}
          />
          <StatCard
            borderClass={HUE.violet.cardBorder}
            label="New Contacts"
            count={counts.NewContacts}
            icon={<IconChip tone="violet" Icon={UserPlusIcon} />}
          />
          <StatCard
            borderClass={HUE.red.cardBorder}
            label="Unassigned"
            count={counts.Unassigned}
            icon={<IconChip tone="red" Icon={UserXIcon} />}
          />
          <StatCard
            borderClass={HUE.red.cardBorder}
            label="Open"
            count={counts.Open}
            icon={<IconChip tone="red" Icon={ClockIcon} />}
          />
          <StatCard
            borderClass={HUE.amber.cardBorder}
            label="Pending"
            count={counts.Pending}
            icon={<IconChip tone="amber" Icon={HourglassIcon} />}
          />
          <StatCard
            borderClass={HUE.emerald.cardBorder}
            label="Closed"
            count={counts.Closed}
            icon={<IconChip tone="emerald" Icon={CheckCircleIcon} />}
          />
        </div>

        {/* Manual Inquiries card — filters and the data table share one card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Manual Inquiries</p>
            </div>
            <p className="text-[13px] text-gray-400 mb-4">Manual inquiries registered by phone, in the same workflow as Telegram/Facebook.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              <div>
                <label htmlFor="manual-filter-contact-name" className="text-[11px] font-semibold text-gray-500">Contact Name</label>
                <div className="relative mt-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  <input
                    id="manual-filter-contact-name"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search Contact Name"
                    className="w-full text-[13px] border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="manual-filter-status" className="text-[11px] font-semibold text-gray-500">Status</label>
                <div className="relative mt-1">
                  <select
                    id="manual-filter-status"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as 'All' | Status)}
                    className="w-full text-[13px] border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="manual-filter-first-contact-date" className="text-[11px] font-semibold text-gray-500">First Contact Date</label>
                <DateFilterInput id="manual-filter-first-contact-date" value={firstContactDateFilter} onChange={setFirstContactDateFilter} />
              </div>

              <div>
                <label htmlFor="manual-filter-assignee" className="text-[11px] font-semibold text-gray-500">Assignee</label>
                <div className="relative mt-1">
                  <select
                    id="manual-filter-assignee"
                    value={assigneeFilter}
                    onChange={e => setAssigneeFilter(e.target.value as 'All' | 'Unassigned' | Dept)}
                    className="w-full text-[13px] border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="Unassigned">Unassigned</option>
                    {ALL_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="manual-filter-priority" className="text-[11px] font-semibold text-gray-500">Priority</label>
                <div className="relative mt-1">
                  <select
                    id="manual-filter-priority"
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value as 'All' | Priority)}
                    className="w-full text-[13px] border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="Normal">Normal</option>
                    <option value="Prio">Prio</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="manual-filter-last-active-date" className="text-[11px] font-semibold text-gray-500">Last Active Date</label>
                <DateFilterInput id="manual-filter-last-active-date" value={lastActiveDateFilter} onChange={setLastActiveDateFilter} />
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-orange-500 bg-orange-50 hover:bg-orange-100 transition-colors"
              >
                <RefreshIcon className="w-3.5 h-3.5" /> Clear
              </button>
              <span className="text-[11px] text-gray-400 whitespace-nowrap">{visible.length} results</span>
            </div>
          </div>

          <ContactsTable
            contacts={visible}
            viewAs="PFSD"
            paneContact={paneContact}
            onRowClick={onRowClick}
            updateContact={updateContact}
            handleStart={handleStart}
            handleWaitingPatient={handleWaitingPatient}
            handleResume={handleResume}
            handleMarkComplete={handleMarkComplete}
            onReturn={onReturn}
            bare
            lastMessageColumnLabel="Last Note"
          />
        </div>
      </div>

      {showForm && <ManualFormModal onClose={() => setShowForm(false)} onAdd={handleAdd} />}
    </>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#3b82f6', '#f97316', '#8b5cf6', '#10b981', '#06b6d4', '#ec4899', '#f59e0b', '#6366f1']

function initialsFor(name: string, patientId: string): string {
  const trimmed = name.trim()
  if (!trimmed) return patientId.slice(0, 2).toUpperCase()
  const parts = trimmed.split(/\s+/)
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>(INIT)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [page, setPage] = useState<'Inbox' | 'Manual'>('Inbox')
  const [viewAs, setViewAs] = useState<ViewAs>('PFSD')
  const [paneContact, setPaneContact] = useState<Contact | null>(null)
  const [assignContact, setAssignContact] = useState<Contact | null>(null)
  const [assignMode, setAssignMode] = useState<'assign' | 'reassign'>('assign')
  const [returnContact, setReturnContact] = useState<Contact | null>(null)
  const [activeTab, setActiveTab] = useState<'needsReply' | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All')
  const [providerFilter, setProviderFilter] = useState<'All' | 'Telegram' | 'Facebook'>('All')
  const [assigneeFilter, setAssigneeFilter] = useState<'All' | 'Unassigned' | Dept>('All')
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All')
  const [firstContactDateFilter, setFirstContactDateFilter] = useState('')
  const [lastActiveDateFilter, setLastActiveDateFilter] = useState('')
  const [pharmFilter, setPharmFilter] = useState<'All' | PharmacyType>('All')
  const [search, setSearch] = useState('')
  const [viewOpen, setViewOpen] = useState(false)

  const clearFilters = () => {
    setActiveTab('all')
    setStatusFilter('All')
    setProviderFilter('All')
    setAssigneeFilter('All')
    setPriorityFilter('All')
    setFirstContactDateFilter('')
    setLastActiveDateFilter('')
    setSearch('')
  }

  const updateContact = (updated: Contact) => {
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c))
    if (paneContact?.id === updated.id) setPaneContact(updated)
  }

  const handleStart = (contact: Contact) => {
    const newChain = contact.chain.map((e, i) =>
      i === contact.currentChainIndex ? { ...e, entryStatus: 'active' as ChainEntryStatus } : e
    )
    const log = `${contact.chain[contact.currentChainIndex]?.dept} started working · just now`
    updateContact({ ...contact, chain: newChain, activityLog: [log, ...contact.activityLog] })
  }

  const handleWaitingPatient = (contact: Contact) => {
    const newChain = contact.chain.map((e, i) =>
      i === contact.currentChainIndex ? { ...e, entryStatus: 'waitingPatient' as ChainEntryStatus } : e
    )
    const log = `${contact.chain[contact.currentChainIndex]?.dept} is waiting on patient · just now`
    updateContact({ ...contact, chain: newChain, activityLog: [log, ...contact.activityLog] })
  }

  const handleResume = (contact: Contact) => {
    const newChain = contact.chain.map((e, i) =>
      i === contact.currentChainIndex ? { ...e, entryStatus: 'active' as ChainEntryStatus } : e
    )
    const log = `${contact.chain[contact.currentChainIndex]?.dept} resumed work · just now`
    updateContact({ ...contact, chain: newChain, activityLog: [log, ...contact.activityLog] })
  }

  const handleMarkComplete = (contact: Contact) => {
    const next = contact.currentChainIndex + 1
    const noMore = next >= contact.chain.length
    // Completing the current dept hands the baton to the next queued dept, which
    // becomes pending (their turn now, Start not yet clicked).
    const newChain = contact.chain.map((e, i) => {
      if (i === contact.currentChainIndex) return { ...e, entryStatus: 'completed' as ChainEntryStatus }
      if (!noMore && i === next) return { ...e, entryStatus: 'pending' as ChainEntryStatus }
      return e
    })
    const log = `${contact.chain[contact.currentChainIndex]?.dept} marked complete · just now`
    updateContact({
      ...contact,
      chain: newChain,
      currentChainIndex: noMore ? -1 : next,
      status: noMore ? 'Pending' : contact.status,
      activityLog: [log, ...contact.activityLog],
    })
  }

  const handleReturn = (contact: Contact, dept: Dept, note: string) => {
    const newChain = contact.chain.map((e, i) =>
      i === contact.currentChainIndex ? { ...e, entryStatus: 'returned' as ChainEntryStatus, returnComment: note } : e
    )
    const log = `Returned to PFSD by ${dept} · just now`
    updateContact({ ...contact, status: 'Pending', chain: newChain, activityLog: [log, ...contact.activityLog] })
    setReturnContact(null)
  }

  const addManualContact = (data: ManualFormData) => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    const resolvedName = data.name.trim() || data.patientId.trim() || 'Unknown'
    const newContact: Contact = {
      id: `manual-${now.getTime()}`,
      name: resolvedName,
      initials: initialsFor(resolvedName, data.patientId),
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      source: 'Manual',
      hnNumber: data.patientId.trim() || undefined,
      phone: data.phone.trim() || undefined,
      lastMessage: data.comment,
      firstContact: dateStr,
      status: 'Open',
      priority: 'Normal',
      chain: [],
      currentChainIndex: -1,
      lastActive: `${dateStr}, ${timeStr}`,
      activityLog: [`Inquiry logged from Manual · just now`],
    }
    setContacts(prev => [newContact, ...prev])
  }

  // ── Filtering ──────────────────────────────────────────────────────────────
  // Dept-view scoping only — feeds the stat badges (an overview of the whole
  // scoped inbox), before the search/status/provider/date/tab filters below
  // narrow down what the table itself shows.
  const baseContacts = contacts.filter(c => {
    if (c.source === 'Manual') return false
    if (viewAs !== 'PFSD') {
      if (c.status === 'Closed') return false
      const active = c.chain[c.currentChainIndex]
      if (!active || active.dept !== viewAs) return false
    }
    return true
  })

  const visible = baseContacts.filter(c => {
    if (activeTab === 'needsReply' && c.status !== 'Open') return false
    if (statusFilter !== 'All' && c.status !== statusFilter) return false
    if (providerFilter !== 'All' && c.source !== providerFilter) return false
    if (assigneeFilter === 'Unassigned' && c.chain.length > 0) return false
    if (assigneeFilter !== 'All' && assigneeFilter !== 'Unassigned') {
      const active = c.chain[c.currentChainIndex]
      if (!active || active.dept !== assigneeFilter) return false
    }
    if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false
    if (!matchesLooseDate(c.firstContact, firstContactDateFilter)) return false
    if (!matchesLooseDate(c.lastActive, lastActiveDateFilter)) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    if (viewAs === 'Pharmacy' && pharmFilter !== 'All') {
      const pe = c.chain.find(e => e.dept === 'Pharmacy')
      if (pe?.pharmacyType !== pharmFilter) return false
    }
    return true
  })

  const counts = {
    Total: baseContacts.length,
    Telegram: baseContacts.filter(c => c.source === 'Telegram').length,
    Facebook: baseContacts.filter(c => c.source === 'Facebook').length,
    NewContacts: baseContacts.filter(c => c.activityLog.length <= 1).length,
    Unassigned: baseContacts.filter(c => c.chain.length === 0).length,
    Open: baseContacts.filter(c => c.status === 'Open').length,
    Pending: baseContacts.filter(c => c.status === 'Pending').length,
    Closed: baseContacts.filter(c => c.status === 'Closed').length,
  }

  const viewLabel = viewAs === 'PFSD' ? 'Admin PFSD' : viewAs

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-[#111827] text-white flex flex-col shrink-0 transition-[width] duration-200 overflow-hidden`}>
        <div className={`flex items-center border-b border-white/10 py-[18px] ${sidebarOpen ? 'justify-between px-4' : 'justify-center px-2'}`}>
          {sidebarOpen && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0">C</div>
              <span className="font-semibold text-[13px] tracking-tight truncate">CRM System</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="text-white/50 hover:text-white transition-colors shrink-0"
          >
            <SidebarToggleIcon className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 px-2.5 py-4 overflow-y-auto overflow-x-hidden space-y-0.5">
          {[
            { label: 'Dashboard', icon: <DashboardGridIcon className="w-[18px] h-[18px]" /> },
            { label: 'Inbox', icon: <MailIcon className="w-[18px] h-[18px]" />, badge: 3 },
            { label: 'Manual', icon: <PencilIcon className="w-[18px] h-[18px]" /> },
            { label: 'Reservations', icon: <CalendarIcon className="w-[18px] h-[18px]" />, badge: 3 },
            { label: 'Medicines', icon: <PillIcon className="w-[18px] h-[18px]" /> },
            { label: 'Support', icon: <LifeBuoyIcon className="w-[18px] h-[18px]" />, badge: 2 },
          ].map(item => {
            const isNavigable = item.label === 'Inbox' || item.label === 'Manual'
            const isActive = isNavigable && item.label === page
            return (
              <button
                key={item.label}
                title={!sidebarOpen ? item.label : undefined}
                onClick={() => {
                  if (!isNavigable) return
                  setPage(item.label as 'Inbox' | 'Manual')
                  setPaneContact(null)
                }}
                className={`w-full flex items-center py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap ${sidebarOpen ? 'justify-between px-3' : 'justify-center px-0'} ${isActive ? 'bg-blue-600 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'}`}
              >
                <span className={`flex items-center ${sidebarOpen ? 'gap-2.5' : ''}`}>
                  <span className="shrink-0 flex items-center justify-center w-[18px] h-[18px]">{item.icon}</span>
                  {sidebarOpen && item.label}
                </span>
                {sidebarOpen && item.badge != null && <span className="bg-blue-500 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold shrink-0">{item.badge}</span>}
              </button>
            )
          })}
          {sidebarOpen ? (
            <div className="pt-5 pb-1.5 px-3">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Admin</span>
            </div>
          ) : (
            <div className="my-3 mx-3 border-t border-white/10" />
          )}
          {[
            { label: 'Members', icon: <UsersIcon className="w-[18px] h-[18px]" /> },
            { label: 'User Mgmt', icon: <UserGearIcon className="w-[18px] h-[18px]" /> },
            { label: 'Scheduled Tasks', icon: <ClockIcon className="w-[18px] h-[18px]" /> },
            { label: 'Pulse', icon: <ActivityPulseIcon className="w-[18px] h-[18px]" /> },
          ].map(item => (
            <button
              key={item.label}
              title={!sidebarOpen ? item.label : undefined}
              className={`w-full flex items-center py-2 rounded-lg text-[13px] text-white/60 hover:bg-white/8 hover:text-white transition-colors whitespace-nowrap ${sidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'}`}
            >
              <span className="shrink-0 flex items-center justify-center w-[18px] h-[18px]">{item.icon}</span>
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main + Pane wrapper ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {page === 'Manual' ? (
          <ManualPage
            contacts={contacts}
            onAdd={addManualContact}
            paneContact={paneContact}
            onRowClick={c => setPaneContact(paneContact?.id === c.id ? null : c)}
            updateContact={updateContact}
            handleStart={handleStart}
            handleWaitingPatient={handleWaitingPatient}
            handleResume={handleResume}
            handleMarkComplete={handleMarkComplete}
            onReturn={c => setReturnContact(c)}
          />
        ) : (
        <>
          {/* Top bar */}
          <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 shrink-0">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Inbox</h1>
              <p className="text-[11px] text-gray-400">CRM System · Mon, 20 Jul 2026</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <button
                  onClick={() => setViewOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${viewAs === 'PFSD' ? 'bg-blue-500' : 'bg-violet-500'}`} />
                  {viewLabel}
                  <span className="text-gray-400 text-[10px]">▾</span>
                </button>
                {viewOpen && (
                  <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 min-w-[200px] py-1.5">
                    <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Switch view</p>
                    {ALL_VIEWS.map(v => (
                      <button
                        key={v}
                        onClick={() => { setViewAs(v); setViewOpen(false); setPaneContact(null) }}
                        className={`w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 flex items-center gap-2.5 ${viewAs === v ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${v === 'PFSD' ? 'bg-blue-400' : 'bg-violet-400'}`} />
                        {v === 'PFSD' ? 'Admin PFSD' : v}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center select-none">
                {viewAs === 'PFSD' ? 'AP' : viewAs.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Stat badges */}
            <div className="flex flex-wrap gap-3 mb-5">
              <StatCard
                borderClass={HUE.violet.cardBorder}
                label="Total"
                count={counts.Total}
                icon={<IconChip tone="violet" Icon={UsersIcon} />}
              />
              <StatCard borderClass={HUE.blue.cardBorder} label="Telegram" count={counts.Telegram} icon={<TelegramGlyph className="w-9 h-9" />} />
              <StatCard borderClass={HUE.blue.cardBorder} label="Facebook" count={counts.Facebook} icon={<FacebookGlyph className="w-9 h-9" />} />
              <StatCard
                borderClass={HUE.violet.cardBorder}
                label="New Contacts"
                count={counts.NewContacts}
                icon={<IconChip tone="violet" Icon={UserPlusIcon} />}
              />
              <StatCard
                borderClass={HUE.red.cardBorder}
                label="Unassigned"
                count={counts.Unassigned}
                icon={<IconChip tone="red" Icon={UserXIcon} />}
              />
              <StatCard
                borderClass={HUE.red.cardBorder}
                label="Open"
                count={counts.Open}
                icon={<IconChip tone="red" Icon={ClockIcon} />}
              />
              <StatCard
                borderClass={HUE.amber.cardBorder}
                label="Pending"
                count={counts.Pending}
                icon={<IconChip tone="amber" Icon={HourglassIcon} />}
              />
              <StatCard
                borderClass={HUE.emerald.cardBorder}
                label="Closed"
                count={counts.Closed}
                icon={<IconChip tone="emerald" Icon={CheckCircleIcon} />}
              />
            </div>

            {/* Customer Inbox card — filters and the data table share one card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Customer Inbox</p>
                </div>
                <p className="text-[13px] text-gray-400 mb-4">Manage customer messages, assignments, and handoffs in one clean workspace.</p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-4">
                  <div>
                    <label htmlFor="filter-contact-name" className="text-[11px] font-semibold text-gray-500">Contact Name</label>
                    <div className="relative mt-1">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                      <input
                        id="filter-contact-name"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search Contact Name"
                        className="w-full text-[13px] border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="filter-status" className="text-[11px] font-semibold text-gray-500">Status</label>
                    <div className="relative mt-1">
                      <select
                        id="filter-status"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as 'All' | Status)}
                        className="w-full text-[13px] border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white appearance-none"
                      >
                        <option value="All">All</option>
                        <option value="Open">Open</option>
                        <option value="Pending">Pending</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="filter-provider" className="text-[11px] font-semibold text-gray-500">Provider</label>
                    <div className="relative mt-1">
                      <select
                        id="filter-provider"
                        value={providerFilter}
                        onChange={e => setProviderFilter(e.target.value as 'All' | 'Telegram' | 'Facebook')}
                        className="w-full text-[13px] border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white appearance-none"
                      >
                        <option value="All">All</option>
                        <option value="Telegram">Telegram</option>
                        <option value="Facebook">Facebook</option>
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="filter-first-contact-date" className="text-[11px] font-semibold text-gray-500">First Contact Date</label>
                    <DateFilterInput id="filter-first-contact-date" value={firstContactDateFilter} onChange={setFirstContactDateFilter} />
                  </div>

                  <div>
                    <label htmlFor="filter-assignee" className="text-[11px] font-semibold text-gray-500">Assignee</label>
                    <div className="relative mt-1">
                      <select
                        id="filter-assignee"
                        value={assigneeFilter}
                        onChange={e => setAssigneeFilter(e.target.value as 'All' | 'Unassigned' | Dept)}
                        className="w-full text-[13px] border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white appearance-none"
                      >
                        <option value="All">All</option>
                        <option value="Unassigned">Unassigned</option>
                        {ALL_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="filter-priority" className="text-[11px] font-semibold text-gray-500">Priority</label>
                    <div className="relative mt-1">
                      <select
                        id="filter-priority"
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value as 'All' | Priority)}
                        className="w-full text-[13px] border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white appearance-none"
                      >
                        <option value="All">All</option>
                        <option value="Normal">Normal</option>
                        <option value="Prio">Prio</option>
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="filter-last-active-date" className="text-[11px] font-semibold text-gray-500">Last Active Date</label>
                    <DateFilterInput id="filter-last-active-date" value={lastActiveDateFilter} onChange={setLastActiveDateFilter} />
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-orange-500 bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    <RefreshIcon className="w-3.5 h-3.5" /> Clear
                  </button>
                  {viewAs === 'Pharmacy' && (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mr-1">Type:</span>
                      {(['All', 'Question', 'Medicine only'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setPharmFilter(f)}
                          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${pharmFilter === f ? 'bg-violet-600 text-white' : 'text-gray-500 hover:bg-violet-50 hover:text-violet-700'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                    <button
                      onClick={() => setActiveTab('needsReply')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${
                        activeTab === 'needsReply' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Needs Reply
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{counts.Open}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${
                        activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      All Contacts
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center">{counts.Total}</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">{visible.length} results</span>
                </div>
              </div>

              <ContactsTable
                contacts={visible}
                viewAs={viewAs}
                paneContact={paneContact}
                onRowClick={c => setPaneContact(paneContact?.id === c.id ? null : c)}
                updateContact={updateContact}
                handleStart={handleStart}
                handleWaitingPatient={handleWaitingPatient}
                handleResume={handleResume}
                handleMarkComplete={handleMarkComplete}
                onReturn={c => setReturnContact(c)}
                useIconActions
                bare
              />
            </div>
          </div>
        </>
        )}
        </main>

        {/* ── Right Pane (PFSD only) ────────────────────────────────────────── */}
        {paneContact && (viewAs === 'PFSD' || page === 'Manual') && (
          <DetailPane
            contact={paneContact}
            onClose={() => setPaneContact(null)}
            onUpdate={updateContact}
            onOpenAssign={() => { setAssignContact(paneContact); setAssignMode('assign') }}
            onOpenReassign={() => { setAssignContact(paneContact); setAssignMode('reassign') }}
            onMarkComplete={handleMarkComplete}
          />
        )}
      </div>

      {/* ── Sequential Assignment / Reassignment Popup ────────────────────── */}
      {assignContact && (
        <AssignPopup
          contact={assignContact}
          mode={assignMode}
          onClose={() => setAssignContact(null)}
          onSave={(chain, currentIdx) => {
            const log = assignMode === 'reassign' ? 'Reassigned by PFSD · just now' : 'Chain updated · just now'
            updateContact({ ...assignContact, chain, currentChainIndex: currentIdx, status: chain.length > 0 ? 'Pending' : assignContact.status, activityLog: [log, ...assignContact.activityLog] })
            setAssignContact(null)
          }}
        />
      )}

      {/* ── Return Modal (dept view) ──────────────────────────────────────── */}
      {returnContact && viewAs !== 'PFSD' && (
        <ReturnModal
          contact={returnContact}
          dept={viewAs as Dept}
          onClose={() => setReturnContact(null)}
          onReturn={note => handleReturn(returnContact, viewAs as Dept, note)}
        />
      )}

      {/* Click-outside to close view dropdown */}
      {viewOpen && <div className="fixed inset-0 z-40" onClick={() => setViewOpen(false)} />}
    </div>
  )
}
