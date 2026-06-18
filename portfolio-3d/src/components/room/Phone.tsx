'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { InteractiveObject } from './InteractiveObject'
import { OBJECT_POSITIONS } from '@/lib/constants'

const POS = OBJECT_POSITIONS.phone

/**
 * Smartphone lying flat on the desk — contact overlay.
 */
export function Phone() {
  const bodyMat = useRef<THREE.MeshStandardMaterial>(null)

  return (
    <InteractiveObject id="phone" overlayId="contact" position={[...POS]} materialRef={bodyMat}>
      <group rotation={[0, 0.35, 0]}>
        {/* Body */}
        <mesh castShadow receiveShadow position={[0, -0.028, 0]}>
          <boxGeometry args={[0.072, 0.008, 0.15]} />
          <meshStandardMaterial
            ref={bodyMat}
            color="#23262d"
            roughness={0.3}
            metalness={0.6}
            emissive={'#5b8cff'}
            emissiveIntensity={0}
          />
        </mesh>
        {/* Glass screen — faces up */}
        <mesh position={[0, -0.0235, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.062, 0.135]} />
          <meshPhysicalMaterial
            color="#0a0d14"
            roughness={0.08}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>
      </group>
    </InteractiveObject>
  )
}
