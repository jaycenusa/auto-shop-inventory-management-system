import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import AppHeader from './Header'
import type { InventoryPart } from '../Database/InventoryData'
import { getPartImageUrl } from '../Database/InventoryData'
import Filter, {
  filterInventoryParts,
  hasActiveInventoryFilters,
  useBrandOptions,
  type InventoryFilterState,
} from '../Shared/Filter'
import type { AppHeaderProps } from './Header'
import { PartImage, StatusBadge } from '../Shared/Table'
import Button, { EditIcon, PlusIcon } from '../Shared/Button'
import { getInventoryCatalogTitle } from '../Utils/InventoryLabels'

type InventoryPageProps = AppHeaderProps & {
  onInventoryFiltersChange: (filters: InventoryFilterState) => void
  parts: InventoryPart[]
  setParts: Dispatch<SetStateAction<InventoryPart[]>>
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const

export default function InventoryPage({
  activePage,
  onNavigate,
  inventoryCategory,
  inventoryFilters,
  onInventorySearchChange,
  onInventoryFiltersChange,
  parts,
}: InventoryPageProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0])

  const brandOptions = useBrandOptions(parts)

  const filteredParts = useMemo(
    () => filterInventoryParts(parts, inventoryFilters, inventoryCategory),
    [parts, inventoryFilters, inventoryCategory],
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [inventoryCategory, inventoryFilters])

  const totalPages = Math.max(1, Math.ceil(filteredParts.length / pageSize))

  const paginatedParts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredParts.slice(start, start + pageSize)
  }, [filteredParts, currentPage, pageSize])

  const rangeStart =
    filteredParts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, filteredParts.length)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const hasActiveFilters = hasActiveInventoryFilters(inventoryFilters)

  const clearFilters = () => {
    onInventoryFiltersChange({
      carPart: '',
      brand: 'All',
      availabilityStatus: 'All',
    })
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize)
    setCurrentPage(1)
  }

  return (
    <div className="page">
      <AppHeader
        activePage={activePage}
        onNavigate={onNavigate}
        inventoryCategory={inventoryCategory}
        inventoryFilters={inventoryFilters}
        onInventorySearchChange={onInventorySearchChange}
      />

      <div className="page-header">
        <div className="page-header__inner">
          <p className="page-header__eyebrow">Inventory</p>
          <h1 className="page-header__title">
            {getInventoryCatalogTitle(inventoryCategory)}
          </h1>
          <p className="page-header__description">
            {inventoryCategory
              ? `Viewing ${inventoryCategory.toLowerCase()} in your inventory.`
              : 'Browse car parts and manage your shop inventory.'}
          </p>
        </div>
      </div>

      <main className="page-main">
        <section className="section-card">
          <div className="section-card__header">
            <Filter
              filters={inventoryFilters}
              brandOptions={brandOptions}
              onChange={(next) => {
                onInventoryFiltersChange(next)
                setCurrentPage(1)
              }}
              onClear={clearFilters}
              showClear={hasActiveFilters}
            />
          </div>

          <div className="inventory-table-scroll">
            <table className="inventory-data-table">
              <thead>
                <tr className="inventory-data-table__head-row">
                  <th className="inventory-data-table__th">Picture</th>
                  <th className="inventory-data-table__th">Car part</th>
                  <th className="inventory-data-table__th">Brand</th>
                  <th className="inventory-data-table__th">Price</th>
                  <th className="inventory-data-table__th">Quantity</th>
                  <th className="inventory-data-table__th">Availability status</th>
                </tr>
              </thead>
              <tbody className="inventory-data-table__body">
                {paginatedParts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="inventory-data-table__empty">
                      No parts match your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedParts.map((part) => (
                    <tr key={part.id} className="inventory-data-table__row">
                      <td className="inventory-data-table__td">
                        <PartImage
                          src={getPartImageUrl(part)}
                          alt={part.carPart}
                        />
                      </td>
                      <td className="inventory-data-table__td--name">
                        {part.carPart}
                      </td>
                      <td className="inventory-data-table__td">{part.brand}</td>
                      <td className="inventory-data-table__td">
                        ${part.price.toFixed(2)}
                      </td>
                      <td className="inventory-data-table__td">
                        {part.quantity}
                      </td>
                      <td className="inventory-data-table__td">
                        <StatusBadge status={part.availabilityStatus} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="inventory-pagination">
            <div className="inventory-pagination__meta">
              <p className="inventory-pagination__count">
                Showing {rangeStart}–{rangeEnd} of {filteredParts.length} parts
                {hasActiveFilters && ` (filtered from ${parts.length})`}
              </p>
              <label className="inventory-pagination__page-size">
                <span className="inventory-pagination__page-size-label">
                  Parts per page
                </span>
                <select
                  value={pageSize}
                  onChange={(e) =>
                    handlePageSizeChange(Number(e.target.value))
                  }
                  className="form-select-page-size"
                  aria-label="Parts per page"
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
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant="pagination"
                    size="sm"
                    active={currentPage === page}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ),
              )}
              <Button
                variant="pagination"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="section-card__footer">
            <Button
              variant="accent"
              size="lg"
              icon={<PlusIcon />}
              onClick={() => onNavigate('add-part')}
            >
              Add new car part
            </Button>
            <Button
              variant="outline-accent"
              icon={<EditIcon />}
              onClick={() => onNavigate('modify-part')}
            >
              Modify car part
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
