import { useEffect, useId, useRef, useState } from 'react'
import { useOrderCart } from '../context/order-cart-context'

function ShoppingCartIcon() {
  return (
    <svg
      className="order-cart__icon"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7H7.31"
      />
    </svg>
  )
}

export default function OrderCart() {
  const panelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const { items, itemCount, subtotal, removeItem, clearCart } = useOrderCart()

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div ref={containerRef} className="order-cart">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="order-cart__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Order cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
      >
        <ShoppingCartIcon />
        {itemCount > 0 && (
          <span className="order-cart__badge">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Order cart"
          className="order-cart__panel"
        >
          <div className="order-cart__panel-header">
            <h3 className="order-cart__panel-title">Order cart</h3>
            <p className="order-cart__panel-subtitle">
              {itemCount === 0
                ? 'No parts added yet'
                : `${itemCount} item${itemCount === 1 ? '' : 's'} in cart`}
            </p>
          </div>

          {items.length === 0 ? (
            <p className="order-cart__empty">
              Your cart is empty. Add parts from inventory to place an order.
            </p>
          ) : (
            <ul className="order-cart__list">
              {items.map((item) => (
                <li key={item.partId} className="order-cart__item">
                  <div className="order-cart__item-body">
                    <p className="order-cart__item-name">{item.carPart}</p>
                    <p className="order-cart__item-brand">{item.brand}</p>
                    <p className="order-cart__item-meta">
                      Qty {item.quantity} · ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.partId)}
                    className="order-cart__remove"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="order-cart__footer">
            <div className="order-cart__subtotal-row">
              <span className="order-cart__subtotal-label">Subtotal</span>
              <span className="order-cart__subtotal-value">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="order-cart__clear"
              >
                Clear cart
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
