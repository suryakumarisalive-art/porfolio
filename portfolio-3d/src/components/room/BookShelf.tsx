'use client'

import { InteractiveObject } from './InteractiveObject'
import { OBJECT_POSITIONS } from '@/lib/constants'

const [px, py, pz] = OBJECT_POSITIONS.bookshelf

/**
 * Invisible click zone in front of the bookshelf.
 * The visual comes from decor.glb (baked texture).
 * Double-click opens the Skills overlay.
 */
export function BookShelf() {
  return (
    <InteractiveObject id="bookshelf" overlayId="skills" position={[px, py, pz]}>
      {/* 500 × 1800 × 300 — tall shelf unit footprint */}
      <mesh>
        <boxGeometry args={[500, 1800, 300]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </InteractiveObject>
  )
}
