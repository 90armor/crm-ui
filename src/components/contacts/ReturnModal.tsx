import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { Contact, Dept } from '@/types/domain'

export function ReturnModal({
  contact, dept, onClose, onReturn,
}: {
  contact: Contact; dept: Dept; onClose: () => void; onReturn: (note: string) => void
}) {
  const [note, setNote] = useState('')
  return (
    <Modal
      title="Return to PFSD"
      subtitle={`${contact.name} · from ${dept}`}
      size="sm"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" disabled={!note.trim()} onClick={() => note.trim() && onReturn(note.trim())}>
            Return to PFSD
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-[13px] text-gray-600">Describe why you are returning this case. PFSD admin will see this note.</p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={4}
          placeholder="Reason for returning…"
          className="w-full text-[13px] border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
        />
      </div>
    </Modal>
  )
}
