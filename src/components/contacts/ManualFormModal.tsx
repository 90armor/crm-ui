import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { ManualFormData } from '@/types/domain'

export function ManualFormModal({
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: {
  onClose: () => void
  onSubmit: (data: ManualFormData) => void
  initialData?: ManualFormData
  mode?: 'create' | 'edit'
}) {
  const [patientId, setPatientId] = useState(initialData?.patientId ?? '')
  const [name, setName] = useState(initialData?.name ?? '')
  const [phone, setPhone] = useState(initialData?.phone ?? '')
  const [comment, setComment] = useState(initialData?.comment ?? '')

  const isValid = patientId.trim() !== '' && name.trim() !== '' && phone.trim() !== '' && comment.trim() !== ''
  const isEdit = mode === 'edit'

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) return
    onSubmit({ patientId: patientId.trim(), name: name.trim(), phone: phone.trim(), comment: comment.trim() })
  }

  return (
    <Modal
      title={isEdit ? 'Edit Manual Inquiry' : 'Create Manual Inquiry'}
      subtitle={isEdit ? "Update this patient's manual inquiry details" : 'For patients who contact by phone · same workflow as Telegram/Facebook'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="manual-inquiry-form" disabled={!isValid}>
            {isEdit ? 'Save Changes' : 'Submit Inquiry'}
          </Button>
        </>
      }
    >
      <form id="manual-inquiry-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="manual-patient-id" className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Patient ID <span className="text-red-500">*</span>
            </label>
            <input
              id="manual-patient-id"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              placeholder="e.g. HN00123"
              autoFocus
              className="mt-1.5 w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300 dark:placeholder-gray-600"
            />
          </div>

          <div>
            <label htmlFor="manual-name" className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="manual-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Patient full name"
              className="mt-1.5 w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300 dark:placeholder-gray-600"
            />
          </div>

          <div>
            <label htmlFor="manual-phone" className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="manual-phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 0812345678"
              className="mt-1.5 w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300 dark:placeholder-gray-600"
            />
          </div>

          <div>
            <label htmlFor="manual-comment" className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              id="manual-comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              placeholder="Describe the patient's inquiry…"
              className="mt-1.5 w-full text-[13px] border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300 dark:placeholder-gray-600 resize-none"
            />
          </div>
      </form>
    </Modal>
  )
}
