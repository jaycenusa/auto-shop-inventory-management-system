import AppHeader, { type AppHeaderProps } from './Header'
import RecentActivity from '../Components/RecentActivity'
import type { Customer } from '../Database/CustomerData'
import Button from '../Shared/Button'

type HomepageProps = AppHeaderProps & {
  customers: Customer[]
  onViewAllCustomers?: () => void
  onViewCustomer?: (customerId: string) => void
}

const stats = [
  { label: 'Total parts', value: '1,248', change: '+12 this week' },
  { label: 'Low stock', value: '18', change: 'Needs attention' },
  { label: 'Open orders', value: '34', change: '6 due today' },
  { label: 'Monthly spend', value: '$24,580', change: 'On track' },
]

export default function Homepage({
  customers,
  onViewAllCustomers,
  onViewCustomer,
  ...props
}: HomepageProps) {
  return (
    <div className="page">
      <AppHeader {...props} />

      <div className="page-header">
        <div className="page-header__inner">
          <p className="page-header__eyebrow">Dashboard</p>
          <h1 className="page-header__title">Welcome back</h1>
          <p className="page-header__description">
            Overview of your shop inventory, stock levels, and recent activity.
          </p>
        </div>
      </div>

      <main className="page-main">
        <section className="homepage__stats">
          {stats.map((stat) => (
            <article key={stat.label} className="homepage__stat-card">
              <p className="homepage__stat-label">{stat.label}</p>
              <p className="homepage__stat-value">{stat.value}</p>
              <p className="homepage__stat-change">{stat.change}</p>
            </article>
          ))}
        </section>

        <section className="homepage__grid">
          <div className="homepage__panel homepage__panel--wide homepage__panel--flush">
            <RecentActivity
              customers={customers}
              onViewAllCustomers={onViewAllCustomers}
              onViewCustomer={onViewCustomer}
            />
          </div>

          <div className="homepage__panel">
            <h2 className="homepage__panel-title">Quick actions</h2>
            <ul className="homepage__actions-list">
              {['Receive shipment', 'Run stock count', 'Export report'].map(
                (action) => (
                  <li key={action}>
                    <Button variant="quick-action">{action}</Button>
                  </li>
                ),
              )}
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
