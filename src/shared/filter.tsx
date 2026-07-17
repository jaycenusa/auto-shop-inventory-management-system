import { useMemo } from 'react'
import {
  availabilityOptions,
  type AvailabilityStatus,
} from '../database/InventoryData'
import Button from './button'

export type InventoryFilterState = {
  carPart: string
  brand: string
  availabilityStatus: 'All' | AvailabilityStatus
}

export const emptyInventoryFilters: InventoryFilterState = {
  carPart: '',
  brand: 'All',
  availabilitystatus: 'All',
}

export function hasActiveInventoryfilters(filters: InventoryfilterState): boolean {
  return (
    filters.carpart !== '' ||
    filters.brand !== 'All' ||
    filters.availabilitystatus !== 'All'
  )
}

export function getBrandOptionsFromparts(
  parts: { brand: string }[],
): string[] {
  return [...new Set(parts.map((part) => part.brand))].sort()
}

export function useBrandOptions(parts: { brand: string }[]) {
  return useMemo(() => getBrandOptionsFromparts(parts), [parts])
}

export function filterInventoryparts<
  T extends {
    carpart: string
    brand: string
    availabilitystatus: Availabilitystatus
    category?: string
  },
>(parts: T[], filters: InventoryfilterState, category?: string | null): T[] {
  const carpartQuery = filters.carpart.trim().toLowerCase()

  return parts.filter((part) => {
    if (category && part.category !== category) return false
    if (
      filters.availabilitystatus !== 'All' &&
      part.availabilitystatus !== filters.availabilitystatus
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

export default function Filter({
  filters,
  brandOptions,
  onChange,
  onClear,
  showClear,
}: FilterProps) {
  return (
    <div>
      <div className="filter__header">
        <h2 className="filter__title">Filter parts</h2>
        {showClear && onClear && (
          <Button variant="link" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>
      <div className="filter__grid">
        <label className="form-field">
          <span className="form-label">Car part</span>
          <input
            type="text"
            value={filters.carPart}
            onChange={(e) =>
              onChange({ ...filters, carPart: e.target.value })
            }
            className="form-input"
            placeholder="Search by name..."
          />
        </label>
        <label className="form-field">
          <span className="form-label">Brand</span>
          <select
            value={filters.brand}
            onChange={(e) => onChange({ ...filters, brand: e.target.value })}
            className="form-input"
          >
            <option value="All">All brands</option>
            {brandOptions.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span className="form-label">Availability status</span>
          <select
            value={filters.availabilityStatus}
            onChange={(e) =>
              onChange({
                ...filters,
                availabilityStatus: e.target
                  .value as InventoryFilterState['availabilitystatus'],
              })
            }
            className="form-input"
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
