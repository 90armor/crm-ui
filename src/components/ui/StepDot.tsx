import type { ChainEntryStatus } from '@/types/domain'

// Destination-dot marker for the department breakdown timeline. The "current"
// node pulses — that's the one PFSD needs to see, whether it's actively being
// worked (active/returned) or just handed off and waiting on the dept to start.
export function StepDot({ status, isCurrent, isOrigin }: { status: ChainEntryStatus; isCurrent: boolean; isOrigin?: boolean }) {
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
