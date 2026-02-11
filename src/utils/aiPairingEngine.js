import { MENU_ITEMS } from '../data/menu'

const CURATED_PAIRS = {
  pizza: ['caesar-salad', 'truffle-fries'],
  'caesar-salad': ['pizza', 'garlic-butter-shrimp'],
  'garlic-butter-shrimp': ['truffle-fries', 'caesar-salad'],
  'filet-mignon': ['caesar-salad', 'truffle-fries'],
  'truffle-fries': ['filet-mignon', 'pizza'],
}

function buildOrderStats(orders) {
  const coOccurrence = {}
  const popularity = {}

  for (const order of orders ?? []) {
    const ids = [...new Set((order.items ?? []).map((item) => item.itemId).filter(Boolean))]
    ids.forEach((id) => {
      popularity[id] = (popularity[id] ?? 0) + 1
      if (!coOccurrence[id]) coOccurrence[id] = {}
    })
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const a = ids[i]
        const b = ids[j]
        coOccurrence[a][b] = (coOccurrence[a][b] ?? 0) + 1
        coOccurrence[b][a] = (coOccurrence[b][a] ?? 0) + 1
      }
    }
  }

  return { coOccurrence, popularity }
}

export function getAIPairingRecommendations({ cartItemIds = [], orders = [], limit = 3 }) {
  const currentIds = [...new Set(cartItemIds)]
  const menuById = Object.fromEntries(MENU_ITEMS.map((item) => [item.id, item]))
  const { coOccurrence, popularity } = buildOrderStats(orders)
  const scores = {}

  for (const candidate of MENU_ITEMS) {
    if (currentIds.includes(candidate.id)) continue
    let score = 0

    for (const currentId of currentIds) {
      score += (coOccurrence[currentId]?.[candidate.id] ?? 0) * 4
      if (CURATED_PAIRS[currentId]?.includes(candidate.id)) score += 2
    }

    score += (popularity[candidate.id] ?? 0) * 0.35

    if (score > 0) scores[candidate.id] = score
  }

  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([itemId, score]) => ({ ...menuById[itemId], score }))

  // Fallback for low-data history.
  if (!ranked.length) {
    const fallback = currentIds
      .flatMap((id) => CURATED_PAIRS[id] ?? [])
      .filter((id, idx, arr) => arr.indexOf(id) === idx)
      .filter((id) => !currentIds.includes(id))
      .slice(0, limit)
      .map((id) => ({ ...menuById[id], score: 1 }))
    if (fallback.length) return { recommendations: fallback, learnedOrders: orders.length }

    const popularFallback = [...MENU_ITEMS]
      .sort((a, b) => (popularity[b.id] ?? 0) - (popularity[a.id] ?? 0))
      .filter((item) => !currentIds.includes(item.id))
      .slice(0, limit)
      .map((item) => ({ ...item, score: popularity[item.id] ?? 0 }))
    return { recommendations: popularFallback, learnedOrders: orders.length }
  }

  return { recommendations: ranked, learnedOrders: orders.length }
}
