import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock3, UtensilsCrossed } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { getMenuItem, getStationName } from '../data/menu'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function OrderSuccess() {
  const { orderId } = useParams()
  const { getOrderById } = useCart()
  const order = getOrderById(orderId)

  if (!order) {
    return (
      <motion.div
        className="min-h-screen text-neutral-900 px-6 py-12"
        style={{ backgroundColor: '#F5F5F7' }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-neutral-200/80 p-6">
          <h1 className="text-2xl font-semibold mb-2">Order not found</h1>
          <p className="text-neutral-500 mb-6">We could not find that order in this browser session.</p>
          <Link to="/menu" className="inline-flex items-center min-h-[44px] px-5 rounded-full bg-neutral-900 text-white">
            Back to Menu
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="min-h-screen text-neutral-900 px-6 py-12"
      style={{ backgroundColor: '#F5F5F7' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 mt-0.5" strokeWidth={2.2} />
            <div>
              <h1 className="text-2xl font-semibold">Order successful</h1>
              <p className="text-neutral-500 mt-1">
                Your order has been sent to the kitchen stations.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-neutral-500">Order ID</p>
              <p className="font-medium tabular-nums">{order.orderId}</p>
            </div>
            <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-neutral-500">Estimated time</p>
              <p className="font-medium flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-neutral-500" />
                {order.etaMinutes} min
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-neutral-500">Ready around</p>
              <p className="font-medium tabular-nums">{formatTime(order.etaReadyAt)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-neutral-600" />
            Order details
          </h2>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => {
              const menuItem = getMenuItem(item.itemId)
              const activeIngredients = menuItem?.ingredients
                ?.filter((ing) => item.activeIngredients?.[ing.id])
                .map((ing) => ing.name) ?? []
              return (
                <div key={item.cartItemId} className="rounded-xl border border-neutral-200/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-neutral-500">Station: {getStationName(item.stationId)}</p>
                      <p className="text-sm text-neutral-500">
                        Ingredients: {activeIngredients.length ? activeIngredients.join(', ') : '—'}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-400 tabular-nums">#{item.variantId}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/menu" className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-full bg-neutral-900 text-white">
            Continue browsing
          </Link>
          <Link to="/kitchen" className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-full border border-neutral-300 text-neutral-700 bg-white">
            Kitchen screen
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
