import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Supprimer', onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm" onClick={onCancel} aria-hidden />
      <div className="fixed z-[90] inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto nemea-panel animate-scale-in">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <button type="button" onClick={onCancel} className="p-1 rounded-lg hover:bg-white/8"><X size={16} className="text-white/40" /></button>
            </div>
            <p className="mt-2 text-sm text-white/45 leading-relaxed">{message}</p>
            <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button type="button" onClick={onCancel} className="btn-ghost justify-center">Annuler</button>
              <button type="button" onClick={onConfirm} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-500/90 hover:bg-red-500 rounded-full transition-colors">
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
