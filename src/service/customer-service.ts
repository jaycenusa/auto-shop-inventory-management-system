import type { Customer, CustomerStatus } from '../types/customer'
import { SEED_CUSTOMERS } from '../constant/seed_customers'

// TODO: This is a template service using in-memory seed data.
// In the future, this service will make API calls to the backend URL.

export type CustomerFilterStatus = 'all' | CustomerStatus

export type CustomerStats = {
  totalCustomers: number
  activeCustomers: number
  totalOrders: number
  totalRevenue: number
}

let customers: Customer[] = [...SEED_CUSTOMERS]

export const customerService = {
  getAll(): Customer[] {
    return [...customers]
  },

  getById(id: string): Customer | undefined {
    return customers.find(c => c.id === id)
  },

  getActive(): Customer[] {
    return customers.filter(c => c.status === 'active')
  },

  search(query: string, status: CustomerFilterStatus = 'all'): Customer[] {
    const q = query.toLowerCase().trim()
    return customers.filter(c => {
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
      const matchStatus = status === 'all' || c.status === status
      return matchQuery && matchStatus
    })
  },

  getStats(): CustomerStats {
    return {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.status === 'active').length,
      totalOrders: customers.reduce((sum, c) => sum + c.totalOrders, 0),
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    }
  },

  create(data: Omit<Customer, 'id'>): Customer {
    const customer: Customer = {
      id: `c${Date.now()}`,
      ...data,
    }
    customers = [...customers, customer]
    return customer
  },

  update(id: string, data: Partial<Omit<Customer, 'id'>>): Customer | undefined {
    const index = customers.findIndex(c => c.id === id)
    if (index === -1) return undefined
    customers = customers.map(c => (c.id === id ? { ...c, ...data } : c))
    return customers.find(c => c.id === id)
  },

  remove(id: string): boolean {
    const before = customers.length
    customers = customers.filter(c => c.id !== id)
    return customers.length < before
  },

  reset(): void {
    customers = [...SEED_CUSTOMERS]
  },
}
