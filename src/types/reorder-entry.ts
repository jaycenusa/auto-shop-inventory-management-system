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
