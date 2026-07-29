import { useState, useMemo } from 'react'
import { useFilteredList } from '@/hooks/useFilteredList'
import { matchesLooseDate } from '@/lib/format'
import { DateFilterInput } from '@/components/ui/DateFilterInput'
import { SearchIcon, ChevronDownIcon, RefreshIcon, HelpCircleIcon } from '@/icons'
import { HOSPITALS, RESERVATIONS } from '@/data/reservations'
import { STAFF_MEMBERS } from '@/data/contacts'
import { ContactCell } from '@/components/requests/ContactCell'
import { RequestStatusOverview } from '@/components/requests/RequestStatusOverview'
import { StatusSelectCell } from '@/components/requests/StatusSelectCell'
import { AssigneeSelectCell } from '@/components/requests/AssigneeSelectCell'
import { ReservationDetailPanel } from '@/components/requests/ReservationDetailPanel'
import { ActivityLogDrawer } from '@/components/contacts/ActivityLogDrawer'
import { MessagePanel } from '@/components/contacts/MessagePanel'
import type { Contact, Reservation, RequestStatus, VisitorType } from '@/types/domain'

export function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(RESERVATIONS)
  const [messageContact, setMessageContact] = useState<Contact | null>(null)
  const [activityLogFor, setActivityLogFor] = useState<Contact | null>(null)
  const [detailFor, setDetailFor] = useState<Reservation | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | RequestStatus>('All')
  const [hospitalFilter, setHospitalFilter] = useState('All')
  const [visitorTypeFilter, setVisitorTypeFilter] = useState<'All' | VisitorType>('All')
  const [assigneeFilter, setAssigneeFilter] = useState('All')
  const [preferredDateFilter, setPreferredDateFilter] = useState('')
  const [createdDateFilter, setCreatedDateFilter] = useState('')

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All')
    setHospitalFilter('All')
    setVisitorTypeFilter('All')
    setAssigneeFilter('All')
    setPreferredDateFilter('')
    setCreatedDateFilter('')
  }

  const updateReservation = (updated: Reservation) => {
    setReservations(prev => prev.map(r => r.id === updated.id ? updated : r))
    if (activityLogFor?.id === updated.contact.id) setActivityLogFor(updated.contact)
    if (detailFor?.id === updated.id) setDetailFor(updated)
  }

  const visible = useFilteredList(reservations, r => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false
    if (hospitalFilter !== 'All' && r.hospital !== hospitalFilter) return false
    if (visitorTypeFilter !== 'All' && r.visitorType !== visitorTypeFilter) return false
    if (assigneeFilter === 'Unassigned' && r.assignee !== null) return false
    if (assigneeFilter !== 'All' && assigneeFilter !== 'Unassigned' && r.assignee !== assigneeFilter) return false
    if (!matchesLooseDate(r.scheduleDate, preferredDateFilter)) return false
    if (!matchesLooseDate(r.createdDate, createdDateFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      const matches = r.contact.name.toLowerCase().includes(q) || (r.contact.hnNumber ?? '').toLowerCase().includes(q) || (r.contact.phone ?? '').includes(q)
      if (!matches) return false
    }
    return true
  }, [statusFilter, hospitalFilter, visitorTypeFilter, assigneeFilter, preferredDateFilter, createdDateFilter, search])

  const counts = useMemo(() => ({
    Total: reservations.length,
    Open: reservations.filter(r => r.status === 'Open').length,
    Pending: reservations.filter(r => r.status === 'Pending').length,
    Resolved: reservations.filter(r => r.status === 'Resolved').length,
  }), [reservations])

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Reservations</h1>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">CRM System · Mon, 20 Jul 2026</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center select-none">AP</div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <RequestStatusOverview title="Reservation Status Overview" counts={counts} />

        {/* Filters + table card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
              <div>
                <label htmlFor="res-filter-search" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Patient ID / Phone</label>
                <div className="relative mt-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600 pointer-events-none" />
                  <input
                    id="res-filter-search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search ID / Phone"
                    className="w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="res-filter-status" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Status</label>
                <div className="relative mt-1">
                  <select
                    id="res-filter-status"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as 'All' | RequestStatus)}
                    className="w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-gray-100 appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="res-filter-hospital" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Hospital</label>
                <div className="relative mt-1">
                  <select
                    id="res-filter-hospital"
                    value={hospitalFilter}
                    onChange={e => setHospitalFilter(e.target.value)}
                    className="w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-gray-100 appearance-none"
                  >
                    <option value="All">All</option>
                    {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="res-filter-visitor-type" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Visitor Type</label>
                <div className="relative mt-1">
                  <select
                    id="res-filter-visitor-type"
                    value={visitorTypeFilter}
                    onChange={e => setVisitorTypeFilter(e.target.value as 'All' | VisitorType)}
                    className="w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-gray-100 appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="First Visit">First Visit</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="res-filter-assignee" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Assignee</label>
                <div className="relative mt-1">
                  <select
                    id="res-filter-assignee"
                    value={assigneeFilter}
                    onChange={e => setAssigneeFilter(e.target.value)}
                    className="w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-gray-100 appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="Unassigned">Unassigned</option>
                    {STAFF_MEMBERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="res-filter-preferred-date" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Preferred Date</label>
                <DateFilterInput id="res-filter-preferred-date" value={preferredDateFilter} onChange={setPreferredDateFilter} />
              </div>

              <div>
                <label htmlFor="res-filter-created-date" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Created Date</label>
                <DateFilterInput id="res-filter-created-date" value={createdDateFilter} onChange={setCreatedDateFilter} />
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950/60 transition-colors"
              >
                <RefreshIcon className="w-3.5 h-3.5" /> Clear
              </button>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{visible.length} results</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                  <th className="text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-3.5">Contact</th>
                  <th className="text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-3.5">
                    <span className="inline-flex items-center gap-1" title="Current reservation status">
                      Status <HelpCircleIcon className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                    </span>
                  </th>
                  <th className="text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-3.5">
                    <span className="inline-flex items-center gap-1" title="Staff member handling this reservation">
                      Assignee <HelpCircleIcon className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                    </span>
                  </th>
                  <th className="text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-3.5 whitespace-nowrap">Appointment Type</th>
                  <th className="text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-3.5">Schedule</th>
                  <th className="text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-3.5">Doctor</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(r => (
                  <tr
                    key={r.id}
                    onClick={() => setDetailFor(r)}
                    className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <ContactCell
                        contact={r.contact}
                        createdDate={r.createdDate}
                        badge={
                          <span className="text-[10px] px-1.5 py-px rounded-full font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 leading-none">
                            {r.visitorType}
                          </span>
                        }
                        onMessage={() => setMessageContact(r.contact)}
                        onActivityLog={() => setActivityLogFor(r.contact)}
                      />
                    </td>

                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                      <StatusSelectCell
                        status={r.status}
                        onChange={status => updateReservation({
                          ...r,
                          status,
                          contact: { ...r.contact, activityLog: [`Status changed to ${status} · just now`, ...r.contact.activityLog] },
                        })}
                      />
                    </td>

                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                      <AssigneeSelectCell
                        assignee={r.assignee}
                        onChange={assignee => updateReservation({
                          ...r,
                          assignee,
                          contact: { ...r.contact, activityLog: [assignee ? `Assigned to ${assignee} · just now` : 'Unassigned · just now', ...r.contact.activityLog] },
                        })}
                      />
                    </td>

                    <td className="px-4 py-3.5 text-[13px] text-gray-700 dark:text-gray-300">{r.appointmentType}</td>

                    <td className="px-4 py-3.5">
                      <p className="text-[13px] text-gray-700 dark:text-gray-300">{r.scheduleDate}</p>
                      <span className="inline-block mt-0.5 text-[11px] px-1.5 py-px rounded border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
                        {r.scheduleTime}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-[13px] text-gray-700 dark:text-gray-300">{r.doctor}</td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-gray-400 dark:text-gray-500">No reservations match these filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activityLogFor && (
        <ActivityLogDrawer contact={activityLogFor} onClose={() => setActivityLogFor(null)} />
      )}

      {messageContact && (
        <MessagePanel contact={messageContact} onClose={() => setMessageContact(null)} />
      )}

      {detailFor && (
        <ReservationDetailPanel reservation={detailFor} onClose={() => setDetailFor(null)} />
      )}
    </>
  )
}
