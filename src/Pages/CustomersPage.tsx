import { useEffect, useMemo, useState } from 'react'
import CustomerFilter from '../Components/CustomerFilter'
import AppHeader, { type AppHeaderProps } from './Header'
import {
  formatVehicleLabel,
  getPrimaryVehicle,
  type Customer,
} from '../Database/CustomerData'
import Button, { EditIcon, PlusIcon } from '../Shared/Button'
import {
  emptyCustomerFilters,
  filterCustomers,
  hasActiveCustomerFilters,
  type CustomerFilterState,
} from '../Utils/CustomerFilters'

type CustomersPageProps = AppHeaderProps & {
  customers: Customer[]
  onAddCustomer: () => void
  onEditCustomer: (customerId: string) => void
}

const CUSTOMER_HEADERS = [
  'Full name',
  'Phone',
  'Vehicles',
  'Primary vehicle',
  'Actions',
] as const

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const

export default function CustomersPage({
  activePage,
  onNavigate,
  inventoryCategory,
  inventoryFilters,
  onInventorySearchChange,
  customers,
  onAddCustomer,
  onEditCustomer,
}: CustomersPageProps) {
  const [filters, setFilters] = useState<CustomerFilterState>(emptyCustomerFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0])

  const filteredCustomers = useMemo(
    () => filterCustomers(customers, filters),
    [customers, filters],
  )

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize))

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCustomers.slice(start, start + pageSize)
  }, [filteredCustomers, currentPage, pageSize])

  const rangeStart =
    filteredCustomers.length === 0
      ? 0
      : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, filteredCustomers.length)

  const hasActiveFilters = hasActiveCustomerFilters(filters)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters.name, filters.phone])

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters(emptyCustomerFilters)
    setCurrentPage(1)
  }

  const emptyMessage =
    customers.length === 0
      ? 'No customers yet. Add your first customer to get started.'
      : 'No customers match your filters. Try adjusting your search.'

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
          <p className="page-header__eyebrow">Customers</p>
          <h1 className="page-header__title">Customer directory</h1>
          <p className="page-header__description">
            View all customers and manage their vehicle and service records.
          </p>
        </div>
      </div>

      <main className="page-main">
        <section className="section-card">
          <div className="section-card__header customers-toolbar">
            <h2 className="customers-toolbar__title">All customers</h2>
            <Button variant="primary" icon={<PlusIcon />} onClick={onAddCustomer}>
              New customer
            </Button>
          </div>

          <div className="customers-section">
            <CustomerFilter
              filters={filters}
              onChange={setFilters}
              onClear={clearFilters}
              showClear={hasActiveFilters}
            />

            <div className="customers-table-area">
              <div className="inventory-table-scroll customers-table-scroll">
                <table className="inventory-data-table customers-data-table">
                  <thead>
                    <tr className="inventory-data-table__head-row">
                      {CUSTOMER_HEADERS.map((header) => (
                        <th key={header} className="inventory-data-table__th">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="inventory-data-table__body">
                    {paginatedCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="inventory-data-table__empty">
                          {emptyMessage}
                        </td>
                      </tr>
                    ) : (
                      paginatedCustomers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="inventory-data-table__row"
                        >
                          <td className="inventory-data-table__td--name">
                            {customer.fullName}
                          </td>
                          <td className="inventory-data-table__td">
                            {customer.phone}
                          </td>
                          <td className="inventory-data-table__td">
                            {customer.vehicles.length}
                          </td>
                          <td className="inventory-data-table__td">
                            {formatVehicleLabel(getPrimaryVehicle(customer))}
                          </td>
                          <td className="inventory-data-table__td">
                            <div className="customers-table__actions">
                              <Button
                                variant="secondary"
                                icon={<EditIcon />}
                                onClick={() => onEditCustomer(customer.id)}
                              >
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="inventory-pagination customers-pagination">
                <div className="inventory-pagination__meta">
                  <p className="inventory-pagination__count">
                    Showing {rangeStart}–{rangeEnd} of {filteredCustomers.length}{' '}
                    customer{filteredCustomers.length === 1 ? '' : 's'}
                    {hasActiveFilters && ` (filtered from ${customers.length})`}
                  </p>
                  <label className="inventory-pagination__page-size">
                    <span className="inventory-pagination__page-size-label">
                      Customers per page
                    </span>
                    <select
                      value={pageSize}
                      onChange={(e) =>
                        handlePageSizeChange(Number(e.target.value))
                      }
                      className="form-select-page-size"
                      aria-label="Customers per page"
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
          </div>
        </section>
      </main>
    </div>
  )
}
