import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  from: number
  to: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, from, to, total, onPageChange }: PaginationProps) {
  if (total === 0) return null

  const pages = getPageNumbers(page, totalPages)

  return (
    <nav className="list-pagination" aria-label="Pagination">
      <p className="list-pagination__info">
        {from}–{to} sur {total}
      </p>
      <div className="list-pagination__controls">
        <button
          type="button"
          className="list-pagination__btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Page précédente"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="list-pagination__pages" aria-hidden={totalPages <= 1}>
          {pages.map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="list-pagination__ellipsis">…</span>
            ) : (
              <button
                key={p}
                type="button"
                className={`list-pagination__page ${p === page ? 'list-pagination__page--active' : ''}`}
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ),
          )}
        </div>
        <button
          type="button"
          className="list-pagination__btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Page suivante"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  )
}

function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, '…', total]
  if (current >= total - 2) return [1, '…', total - 3, total - 2, total - 1, total]
  return [1, '…', current - 1, current, current + 1, '…', total]
}
