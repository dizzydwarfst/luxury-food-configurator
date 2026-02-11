import { Float } from '@react-three/drei'

const GOLD = '#d4a84b'
const PATTY = '#5c4033'
const CHEESE = '#f0c14b'
const BACON = '#c45c38'
const TOMATO = '#e74c3c'

export default function Burger({ ingredients }) {
  const layerHeight = 0.22
  let y = -0.5

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
        {/* Bottom Bun - Gold Cylinder */}
        <mesh position={[0, y, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.55, 0.2, 32]} />
          <meshStandardMaterial color={GOLD} roughness={0.6} metalness={0.1} />
        </mesh>
        y += layerHeight

        {/* Patty - Brown Cylinder */}
        <mesh position={[0, y, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.48, 0.48, 0.18, 32]} />
          <meshStandardMaterial color={PATTY} roughness={0.8} metalness={0} />
        </mesh>
        y += layerHeight

        {/* Cheese - Yellow Box (Toggleable) */}
        {ingredients.cheese && (
          <>
            <mesh position={[0, y, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.9, 0.08, 0.9]} />
              <meshStandardMaterial color={CHEESE} roughness={0.5} metalness={0} />
            </mesh>
            y += 0.12
          </>
        )}

        {/* Bacon - Red Box (Toggleable) */}
        {ingredients.bacon && (
          <>
            <mesh position={[0, y, 0]} rotation={[0, 0, Math.PI / 12]} castShadow receiveShadow>
              <boxGeometry args={[0.85, 0.06, 0.4]} />
              <meshStandardMaterial color={BACON} roughness={0.7} metalness={0} />
            </mesh>
            y += 0.1
          </>
        )}

        {/* Tomato - Red Sphere (Toggleable) */}
        {ingredients.tomato && (
          <>
            <mesh position={[0, y, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.4, 24, 24]} />
              <meshStandardMaterial color={TOMATO} roughness={0.6} metalness={0} />
            </mesh>
            y += 0.22
          </>
        )}

        {/* Top Bun - Gold Cylinder */}
        <mesh position={[0, y, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.45, 0.2, 32]} />
          <meshStandardMaterial color={GOLD} roughness={0.6} metalness={0.1} />
        </mesh>
      </group>
    </Float>
  )
}
