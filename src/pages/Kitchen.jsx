import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock3, ChefHat } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { STATIONS } from '../data/menu'

const STATION_PREP_MINUTES = {
  'pan-fry': 10,
  apps: 7,
  entree: 14,
  salads: 6,
  ovens: 12,
}

export default function Kitchen() {
  const { orders, updateKitchenItemStatus } = useCart()
  const [nowMs, setNowMs] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const stationOrder = ['ovens', 'salads', 'pan-fry', 'entree', 'apps']
  const kitchenStations = useMemo(() => {
    const stationMap = Object.fromEntries(STATIONS.map((station) => [station.id, station]))
    return stationOrder.map((id) => stationMap[id]).filter(Boolean)
  }, [])

  const stationItemsMap = useMemo(() => {
    const map = Object.fromEntries(kitchenStations.map((station) => [station.id, []]))
    const ordered = [...orders].sort(
      (a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime()
    )
    ordered.forEach((order) => {
      order.items.forEach((item) => {
        if (item.stationId === 'drinks-bar') return
        const prepMinutes = STATION_PREP_MINUTES[item.stationId] ?? 10
        const placedAtMs = new Date(order.placedAt).getTime()
        const readyAtMs = placedAtMs + prepMinutes * 60 * 1000
        if (!map[item.stationId]) map[item.stationId] = []
        map[item.stationId].push({
          ...item,
          orderId: order.orderId,
          placedAt: order.placedAt,
          prepMinutes,
          readyAtMs,
          arrivedAtMs: new Date(item.arrivedAt ?? order.placedAt).getTime(),
          cookStartedAtMs: item.cookStartedAt ? new Date(item.cookStartedAt).getTime() : null,
          bumpedAtMs: item.bumpedAt ? new Date(item.bumpedAt).getTime() : null,
        })
      })
    })
    return map
  }, [orders, kitchenStations])

  const hasKitchenItems = kitchenStations.some(
    (station) => (stationItemsMap[station.id]?.length ?? 0) > 0
  )

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const formatDuration = (ms) => {
    const diff = Math.max(0, ms)
    const totalSeconds = Math.floor(diff / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const formatRemaining = (readyAtMs) => {
    const diff = readyAtMs - nowMs
    if (diff <= 0) return 'Ready'
    return formatDuration(diff)
  }

  const getStatusStyle = (status) => {
    if (status === 'cooking') return 'bg-orange-50 border-orange-200'
    if (status === 'bumped') return 'bg-emerald-50 border-emerald-200'
    return 'bg-white border-neutral-200/80'
  }

  const getStatusBadgeStyle = (status) => {
    if (status === 'cooking') return 'bg-orange-100 text-orange-700'
    if (status === 'bumped') return 'bg-emerald-100 text-emerald-700'
    return 'bg-neutral-100 text-neutral-600'
  }

  return (
    <motion.div
      className="min-h-screen text-neutral-900 px-6 py-12"
      style={{ backgroundColor: '#F5F5F7' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-neutral-700" />
            <h1 className="text-2xl font-semibold">Kitchen Orders</h1>
          </div>
          <Link to="/menu" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
            Back to Menu
          </Link>
        </div>

        {!hasKitchenItems ? (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6">
            <p className="text-neutral-500">No kitchen orders yet.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-300/80 bg-white/90 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5">
            {kitchenStations.map((station) => {
              const items = stationItemsMap[station.id] ?? []
              return (
                  <section key={station.id} className="min-h-[520px] border-b md:border-b-0 md:border-r border-neutral-200/80 last:border-r-0 p-4 overflow-hidden">
                    <div className="mb-3">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      {station.name}
                    </h2>
                  </div>

                  {items.length === 0 ? (
                      <p className="text-sm text-neutral-400">No orders in this station.</p>
                  ) : (
                      <div className="space-y-3">
                      {items.map((item) => {
                        const countdown = formatRemaining(item.readyAtMs)
                        const isReady = countdown === 'Ready'
                        const status = item.kitchenStatus ?? 'queued'
                        const timeToStartCookMs = (item.cookStartedAtMs ?? nowMs) - item.arrivedAtMs
                        const activeCookingEndMs = item.bumpedAtMs ?? nowMs
                        const cookingElapsedMs = item.cookStartedAtMs
                          ? activeCookingEndMs - item.cookStartedAtMs
                          : 0
                        return (
                            <div key={item.cartItemId} className={`rounded-xl border p-3 overflow-hidden ${getStatusStyle(status)}`}>
                              <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                  <p className="font-medium break-words">{item.name}</p>
                                  <p className="text-xs text-neutral-500 tabular-nums break-all">Order: {item.orderId}</p>
                                  <p className="text-xs text-neutral-500 tabular-nums">Arrived: {formatTime(item.placedAt)} · Prep: {item.prepMinutes}m</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeStyle(status)}`}>
                                    {status === 'queued' ? 'Queued' : status === 'cooking' ? 'Cooking' : 'Bumped'}
                              </span>
                                  <p className="mt-1 text-[11px] text-neutral-400 tabular-nums">#{item.variantId}</p>
                                </div>
                            </div>
                              <div className="mt-3 space-y-1.5">
                                <p className="text-xs text-neutral-600 flex items-center gap-1.5">
                                  <Clock3 className="h-3.5 w-3.5" />
                                  Station ETA: <span className={isReady ? 'text-emerald-700 font-medium' : 'font-medium tabular-nums'}>{countdown}</span>
                                </p>
                                {status !== 'queued' && (
                                  <p className="text-xs text-neutral-600">
                                    Wait to cook: <span className="font-medium tabular-nums">{formatDuration(timeToStartCookMs)}</span>
                                  </p>
                                )}
                                {status !== 'queued' && (
                                  <p className="text-xs text-neutral-600">
                                    Cook time: <span className="font-medium tabular-nums">{formatDuration(cookingElapsedMs)}</span>
                                  </p>
                                )}
                              </div>
                              <div className="mt-3 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateKitchenItemStatus(item.orderId, item.cartItemId, 'cooking')}
                                  disabled={status !== 'queued'}
                                  className="flex-1 min-h-[34px] rounded-full text-xs font-medium bg-orange-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  Cook
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateKitchenItemStatus(item.orderId, item.cartItemId, 'bumped')}
                                  disabled={status === 'bumped'}
                                  className="flex-1 min-h-[34px] rounded-full text-xs font-medium bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  Bump
                                </button>
                              </div>
                            </div>
                        )
                      })}
                      </div>
                  )}
                </section>
              )
            })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
