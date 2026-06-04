import { useMemo } from 'react'
import AppHeader, { type AppHeaderProps } from './Header'
import RecentActivity from '../Components/RecentActivity'
import type { Customer } from '../Database/CustomerData'
import type { InventoryPart } from '../Database/InventoryData'
import {
  formatCurrency,
  getLowStockChangeLabel,
  getTotalMoneyMadeChangeLabel,
  getTotalPartsChangeLabel,
  useDashboardCalculations,
} from '../Utils/Calculation'

type HomepageProps = AppHeaderProps & {
  parts: InventoryPart[]
  customers: Customer[]
  onViewAllCustomers?: () => void
  onViewCustomer?: (customerId: string) => void
}

export default function Homepage({
  parts,
  customers,
  onViewAllCustomers,
  onViewCustomer,
  ...headerProps
}: HomepageProps) {
  const { totalParts, lowStockCount, totalMoneyMade } = useDashboardCalculations(
    parts,
    customers,
  )

  const stats = useMemo(
    () => [
      {
        label: 'Total parts',
        value: totalParts.toLocaleString(),
        change: getTotalPartsChangeLabel(totalParts),
      },
      {
        label: 'Low stock',
        value: lowStockCount.toLocaleString(),
        change: getLowStockChangeLabel(lowStockCount),
      },
      {
        label: 'Total money made',
        value: formatCurrency(totalMoneyMade),
        change: getTotalMoneyMadeChangeLabel(customers, totalMoneyMade),
      },
    ],
    [totalParts, lowStockCount, totalMoneyMade, customers],
  )

  return (
    <div className="page">
      <AppHeader {...headerProps} />

      <div className="page-header">
        <div className="page-header__inner">
          <p className="page-header__eyebrow">Dashboard</p>
          <h1 className="page-header__title">
            Welcome to Auto Shop Inventory System
          </h1>
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

        <section className="homepage__recent">
          <RecentActivity
            customers={customers}
            onViewAllCustomers={onViewAllCustomers}
            onViewCustomer={onViewCustomer}
          />
        </section>
      </main>
    </div>
  )
}
