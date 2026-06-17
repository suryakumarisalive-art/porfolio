import { useRef } from 'react'
import * as THREE from 'three'
import { InteractiveObject } from './InteractiveObject'
import { OBJECT_POSITIONS } from '@/lib/constants'

/**
 * Monitor — triggers the Projects overlay on double-click.
 * Placeholder geometry: dark panel (screen) + base stand.
 * Swap for a GLTF by using useGLTFLoader() and replacing the primitives.
 */
export function Monitor() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const [px, py, pz] = OBJECT_POSITIONS.monitor

  return (
    <InteractiveObject
      id="monitor"
      overlayId="projects"
      position={[px, py, pz]}
      materialRef={matRef}
    >
      {/* Screen panel */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[1.6, 1.0, 0.06]} />
        <meshStandardMaterial
          ref={matRef}
          color="#0d0d1a"
          emissive="#3366ff"
          emissiveIntensity={0}
          roughness={0.1}
          metalness={0.7}
        />
      </mesh>

      {/* Screen bezel */}
      <mesh castShadow position={[0, 0.3, -0.04]}>
        <boxGeometry args={[1.72, 1.12, 0.04]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Stand neck */}
      <mesh castShadow position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Stand base */}
      <mesh castShadow position={[0, -0.62, 0]}>
        <cylinderGeometry args={[0.32, 0.36, 0.06, 16]} />
        <meshStandardMaterial color="#1e1e2e" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Simulated screen glow plane */}
      <mesh position={[0, 0.3, 0.035]}>
        <planeGeometry args={[1.52, 0.92]} />
        <meshStandardMaterial
          color="#0a0a2e"
          emissive="#2244cc"
          emissiveIntensity={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
    </InteractiveObject>
  )
}
