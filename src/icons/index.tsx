// ─── Inline-SVG icon components ──────────────────────────────────────────────
// Every icon glyph used across the app. All follow the same convention:
// `viewBox="0 0 20 20"`, `stroke="currentColor"`, and a `className` prop for
// sizing/color — so any icon can be dropped in at any size via Tailwind
// width/height/text-color utilities on the caller's side.
import type { Contact } from '@/types/domain'

export function ChatIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

export function MinusCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="10" cy="10" r="8" />
      <line x1="6.5" y1="10" x2="13.5" y2="10" strokeLinecap="round" />
    </svg>
  )
}

export function NoteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 3.5h7.5L16 7v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-11.5a1 1 0 011-1z" />
      <path d="M12.5 3.5V7H16" />
      <path d="M6.5 10.5h7M6.5 13h5" />
    </svg>
  )
}

export function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13.5 3.5l3 3L6 17l-4 1 1-4L13.5 3.5z" />
    </svg>
  )
}

export function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9.6c0-3.6 3.13-6.5 7-6.5s7 2.9 7 6.5-3.13 6.5-7 6.5c-.86 0-1.68-.14-2.43-.4L4 17l1.1-3.13A6.16 6.16 0 013 9.6z" />
    </svg>
  )
}

export function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6.5 3.5c.3 0 .58.18.7.46l1 2.3c.11.26.07.55-.1.77l-1.1 1.4a9 9 0 004.6 4.6l1.4-1.1c.22-.17.51-.21.77-.1l2.3 1c.28.12.46.4.46.7v2.2c0 .8-.7 1.42-1.49 1.31A13.5 13.5 0 013 5c-.11-.79.51-1.5 1.31-1.5h2.2z" />
    </svg>
  )
}

export function ActivityLogIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4.2l2.8 1.6" />
    </svg>
  )
}

export function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <circle cx="10" cy="10" r="10" fill="#29A9EB" />
      <path d="M4.7 9.9l10.6-4.3c.5-.2 1 .2.8.8l-1.8 8.6c-.1.5-.7.7-1.1.4l-2.6-2-1.3 1.3c-.3.3-.7.1-.8-.3l-.4-2.5-2.6-1.1c-.5-.2-.5-.9.2-1.1z" fill="#fff" />
    </svg>
  )
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <circle cx="10" cy="10" r="10" fill="#1877F2" />
      <path d="M12.5 6.5h-1.2c-.4 0-.8.3-.8.9v1.3h2l-.3 2h-1.7v5h-2v-5H7v-2h1.5V7.1c0-1.5 1-2.6 2.5-2.6h1.5v2z" fill="#fff" />
    </svg>
  )
}

export function SourceIcon({ source, className }: { source: Contact['source']; className?: string }) {
  if (source === 'Telegram') return <TelegramIcon className={className} />
  if (source === 'Facebook') return <FacebookIcon className={className} />
  return null
}

export function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="8" />
      <path d="M7.8 7.6a2.2 2.2 0 014.2.9c0 1.5-2.2 1.6-2.2 3.1" />
      <circle cx="10" cy="14.2" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.5 3h4.5v4.5M7.5 17H3v-4.5M17 3l-5.5 5.5M3 17l5.5-5.5" />
    </svg>
  )
}

export function MinimizeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <line x1="4" y1="14" x2="16" y2="14" />
    </svg>
  )
}

export function CloseXIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <line x1="5" y1="5" x2="15" y2="15" />
      <line x1="15" y1="5" x2="5" y2="15" />
    </svg>
  )
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  )
}

export function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 7.2l-6 6a2.3 2.3 0 003.3 3.3l6.2-6.2a3.9 3.9 0 00-5.5-5.5l-6.3 6.3a5.5 5.5 0 007.8 7.8" />
    </svg>
  )
}

export function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2.3 10.1L17 3.6c.8-.35 1.6.35 1.3 1.15l-2.6 12.4c-.18.86-1.15 1.25-1.9.75l-3.5-2.35-1.75 1.85c-.42.44-1.13.2-1.22-.4l-.55-3.6-3.5-1.55c-.72-.32-.75-1.32.08-1.75z" />
    </svg>
  )
}

// ─── Inbox stat-card + filter icons ──────────────────────────────────────────

export function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="7" r="3" />
      <path d="M3.5 17c.6-3.4 3.1-5.5 6.5-5.5s5.9 2.1 6.5 5.5" />
    </svg>
  )
}

export function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="2.5" width="9" height="15" rx="1" />
      <path d="M13 8.5h3v9h-12" />
      <path d="M6.5 5.5h1.5M6.5 8.5h1.5M6.5 11.5h1.5M9.5 5.5h1.5M9.5 8.5h1.5M9.5 11.5h1.5" />
    </svg>
  )
}

