import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Sparkles, TrendingUp } from 'lucide-react'
import { getAIPairingRecommendations } from '../utils/aiPairingEngine'

export default function AIPairingBot({ cart = [], orders = [] }) {
  const cartItemIds = useMemo(
    () => [...new Set(cart.map((item) => item.itemId))],
    [cart]
  )

  const { recommendations, learnedOrders } = useMemo(
    () => getAIPairingRecommendations({ cartItemIds, orders, limit: 3 }),
    [cartItemIds, orders]
  )

  const hasCart = cartItemIds.length > 0
  const title = hasCart
    ? 'AI Pairing Bot'
    : 'AI Menu Assistant'

  const subtitle = hasCart
    ? 'Based on current cart + previous customer behavior, these pair best.'
    : 'No items in cart yet. Based on customer behavior, these are popular pairings.'

  return (
    <section className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm mb-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center">
          <Bot className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-neutral-900">{title}</h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500 tabular-nums">
              <TrendingUp className="h-3.5 w-3.5" />
              learned from {learnedOrders} orders
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {recommendations.map((item) => (
          <Link
            key={item.id}
            to={`/configurator/${item.id}`}
            className="rounded-xl border border-neutral-200/80 px-3 py-2 hover:border-neutral-300 hover:shadow-sm transition-all"
          >
            <p className="font-medium text-sm text-neutral-900 line-clamp-2">{item.name}</p>
            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Pairing score {item.score.toFixed(1)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
