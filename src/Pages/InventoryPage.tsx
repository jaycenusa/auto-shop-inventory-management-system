import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import AppHeader from './Header'
import type { AvailabilityStatus, InventoryPart } from '../Database/InventoryData'
import { getPartImageUrl } from '../Database/InventoryData'
import Filter, {
  filterInventoryParts,
  hasActiveInventoryFilters,
  useBrandOptions,
  type InventoryFilterState,
} from '../Shared/Filter'
import type { AppHeaderProps } from './Header'
import { PartImage } from '../Shared/Table'
import Button, { EditIcon, PlusIcon } from '../Shared/Button'
import { getInventoryCatalogTitle } from '../Utils/InventoryLabels'

type InventoryPageProps = AppHeaderProps & {
  onInventoryFiltersChange: (filters: InventoryFilterState) => void
  parts: InventoryPart[]
  setParts: Dispatch<SetStateAction<InventoryPart[]>>
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const

const pageSizeSelectClass =
  'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500'

const statusStyles: Record<AvailabilityStatus, string> = {
  'In Stock': 'bg-emerald-100 text-emerald-800',
  'Low Stock': 'bg-amber-100 text-amber-800',
  'Out of Stock': 'bg-red-100 text-red-800',
}

export default function InventoryPage({
  activePage,
  onNavigate,
  inventoryCategory,
  onSelectInventoryCategory,
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
    <div className="min-h-svh w-full bg-slate-100 text-slate-900">
      <AppHeader
        activePage={activePage}
        onNavigate={onNavigate}
        inventoryCategory={inventoryCategory}
        onSelectInventoryCategory={onSelectInventoryCategory}
        inventoryFilters={inventoryFilters}
        onInventorySearchChange={onInventorySearchChange}
      />

      <div className="border-b border-slate-200 bg-white">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-wider text-amber-600">
            Inventory
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {getInventoryCatalogTitle(inventoryCategory)}
          </h1>
          <p className="mt-2 text-base text-slate-600">
            {inventoryCategory
              ? `Viewing ${inventoryCategory.toLowerCase()} in your inventory.`
              : 'Browse car parts and manage your shop inventory.'}
          </p>
        </div>
      </div>

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
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

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 font-semibold text-slate-900">
                    Picture
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-900">
                    Car part
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-900">
                    Brand
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-900">
                    Price
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-900">
                    Quantity
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-900">
                    Availability status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedParts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No parts match your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedParts.map((part) => (
                    <tr
                      key={part.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <PartImage
                          src={getPartImageUrl(part)}
                          alt={part.carPart}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {part.carPart}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{part.brand}</td>
                      <td className="px-6 py-4 text-slate-700">
                        ${part.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {part.quantity}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[part.availabilityStatus]}`}
                        >
                          {part.availabilityStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-600">
                Showing {rangeStart}–{rangeEnd} of {filteredParts.length} parts
                {hasActiveFilters && ` (filtered from ${parts.length})`}
              </p>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <span className="font-medium">Parts per page</span>
                <select
                  value={pageSize}
                  onChange={(e) =>
                    handlePageSizeChange(Number(e.target.value))
                  }
                  className={pageSizeSelectClass}
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
            <div className="flex flex-wrap items-center gap-2">
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

          <div className="flex flex-wrap gap-3 border-t border-slate-200 px-6 py-4">
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
