import OrderCart from '../components/order-cart'
import Button from '../shared/button'
import type { AppPage } from './header'

const INVENTORY_PAGES: AppPage[] = ['inventory', 'add-part', 'modify-part']

type NavBarProps = {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  searchQuery: string
  onSearchChange: (carPart: string) => void
}

function isInventoryPage(page: AppPage) {
  return INVENTORY_PAGES.includes(page)
}

function SearchIcon() {
  return (
    <svg
      className="navbar-search__icon"
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

type NavSearchProps = {
  value: string
  onChange: (value: string) => void
}

function NavSearch({ value, onChange }: NavSearchProps) {
  return (
    <div className="navbar-search">
      <label htmlFor="navbar-search" className="sr-only">
        Search inventory
      </label>
      <span className="navbar-search__icon-wrap">
        <SearchIcon />
      </span>
      <input
        id="navbar-search"
        type="search"
        name="navbar-search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search parts..."
        className="navbar-search__input"
      />
    </div>
  )
}

export default function NavBar({
  activePage,
  onNavigate,
  searchQuery,
  onSearchChange,
}: NavBarProps) {
  const inventoryActive = isInventoryPage(activePage)

  return (
    <nav className="navbar" aria-label="main navigation">
      <div className="navbar__inner">
        <div className="navbar__center">
          <ul className="navbar__links">
            <li>
              <Button
                variant="nav"
                active={activePage === 'dashboard'}
                className={
                  activePage === 'dashboard' ? 'btn--nav-on-bar-active' : undefined
                }
                onClick={() => onNavigate('dashboard')}
              >
                Dashboard
              </Button>
            </li>

            <li>
              <Button
                variant="nav"
                active={inventoryActive}
                className={inventoryActive ? 'btn--nav-on-bar-active' : undefined}
                onClick={() => onNavigate('inventory')}
              >
                Inventory
              </Button>
            </li>
          </ul>

          <NavSearch value={searchQuery} onChange={onSearchChange} />
        </div>

        <OrderCart />
      </div>
    </nav>
  )
}
