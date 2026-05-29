import { useState } from 'react'
import { OrderCartProvider } from './Context/OrderCartContext'
import { AuthProvider } from './OAuth/AuthContext'
import Homepage from './Pages/Homepage'
import InventoryPage from './Pages/InventoryPage'
import AddCarPart from './Components/AddCarPart'
import ModifyCarPart from './Components/ModifyCarPart'
import type { AppPage } from './Pages/Header'
import { emptyInventoryFilters } from './Shared/Filter'
import type { InventoryFilterState } from './Shared/Filter'
import {
  inventoryParts as initialParts,
  type InventoryCategory,
  type InventoryPart,
} from './Database/InventoryData'

function App() {
  const [page, setPage] = useState<AppPage>('dashboard')
  const [inventoryCategory, setInventoryCategory] =
    useState<InventoryCategory | null>(null)
  const [inventoryFilters, setInventoryFilters] =
    useState<InventoryFilterState>(emptyInventoryFilters)
  const [parts, setParts] = useState<InventoryPart[]>(initialParts)

  const handleNavigate = (nextPage: AppPage) => {
    if (nextPage === 'inventory') {
      setInventoryCategory(null)
    }
    setPage(nextPage)
  }

  const handleInventorySearchChange = (carPart: string) => {
    setInventoryFilters((prev) => ({ ...prev, carPart }))
    if (carPart.trim() && page !== 'inventory') {
      setPage('inventory')
    }
  }

  const headerProps = {
    activePage: page,
    onNavigate: handleNavigate,
    inventoryCategory,
    inventoryFilters,
    onInventorySearchChange: handleInventorySearchChange,
  }

  const inventoryProps = {
    ...headerProps,
    onInventoryFiltersChange: setInventoryFilters,
    parts,
    setParts,
  }

  let content
  if (page === 'add-part') {
    content = <AddCarPart {...inventoryProps} />
  } else if (page === 'modify-part') {
    content = <ModifyCarPart {...inventoryProps} />
  } else if (page === 'inventory') {
    content = <InventoryPage {...inventoryProps} />
  } else {
    content = <Homepage {...headerProps} />
  }

  return (
    <AuthProvider>
      <OrderCartProvider>{content}</OrderCartProvider>
    </AuthProvider>
  )
}

export default App
