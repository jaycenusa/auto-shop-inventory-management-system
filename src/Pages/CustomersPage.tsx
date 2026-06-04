import AppHeader, { type AppHeaderProps } from './Header'
import type { Customer } from '../Database/CustomerData'
import Button, { EditIcon, PlusIcon } from '../Shared/Button'

type CustomersPageProps = AppHeaderProps & {
  customers: Customer[]
  onAddCustomer: () => void
  onEditCustomer: (customerId: string) => void
}

const CUSTOMER_HEADERS = [
  'Full name',
  'Phone',
  'Car brand',
  'Car model',
  'VIN',
  'Actions',
] as const

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

          <div className="inventory-table-wrap">
            <table className="inventory-table inventory-table--wide">
              <thead>
                <tr className="inventory-table__head-row">
                  {CUSTOMER_HEADERS.map((header) => (
                    <th key={header} className="table-cell--header">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="inventory-table__body">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="customers-table__empty">
                      No customers yet. Add your first customer to get started.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="table-cell--emphasis">{customer.fullName}</td>
                      <td className="table-cell">{customer.phone}</td>
                      <td className="table-cell">{customer.carBrand}</td>
                      <td className="table-cell">{customer.carModel}</td>
                      <td className="table-cell">{customer.vin}</td>
                      <td className="table-cell">
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
        </section>
      </main>
    </div>
  )
}
