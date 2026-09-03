export type ReorderStatus = 'pending' | 'ordered' | 'delivered' | 'cancelled'

export type ReorderType = 'manual' | 'auto'

export type ReorderEntry = {
  id: string
  partId: string
  partSku: string
  partName: string
  quantity: number
  supplier: string
  unitCost: number
  status: ReorderStatus
  type: ReorderType
  createdAt: string
  deliveredAt?: string
}

/** Request body for POST `/api/reorders` (Swagger ReorderRequest). */
export type ReorderRequest = {
  partId: string
  quantity?: number
  supplier?: string
  unitCost?: number
  type: ReorderType
}

/** Request body for PATCH `/api/reorders/{id}/status`. */
export type ReorderStatusUpdateRequest = {
  status: ReorderStatus
}

/** Raw API response for `/api/reorders` (Swagger ReorderResponse). */
export type ReorderResponse = {
  id: string
  partId: string
  partSku: string
  partName: string
  quantity: number
  supplier: string
  unitCost: number
  status: ReorderStatus
  type: ReorderType
  createdAt: string
  deliveredAt?: string
}

export function mapReorderResponse(response: ReorderResponse): ReorderEntry {
  return {
    id: response.id,
    partId: response.partId,
    partSku: response.partSku,
    partName: response.partName,
    quantity: response.quantity,
    supplier: response.supplier,
    unitCost: response.unitCost,
    status: response.status,
    type: response.type,
    createdAt: response.createdAt,
    deliveredAt: response.deliveredAt,
  }
}
