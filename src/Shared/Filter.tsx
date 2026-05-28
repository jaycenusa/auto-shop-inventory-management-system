import { useMemo } from 'react'
import {
  availabilityOptions,
  type AvailabilityStatus,
} from '../Database/InventoryData'
import Button from './Button'

export type InventoryFilterState = {
  carPart: string
  brand: string
  availabilityStatus: 'All' | AvailabilityStatus
}

export const emptyInventoryFilters: InventoryFilterState = {
  carPart: '',
  brand: 'All',
  availabilityStatus: 'All',
}

export function hasActiveInventoryFilters(filters: InventoryFilterState): boolean {
  return (
    filters.carPart !== '' ||
    filters.brand !== 'All' ||
    filters.availabilityStatus !== 'All'
  )
}

export function getBrandOptionsFromParts(
  parts: { brand: string }[],
): string[] {
  return [...new Set(parts.map((part) => part.brand))].sort()
}

export function useBrandOptions(parts: { brand: string }[]) {
  return useMemo(() => getBrandOptionsFromParts(parts), [parts])
}

export function filterInventoryParts<
  T extends {
    carPart: string
    brand: string
    availabilityStatus: AvailabilityStatus
    category?: string
  },
>(parts: T[], filters: InventoryFilterState, category?: string | null): T[] {
  const carPartQuery = filters.carPart.trim().toLowerCase()

  return parts.filter((part) => {
    if (category && part.category !== category) return false
    if (
      filters.availabilityStatus !== 'All' &&
      part.availabilityStatus !== filters.availabilityStatus
    ) {
      return false
    }
    if (filters.brand !== 'All' && part.brand !== filters.brand) return false
    if (carPartQuery && !part.carPart.toLowerCase().includes(carPartQuery)) {
      return false
    }
    return true
  })
}

type FilterProps = {
  filters: InventoryFilterState
  brandOptions: string[]
  onChange: (filters: InventoryFilterState) => void
  onClear?: () => void
  showClear?: boolean
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500'

export default function Filter({
  filters,
  brandOptions,
  onChange,
  onClear,
  showClear,
}: FilterProps) {
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Filter parts</h2>
        {showClear && onClear && (
          <Button variant="link" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Car part</span>
          <input
            type="text"
            value={filters.carPart}
            onChange={(e) =>
              onChange({ ...filters, carPart: e.target.value })
            }
            className={inputClass}
            placeholder="Search by name..."
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Brand</span>
          <select
            value={filters.brand}
            onChange={(e) => onChange({ ...filters, brand: e.target.value })}
            className={inputClass}
          >
            <option value="All">All brands</option>
            {brandOptions.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Availability status</span>
          <select
            value={filters.availabilityStatus}
            onChange={(e) =>
              onChange({
                ...filters,
                availabilityStatus: e.target
                  .value as InventoryFilterState['availabilityStatus'],
              })
            }
            className={inputClass}
          >
            <option value="All">All statuses</option>
            {availabilityOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
