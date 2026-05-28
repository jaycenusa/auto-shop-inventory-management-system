import type { InventoryCategory } from '../Database/InventoryData'

export function getInventoryNavLabel(
  category: InventoryCategory | null,
): string {
  if (!category) return 'Inventory'

  switch (category) {
    case 'Tires':
      return 'Inventory Tire'
    case 'Air Filter':
      return 'Inventory Air Filter'
    case 'Car Parts':
      return 'Inventory Car Parts'
  }
}

export function getInventoryCatalogTitle(
  category: InventoryCategory | null,
): string {
  if (!category) return 'Inventory Parts Catalog'

  switch (category) {
    case 'Tires':
      return 'Inventory Tire'
    case 'Air Filter':
      return 'Inventory Air Filter'
    case 'Car Parts':
      return 'Inventory Car Parts'
  }
}
