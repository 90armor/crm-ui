import { useState, useMemo } from 'react'
import { useFilteredList } from '@/hooks/useFilteredList'
import { matchesLooseDate } from '@/lib/format'
import { StatCard } from '@/components/ui/StatCard'
import { IconChip } from '@/components/ui/IconChip'
import { DateFilterInput } from '@/components/ui/DateFilterInput'
import { ContactsTable } from '@/components/contacts/ContactsTable'
import {
  UsersIcon, TelegramIcon, FacebookIcon, UserPlusIcon, UserXIcon, ClockIcon, HourglassIcon,
  CheckCircleIcon, SearchIcon, ChevronDownIcon, RefreshIcon,
} from '@/icons'
import { HUE } from '@/theme/hue'
import { ALL_DEPTS, ALL_VIEWS } from '@/data/contacts'
import type { Contact, ViewAs, Status, Priority, Dept, PharmacyType } from '@/types/domain'

export function InboxPage({
  contacts,
  viewAs,
  onChangeViewAs,
  paneContact,
  onRowClick,
  updateContact,
  handleStart,
  handleWaitingPatient,
  handleResume,
  handleMarkComplete,
  onReturn,
  onOpenActivityLog,
}: {
  contacts: Contact[]
  viewAs: ViewAs
  onChangeViewAs: (v: ViewAs) => void
  paneContact: Contact | null
  onRowClick: (c: Contact) => void
  updateContact: (c: Contact) => void
  handleStart: (c: Contact) => void
  handleWaitingPatient: (c: Contact) => void
  handleResume: (c: Contact) => void
  handleMarkComplete: (c: Contact) => void
  onReturn: (c: Contact) => void
  onOpenActivityLog: (c: Contact) => void
}) {
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'needsReply' | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All')
  const [providerFilter, setProviderFilter] = useState<'All' | 'Telegram' | 'Facebook'>('All')
  const [assigneeFilter, setAssigneeFilter] = useState<'All' | 'Unassigned' | Dept>('All')
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All')
  const [firstContactDateFilter, setFirstContactDateFilter] = useState('')
  const [lastActiveDateFilter, setLastActiveDateFilter] = useState('')
  const [pharmFilter, setPharmFilter] = useState<'All' | PharmacyType>('All')
  const [search, setSearch] = useState('')

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

  // Dept-view scoping only — feeds the stat badges (an overview of the whole
  // scoped inbox), before the search/status/provider/date/tab filters below
  // narrow down what the table itself shows.
  const baseContacts = useFilteredList(contacts, c => {
    if (c.source === 'Manual') return false
    if (viewAs !== 'PFSD') {
      if (c.status === 'Closed') return false
      const active = c.chain[c.currentChainIndex]
      if (!active || active.dept !== viewAs) return false
    }
    return true
  }, [viewAs])

  const visible = useFilteredList(baseContacts, c => {
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
  }, [activeTab, statusFilter, providerFilter, assigneeFilter, priorityFilter, firstContactDateFilter, lastActiveDateFilter, search, viewAs, pharmFilter])

  const counts = useMemo(() => ({
    Total: baseContacts.length,
    Telegram: baseContacts.filter(c => c.source === 'Telegram').length,
    Facebook: baseContacts.filter(c => c.source === 'Facebook').length,
    NewContacts: baseContacts.filter(c => c.activityLog.length <= 1).length,
    Unassigned: baseContacts.filter(c => c.chain.length === 0).length,
    Open: baseContacts.filter(c => c.status === 'Open').length,
    Pending: baseContacts.filter(c => c.status === 'Pending').length,
    Closed: baseContacts.filter(c => c.status === 'Closed').length,
  }), [baseContacts])

  const viewLabel = viewAs === 'PFSD' ? 'Admin PFSD' : viewAs

  return (
    <>
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Inbox</h1>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">CRM System · Mon, 20 Jul 2026</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <button
              onClick={() => setIsViewOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-[13px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${viewAs === 'PFSD' ? 'bg-blue-500' : 'bg-violet-500'}`} />
              {viewLabel}
              <span className="text-gray-400 dark:text-gray-500 text-[10px]">▾</span>
            </button>
            {isViewOpen && (
              <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl z-50 min-w-[200px] py-1.5">
                <p className="px-4 py-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Switch view</p>
                {ALL_VIEWS.map(v => (
                  <button
                    key={v}
                    onClick={() => { onChangeViewAs(v); setIsViewOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2.5 ${viewAs === v ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
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
          <StatCard borderClass={HUE.blue.cardBorder} label="Telegram" count={counts.Telegram} icon={<TelegramIcon className="w-9 h-9" />} />
          <StatCard borderClass={HUE.blue.cardBorder} label="Facebook" count={counts.Facebook} icon={<FacebookIcon className="w-9 h-9" />} />
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-5">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Customer Inbox</p>
            </div>
            <p className="text-[13px] text-gray-400 dark:text-gray-500 mb-4">Manage customer messages, assignments, and handoffs in one clean workspace.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-4">
              <div>
                <label htmlFor="filter-contact-name" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Contact Name</label>
                <div className="relative mt-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600 pointer-events-none" />
                  <input
                    id="filter-contact-name"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search contact name"
                    className="w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="filter-status" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Status</label>
                <div className="relative mt-1">
                  <select
                    id="filter-status"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as 'All' | Status)}
                    className="w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-gray-100 appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="filter-provider" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Provider</label>
                <div className="relative mt-1">
                  <select
                    id="filter-provider"
                    value={providerFilter}
                    onChange={e => setProviderFilter(e.target.value as 'All' | 'Telegram' | 'Facebook')}
                    className="w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-gray-100 appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="filter-first-contact-date" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">First Contact Date</label>
                <DateFilterInput id="filter-first-contact-date" value={firstContactDateFilter} onChange={setFirstContactDateFilter} />
              </div>

              <div>
                <label htmlFor="filter-assignee" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Assignee</label>
                <div className="relative mt-1">
                  <select
                    id="filter-assignee"
                    value={assigneeFilter}
                    onChange={e => setAssigneeFilter(e.target.value as 'All' | 'Unassigned' | Dept)}
                    className="w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-gray-100 appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="Unassigned">Unassigned</option>
                    {ALL_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="filter-priority" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Priority</label>
                <div className="relative mt-1">
                  <select
                    id="filter-priority"
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value as 'All' | Priority)}
                    className="w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-gray-100 appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="Normal">Normal</option>
                    <option value="Prio">Prio</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="filter-last-active-date" className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Last Active Date</label>
                <DateFilterInput id="filter-last-active-date" value={lastActiveDateFilter} onChange={setLastActiveDateFilter} />
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950/60 transition-colors"
              >
                <RefreshIcon className="w-3.5 h-3.5" /> Clear
              </button>
              {viewAs === 'Pharmacy' && (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide mr-1">Type:</span>
                  {(['All', 'Question', 'Medicine only'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setPharmFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${pharmFilter === f ? 'bg-violet-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
                <button
                  onClick={() => setActiveTab('needsReply')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${
                    activeTab === 'needsReply' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Needs Reply
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{counts.Open}</span>
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${
                    activeTab === 'all' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  All Contacts
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold flex items-center justify-center">{counts.Total}</span>
                </button>
              </div>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{visible.length} results</span>
            </div>
          </div>

          <ContactsTable
            contacts={visible}
            viewAs={viewAs}
            paneContact={paneContact}
            onRowClick={onRowClick}
            updateContact={updateContact}
            handleStart={handleStart}
            handleWaitingPatient={handleWaitingPatient}
            handleResume={handleResume}
            handleMarkComplete={handleMarkComplete}
            onReturn={onReturn}
            onOpenActivityLog={onOpenActivityLog}
            useIconActions
            bare
          />
        </div>
      </div>
    </>
  )
}
