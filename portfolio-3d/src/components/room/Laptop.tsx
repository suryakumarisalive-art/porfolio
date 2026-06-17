import { useRef } from 'react'
import * as THREE from 'three'
import { InteractiveObject } from './InteractiveObject'
import { OBJECT_POSITIONS } from '@/lib/constants'

/**
 * Laptop — triggers the Resume overlay on double-click.
 * Placeholder geometry: base + lid (partially open).
 */
export function Laptop() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const [px, py, pz] = OBJECT_POSITIONS.laptop

  return (
    <InteractiveObject
      id="laptop"
      overlayId="resume"
      position={[px, py, pz]}
      materialRef={matRef}
    >
      {/* Base / keyboard deck */}
      <mesh castShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.9, 0.04, 0.62]} />
        <meshStandardMaterial
          ref={matRef}
          color="#1e1e2e"
          emissive="#4466aa"
          emissiveIntensity={0}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Screen lid — rotated ~60° open */}
      <group position={[0, 0.04, -0.28]} rotation={[-Math.PI * 0.35, 0, 0]}>
        <mesh castShadow position={[0, 0.2, 0]}>
          <boxGeometry args={[0.88, 0.56, 0.025]} />
          <meshStandardMaterial color="#18182a" roughness={0.15} metalness={0.85} />
        </mesh>
        {/* Screen surface glow */}
        <mesh position={[0, 0.2, 0.014]}>
          <planeGeometry args={[0.82, 0.5]} />
          <meshStandardMaterial
            color="#0a0a1e"
            emissive="#224499"
            emissiveIntensity={0.4}
            transparent
            opacity={0.95}
          />
        </mesh>
      </group>
    </InteractiveObject>
  )
}
