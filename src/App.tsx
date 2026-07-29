import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { InboxPage } from '@/pages/InboxPage'
import { ManualPage } from '@/pages/ManualPage'
import { ReservationsPage } from '@/pages/ReservationsPage'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { MedicinesPage } from '@/pages/MedicinesPage'
import { SupportPage } from '@/pages/SupportPage'
import { ActivityLogsPage } from '@/pages/ActivityLogsPage'
import { DetailPanel } from '@/components/contacts/DetailPanel'
import { ActivityLogDrawer } from '@/components/contacts/ActivityLogDrawer'
import { AssignModal } from '@/components/contacts/AssignModal'
import { ReturnModal } from '@/components/contacts/ReturnModal'
import { initialsFor } from '@/lib/format'
import { INIT, AVATAR_COLORS } from '@/data/contacts'
import type { Contact, ChainEntryStatus, Dept, ViewAs, PageName, ManualFormData } from '@/types/domain'

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>(INIT)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [page, setPage] = useState<PageName>('Inbox')
  const [userRole, setUserRole] = useState<'Staff' | 'IT Staff'>('IT Staff')
  const [viewAs, setViewAs] = useState<ViewAs>('PFSD')
  const [paneContact, setPaneContact] = useState<Contact | null>(null)
  const [activityLogContact, setActivityLogContact] = useState<Contact | null>(null)
  const [assignContact, setAssignContact] = useState<Contact | null>(null)
  const [assignMode, setAssignMode] = useState<'assign' | 'reassign'>('assign')
  const [returnContact, setReturnContact] = useState<Contact | null>(null)

  const navigateTo = (next: PageName) => {
    setPage(next)
    setPaneContact(null)
    setActivityLogContact(null)
  }

  const changeRole = (role: 'Staff' | 'IT Staff') => {
    setUserRole(role)
    if (role === 'Staff' && page === 'Activity Logs') setPage('Inbox')
  }

  const updateContact = (updated: Contact) => {
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c))
    if (paneContact?.id === updated.id) setPaneContact(updated)
    if (activityLogContact?.id === updated.id) setActivityLogContact(updated)
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar
        page={page}
        onNavigate={navigateTo}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(v => !v)}
        userRole={userRole}
        onChangeRole={changeRole}
      />

      {/* ── Main + Pane wrapper ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {page === 'Support' ? (
          <SupportPage />
        ) : page === 'Activity Logs' ? (
          userRole === 'IT Staff' ? <ActivityLogsPage /> : null
        ) : page === 'Medicines' ? (
          <MedicinesPage />
        ) : page === 'Documents' ? (
          <DocumentsPage />
        ) : page === 'Reservations' ? (
          <ReservationsPage />
        ) : page === 'Manual' ? (
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
          <InboxPage
            contacts={contacts}
            viewAs={viewAs}
            onChangeViewAs={setViewAs}
            paneContact={paneContact}
            onRowClick={c => setPaneContact(paneContact?.id === c.id ? null : c)}
            updateContact={updateContact}
            handleStart={handleStart}
            handleWaitingPatient={handleWaitingPatient}
            handleResume={handleResume}
            handleMarkComplete={handleMarkComplete}
            onReturn={c => setReturnContact(c)}
            onOpenActivityLog={c => setActivityLogContact(c)}
          />
        )}
        </main>

        {/* ── Right Pane (PFSD only) ────────────────────────────────────────── */}
        {paneContact && (viewAs === 'PFSD' || page === 'Manual') && (
          <DetailPanel
            contact={paneContact}
            onClose={() => setPaneContact(null)}
            onUpdate={updateContact}
            onOpenAssign={() => { setAssignContact(paneContact); setAssignMode('assign') }}
            onOpenReassign={() => { setAssignContact(paneContact); setAssignMode('reassign') }}
            onMarkComplete={handleMarkComplete}
          />
        )}

        {/* ── Activity Log Drawer (department view) ─────────────────────────── */}
        {activityLogContact && viewAs !== 'PFSD' && (
          <ActivityLogDrawer
            contact={activityLogContact}
            dept={viewAs}
            onClose={() => setActivityLogContact(null)}
          />
        )}
      </div>

      {/* ── Sequential Assignment / Reassignment Popup ────────────────────── */}
      {assignContact && (
        <AssignModal
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
    </div>
  )
}
