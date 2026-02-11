import { Center, Float } from '@react-three/drei'

/**
 * Generic placeholder 3D shape when no real model exists.
 * shape: 'sphere' | 'cylinder'
 */
export default function PlaceholderDish({ shape = 'sphere', ingredients }) {
  return (
    <Center>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
        <group scale={0.8}>
          {shape === 'sphere' && (
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color="#2d5016" roughness={0.7} metalness={0} />
            </mesh>
          )}
          {shape === 'cylinder' && (
            <mesh>
              <cylinderGeometry args={[0.35, 0.35, 0.8, 32]} />
              <meshStandardMaterial color="#0d5c2e" roughness={0.5} metalness={0.1} />
            </mesh>
          )}
        </group>
      </Float>
    </Center>
  )
}
