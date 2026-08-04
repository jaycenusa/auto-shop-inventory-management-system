import type { InventoryCategory } from '../database/InventoryData'

export function getInventoryNavLabel(
  category: InventoryCategory | null,
): string {
  if (!category) return 'Inventory'

  switch (category) {
    case 'Tires':
      return 'Inventory Tire'
    case 'Air filter':
      return 'Inventory Air filter'
    case 'Car parts':
      return 'Inventory Car parts'
  }
}

export function getInventoryCatalogTitle(
  category: InventoryCategory | null,
): string {
  if (!category) return 'Inventory parts Catalog'

  switch (category) {
    case 'Tires':
      return 'Inventory Tire'
    case 'Air filter':
      return 'Inventory Air filter'
    case 'Car parts':
      return 'Inventory Car parts'
  }
}
