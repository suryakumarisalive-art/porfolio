'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { InteractiveObject } from './InteractiveObject'
import { OBJECT_POSITIONS } from '@/lib/constants'

const POS = OBJECT_POSITIONS.bookshelf

// A small stack of hardcover books — skills overlay.
const BOOKS = [
  { y: -0.085, w: 0.20, d: 0.26, h: 0.035, rot:  0.04, color: '#9c5b46' },
  { y: -0.048, w: 0.19, d: 0.25, h: 0.034, rot: -0.05, color: '#3f6b66' },
  { y: -0.013, w: 0.18, d: 0.24, h: 0.032, rot:  0.02, color: '#cdb892' },
] as const

export function BookShelf() {
  const topMat = useRef<THREE.MeshStandardMaterial>(null)

  return (
    <InteractiveObject id="bookshelf" overlayId="skills" position={[...POS]} materialRef={topMat}>
      {BOOKS.map((b, i) => (
        <mesh key={i} castShadow receiveShadow position={[0, b.y, 0]} rotation={[0, b.rot, 0]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          {i === BOOKS.length - 1 ? (
            <meshStandardMaterial
              ref={topMat}
              color={b.color}
              roughness={0.85}
              metalness={0}
              emissive={'#5b8cff'}
              emissiveIntensity={0}
            />
          ) : (
            <meshStandardMaterial color={b.color} roughness={0.85} metalness={0} />
          )}
        </mesh>
      ))}
    </InteractiveObject>
  )
}
