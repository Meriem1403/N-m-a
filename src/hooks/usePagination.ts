import { useEffect, useMemo, useState } from 'react'

export function usePagination<T>(items: T[], pageSize: number, resetDeps: unknown[] = []) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, resetDeps)

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, currentPage, pageSize])

  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, total)

  return {
    page: currentPage,
    setPage,
    totalPages,
    paginated,
    total,
    from,
    to,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  }
}
