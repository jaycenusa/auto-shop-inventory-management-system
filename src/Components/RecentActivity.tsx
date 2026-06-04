import { useMemo } from 'react'
import {
  getRecentCustomerTransactions,
  type Customer,
} from '../Database/CustomerData'
import Button from '../Shared/Button'

type RecentActivityProps = {
  customers: Customer[]
  limit?: number
  onViewAllCustomers?: () => void
  onViewCustomer?: (customerId: string) => void
}

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
  limit = 20,
  onViewAllCustomers,
  onViewCustomer,
}: RecentActivityProps) {
  const activities = useMemo(
    () => getRecentCustomerTransactions(customers, limit),
    [customers, limit],
  )

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

      {activities.length === 0 ? (
        <p className="recent-activity__empty">
          No customer transactions recorded yet. Add transactions from a
          customer profile.
        </p>
      ) : (
        <div className="inventory-table-wrap">
          <table className="inventory-table inventory-table--wide">
            <thead>
              <tr className="inventory-table__head-row">
                <th className="table-cell--header">Date</th>
                <th className="table-cell--header">Customer</th>
                <th className="table-cell--header">Vehicle</th>
                <th className="table-cell--header">Description</th>
                <th className="table-cell--header">Cost</th>
                <th className="table-cell--header">Down payment</th>
                {onViewCustomer && (
                  <th className="table-cell--header">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="inventory-table__body">
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="table-cell">{formatDate(activity.date)}</td>
                  <td className="table-cell--emphasis">
                    {activity.customerName}
                  </td>
                  <td className="table-cell">
                    {activity.carBrand} {activity.carModel}
                  </td>
                  <td className="table-cell">{activity.description}</td>
                  <td className="table-cell">{formatMoney(activity.cost)}</td>
                  <td className="table-cell">
                    {formatMoney(activity.downPayment)}
                  </td>
                  {onViewCustomer && (
                    <td className="table-cell">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => onViewCustomer(activity.customerId)}
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
      )}
    </section>
  )
}
