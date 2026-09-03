import { describe, expect, it } from 'vitest'
import { resolveViewRequestKeys } from '../hooks/resolve-view-request-keys'

describe('resolveViewRequestKeys', () => {
  it('requests parts for inventory and alerts', () => {
    expect(resolveViewRequestKeys('inventory')).toEqual({
      parts: 'inventory',
      customers: null,
      reorders: null,
    })
    expect(resolveViewRequestKeys('alerts')).toEqual({
      parts: 'alerts',
      customers: null,
      reorders: null,
    })
  })

  it('requests reorders and parts for the reorders tab', () => {
    expect(resolveViewRequestKeys('reorders')).toEqual({
      parts: 'reorders',
      customers: null,
      reorders: 'reorders',
    })
  })

  it('requests customers only for the customers tab', () => {
    expect(resolveViewRequestKeys('customers')).toEqual({
      parts: null,
      customers: 'customers',
      reorders: null,
    })
  })

  it('requests parts only for the VIN lookup tab', () => {
    expect(resolveViewRequestKeys('vinlookup')).toEqual({
      parts: 'vinlookup',
      customers: null,
      reorders: null,
    })
  })

  it('requests all three services on the dashboard', () => {
    expect(resolveViewRequestKeys('dashboard')).toEqual({
      parts: 'dashboard',
      customers: 'dashboard',
      reorders: 'dashboard',
    })
  })
})
