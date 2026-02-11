import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { getMenuItem } from '../data/menu'

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart()
  const [orderJson, setOrderJson] = useState(null)

  const handlePlaceOrder = () => {
    const summary = {
      placedAt: new Date().toISOString(),
      itemCount: cart.length,
      items: cart.map((c) => ({
        cartItemId: c.cartItemId,
        itemId: c.itemId,
        name: c.name,
        variantId: c.variantId,
        activeIngredients: Object.entries(c.activeIngredients)
          .filter(([, on]) => on)
          .map(([id]) => id),
      })),
    }
    setOrderJson(JSON.stringify(summary, null, 2))
  }

  const activeIngredientNames = (cartItem) => {
    const item = getMenuItem(cartItem.itemId)
    if (!item || !item.ingredients) return []
    return item.ingredients
      .filter((ing) => cartItem.activeIngredients[ing.id])
      .map((ing) => ing.name)
  }

  return (
    <motion.div
      className="min-h-screen text-neutral-900 px-6 py-12"
      style={{ backgroundColor: '#F5F5F7' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Cart</h1>
          <Link
            to="/menu"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            ← Back to Menu
          </Link>
        </div>

        {cart.length === 0 ? (
          <p className="text-neutral-500 py-8">Your cart is empty.</p>
        ) : (
          <>
            {/* Bill receipt style list */}
            <div
              className="bg-white rounded-2xl shadow-sm border border-neutral-200/80 overflow-hidden mb-6"
              style={{ fontFamily: 'ui-monospace, monospace' }}
            >
              <div className="px-4 py-3 border-b border-neutral-200 text-sm text-neutral-500">
                ITEM · INGREDIENTS · VARIANT ID
              </div>
              {cart.map((c) => (
                <div
                  key={c.cartItemId}
                  className="px-4 py-3 border-b border-neutral-100 last:border-b-0 flex justify-between items-start gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-neutral-900">{c.name}</div>
                    <div className="text-sm text-neutral-500 mt-0.5">
                      {activeIngredientNames(c).length
                        ? activeIngredientNames(c).join(', ')
                        : '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-neutral-400 tabular-nums">#{c.variantId}</span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(c.cartItemId)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="w-full min-h-[48px] rounded-full bg-neutral-900 text-white font-medium px-6"
              >
                Place Order
              </button>
              <button
                type="button"
                onClick={clearCart}
                className="w-full min-h-[44px] rounded-full border border-neutral-300 text-neutral-700 text-sm"
              >
                Clear cart
              </button>
            </div>

            {orderJson && (
              <div className="mt-6 p-4 bg-neutral-900 rounded-xl text-neutral-300 text-xs overflow-x-auto">
                <pre className="whitespace-pre-wrap">{orderJson}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
