import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'

interface DetailActionsProps {
  editPath: string
  onDelete: () => void
  extra?: React.ReactNode
}

export function DetailActions({ editPath, onDelete, extra }: DetailActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {extra}
      <Link to={editPath} className="btn-ghost"><Pencil size={14} /> Modifier</Link>
      <button type="button" onClick={onDelete} className="btn-ghost !text-red-400/90 hover:!text-red-300 hover:!border-red-400/30">
        <Trash2 size={14} /> Supprimer
      </button>
    </div>
  )
}
