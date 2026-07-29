import { STAFF_MEMBERS } from '@/data/contacts'
import { ChevronDownIcon, UserIcon } from '@/icons'

export function AssigneeSelectCell({
  assignee,
  onChange,
}: {
  assignee: string | null
  onChange: (assignee: string | null) => void
}) {
  return (
    <div className="relative inline-block">
      <select
        value={assignee ?? ''}
        onChange={e => onChange(e.target.value || null)}
        className="appearance-none pl-7 pr-7 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">Unassigned</option>
        {STAFF_MEMBERS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
    </div>
  )
}
