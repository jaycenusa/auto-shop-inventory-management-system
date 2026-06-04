export type AvailabilityStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

export type InventoryCategory = 'Tires' | 'Air Filter' | 'Car Parts'

export const inventoryCategories: InventoryCategory[] = [
  'Tires',
  'Air Filter',
  'Car Parts',
]

export type InventoryPart = {
  id: string
  carPart: string
  brand: string
  price: number
  quantity: number
  category: InventoryCategory
  availabilityStatus: AvailabilityStatus
  imageUrl: string
}

export function getPartImageUrl(
  part: Pick<InventoryPart, 'imageUrl' | 'id'>,
): string {
  return part.imageUrl || `https://picsum.photos/seed/part-${part.id}/96/96`
}

export const inventoryParts: InventoryPart[] = []

export const availabilityOptions: AvailabilityStatus[] = [
  'In Stock',
  'Low Stock',
  'Out of Stock',
]
