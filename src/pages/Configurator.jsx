import { useRef, useState, useCallback, Suspense, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js'
import { Sun, ArrowLeft, X } from 'lucide-react'
import { getMenuItem, calculateVariantID } from '../data/menu'
import { useCart } from '../context/CartContext'
import Pizza from '../components/Pizza'
import PlaceholderDish from '../components/PlaceholderDish'
import UIControls from '../components/UIControls'

const LIGHT_MIN = 0.15
const LIGHT_MAX = 2
const LIGHT_DEFAULT = 0.55
const GLASS_STYLE = {
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.5)',
}

function SceneLights({ intensity }) {
  const value = Math.max(LIGHT_MIN, Math.min(LIGHT_MAX, intensity))
  return (
    <>
      <ambientLight intensity={value * 0.5} />
      <directionalLight position={[5, 5, 5]} intensity={value * 0.7} />
      <Environment preset="studio" environmentIntensity={0.4} />
    </>
  )
}

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
  const [arStatusText, setArStatusText] = useState('Generating AR Model...')
  const [arHintText, setArHintText] = useState('')
  const [arDebugText, setArDebugText] = useState('')
  const [arOverlayOpen, setArOverlayOpen] = useState(false)
  const [arGlbUrl, setArGlbUrl] = useState('')
  const [arUsdzUrl, setArUsdzUrl] = useState(null)

  const menuItem = useMemo(() => getMenuItem(itemId), [itemId])
  const [ingredients, setIngredients] = useState(() => buildInitialIngredients(menuItem?.ingredients ?? []))
  const [lightIntensity, setLightIntensity] = useState(LIGHT_DEFAULT)

  useEffect(() => {
    setIngredients(buildInitialIngredients(menuItem?.ingredients ?? []))
  }, [menuItem?.ingredients])

  const variantId = useMemo(() => {
    if (!menuItem) return null
    return calculateVariantID(menuItem.baseId, ingredients, menuItem.ingredients)
  }, [menuItem, ingredients])

  const arDebugEnabled =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('arDebug') === '1'

  const logAr = useCallback((bucket, detail = '') => {
    const line = detail ? `${bucket}:${detail}` : bucket
    if (arDebugEnabled) {
      setArDebugText(line)
      console.info('[AR]', line)
    }
  }, [arDebugEnabled])

  const exportCurrentModelAsGlb = useCallback(async () => {
    const group = pizzaGroupRef.current
    if (!group) return null
    const clone = group.clone(true)
    const exporter = new GLTFExporter()
    const result = await new Promise((resolve, reject) => {
      exporter.parse(
        clone,
        (parsed) => resolve(parsed),
        (error) => reject(error),
        { binary: true }
      )
    })
    return new Blob([result], { type: 'model/gltf-binary' })
  }, [])

  const exportCurrentModelAsUsdz = useCallback(async () => {
    const group = pizzaGroupRef.current
    if (!group) return null
    const clone = group.clone(true)
    const exporter = new USDZExporter()
    try {
      const arrayBuffer = await exporter.parse(clone)
      const blob = new Blob([arrayBuffer], { type: 'model/vnd.usdz+zip' })
      return URL.createObjectURL(blob)
    } catch (error) {
      console.warn('Failed to export USDZ.', error)
      return null
    }
  }, [])

  const closeAROverlay = useCallback(() => {
    if (arGlbUrl) URL.revokeObjectURL(arGlbUrl)
    if (arUsdzUrl) URL.revokeObjectURL(arUsdzUrl)
    setArOverlayOpen(false)
    setArGlbUrl('')
    setArUsdzUrl(null)
  }, [arGlbUrl, arUsdzUrl])

  const handleViewInAR = useCallback(async () => {
    setArStatusText('Preparing AR…')
    setArHintText('')
    if (arDebugEnabled) setArDebugText('')
    setArLoading(true)
    try {
      const glbBlob = await exportCurrentModelAsGlb()
      if (!glbBlob) {
        setArHintText('Could not export model.')
        setArLoading(false)
        return
      }
      const glbUrl = URL.createObjectURL(glbBlob)
      let usdzUrl = null
      if (menuItem?.modelType === 'pizza') {
        usdzUrl = await exportCurrentModelAsUsdz()
      }
      setArGlbUrl(glbUrl)
      setArUsdzUrl(usdzUrl)
      setArOverlayOpen(true)
      logAr('model_viewer_overlay_open')
    } catch (err) {
      logAr('model_viewer_export_failed', err?.message ?? String(err))
      setArHintText('Failed to prepare AR.')
    } finally {
      setArLoading(false)
    }
  }, [arDebugEnabled, exportCurrentModelAsGlb, exportCurrentModelAsUsdz, logAr, menuItem])

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
        <SceneLights intensity={lightIntensity} />
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

      {/* AR overlay: model-viewer with universal AR button */}
      {arOverlayOpen && arGlbUrl && (
        <div className="ar-overlay">
          <button
            type="button"
            onClick={closeAROverlay}
            className="ar-overlay-close"
            aria-label="Close AR"
          >
            <X className="h-6 w-6" strokeWidth={2} />
          </button>
          <model-viewer
            src={arGlbUrl}
            ios-src={arUsdzUrl || undefined}
            alt={menuItem?.name ?? 'AR Model'}
            ar
            ar-modes="scene-viewer quick-look webxr"
            ar-scale="auto"
            ar-placement="floor"
            camera-controls
            loading="eager"
            reveal="auto"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <button type="button" slot="ar-button">
              View in AR
            </button>
          </model-viewer>
        </div>
      )}

      {/* Back to menu button */}
      <button
        type="button"
        onClick={() => navigate('/menu')}
        className="fixed top-6 left-4 z-10 flex items-center gap-2 min-h-[48px] px-4 rounded-full font-medium text-neutral-800 shadow-lg active:scale-[0.98] transition-transform touch-manipulation"
        style={GLASS_STYLE}
        aria-label="Back to menu"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        <span className="hidden sm:inline">Menu</span>
      </button>

      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div
          className="px-6 py-3 rounded-full text-neutral-800 font-semibold text-lg shadow-lg min-h-[48px] flex items-center justify-center"
          style={GLASS_STYLE}
        >
          {menuItem.name}
        </div>
      </header>

      {/* Left panel: viewer light slider */}
      <div
        className="fixed left-4 top-1/2 z-10 -translate-y-1/2 flex flex-col items-center gap-3 py-4 px-3 rounded-2xl min-w-[72px]"
        style={{
          ...GLASS_STYLE,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        <label htmlFor="viewer-light" className="flex flex-col items-center gap-1.5 text-neutral-700" title="Viewer light">
          <Sun className="h-5 w-5 text-amber-500" aria-hidden />
          <span className="text-[10px] font-medium uppercase tracking-wider">Light</span>
        </label>
        <input
          id="viewer-light"
          type="range"
          min={LIGHT_MIN}
          max={LIGHT_MAX}
          step={0.1}
          value={lightIntensity}
          onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
          className="w-full max-w-[120px] h-2 rounded-full appearance-none bg-neutral-200 accent-amber-500 cursor-pointer touch-manipulation"
          aria-label="Adjust 3D viewer light"
        />
        <span className="text-[10px] tabular-nums text-neutral-500">
          {Math.round(((lightIntensity - LIGHT_MIN) / (LIGHT_MAX - LIGHT_MIN)) * 100)}%
        </span>
      </div>

      <UIControls
        ingredients={ingredients}
        setIngredients={setIngredients}
        ingredientOptions={ingredientOptions}
        onAddToOrder={handleAddToOrder}
        onViewInAR={handleViewInAR}
        arLoading={arLoading}
        arStatusText={arStatusText}
        arHintText={arHintText}
        arDebugText={arDebugText}
        variantId={variantId}
        showArButton={isPizza}
      />
    </motion.div>
  )
}
