'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { InteractiveObject } from './InteractiveObject'
import { OBJECT_POSITIONS } from '@/lib/constants'

const POS = OBJECT_POSITIONS.desk

/**
 * Open notebook + pen — the "about" object. Sits centre-desk as the personal,
 * storytelling prop. (The desk furniture itself is static, in DeskFurniture.)
 */
export function Desk() {
  const coverMat = useRef<THREE.MeshStandardMaterial>(null)

  return (
    <InteractiveObject id="desk" overlayId="about" position={[...POS]} materialRef={coverMat}>
      <group rotation={[0, 0.18, 0]} position={[0, 0.012, 0]}>
        {/* Cover */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.18, 0.02, 0.24]} />
          <meshStandardMaterial
            ref={coverMat}
            color="#37598c"
            roughness={0.7}
            metalness={0.05}
            emissive={'#5b8cff'}
            emissiveIntensity={0}
          />
        </mesh>
        {/* Paper */}
        <mesh position={[0, 0.012, 0]}>
          <boxGeometry args={[0.165, 0.006, 0.225]} />
          <meshStandardMaterial color="#f6f3ec" roughness={0.9} metalness={0} />
        </mesh>
        {/* Pen */}
        <mesh castShadow position={[0.11, 0.006, 0.02]} rotation={[0, 0.5, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.16, 12]} />
          <meshStandardMaterial color="#1d1f24" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </InteractiveObject>
  )
}
