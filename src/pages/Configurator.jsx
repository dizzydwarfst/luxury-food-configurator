import { useRef, useState, useCallback, Suspense, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { getMenuItem, calculateVariantID } from '../data/menu'
import { useCart } from '../context/CartContext'
import Pizza from '../components/Pizza'
import PlaceholderDish from '../components/PlaceholderDish'
import UIControls from '../components/UIControls'

function buildInitialIngredients(ingredients) {
  if (!ingredients || !ingredients.length) return {}
  return ingredients.reduce((acc, ing) => ({ ...acc, [ing.id]: ing.id === 'pizza' || ing.id === 'plate' }), {})
}

export default function Configurator() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const pizzaGroupRef = useRef(null)
  const [arLoading, setArLoading] = useState(false)

  const menuItem = useMemo(() => getMenuItem(itemId), [itemId])

  const defaultIngredients = useMemo(() => {
    if (!menuItem?.ingredients) return { plate: true, pizza: true, steam: false }
    return buildInitialIngredients(menuItem.ingredients)
  }, [menuItem])

  const [ingredients, setIngredients] = useState(defaultIngredients)

  useEffect(() => {
    setIngredients(buildInitialIngredients(menuItem?.ingredients ?? []))
  }, [itemId])

  const variantId = useMemo(() => {
    if (!menuItem) return null
    return calculateVariantID(menuItem.baseId, ingredients, menuItem.ingredients)
  }, [menuItem, ingredients])

  const handleViewInAR = useCallback(() => {
    setArLoading(true)
    const delay = 1500
    const runExport = () => {
      const group = pizzaGroupRef.current
      if (!group) {
        setArLoading(false)
        return
      }
      const clone = group.clone(true)
      const exporter = new GLTFExporter()
      exporter.parse(
        clone,
        (result) => {
          const blob = new Blob([result], { type: 'model/gltf-binary' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${itemId || 'dish'}-ar.glb`
          a.rel = 'ar'
          a.click()
          URL.revokeObjectURL(url)
          setArLoading(false)
        },
        () => setArLoading(false),
        { binary: true }
      )
    }
    setTimeout(runExport, delay)
  }, [itemId])

  const handleAddToOrder = useCallback(() => {
    if (!menuItem) return
    addToCart(menuItem, ingredients, variantId ?? menuItem.baseId)
    navigate('/cart')
  }, [menuItem, ingredients, variantId, addToCart, navigate])

  if (!menuItem) {
    return (
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-[#F5F5F7]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-neutral-500">Item not found.</p>
      </motion.div>
    )
  }

  const isPizza = menuItem.modelType === 'pizza'
  const ingredientOptions = menuItem.ingredients ?? []

  return (
    <motion.div
      className="fixed inset-0"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="fixed inset-0" style={{ backgroundColor: '#F5F5F7' }} aria-hidden />
      <Canvas
        className="fixed inset-0 z-0"
        camera={{ position: [0, 10, 48], fov: 38 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor('#F5F5F7')}
        dpr={[1, 2]}
      >
        <OrbitControls
          makeDefault
          enablePan={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.75}
        />
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <Environment preset="studio" />
        <Suspense fallback={null}>
          {isPizza ? (
            <Pizza ingredients={ingredients} groupRef={pizzaGroupRef} />
          ) : (
            <PlaceholderDish
              shape={menuItem.placeholderShape ?? 'sphere'}
              ingredients={ingredients}
            />
          )}
        </Suspense>
      </Canvas>

      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div
          className="px-6 py-3 rounded-full text-neutral-800 font-semibold text-lg shadow-lg min-h-[48px] flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          {menuItem.name}
        </div>
      </header>

      <UIControls
        ingredients={ingredients}
        setIngredients={setIngredients}
        ingredientOptions={ingredientOptions}
        onAddToOrder={handleAddToOrder}
        onViewInAR={handleViewInAR}
        arLoading={arLoading}
        variantId={variantId}
        showArButton={isPizza}
      />
    </motion.div>
  )
}
