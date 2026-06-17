import { useRef } from 'react'
import * as THREE from 'three'
import { InteractiveObject } from './InteractiveObject'
import { OBJECT_POSITIONS } from '@/lib/constants'

/**
 * Phone — triggers the Contact overlay on double-click.
 * Placeholder geometry: flat slab with screen face.
 */
export function Phone() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const [px, py, pz] = OBJECT_POSITIONS.phone

  return (
    <InteractiveObject
      id="phone"
      overlayId="contact"
      position={[px, py, pz]}
      materialRef={matRef}
    >
      {/* Phone body */}
      <mesh castShadow position={[0, 0, 0]} rotation={[0, 0, Math.PI * 0.05]}>
        <boxGeometry args={[0.18, 0.37, 0.016]} />
        <meshStandardMaterial
          ref={matRef}
          color="#1a1a2a"
          emissive="#3355aa"
          emissiveIntensity={0}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Screen */}
      <mesh position={[0, 0.005, 0.009]} rotation={[0, 0, Math.PI * 0.05]}>
        <planeGeometry args={[0.16, 0.33]} />
        <meshStandardMaterial
          color="#050515"
          emissive="#1133aa"
          emissiveIntensity={0.35}
          transparent
          opacity={0.98}
        />
      </mesh>

      {/* Home indicator bar */}
      <mesh position={[0, -0.14, 0.01]} rotation={[0, 0, Math.PI * 0.05]}>
        <boxGeometry args={[0.06, 0.005, 0.002]} />
        <meshStandardMaterial color="#555577" />
      </mesh>
    </InteractiveObject>
  )
}
