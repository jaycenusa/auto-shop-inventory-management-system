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
