import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Welcome() {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center text-white px-6"
      style={{ backgroundColor: '#171717' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <motion.h1
        className="text-5xl md:text-7xl font-light tracking-tight text-center mb-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        Gourmet AR
      </motion.h1>
      <motion.p
        className="text-neutral-400 text-lg md:text-xl text-center max-w-md mb-12"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        Visualize before you order.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        <Link
          to="/menu"
          className="inline-flex items-center justify-center min-h-[56px] px-10 rounded-full bg-white text-black font-medium text-lg hover:bg-neutral-200 transition-colors"
          style={{ minHeight: 56, paddingLeft: 40, paddingRight: 40, borderRadius: 9999, backgroundColor: '#fff', color: '#000' }}
        >
          Start Experience
        </Link>
      </motion.div>
    </motion.div>
  )
}
