'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { InteractiveObject } from './InteractiveObject'
import { OBJECT_POSITIONS } from '@/lib/constants'

const POS = OBJECT_POSITIONS.laptop

/**
 * Open laptop — resume overlay. Aluminium unibody with a softly lit screen.
 * Authored in local coords; base bottom rests on the desk surface.
 */
export function Laptop() {
  const lidMat = useRef<THREE.MeshStandardMaterial>(null)

  return (
    <InteractiveObject id="laptop" overlayId="resume" position={[...POS]} materialRef={lidMat}>
      <group rotation={[0, -0.5, 0]}>
        {/* Base / keyboard deck */}
        <mesh castShadow receiveShadow position={[0, -0.03, 0]}>
          <boxGeometry args={[0.33, 0.014, 0.23]} />
          <meshStandardMaterial color="#b8bcc4" roughness={0.35} metalness={0.85} />
        </mesh>
        {/* Keyboard inset */}
        <mesh position={[0, -0.022, 0.02]}>
          <boxGeometry args={[0.29, 0.002, 0.16]} />
          <meshStandardMaterial color="#1c1e22" roughness={0.6} metalness={0.2} />
        </mesh>
        {/* Trackpad */}
        <mesh position={[0, -0.022, 0.085]}>
          <boxGeometry args={[0.10, 0.002, 0.05]} />
          <meshStandardMaterial color="#2a2d33" roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Lid (hinged back) */}
        <group position={[0, -0.035, -0.11]} rotation={[-1.78, 0, 0]}>
          <mesh castShadow position={[0, 0.11, 0]}>
            <boxGeometry args={[0.33, 0.22, 0.012]} />
            <meshStandardMaterial
              ref={lidMat}
              color="#b8bcc4"
              roughness={0.35}
              metalness={0.85}
              emissive={'#5b8cff'}
              emissiveIntensity={0}
            />
          </mesh>
          {/* Screen face */}
          <mesh position={[0, 0.11, 0.007]}>
            <planeGeometry args={[0.30, 0.19]} />
            <meshBasicMaterial color="#1a2740" toneMapped={false} />
          </mesh>
        </group>
      </group>
    </InteractiveObject>
  )
}
