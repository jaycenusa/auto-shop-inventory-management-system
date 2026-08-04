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

/** Request body for POST/PUT `/api/parts` (Swagger PartRequest). */
export type PartRequest = {
  sku: string
  name: string
  category: string
  unitPrice: number
  markupPct: number
  labourCost: number
  supplier: string
  location: string
  stock?: number
  threshold?: number
  reorderQty?: number
  autoReorder?: boolean
}

/** Raw API response for `/api/parts` (Swagger PartResponse). */
export type PartResponse = {
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
  status?: string
}

export function mapPartResponse(response: PartResponse): Part {
  return {
    id: response.id,
    sku: response.sku,
    name: response.name,
    category: response.category,
    stock: response.stock,
    threshold: response.threshold,
    reorderQty: response.reorderQty,
    unitPrice: response.unitPrice,
    markupPct: response.markupPct,
    labourCost: response.labourCost,
    supplier: response.supplier,
    location: response.location,
    autoReorder: response.autoReorder,
  }
}
