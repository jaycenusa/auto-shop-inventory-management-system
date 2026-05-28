import { useState } from 'react'
import {
  inventoryCategories,
  type InventoryCategory,
} from '../Database/InventoryData'
import { getInventoryNavLabel } from '../Utils/InventoryLabels'
import Button from '../Shared/Button'
import type { AppPage } from './Header'

const INVENTORY_PAGES: AppPage[] = ['inventory', 'add-part', 'modify-part']

type NavBarProps = {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  inventoryCategory: InventoryCategory | null
  onSelectInventoryCategory: (category: InventoryCategory) => void
  searchQuery: string
  onSearchChange: (carPart: string) => void
}

function isInventoryPage(page: AppPage) {
  return INVENTORY_PAGES.includes(page)
}

const navActiveClass = '!bg-slate-950'

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-500"
      aria-hidden="true"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
      />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  )
}

type NavSearchProps = {
  value: string
  onChange: (value: string) => void
}

function NavSearch({ value, onChange }: NavSearchProps) {
  return (
    <div className="relative w-full max-w-xs sm:w-64 lg:w-72">
      <label htmlFor="navbar-search" className="sr-only">
        Search inventory
      </label>
      <span className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3">
        <SearchIcon />
      </span>
      <input
        id="navbar-search"
        type="search"
        name="navbar-search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search parts..."
        className="block w-full rounded-lg border border-slate-600 bg-slate-800 py-2 ps-10 pe-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
    </div>
  )
}

export default function NavBar({
  activePage,
  onNavigate,
  inventoryCategory,
  onSelectInventoryCategory,
  searchQuery,
  onSearchChange,
}: NavBarProps) {
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const inventoryActive = isInventoryPage(activePage)

  const selectCategory = (category: InventoryCategory) => {
    onSelectInventoryCategory(category)
    setInventoryOpen(false)
  }

  return (
    <nav
      className="border-t border-slate-600 bg-slate-800"
      aria-label="Main navigation"
    >
      <div className="flex w-full flex-col items-center justify-center gap-3 px-4 py-2 sm:flex-row sm:px-6 lg:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-1">
          <li>
            <Button
              variant="nav"
              active={activePage === 'dashboard'}
              className={activePage === 'dashboard' ? navActiveClass : undefined}
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </Button>
          </li>

          <li className="relative">
            <Button
              variant="nav"
              active={inventoryActive}
              className={`flex items-center gap-1${inventoryActive ? ` ${navActiveClass}` : ''}`}
              onClick={() => {
                onNavigate('inventory')
                setInventoryOpen((open) => !open)
              }}
            >
              {inventoryActive
                ? getInventoryNavLabel(inventoryCategory)
                : 'Inventory'}
              <ChevronIcon open={inventoryOpen} />
            </Button>

            {inventoryOpen && (
              <ul className="absolute left-0 top-full z-20 mt-1 min-w-40 overflow-hidden rounded-lg border border-slate-600 bg-slate-900 py-1 shadow-lg">
                {inventoryCategories.map((category) => (
                  <li key={category}>
                    <Button
                      variant="nav-dropdown"
                      active={inventoryCategory === category}
                      onClick={() => selectCategory(category)}
                    >
                      {category}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>

        <NavSearch value={searchQuery} onChange={onSearchChange} />
      </div>
    </nav>
  )
}
