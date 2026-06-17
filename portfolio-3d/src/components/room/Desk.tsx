import { useRef } from 'react'
import * as THREE from 'three'
import { InteractiveObject } from './InteractiveObject'
import { OBJECT_POSITIONS } from '@/lib/constants'

/**
 * Desk — triggers the About Me camera pan on double-click.
 * Placeholder geometry: tabletop + four legs.
 */
export function Desk() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const [px, py, pz] = OBJECT_POSITIONS.desk

  return (
    <InteractiveObject
      id="desk"
      overlayId="about"
      position={[px, py, pz]}
      materialRef={matRef}
    >
      {/* Tabletop */}
      <mesh castShadow receiveShadow position={[0, 0.76, 0]}>
        <boxGeometry args={[3.2, 0.06, 1.6]} />
        <meshStandardMaterial
          ref={matRef}
          color="#3d2b1f"
          emissive="#8b5e3c"
          emissiveIntensity={0}
          roughness={0.6}
          metalness={0.05}
        />
      </mesh>

      {/* Legs ×4 */}
      {([[-1.5, -0.7], [1.5, -0.7], [-1.5, 0.7], [1.5, 0.7]] as [number, number][]).map(
        ([x, z], i) => (
          <mesh key={i} castShadow position={[x, 0.37, z]}>
            <boxGeometry args={[0.08, 0.74, 0.08]} />
            <meshStandardMaterial color="#2a1f15" roughness={0.7} metalness={0.05} />
          </mesh>
        )
      )}

      {/* Keyboard (flat slab on desk) */}
      <mesh castShadow position={[0, 0.8, 0.3]}>
        <boxGeometry args={[0.8, 0.02, 0.28]} />
        <meshStandardMaterial color="#1a1a28" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Mouse pad */}
      <mesh receiveShadow position={[0.6, 0.79, 0.3]}>
        <boxGeometry args={[0.3, 0.005, 0.24]} />
        <meshStandardMaterial color="#111120" roughness={0.9} />
      </mesh>
    </InteractiveObject>
  )
}
