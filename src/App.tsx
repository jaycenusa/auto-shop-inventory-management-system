import { useState } from 'react'
import { OrderCartProvider } from './Context/OrderCartContext'
import { ImageZoomProvider } from './Utils/ImageZoom'
import { usePersistedState } from './Utils/usePersistedState'
import Homepage from './Pages/Homepage'
import InventoryPage from './Pages/InventoryPage'
import CustomersPage from './Pages/CustomersPage'
import CustomerInfo from './Pages/CustomerInfo'
import AddCarPart from './Components/AddCarPart'
import ModifyCarPart from './Components/ModifyCarPart'
import type { AppPage } from './Pages/Header'
import { emptyInventoryFilters } from './Shared/Filter'
import type { InventoryFilterState } from './Shared/Filter'
import {
  inventoryParts as initialParts,
  type InventoryCategory,
} from './Database/InventoryData'
import { initialCustomers } from './Database/CustomerData'

const PARTS_STORAGE_KEY = 'auto-shop-inventory:parts'
const CUSTOMERS_STORAGE_KEY = 'auto-shop-inventory:customers'

function App() {
  const [page, setPage] = useState<AppPage>('dashboard')
  const [inventoryCategory, setInventoryCategory] =
    useState<InventoryCategory | null>(null)
  const [inventoryFilters, setInventoryFilters] =
    useState<InventoryFilterState>(emptyInventoryFilters)
  const [parts, setParts] = usePersistedState(PARTS_STORAGE_KEY, initialParts)
  const [customers, setCustomers] = usePersistedState(
    CUSTOMERS_STORAGE_KEY,
    initialCustomers,
  )
  const [customerEditId, setCustomerEditId] = useState<string | null>(null)

  const handleNavigate = (nextPage: AppPage) => {
    if (nextPage === 'inventory') {
      setInventoryCategory(null)
    }
    if (nextPage !== 'customer-info') {
      setCustomerEditId(null)
    }
    setPage(nextPage)
  }

  const openCustomerInfo = (customerId: string | null) => {
    setCustomerEditId(customerId)
    setPage('customer-info')
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

  const customerProps = {
    ...headerProps,
    customers,
    setCustomers,
  }

  let content
  if (page === 'add-part') {
    content = <AddCarPart {...inventoryProps} />
  } else if (page === 'modify-part') {
    content = <ModifyCarPart {...inventoryProps} />
  } else if (page === 'inventory') {
    content = <InventoryPage {...inventoryProps} />
  } else if (page === 'customers') {
    content = (
      <CustomersPage
        {...customerProps}
        onAddCustomer={() => openCustomerInfo(null)}
        onEditCustomer={(id) => openCustomerInfo(id)}
      />
    )
  } else if (page === 'customer-info') {
    content = (
      <CustomerInfo
        {...customerProps}
        customerId={customerEditId}
        onDone={() => handleNavigate('customers')}
      />
    )
  } else {
    content = (
      <Homepage
        {...headerProps}
        parts={parts}
        customers={customers}
        onViewAllCustomers={() => handleNavigate('customers')}
        onViewCustomer={(customerId) => openCustomerInfo(customerId)}
      />
    )
  }

  return (
    <OrderCartProvider>
      <ImageZoomProvider>{content}</ImageZoomProvider>
    </OrderCartProvider>
  )
}

export default App
