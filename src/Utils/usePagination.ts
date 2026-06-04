import { useEffect, useMemo, useState } from 'react'

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const

export function usePagination<T>(
  items: T[],
  initialPageSize: number = PAGE_SIZE_OPTIONS[0],
) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, currentPage, pageSize])

  const rangeStart = items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, items.length)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize)
    setCurrentPage(1)
  }

  const resetPage = () => setCurrentPage(1)

  return {
    paginatedItems,
    currentPage,
    pageSize,
    totalPages,
    rangeStart,
    rangeEnd,
    goToPage,
    handlePageSizeChange,
    resetPage,
  }
}
