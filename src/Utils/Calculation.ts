import { useMemo } from 'react'
import type { Customer } from '../Database/CustomerData'
import type { InventoryPart } from '../Database/InventoryData'

export type DashboardCalculations = {
  totalParts: number
  lowStockCount: number
  totalMoneyMade: number
}

function formatCount(value: number): string {
  return value.toLocaleString()
}

export function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Total inventory SKUs (parts array length). */
export function calculateTotalParts(parts: InventoryPart[]): number {
  return parts.length
}

/**
 * Count of parts marked Low Stock. Returns 0 when inventory is empty
 * or no parts have low-stock status.
 */
export function calculateLowStockCount(parts: InventoryPart[]): number {
  if (parts.length === 0) return 0
  return parts.filter((part) => part.availabilityStatus === 'Low Stock').length
}

/** Sum of transaction costs across all customers (shop revenue). */
export function calculateTotalMoneyMade(customers: Customer[]): number {
  let total = 0

  for (const customer of customers) {
    for (const transaction of customer.transactions) {
      total += transaction.cost
    }
  }

  return total
}

export class Calculation {
  static getTotalParts(parts: InventoryPart[]): number {
    return calculateTotalParts(parts)
  }

  static getLowStockCount(parts: InventoryPart[]): number {
    return calculateLowStockCount(parts)
  }

  static getTotalMoneyMade(customers: Customer[]): number {
    return calculateTotalMoneyMade(customers)
  }

  static computeDashboard(
    parts: InventoryPart[],
    customers: Customer[],
  ): DashboardCalculations {
    return {
      totalParts: calculateTotalParts(parts),
      lowStockCount: calculateLowStockCount(parts),
      totalMoneyMade: calculateTotalMoneyMade(customers),
    }
  }
}

/**
 * Recomputes dashboard metrics when inventory or customer data changes
 * (React state updates in App act as the change events).
 */
export function useDashboardCalculations(
  parts: InventoryPart[],
  customers: Customer[],
): DashboardCalculations {
  return useMemo(
    () => Calculation.computeDashboard(parts, customers),
    [parts, customers],
  )
}

export function getLowStockChangeLabel(lowStockCount: number): string {
  if (lowStockCount === 0) return 'No low-stock items'
  if (lowStockCount === 1) return '1 part needs attention'
  return `${formatCount(lowStockCount)} parts need attention`
}

export function getTotalPartsChangeLabel(totalParts: number): string {
  if (totalParts === 0) return 'Add parts in inventory'
  if (totalParts === 1) return '1 part in catalog'
  return `${formatCount(totalParts)} parts in catalog`
}

export function getTotalMoneyMadeChangeLabel(
  customers: Customer[],
  totalMoneyMade: number,
): string {
  const transactionCount = customers.reduce(
    (sum, customer) => sum + customer.transactions.length,
    0,
  )

  if (transactionCount === 0) return 'No customer transactions yet'
  return `From ${formatCount(transactionCount)} transaction${
    transactionCount === 1 ? '' : 's'
  } · ${formatCurrency(totalMoneyMade)}`
}
