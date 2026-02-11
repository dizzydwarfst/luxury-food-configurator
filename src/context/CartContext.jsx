import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'

const CART_STORAGE_KEY = 'gourmet-ar-cart'
const ORDERS_STORAGE_KEY = 'gourmet-ar-orders'

const CartContext = createContext(null)

function loadCart() {
  if (typeof window === 'undefined') return []
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
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch (error) {
    console.warn('Could not persist cart', error)
  }
}

function loadOrders() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveOrders(orders) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
  } catch (error) {
    console.warn('Could not persist orders', error)
  }
}

function nextCartItemId() {
  return `ci_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function nextOrderId() {
  return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function estimatePrepTime(cartItems) {
  const kitchenItems = cartItems.filter((item) => item.stationId !== 'drinks-bar')
  const base = 12
  const perKitchenItem = 4
  const kitchenTime = kitchenItems.length * perKitchenItem
  return base + kitchenTime
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart)
  const [orders, setOrders] = useState(loadOrders)

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  useEffect(() => {
    saveOrders(orders)
  }, [orders])

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

  const placeOrder = useCallback(() => {
    if (!cart.length) return null
    const now = Date.now()
    const etaMinutes = estimatePrepTime(cart)
    const order = {
      orderId: nextOrderId(),
      placedAt: new Date(now).toISOString(),
      etaMinutes,
      etaReadyAt: new Date(now + etaMinutes * 60 * 1000).toISOString(),
      status: 'placed',
      items: cart.map((item) => ({
        cartItemId: item.cartItemId,
        itemId: item.itemId,
        name: item.name,
        stationId: item.stationId,
        variantId: item.variantId,
        activeIngredients: { ...item.activeIngredients },
        kitchenStatus: 'queued',
        arrivedAt: new Date(now).toISOString(),
        cookStartedAt: null,
        bumpedAt: null,
      })),
    }
    setOrders((prev) => [order, ...prev])
    setCart([])
    return order
  }, [cart])

  const getOrderById = useCallback(
    (orderId) => orders.find((order) => order.orderId === orderId) ?? null,
    [orders]
  )

  const updateKitchenItemStatus = useCallback((orderId, cartItemId, nextStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.orderId !== orderId) return order
        return {
          ...order,
          items: order.items.map((item) => {
            if (item.cartItemId !== cartItemId) return item
            if (nextStatus === 'cooking') {
              if (item.kitchenStatus === 'bumped') return item
              return {
                ...item,
                kitchenStatus: 'cooking',
                cookStartedAt: item.cookStartedAt ?? new Date().toISOString(),
              }
            }
            if (nextStatus === 'bumped') {
              return {
                ...item,
                kitchenStatus: 'bumped',
                bumpedAt: item.bumpedAt ?? new Date().toISOString(),
              }
            }
            return item
          }),
        }
      })
    )
  }, [])

  const value = useMemo(
    () => ({
      cart,
      orders,
      addToCart,
      removeFromCart,
      clearCart,
      placeOrder,
      getOrderById,
      updateKitchenItemStatus,
    }),
    [cart, orders, addToCart, removeFromCart, clearCart, placeOrder, getOrderById, updateKitchenItemStatus]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
