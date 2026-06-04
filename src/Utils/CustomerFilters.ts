import type { Customer } from '../Database/CustomerData'

export type CustomerFilterState = {
  name: string
  phone: string
}

export const emptyCustomerFilters: CustomerFilterState = {
  name: '',
  phone: '',
}

export function hasActiveCustomerFilters(filters: CustomerFilterState): boolean {
  return filters.name.trim() !== '' || filters.phone.trim() !== ''
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '')
}

export function filterCustomers(
  customers: Customer[],
  filters: CustomerFilterState,
): Customer[] {
  const nameQuery = filters.name.trim().toLowerCase()
  const phoneQuery = filters.phone.trim().toLowerCase()
  const phoneDigitsQuery = normalizePhone(filters.phone)

  return customers.filter((customer) => {
    if (nameQuery && !customer.fullName.toLowerCase().includes(nameQuery)) {
      return false
    }

    if (phoneQuery) {
      const phoneLower = customer.phone.toLowerCase()
      const phoneDigits = normalizePhone(customer.phone)
      const matchesFormatted = phoneLower.includes(phoneQuery)
      const matchesDigits =
        phoneDigitsQuery.length > 0 && phoneDigits.includes(phoneDigitsQuery)

      if (!matchesFormatted && !matchesDigits) {
        return false
      }
    }

    return true
  })
}
