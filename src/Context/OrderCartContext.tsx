import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { InventoryPart } from '../Database/InventoryData'

export type CartLineItem = {
  partId: string
  carPart: string
  brand: string
  price: number
  quantity: number
}

type OrderCartContextValue = {
  items: CartLineItem[]
  itemCount: number
  subtotal: number
  addItem: (part: InventoryPart, quantity?: number) => void
  removeItem: (partId: string) => void
  clearCart: () => void
}

const OrderCartContext = createContext<OrderCartContextValue | null>(null)

type OrderCartProviderProps = {
  children: ReactNode
}

export function OrderCartProvider({ children }: OrderCartProviderProps) {
  const [items, setItems] = useState<CartLineItem[]>([])

  const addItem = useCallback((part: InventoryPart, quantity = 1) => {
    const amount = Math.max(1, quantity)
    setItems((prev) => {
      const existing = prev.find((item) => item.partId === part.id)
      if (existing) {
        return prev.map((item) =>
          item.partId === part.id
            ? { ...item, quantity: item.quantity + amount }
            : item,
        )
      }
      return [
        ...prev,
        {
          partId: part.id,
          carPart: part.carPart,
          brand: part.brand,
          price: part.price,
          quantity: amount,
        },
      ]
    })
  }, [])

  const removeItem = useCallback((partId: string) => {
    setItems((prev) => prev.filter((item) => item.partId !== partId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      clearCart,
    }),
    [items, itemCount, subtotal, addItem, removeItem, clearCart],
  )

  return (
    <OrderCartContext.Provider value={value}>{children}</OrderCartContext.Provider>
  )
}

export function useOrderCart() {
  const context = useContext(OrderCartContext)
  if (!context) {
    throw new Error('useOrderCart must be used within an OrderCartProvider.')
  }
  return context
}
