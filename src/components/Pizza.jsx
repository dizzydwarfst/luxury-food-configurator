/* components/Pizza.jsx */
import React, { useRef, useState, useEffect } from 'react'
import { useGLTF, Center, Float } from '@react-three/drei'

export default function Pizza({ ingredients, groupRef }) {
  // Load the specific pizza file
  const { nodes, materials } = useGLTF('/pizza.glb')

  // Debug: Keep this for now to be safe
  console.log("3D Nodes:", nodes)

  return (
    <Center>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* 1. scale={0.5} -> Shrinks the Godzilla Pizza
            2. rotation={[Math.PI / 2, 0, 0]} -> Rotates it 90 degrees on X-axis
               (If it's upside down, try -Math.PI / 2)
        */}
        <group ref={groupRef} dispose={null} scale={0.5} rotation={[-Math.PI / 2, 0, 0]}>

          {/* THE PLATE */}
          {ingredients.plate && (
            <mesh
              geometry={nodes.Tarelka001__0.geometry}
              material={nodes.Tarelka001__0.material}
            />
          )}

          {/* THE PIZZA */}
          {ingredients.pizza && (
            <mesh
              geometry={nodes.pizza_pizza_0.geometry}
              material={nodes.pizza_pizza_0.material}
            />
          )}

        </group>
      </Float>
    </Center>
  )
}

useGLTF.preload('/pizza.glb')
