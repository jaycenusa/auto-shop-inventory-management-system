export type CustomerTransaction = {
  id: string
  date: string
  description: string
  cost: number
  downPayment: number
  vin: string
}

export type CustomerVehicle = {
  id: string
  carBrand: string
  carModel: string
  carYear: number
  vin: string
}

export type Customer = {
  id: string
  fullName: string
  phone: string
  vehicles: CustomerVehicle[]
  transactions: CustomerTransaction[]
}

export function formatVehicleLabel(vehicle: CustomerVehicle | undefined): string {
  if (!vehicle) return '—'
  const year = vehicle.carYear > 0 ? `${vehicle.carYear} ` : ''
  return `${year}${vehicle.carBrand} ${vehicle.carModel}`.trim() || '—'
}

export function getPrimaryVehicle(customer: Customer): CustomerVehicle | undefined {
  return customer.vehicles[0]
}

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    fullName: 'Jordan Martinez',
    phone: '(555) 201-8842',
    vehicles: [
      {
        id: 'veh-1',
        carBrand: 'Toyota',
        carModel: 'Camry',
        carYear: 2019,
        vin: '4T1BF1FK5HU123456',
      },
    ],
    transactions: [
      {
        id: 'txn-1',
        date: '2026-03-12',
        description: 'Brake pad replacement',
        cost: 420,
        downPayment: 150,
        vin: '4T1BF1FK5HU123456',
      },
      {
        id: 'txn-2',
        date: '2026-04-02',
        description: 'Oil change and filter',
        cost: 89.5,
        downPayment: 89.5,
        vin: '4T1BF1FK5HU123456',
      },
    ],
  },
]

export function createEmptyCustomer(): Customer {
  return {
    id: `cust-${Date.now()}`,
    fullName: '',
    phone: '',
    vehicles: [],
    transactions: [],
  }
}

export function createEmptyVehicle(): CustomerVehicle {
  return {
    id: `veh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    carBrand: '',
    carModel: '',
    carYear: 0,
    vin: '',
  }
}

export type CustomerActivityRecord = CustomerTransaction & {
  customerId: string
  customerName: string
  vehicleLabel: string
}

export function getRecentCustomerTransactions(
  customers: Customer[],
  limit = 20,
): CustomerActivityRecord[] {
  const records: CustomerActivityRecord[] = []

  for (const customer of customers) {
    const vehicleLabel = formatVehicleLabel(getPrimaryVehicle(customer))

    for (const transaction of customer.transactions) {
      records.push({
        ...transaction,
        customerId: customer.id,
        customerName: customer.fullName,
        vehicleLabel,
      })
    }
  }

  const sorted = records.sort((a, b) => b.date.localeCompare(a.date))
  return limit === undefined ? sorted : sorted.slice(0, limit)
}

export const ACTIVITY_FILTER_ALL = 'All'

export type RecentActivityFilterState = {
  dateFrom: string
  dateTo: string
  customerName: string
  description: string
}

export const emptyRecentActivityFilters: RecentActivityFilterState = {
  dateFrom: '',
  dateTo: '',
  customerName: ACTIVITY_FILTER_ALL,
  description: ACTIVITY_FILTER_ALL,
}

function activityDateValue(isoDate: string): string {
  return isoDate.slice(0, 10)
}

export function hasActiveRecentActivityFilters(
  filters: RecentActivityFilterState,
): boolean {
  return (
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.customerName !== ACTIVITY_FILTER_ALL ||
    filters.description !== ACTIVITY_FILTER_ALL
  )
}

export function filterRecentActivityRecords(
  records: CustomerActivityRecord[],
  filters: RecentActivityFilterState,
): CustomerActivityRecord[] {
  if (
    filters.dateFrom &&
    filters.dateTo &&
    filters.dateFrom > filters.dateTo
  ) {
    return []
  }

  return records.filter((record) => {
    const recordDate = activityDateValue(record.date)

    if (filters.dateFrom && recordDate < filters.dateFrom) {
      return false
    }
    if (filters.dateTo && recordDate > filters.dateTo) {
      return false
    }
    if (
      filters.customerName !== ACTIVITY_FILTER_ALL &&
      record.customerName !== filters.customerName
    ) {
      return false
    }
    if (
      filters.description !== ACTIVITY_FILTER_ALL &&
      record.description !== filters.description
    ) {
      return false
    }
    return true
  })
}

export function getRecentActivityFilterOptions(records: CustomerActivityRecord[]) {
  const dates = [...new Set(records.map((record) => activityDateValue(record.date)))].sort()

  return {
    dateFrom: dates[0] ?? '',
    dateTo: dates[dates.length - 1] ?? '',
    customerNames: [...new Set(records.map((record) => record.customerName))].sort(),
    descriptions: [...new Set(records.map((record) => record.description))].sort(),
  }
}

export function createEmptyTransaction(): CustomerTransaction {
  return {
    id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString().slice(0, 10),
    description: '',
    cost: 0,
    downPayment: 0,
    vin: '',
  }
}
