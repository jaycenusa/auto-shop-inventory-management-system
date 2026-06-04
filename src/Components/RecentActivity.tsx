import { useEffect, useMemo, useState } from 'react'
import {
  ACTIVITY_FILTER_ALL,
  emptyRecentActivityFilters,
  filterRecentActivityRecords,
  getRecentActivityFilterOptions,
  getRecentCustomerTransactions,
  hasActiveRecentActivityFilters,
  type Customer,
  type RecentActivityFilterState,
} from '../Database/CustomerData'
import Button from '../Shared/Button'

type RecentActivityProps = {
  customers: Customer[]
  limit?: number
  onViewAllCustomers?: () => void
  onViewCustomer?: (customerId: string) => void
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const

function formatDate(isoDate: string) {
  const parsed = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return isoDate
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

export default function RecentActivity({
  customers,
  limit,
  onViewAllCustomers,
  onViewCustomer,
}: RecentActivityProps) {
  const [filters, setFilters] = useState<RecentActivityFilterState>(
    emptyRecentActivityFilters,
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0])

  const allActivities = useMemo(
    () => getRecentCustomerTransactions(customers, limit),
    [customers, limit],
  )

  const filterOptions = useMemo(
    () => getRecentActivityFilterOptions(allActivities),
    [allActivities],
  )

  const filteredActivities = useMemo(
    () => filterRecentActivityRecords(allActivities, filters),
    [allActivities, filters],
  )

  const hasFilters = hasActiveRecentActivityFilters(filters)

  const totalPages = Math.max(
    1,
    Math.ceil(filteredActivities.length / pageSize),
  )

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredActivities.slice(start, start + pageSize)
  }, [filteredActivities, currentPage, pageSize])

  const rangeStart =
    filteredActivities.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, filteredActivities.length)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const clearFilters = () => setFilters(emptyRecentActivityFilters)

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize)
    setCurrentPage(1)
  }

  const updateFilters = (next: RecentActivityFilterState) => {
    setFilters(next)
    setCurrentPage(1)
  }

  return (
    <section className="recent-activity">
      <div className="recent-activity__header">
        <div>
          <h2 className="recent-activity__title">Recent activity</h2>
          <p className="recent-activity__description">
            Customer service transactions across your shop, newest first.
          </p>
        </div>
        {onViewAllCustomers && (
          <Button
            type="button"
            variant="link"
            onClick={onViewAllCustomers}
            className="recent-activity__view-all"
          >
            View customers
          </Button>
        )}
      </div>

      {allActivities.length === 0 ? (
        <p className="recent-activity__empty">
          No customer transactions recorded yet. Add transactions from a
          customer profile.
        </p>
      ) : (
        <>
          <div className="recent-activity__filters">
            <div className="recent-activity__filters-header">
              <h3 className="recent-activity__filters-title">Filter activity</h3>
              {hasFilters && (
                <Button
                  variant="link"
                  onClick={() => {
                    clearFilters()
                    setCurrentPage(1)
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
            <div className="recent-activity__filters-grid">
              <label className="form-field">
                <span className="form-label">From date</span>
                <input
                  type="date"
                  value={filters.dateFrom}
                  min={filterOptions.dateFrom || undefined}
                  max={filters.dateTo || filterOptions.dateTo || undefined}
                  onChange={(e) =>
                    updateFilters({ ...filters, dateFrom: e.target.value })
                  }
                  className="form-input"
                  aria-label="Filter from date"
                />
              </label>

              <label className="form-field">
                <span className="form-label">To date</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  min={
                    filters.dateFrom ||
                    filterOptions.dateFrom ||
                    undefined
                  }
                  max={filterOptions.dateTo || undefined}
                  onChange={(e) =>
                    updateFilters({ ...filters, dateTo: e.target.value })
                  }
                  className="form-input"
                  aria-label="Filter to date"
                />
              </label>

              <label className="form-field">
                <span className="form-label">Customer name</span>
                <select
                  value={filters.customerName}
                  onChange={(e) =>
                    updateFilters({
                      ...filters,
                      customerName: e.target.value,
                    })
                  }
                  className="form-input"
                >
                  <option value={ACTIVITY_FILTER_ALL}>All customers</option>
                  {filterOptions.customerNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span className="form-label">Description</span>
                <select
                  value={filters.description}
                  onChange={(e) =>
                    updateFilters({
                      ...filters,
                      description: e.target.value,
                    })
                  }
                  className="form-input"
                >
                  <option value={ACTIVITY_FILTER_ALL}>All descriptions</option>
                  {filterOptions.descriptions.map((description) => (
                    <option key={description} value={description}>
                      {description}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <p className="recent-activity__empty">
              {filters.dateFrom &&
              filters.dateTo &&
              filters.dateFrom > filters.dateTo
                ? 'The from date must be on or before the to date.'
                : 'No transactions match your filters. Try adjusting or clearing filters.'}
            </p>
          ) : (
            <>
              <div className="recent-activity__table-area">
                <div className="inventory-table-scroll recent-activity__table-scroll">
                  <table className="inventory-data-table recent-activity__table">
                    <thead>
                      <tr className="inventory-data-table__head-row">
                        <th className="inventory-data-table__th">Date</th>
                        <th className="inventory-data-table__th">Customer</th>
                        <th className="inventory-data-table__th">Vehicle</th>
                        <th className="inventory-data-table__th">VIN number</th>
                        <th className="inventory-data-table__th">Description</th>
                        <th className="inventory-data-table__th">Cost</th>
                        <th className="inventory-data-table__th">
                          Down payment
                        </th>
                        {onViewCustomer && (
                          <th className="inventory-data-table__th">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="inventory-data-table__body">
                      {paginatedActivities.map((activity) => (
                        <tr
                          key={activity.id}
                          className="inventory-data-table__row"
                        >
                          <td className="inventory-data-table__td">
                            {formatDate(activity.date)}
                          </td>
                          <td className="inventory-data-table__td--name">
                            {activity.customerName}
                          </td>
                          <td className="inventory-data-table__td">
                            {activity.vehicleLabel}
                          </td>
                          <td className="inventory-data-table__td">
                            {activity.vin || '—'}
                          </td>
                          <td className="inventory-data-table__td">
                            {activity.description}
                          </td>
                          <td className="inventory-data-table__td">
                            {formatMoney(activity.cost)}
                          </td>
                          <td className="inventory-data-table__td">
                            {formatMoney(activity.downPayment)}
                          </td>
                          {onViewCustomer && (
                            <td className="inventory-data-table__td">
                              <Button
                                type="button"
                                variant="link"
                                onClick={() =>
                                  onViewCustomer(activity.customerId)
                                }
                              >
                                View
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="inventory-pagination recent-activity__pagination">
                <div className="inventory-pagination__meta">
                  <p className="inventory-pagination__count">
                    Showing {rangeStart}–{rangeEnd} of {filteredActivities.length}{' '}
                    transactions
                    {hasFilters && ` (filtered from ${allActivities.length})`}
                  </p>
                  <label className="inventory-pagination__page-size">
                    <span className="inventory-pagination__page-size-label">
                      Rows per page
                    </span>
                    <select
                      value={pageSize}
                      onChange={(e) =>
                        handlePageSizeChange(Number(e.target.value))
                      }
                      className="form-select-page-size"
                      aria-label="Rows per page"
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
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}
