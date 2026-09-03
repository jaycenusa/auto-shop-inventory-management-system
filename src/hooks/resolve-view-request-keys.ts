import type { View } from '../types/view'

/** Views that need a fresh parts list from `/api/parts`. */
const PARTS_VIEWS = new Set<View>([
  'dashboard',
  'inventory',
  'alerts',
  'reorders',
  'vinlookup',
])

/** Views that need a fresh customers list from `/api/customers`. */
const CUSTOMERS_VIEWS = new Set<View>(['dashboard', 'customers'])

/** Views that need a fresh reorders list from `/api/reorders`. */
const REORDERS_VIEWS = new Set<View>(['dashboard', 'reorders'])

/**
 * Map owner nav view → request keys for each hook.
 * Using the view id as the key refetches whenever that tab is selected.
 */
export function resolveViewRequestKeys(view: View): {
  parts: string | null
  customers: string | null
  reorders: string | null
} {
  return {
    parts: PARTS_VIEWS.has(view) ? view : null,
    customers: CUSTOMERS_VIEWS.has(view) ? view : null,
    reorders: REORDERS_VIEWS.has(view) ? view : null,
  }
}
