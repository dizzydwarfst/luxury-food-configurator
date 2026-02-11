import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { STATIONS, getItemsByStation } from '../data/menu'

const STATION_EMOJI = {
  'pan-fry': '🍳',
  'apps': '🥗',
  'entree': '🍽️',
  'salads': '🥬',
  'ovens': '🍕',
  'drinks-bar': '🍸',
}

export default function Menu() {
  return (
    <motion.div
      className="min-h-screen text-neutral-900 px-6 py-12"
      style={{ backgroundColor: '#F5F5F7' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Menu</h1>
          <Link
            to="/cart"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            Cart →
          </Link>
        </div>

        <div className="space-y-10">
          {STATIONS.map((station, stationIndex) => {
            const items = getItemsByStation(station.id)
            if (items.length === 0) return null
            return (
              <motion.section
                key={station.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stationIndex * 0.06, duration: 0.3 }}
              >
                <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-2">
                  <span>{STATION_EMOJI[station.id] ?? '•'}</span>
                  {station.name}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      to={`/configurator/${item.id}`}
                      className="block px-5 py-4 rounded-2xl bg-white shadow-sm border border-neutral-200/80 hover:border-neutral-300 hover:shadow-md transition-all"
                    >
                      <span className="font-medium text-neutral-900">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