export function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 17.5s6-5.3 6-10a6 6 0 10-12 0c0 4.7 6 10 6 10z" />
      <circle cx="10" cy="7.5" r="2" />
    </svg>
  )
}

export function IdCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
      <circle cx="7" cy="9.7" r="1.7" />
      <path d="M4.3 13.3c.4-1.4 1.5-2.2 2.7-2.2s2.3.8 2.7 2.2" />
      <path d="M12.5 8h3M12.5 10.5h3" />
    </svg>
  )
}

export function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="7.5" cy="6.5" r="2.5" />
      <path d="M2.8 16c.4-2.6 2.4-4.3 4.7-4.3s4.3 1.7 4.7 4.3" />
      <circle cx="14" cy="7" r="2" />
      <path d="M13 11.8c1.9.3 3.4 1.8 3.7 4" />
    </svg>
  )
}

export function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="7" r="3" />
      <path d="M2.5 16.5c.5-3 2.7-5 5.5-5s5 2 5.5 5" />
      <path d="M15.5 5.5v5M13 8h5" />
    </svg>
  )
}

export function UserXIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="7" r="3" />
      <path d="M2.5 16.5c.5-3 2.7-5 5.5-5s5 2 5.5 5" />
      <path d="M13.5 5.5l4 4M17.5 5.5l-4 4" />
    </svg>
  )
}

export function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 5.8V10l3 2" />
    </svg>
  )
}

export function HourglassIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 3h10M5 17h10" />
      <path d="M6 3c0 3 2 4.5 4 5 2-.5 4-2 4-5M6 17c0-3 2-4.5 4-5 2 .5 4 2 4 5" />
    </svg>
  )
}

export function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M6.8 10.2l2.2 2.2 4.2-4.8" />
    </svg>
  )
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8.5" cy="8.5" r="5.5" />
      <line x1="16.5" y1="16.5" x2="12.7" y2="12.7" />
    </svg>
  )
}

export function CalendarIcon({ className }: { className?: string }) {
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
export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5.5 8l4.5 4.5L14.5 8" />
    </svg>
  )
}

export function SidebarToggleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="14" height="12" rx="2" />
      <line x1="8" y1="4" x2="8" y2="16" />
    </svg>
  )
}

export function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 10a6 6 0 0110-4.2M16 10a6 6 0 01-10 4.2" />
      <path d="M14 3v3h-3M6 17v-3h3" />
    </svg>
  )
}

// ─── Sidebar module icons ─────────────────────────────────────────────────────

export function DashboardGridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className={className}>
      <rect x="2.8" y="2.8" width="6.2" height="6.2" rx="1.3" />
      <rect x="11" y="2.8" width="6.2" height="6.2" rx="1.3" />
      <rect x="2.8" y="11" width="6.2" height="6.2" rx="1.3" />
      <rect x="11" y="11" width="6.2" height="6.2" rx="1.3" />
    </svg>
  )
}

export function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2.3" y="4.5" width="15.4" height="11" rx="1.6" />
      <path d="M3 5.5l7 6 7-6" />
    </svg>
  )
}

export function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5.5 2.8h6l3 3v10.4a1 1 0 01-1 1h-8a1 1 0 01-1-1V3.8a1 1 0 011-1z" />
      <path d="M11.5 2.8v3h3" />
      <path d="M7 10.2h6M7 13h6M7 7.5h2.5" />
    </svg>
  )
}

export function PillIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <g transform="rotate(-45 10 10)">
        <rect x="3.2" y="7" width="13.6" height="6" rx="3" />
        <line x1="10" y1="7" x2="10" y2="13" />
      </g>
    </svg>
  )
}

export function LifeBuoyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="7.2" />
      <circle cx="10" cy="10" r="3.1" />
      <path d="M4.9 4.9l2.9 2.9M15.1 4.9l-2.9 2.9M4.9 15.1l2.9-2.9M15.1 15.1l-2.9-2.9" />
    </svg>
  )
}

export function UserGearIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="7.3" cy="6.8" r="3" />
      <path d="M2.5 16.3c.5-2.9 2.5-4.8 4.8-4.8.7 0 1.35.17 1.93.47" />
      <circle cx="14.7" cy="13.7" r="2.1" />
      <path d="M14.7 10.7v.9M14.7 15.8v.9M17.7 13.7h-.9M12.6 13.7h-.9M16.6 11.6l-.65.65M13.45 14.75l-.65.65M16.6 15.8l-.65-.65M13.45 12.65l-.65-.65" />
    </svg>
  )
}

export function ActivityPulseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 10.5h3l1.8-4.8 3 9 1.8-4.2h4.4" />
    </svg>
  )
}
