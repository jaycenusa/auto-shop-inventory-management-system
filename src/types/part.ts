export type PartStatus = 'ok' | 'low' | 'critical' | 'out'

export type Part = {
  id: string
  sku: string
  name: string
  category: string
  stock: number
  threshold: number
  reorderQty: number
  unitPrice: number
  markupPct: number
  labourCost: number
  supplier: string
  location: string
  autoReorder: boolean
}
