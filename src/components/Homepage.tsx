const navLinks = [
  { label: 'Dashboard', href: '#', active: true },
  { label: 'Inventory', href: '#' },
  { label: 'Orders', href: '#' },
  { label: 'Reports', href: '#' },
]

const stats = [
  { label: 'Total parts', value: '1,248', change: '+12 this week' },
  { label: 'Low stock', value: '18', change: 'Needs attention' },
  { label: 'Open orders', value: '34', change: '6 due today' },
  { label: 'Monthly spend', value: '$24,580', change: 'On track' },
]

export default function Homepage() {
  return (
    <div className="min-h-svh w-full bg-slate-100 text-slate-900">
      <header className="border-b border-slate-800 bg-slate-900 text-white shadow-md">
        <nav className="flex w-full items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-slate-900">
              AS
            </span>
            <div className="text-left leading-tight">
              <p className="text-sm font-semibold tracking-wide text-white">
                AutoShop IMS
              </p>
              <p className="text-xs text-slate-400">Inventory Management</p>
            </div>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    link.active
                      ? 'bg-slate-800 text-amber-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-slate-500 hover:text-white sm:inline-flex"
            >
              Notifications
            </button>
            <button
              type="button"
              className="rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-amber-400"
            >
              Add part
            </button>
          </div>
        </nav>
      </header>

      <div className="border-b border-slate-200 bg-white">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-wider text-amber-600">
            Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Overview of your shop inventory, stock levels, and recent activity.
          </p>
        </div>
      </div>

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{stat.change}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent activity
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Stock updates and order changes will appear here.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                'Brake pads restocked — 48 units',
                'Order #1042 marked as received',
                'Oil filter SKU-221 below reorder point',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 border-b border-slate-100 pb-4 text-sm text-slate-700 last:border-0 last:pb-0"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Quick actions
            </h2>
            <ul className="mt-4 space-y-2">
              {['Receive shipment', 'Run stock count', 'Export report'].map(
                (action) => (
                  <li key={action}>
                    <button
                      type="button"
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:border-amber-300 hover:bg-amber-50"
                    >
                      {action}
                    </button>
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
