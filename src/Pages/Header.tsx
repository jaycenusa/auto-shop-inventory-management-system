import type { InventoryCategory } from '../Database/InventoryData'
import HeaderAuth from '../OAuth/HeaderAuth'
import type { InventoryFilterState } from '../Shared/Filter'
import Button from '../Shared/Button'
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
      <div className="app-header__brand-row">
        <Button variant="brand" onClick={() => onNavigate('dashboard')}>
          <span className="app-header__logo">AS</span>
          <div className="app-header__brand-text">
            <p className="app-header__title">AutoShop IMS</p>
            <p className="app-header__subtitle">Inventory Management</p>
          </div>
        </Button>

        <HeaderAuth />
      </div>

      <NavBar
        activePage={activePage}
        onNavigate={onNavigate}
        searchQuery={inventoryFilters.carPart}
        onSearchChange={onInventorySearchChange}
      />
    </header>
  )
}
