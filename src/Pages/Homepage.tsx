import AppHeader, { type AppHeaderProps } from './Header'
import Button from '../Shared/Button'

type HomepageProps = AppHeaderProps

const stats = [
  { label: 'Total parts', value: '1,248', change: '+12 this week' },
  { label: 'Low stock', value: '18', change: 'Needs attention' },
  { label: 'Open orders', value: '34', change: '6 due today' },
  { label: 'Monthly spend', value: '$24,580', change: 'On track' },
]

export default function Homepage(props: HomepageProps) {
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
          <div className="homepage__panel homepage__panel--wide">
            <h2 className="homepage__panel-title">Recent activity</h2>
            <p className="homepage__panel-text">
              Stock updates and order changes will appear here.
            </p>
            <ul className="homepage__activity-list">
              {[
                'Brake pads restocked — 48 units',
                'Order #1042 marked as received',
                'Oil filter SKU-221 below reorder point',
              ].map((item) => (
                <li key={item} className="homepage__activity-item">
                  <span className="homepage__activity-dot" />
                  {item}
                </li>
              ))}
            </ul>
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
