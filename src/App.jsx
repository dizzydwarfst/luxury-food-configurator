import { Component } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { CartProvider } from './context/CartContext'
import Welcome from './pages/Welcome'
import Menu from './pages/Menu'
import Configurator from './pages/Configurator'
import Cart from './pages/Cart'
import OrderSuccess from './pages/OrderSuccess'
import Kitchen from './pages/Kitchen'

class ErrorBoundary extends Component {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#171717', color: '#fff', minHeight: '100vh' }}>
          <h1>Something went wrong</h1>
          <p>Check the browser console for details.</p>
        </div>
      )
    }
    return this.props.children
  }
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Welcome />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/configurator/:itemId" element={<Configurator />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />
        <Route path="/kitchen" element={<Kitchen />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CartProvider>
          <AnimatedRoutes />
        </CartProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
