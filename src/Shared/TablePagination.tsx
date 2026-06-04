import Button from './Button'
import { PAGE_SIZE_OPTIONS } from '../Utils/usePagination'

type TablePaginationProps = {
  totalItems: number
  itemLabel: string
  rangeStart: number
  rangeEnd: number
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeLabel?: string
  className?: string
}

export default function TablePagination({
  totalItems,
  itemLabel,
  rangeStart,
  rangeEnd,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeLabel,
  className = '',
}: TablePaginationProps) {
  return (
    <div className={`inventory-pagination ${className}`.trim()}>
      <div className="inventory-pagination__meta">
        <p className="inventory-pagination__count">
          Showing {rangeStart}–{rangeEnd} of {totalItems} {itemLabel}
        </p>
        <label className="inventory-pagination__page-size">
          <span className="inventory-pagination__page-size-label">
            {pageSizeLabel ?? `${itemLabel} per page`}
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="form-select-page-size"
            aria-label={pageSizeLabel ?? `${itemLabel} per page`}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="inventory-pagination__controls">
        <Button
          variant="pagination"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant="pagination"
            size="sm"
            active={currentPage === page}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="pagination"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
