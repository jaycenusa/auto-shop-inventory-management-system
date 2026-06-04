import type { InventoryCategory } from '../Database/InventoryData'
import type { InventoryFilterState } from '../Shared/Filter'
import NavBar from './NavBar'

export type AppPage =
  | 'dashboard'
  | 'inventory'
  | 'add-part'
  | 'modify-part'
  | 'customers'
  | 'customer-info'

export type AppHeaderProps = {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  inventoryCategory: InventoryCategory | null
  inventoryFilters: InventoryFilterState
  onInventorySearchChange: (carPart: string) => void
}

export default function AppHeader({
  activePage,
  onNavigate,
  inventoryFilters,
  onInventorySearchChange,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <NavBar
        activePage={activePage}
        onNavigate={onNavigate}
        searchQuery={inventoryFilters.carPart}
        onSearchChange={onInventorySearchChange}
      />
    </header>
  )
}
