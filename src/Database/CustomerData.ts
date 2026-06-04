export type CustomerTransaction = {
  id: string
  date: string
  description: string
  cost: number
  downPayment: number
}

export type Customer = {
  id: string
  fullName: string
  phone: string
  carBrand: string
  carModel: string
  vin: string
  transactions: CustomerTransaction[]
}

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    fullName: 'Jordan Martinez',
    phone: '(555) 201-8842',
    carBrand: 'Toyota',
    carModel: 'Camry',
    vin: '4T1BF1FK5HU123456',
    transactions: [
      {
        id: 'txn-1',
        date: '2026-03-12',
        description: 'Brake pad replacement',
        cost: 420,
        downPayment: 150,
      },
      {
        id: 'txn-2',
        date: '2026-04-02',
        description: 'Oil change and filter',
        cost: 89.5,
        downPayment: 89.5,
      },
    ],
  },
]

export function createEmptyCustomer(): Customer {
  return {
    id: `cust-${Date.now()}`,
    fullName: '',
    phone: '',
    carBrand: '',
    carModel: '',
    vin: '',
    transactions: [],
  }
}

export type CustomerActivityRecord = CustomerTransaction & {
  customerId: string
  customerName: string
  carBrand: string
  carModel: string
}

export function getRecentCustomerTransactions(
  customers: Customer[],
  limit = 20,
): CustomerActivityRecord[] {
  const records: CustomerActivityRecord[] = []

  for (const customer of customers) {
    for (const transaction of customer.transactions) {
      records.push({
        ...transaction,
        customerId: customer.id,
        customerName: customer.fullName,
        carBrand: customer.carBrand,
        carModel: customer.carModel,
      })
    }
  }

  return records
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
}

export function createEmptyTransaction(): CustomerTransaction {
  return {
    id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString().slice(0, 10),
    description: '',
    cost: 0,
    downPayment: 0,
  }
}
