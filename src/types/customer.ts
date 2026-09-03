export type CustomerStatus = 'active' | 'inactive'

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  totalOrders: number
  lastOrder: string
  totalSpent: number
  status: CustomerStatus
}

/** Request body for POST/PUT `/api/customers` (Swagger CustomerRequest). */
export type CustomerRequest = {
  name: string
  email: string
  phone: string
  company: string
  totalOrders?: number
  lastOrder?: string
  totalSpent: number
  status: CustomerStatus
}

/** Raw API response for `/api/customers` (Swagger CustomerResponse). */
export type CustomerResponse = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  totalOrders: number
  lastOrder: string
  totalSpent: number
  status: CustomerStatus
}

export type CustomerStats = {
  totalCustomers: number
  activeCustomers: number
  totalOrders: number
  totalRevenue: number
}

export type CustomerStatsResponse = {
  totalCustomers: number
  activeCustomers: number
  totalOrders: number
  totalRevenue: number
}

export function mapCustomerResponse(response: CustomerResponse): Customer {
  return {
    id: response.id,
    name: response.name,
    email: response.email,
    phone: response.phone,
    company: response.company,
    totalOrders: response.totalOrders,
    lastOrder: response.lastOrder,
    totalSpent: response.totalSpent,
    status: response.status,
  }
}

export function mapCustomerStatsResponse(
  response: CustomerStatsResponse,
): CustomerStats {
  return {
    totalCustomers: response.totalCustomers,
    activeCustomers: response.activeCustomers,
    totalOrders: response.totalOrders,
    totalRevenue: response.totalRevenue,
  }
}
