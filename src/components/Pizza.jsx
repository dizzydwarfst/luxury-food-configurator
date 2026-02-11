/* components/Pizza.jsx */
import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Center, Float } from '@react-three/drei'

const ENTER_DURATION = 0.35
const EXIT_DURATION = 0.7
const EXIT_DISTANCE = 38
const PLATE_NODE_KEY = 'Tarelka001__0'
const PIZZA_NODE_KEY = 'pizza_pizza_0'

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function getExitAxisAndDistance(exitDirection) {
  const dir = exitDirection === 'right' ? 1 : exitDirection === 'left' ? -1 : exitDirection === 'up' ? 1 : exitDirection === 'down' ? -1 : 1
  const axis = exitDirection === 'right' || exitDirection === 'left' ? 'x' : exitDirection === 'up' || exitDirection === 'down' ? 'y' : 'x'
  const distance = (axis === 'x' ? EXIT_DISTANCE : EXIT_DISTANCE * 0.6) * dir
  return { axis, distance }
}

function AnimatedIngredient({ isExiting, exitDirection, onExitComplete, materialRef, children }) {
  const groupRef = useRef(null)
  const exitStartTimeRef = useRef(null)
  const enterStartTimeRef = useRef(null)
  const hasEnteredRef = useRef(false)
  const enterStartPosSetRef = useRef(false)

  const { axis, distance: exitDistance } = getExitAxisAndDistance(exitDirection)
  const enterStartDistance = exitDistance

  useFrame((state) => {
    const clock = state.clock.elapsedTime
    const mat = materialRef?.current

    if (isExiting) {
      if (!groupRef.current) return
      if (exitStartTimeRef.current == null) exitStartTimeRef.current = clock
      const elapsed = clock - exitStartTimeRef.current
      const t = Math.min(elapsed / EXIT_DURATION, 1)
      const eased = easeOutCubic(t)

      groupRef.current.position[axis] = exitDistance * eased
      if (mat) mat.opacity = Math.max(0, 1 - eased)

      if (t >= 1) {
        exitStartTimeRef.current = null
        onExitComplete?.()
      }
      return
    }

    exitStartTimeRef.current = null

    if (!groupRef.current) return

    if (!hasEnteredRef.current) {
      if (enterStartTimeRef.current == null) {
        enterStartTimeRef.current = clock
        if (!enterStartPosSetRef.current) {
          groupRef.current.position[axis] = enterStartDistance
          enterStartPosSetRef.current = true
        }
      }
      const enterElapsed = clock - enterStartTimeRef.current
      const t = Math.min(enterElapsed / ENTER_DURATION, 1)
      const eased = easeOutCubic(t)

      groupRef.current.position[axis] = enterStartDistance + (0 - enterStartDistance) * eased
      if (mat) mat.opacity = eased

      if (t >= 1) {
        hasEnteredRef.current = true
        enterStartTimeRef.current = null
        enterStartPosSetRef.current = false
      }
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {children}
    </group>
  )
}

function useClonedMaterial(source) {
  return useMemo(() => {
    if (!source) return null
    const m = source.clone()
    m.transparent = true
    m.opacity = 0
    return m
  }, [source])
}

function buildNodesFromScene(scene) {
  const flat = {}
  if (!scene) return flat
  scene.traverse((o) => {
    if (!o.isMesh) return
    const key = o.name || (o.parent && o.parent.name)
    if (key) flat[key] = o
  })
  return flat
}

export default function Pizza({ ingredients, groupRef }) {
  const gltf = useGLTF('/pizza.glb')
  const nodes = useMemo(
    () => (gltf.nodes && typeof gltf.nodes === 'object' ? gltf.nodes : buildNodesFromScene(gltf.scene)),
    [gltf.nodes, gltf.scene]
  )
  const plateMaterial = useClonedMaterial(nodes[PLATE_NODE_KEY]?.material)
  const pizzaMaterial = useClonedMaterial(nodes[PIZZA_NODE_KEY]?.material)
  const plateMatRef = useRef(plateMaterial)
  const pizzaMatRef = useRef(pizzaMaterial)
  plateMatRef.current = plateMaterial
  pizzaMatRef.current = pizzaMaterial

  const [exitingPlate, setExitingPlate] = useState(false)
  const [exitingPizza, setExitingPizza] = useState(false)
  const prevPlateRef = useRef(ingredients.plate)
  const prevPizzaRef = useRef(ingredients.pizza)

  useEffect(() => {
    if (ingredients.plate) setExitingPlate(false)
    else if (prevPlateRef.current) setExitingPlate(true)
    prevPlateRef.current = ingredients.plate
  }, [ingredients.plate])

  useEffect(() => {
    if (ingredients.pizza) setExitingPizza(false)
    else if (prevPizzaRef.current) setExitingPizza(true)
    prevPizzaRef.current = ingredients.pizza
  }, [ingredients.pizza])

  const showPlate = ingredients.plate || exitingPlate
  const showPizza = ingredients.pizza || exitingPizza
  const plateExiting = exitingPlate && !ingredients.plate
  const pizzaExiting = exitingPizza && !ingredients.pizza

  return (
    <Center>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group ref={groupRef} dispose={null} scale={0.5} rotation={[-Math.PI / 2, 0, 0]}>

          {/* THE PLATE — exits right */}
          {showPlate && plateMaterial && (
            <AnimatedIngredient
              isExiting={plateExiting}
              exitDirection="right"
              onExitComplete={() => setExitingPlate(false)}
              materialRef={plateMatRef}
            >
              <mesh
                geometry={nodes[PLATE_NODE_KEY].geometry}
                material={plateMaterial}
              />
            </AnimatedIngredient>
          )}

          {/* THE PIZZA — exits left */}
          {showPizza && pizzaMaterial && (
            <AnimatedIngredient
              isExiting={pizzaExiting}
              exitDirection="left"
              onExitComplete={() => setExitingPizza(false)}
              materialRef={pizzaMatRef}
            >
              <mesh
                geometry={nodes[PIZZA_NODE_KEY].geometry}
                material={pizzaMaterial}
              />
            </AnimatedIngredient>
          )}

        </group>
      </Float>
    </Center>
  )
}

useGLTF.preload('/pizza.glb')
