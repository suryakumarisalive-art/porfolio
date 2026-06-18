'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { InteractiveObject } from './InteractiveObject'
import { MonitorScreen } from './MonitorScreen'
import { OBJECT_POSITIONS } from '@/lib/constants'

const POS = OBJECT_POSITIONS.monitor

/**
 * Hero monitor — projects overlay. Authored in LOCAL coords around the hotspot:
 * a thin-bezel display on a slim aluminium stand, with the live screen as a
 * child so it scales/glows with the group on hover.
 */
export function Monitor() {
  const bezelMat = useRef<THREE.MeshStandardMaterial>(null)

  return (
    <InteractiveObject id="monitor" overlayId="projects" position={[...POS]} materialRef={bezelMat}>
      {/* Bezel / chassis */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.64, 0.39, 0.02]} />
        <meshStandardMaterial
          ref={bezelMat}
          color="#16181d"
          roughness={0.45}
          metalness={0.4}
          emissive={'#5b8cff'}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Live screen */}
      <MonitorScreen />

      {/* Stand neck */}
      <mesh castShadow position={[0, -0.30, -0.03]}>
        <boxGeometry args={[0.05, 0.30, 0.04]} />
        <meshStandardMaterial color="#c9ccd2" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Stand foot on the desk */}
      <mesh castShadow receiveShadow position={[0, -0.44, 0.02]}>
        <boxGeometry args={[0.26, 0.018, 0.17]} />
        <meshStandardMaterial color="#c9ccd2" roughness={0.3} metalness={0.85} />
      </mesh>
    </InteractiveObject>
  )
}
