import type { Part } from '../types/part'

export function partsCostToCustomer(p: Part) {
  return p.unitPrice * (1 + p.markupPct / 100)
}

export function totalServicePrice(p: Part) {
  return partsCostToCustomer(p) + p.labourCost
}

export const fmtCurrency = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
