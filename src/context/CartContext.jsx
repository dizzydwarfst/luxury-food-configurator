import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const CART_STORAGE_KEY = 'gourmet-ar-cart'

const CartContext = createContext(null)

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch (e) {
    console.warn('Could not persist cart', e)
  }
}

function nextCartItemId() {
  return `ci_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart)

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  const addToCart = useCallback((item, activeIngredients, variantId) => {
    const cartItem = {
      cartItemId: nextCartItemId(),
      itemId: item.id,
      name: item.name,
      stationId: item.stationId,
      activeIngredients: { ...activeIngredients },
      variantId,
      addedAt: Date.now(),
    }
    setCart((prev) => [...prev, cartItem])
  }, [])

  const removeFromCart = useCallback((cartItemId) => {
    setCart((prev) => prev.filter((c) => c.cartItemId !== cartItemId))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
