import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export function ConfirmModal({
  title, message, confirmLabel, tone = 'red', onClose, onConfirm,
}: {
  title: string; message: string; confirmLabel: string; tone?: 'red' | 'gray'; onClose: () => void; onConfirm: () => void
}) {
  return (
    <Modal
      title={title}
      size="sm"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={tone === 'red' ? 'danger' : 'dark'} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-[13px] text-gray-600 leading-relaxed">{message}</p>
    </Modal>
  )
}
