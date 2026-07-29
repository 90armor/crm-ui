import type { ReactNode } from 'react'

type ModalSize = 'sm' | 'md' | 'lg'

const MODAL_SIZE: Record<ModalSize, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[460px]',
  lg: 'max-w-[580px]',
}

export function Modal({
  title,
  subtitle,
  size = 'md',
  onClose,
  footer,
  children,
}: {
  title: string
  subtitle?: ReactNode
  size?: ModalSize
  onClose: () => void
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${MODAL_SIZE[size]} max-h-[88vh] flex flex-col`}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-2xl leading-none shrink-0 ml-2">×</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">{footer}</div>
        )}
      </div>
    </div>
  )
}
