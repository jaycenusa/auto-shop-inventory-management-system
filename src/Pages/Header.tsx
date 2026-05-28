import type { InventoryCategory } from '../Database/InventoryData'
import HeaderAuth from '../OAuth/HeaderAuth'
import type { InventoryFilterState } from '../Shared/Filter'
import Button from '../Shared/Button'
import NavBar from './NavBar'

export type AppPage = 'dashboard' | 'inventory' | 'add-part' | 'modify-part'

export type AppHeaderProps = {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  inventoryCategory: InventoryCategory | null
  onSelectInventoryCategory: (category: InventoryCategory) => void
  inventoryFilters: InventoryFilterState
  onInventorySearchChange: (carPart: string) => void
}

export default function AppHeader({
  activePage,
  onNavigate,
  inventoryCategory,
  onSelectInventoryCategory,
  inventoryFilters,
  onInventorySearchChange,
}: AppHeaderProps) {
  return (
    <header className="text-white shadow-md">
      <div className="flex w-full items-center justify-between gap-4 border-b border-slate-800 bg-slate-950 px-4 py-3 sm:px-6 lg:px-8">
        <Button variant="brand" onClick={() => onNavigate('dashboard')}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-slate-900">
            AS
          </span>
          <div className="text-left leading-tight">
            <p className="text-sm font-semibold tracking-wide text-white">
              AutoShop IMS
            </p>
            <p className="text-xs text-slate-400">Inventory Management</p>
          </div>
        </Button>

        <HeaderAuth />
      </div>

      <NavBar
        activePage={activePage}
        onNavigate={onNavigate}
        inventoryCategory={inventoryCategory}
        onSelectInventoryCategory={onSelectInventoryCategory}
        searchQuery={inventoryFilters.carPart}
        onSearchChange={onInventorySearchChange}
      />
    </header>
  )
}
