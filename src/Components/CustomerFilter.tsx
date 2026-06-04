import type { CustomerFilterState } from '../Utils/CustomerFilters'
import Button from '../Shared/Button'

type CustomerFilterProps = {
  filters: CustomerFilterState
  onChange: (filters: CustomerFilterState) => void
  onClear?: () => void
  showClear?: boolean
}

export default function CustomerFilter({
  filters,
  onChange,
  onClear,
  showClear,
}: CustomerFilterProps) {
  return (
    <div>
      <div className="filter__header">
        <h2 className="filter__title">Filter customers</h2>
        {showClear && onClear && (
          <Button variant="link" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>
      <div className="filter__grid filter__grid--two">
        <label className="form-field">
          <span className="form-label">Name</span>
          <input
            type="text"
            value={filters.name}
            onChange={(e) => onChange({ ...filters, name: e.target.value })}
            className="form-input"
            placeholder="Search by name..."
            aria-label="Filter by customer name"
          />
        </label>
        <label className="form-field">
          <span className="form-label">Phone number</span>
          <input
            type="tel"
            value={filters.phone}
            onChange={(e) => onChange({ ...filters, phone: e.target.value })}
            className="form-input"
            placeholder="Search by phone..."
            aria-label="Filter by phone number"
          />
        </label>
      </div>
    </div>
  )
}
