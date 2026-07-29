import { useState, useMemo } from 'react'
import { useFilteredList } from '@/hooks/useFilteredList'
import { matchesLooseDate } from '@/lib/format'
import { StatCard } from '@/components/ui/StatCard'
import { IconChip } from '@/components/ui/IconChip'
import { DateFilterInput } from '@/components/ui/DateFilterInput'
import { UsersIcon, UserPlusIcon, UserXIcon, ClockIcon, HourglassIcon, CheckCircleIcon, SearchIcon, ChevronDownIcon, RefreshIcon } from '@/icons'
import { HUE } from '@/theme/hue'
import { ALL_DEPTS } from '@/data/contacts'
import { ContactsTable } from '@/components/contacts/ContactsTable'
import { ManualFormModal } from '@/components/contacts/ManualFormModal'
import type { Contact, ManualFormData, Status, Priority, Dept } from '@/types/domain'

function manualFormDataFromContact(contact: Contact): ManualFormData {
  return {
    patientId: contact.hnNumber ?? '',
    name: contact.name,
    phone: contact.phone ?? '',
    comment: contact.lastMessage,
  }
}

export function ManualPage({
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
  const manualContacts = useFilteredList(contacts, c => c.source === 'Manual', [])
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

  const visible = useFilteredList(manualContacts, c => {
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
  }, [statusFilter, assigneeFilter, priorityFilter, firstContactDateFilter, lastActiveDateFilter, search])

  const counts = useMemo(() => ({
    Total: manualContacts.length,
    NewContacts: manualContacts.filter(c => c.activityLog.length <= 1).length,
    Unassigned: manualContacts.filter(c => c.chain.length === 0).length,
    Open: manualContacts.filter(c => c.status === 'Open').length,
    Pending: manualContacts.filter(c => c.status === 'Pending').length,
    Closed: manualContacts.filter(c => c.status === 'Closed').length,
  }), [manualContacts])

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const handleAdd = (data: ManualFormData) => {
    onAdd(data)
    setIsFormOpen(false)
    setToast(`Inquiry created for ${data.patientId.trim() || data.name.trim() || 'new contact'}`)
    setTimeout(() => setToast(null), 3500)
  }

  const handleEditSave = (data: ManualFormData) => {
    if (!editingContact) return
    updateContact({
      ...editingContact,
      name: data.name.trim() || data.patientId.trim() || 'Unknown',
      hnNumber: data.patientId.trim() || undefined,
      phone: data.phone.trim() || undefined,
      lastMessage: data.comment.trim(),
    })
    setEditingContact(null)
    setToast(`Inquiry updated for ${data.name.trim() || data.patientId.trim() || 'contact'}`)
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
            onClick={() => setIsFormOpen(true)}
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
                    placeholder="Search contact name"
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
            onEditManual={setEditingContact}
            bare
            lastMessageColumnLabel="Last Note"
          />
        </div>
      </div>

      {isFormOpen && <ManualFormModal onClose={() => setIsFormOpen(false)} onSubmit={handleAdd} />}
      {editingContact && (
        <ManualFormModal
          mode="edit"
          initialData={manualFormDataFromContact(editingContact)}
          onClose={() => setEditingContact(null)}
          onSubmit={handleEditSave}
        />
      )}
    </>
  )
}
