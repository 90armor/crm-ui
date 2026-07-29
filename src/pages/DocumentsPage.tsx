import { useState, useMemo } from 'react'
import { useFilteredList } from '@/hooks/useFilteredList'
import { matchesLooseDate } from '@/lib/format'
import { DateFilterInput } from '@/components/ui/DateFilterInput'
import { SearchIcon, ChevronDownIcon, RefreshIcon, HelpCircleIcon } from '@/icons'
import { DOCUMENT_TYPES, RECEIVE_METHODS, DOCUMENT_REQUESTS } from '@/data/documents'
import { STAFF_MEMBERS } from '@/data/contacts'
import { ContactCell } from '@/components/requests/ContactCell'
import { RequestStatusOverview } from '@/components/requests/RequestStatusOverview'
import { StatusSelectCell } from '@/components/requests/StatusSelectCell'
import { AssigneeSelectCell } from '@/components/requests/AssigneeSelectCell'
import { ActivityLogDrawer } from '@/components/contacts/ActivityLogDrawer'
import { MessagePanel } from '@/components/contacts/MessagePanel'
import type { Contact, DocumentRequest, RequestStatus, DocumentType, ReceiveMethod } from '@/types/domain'

export function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRequest[]>(DOCUMENT_REQUESTS)
  const [messageContact, setMessageContact] = useState<Contact | null>(null)
  const [activityLogFor, setActivityLogFor] = useState<Contact | null>(null)
  const [patientIdSearch, setPatientIdSearch] = useState('')
  const [patientNameSearch, setPatientNameSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | RequestStatus>('All')
  const [documentTypeFilter, setDocumentTypeFilter] = useState<'All' | DocumentType>('All')
  const [assigneeFilter, setAssigneeFilter] = useState('All')
  const [createdDateFilter, setCreatedDateFilter] = useState('')
  const [receiveMethodFilter, setReceiveMethodFilter] = useState<'All' | ReceiveMethod>('All')

  const clearFilters = () => {
    setPatientIdSearch('')
    setPatientNameSearch('')
    setStatusFilter('All')
    setDocumentTypeFilter('All')
    setAssigneeFilter('All')
    setCreatedDateFilter('')
    setReceiveMethodFilter('All')
  }

  const updateDocument = (updated: DocumentRequest) => {
    setDocuments(prev => prev.map(d => d.id === updated.id ? updated : d))
    if (activityLogFor?.id === updated.contact.id) setActivityLogFor(updated.contact)
  }

  const visible = useFilteredList(documents, d => {
    if (statusFilter !== 'All' && d.status !== statusFilter) return false
    if (documentTypeFilter !== 'All' && d.documentType !== documentTypeFilter) return false
    if (assigneeFilter === 'Unassigned' && d.assignee !== null) return false
    if (assigneeFilter !== 'All' && assigneeFilter !== 'Unassigned' && d.assignee !== assigneeFilter) return false
    if (receiveMethodFilter !== 'All' && d.receiveMethod !== receiveMethodFilter) return false
    if (!matchesLooseDate(d.createdDate, createdDateFilter)) return false
    if (patientIdSearch && !d.patientId.toLowerCase().includes(patientIdSearch.toLowerCase())) return false
    if (patientNameSearch && !d.patientName.toLowerCase().includes(patientNameSearch.toLowerCase())) return false
    return true
  }, [statusFilter, documentTypeFilter, assigneeFilter, receiveMethodFilter, createdDateFilter, patientIdSearch, patientNameSearch])

  const counts = useMemo(() => ({
    Total: documents.length,
    Open: documents.filter(d => d.status === 'Open').length,
    Pending: documents.filter(d => d.status === 'Pending').length,
    Resolved: documents.filter(d => d.status === 'Resolved').length,
  }), [documents])

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
          <p className="text-[11px] text-gray-400">CRM System · Mon, 20 Jul 2026</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center select-none">AP</div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <RequestStatusOverview title="Document Request Status Overview" counts={counts} />

        {/* Filters + table card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
              <div>
                <label htmlFor="doc-filter-patient-id" className="text-[11px] font-semibold text-gray-500">Patient ID</label>
                <div className="relative mt-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  <input
                    id="doc-filter-patient-id"
                    value={patientIdSearch}
                    onChange={e => setPatientIdSearch(e.target.value)}
                    placeholder="Search ID"
                    className="w-full text-[13px] border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="doc-filter-patient-name" className="text-[11px] font-semibold text-gray-500">Patient Name</label>
                <div className="relative mt-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  <input
                    id="doc-filter-patient-name"
                    value={patientNameSearch}
                    onChange={e => setPatientNameSearch(e.target.value)}
                    placeholder="Search Name"
                    className="w-full text-[13px] border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="doc-filter-status" className="text-[11px] font-semibold text-gray-500">Status</label>
                <div className="relative mt-1">
                  <select
                    id="doc-filter-status"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as 'All' | RequestStatus)}
                    className="w-full text-[13px] border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="doc-filter-document-type" className="text-[11px] font-semibold text-gray-500">Document Type</label>
                <div className="relative mt-1">
                  <select
                    id="doc-filter-document-type"
                    value={documentTypeFilter}
                    onChange={e => setDocumentTypeFilter(e.target.value as 'All' | DocumentType)}
                    className="w-full text-[13px] border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white appearance-none"
                  >
                    <option value="All">All</option>
                    {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="doc-filter-assignee" className="text-[11px] font-semibold text-gray-500">Assignee</label>
                <div className="relative mt-1">
                  <select
                    id="doc-filter-assignee"
                    value={assigneeFilter}
                    onChange={e => setAssigneeFilter(e.target.value)}
                    className="w-full text-[13px] border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="Unassigned">Unassigned</option>
                    {STAFF_MEMBERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="doc-filter-created-date" className="text-[11px] font-semibold text-gray-500">Created Date</label>
                <DateFilterInput id="doc-filter-created-date" value={createdDateFilter} onChange={setCreatedDateFilter} />
              </div>

              <div>
                <label htmlFor="doc-filter-receive-method" className="text-[11px] font-semibold text-gray-500">Receive Method</label>
                <div className="relative mt-1">
                  <select
                    id="doc-filter-receive-method"
                    value={receiveMethodFilter}
                    onChange={e => setReceiveMethodFilter(e.target.value as 'All' | ReceiveMethod)}
                    className="w-full text-[13px] border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white appearance-none"
                  >
                    <option value="All">All</option>
                    {RECEIVE_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
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

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Contact</th>
                  <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">
                    <span className="inline-flex items-center gap-1" title="Current document request status">
                      Status <HelpCircleIcon className="w-3 h-3 text-gray-300" />
                    </span>
                  </th>
                  <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">
                    <span className="inline-flex items-center gap-1" title="Staff member handling this request">
                      Assignee <HelpCircleIcon className="w-3 h-3 text-gray-300" />
                    </span>
                  </th>
                  <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Document</th>
                  <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5 whitespace-nowrap">Patient Name/ID</th>
                  <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide px-4 py-3.5">Receive</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(d => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <ContactCell
                        contact={d.contact}
                        createdDate={d.createdDate}
                        onMessage={() => setMessageContact(d.contact)}
                        onActivityLog={() => setActivityLogFor(d.contact)}
                      />
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusSelectCell
                        status={d.status}
                        onChange={status => updateDocument({
                          ...d,
                          status,
                          contact: { ...d.contact, activityLog: [`Status changed to ${status} · just now`, ...d.contact.activityLog] },
                        })}
                      />
                    </td>

                    <td className="px-4 py-3.5">
                      <AssigneeSelectCell
                        assignee={d.assignee}
                        onChange={assignee => updateDocument({
                          ...d,
                          assignee,
                          contact: { ...d.contact, activityLog: [assignee ? `Assigned to ${assignee} · just now` : 'Unassigned · just now', ...d.contact.activityLog] },
                        })}
                      />
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-[12px] font-medium">
                        {d.documentType}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="text-[13px] text-gray-700">{d.patientName}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{d.patientId}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="text-[13px] text-gray-700">{d.receiveMethod}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{d.receiveDate}</p>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-gray-400">No document requests match these filters.</td>
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
    </>
  )
}
