import { CalendarIcon } from '@/icons'

// Date filter that only accepts a value through the native picker — typing is
// blocked, and the picker indicator is stretched invisibly over the whole
// field (WebKit-only pseudo-element; Firefox falls back to its own icon on
// the right, typing still blocked there too) so clicking anywhere opens it.
// A real "Pick a date" placeholder is shown in its place since date inputs
// don't support one natively.
export function DateFilterInput({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
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
