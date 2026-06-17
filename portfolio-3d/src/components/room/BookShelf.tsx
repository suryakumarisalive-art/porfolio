import { useRef } from 'react'
import type { ReactElement } from 'react'
import * as THREE from 'three'
import { InteractiveObject } from './InteractiveObject'
import { OBJECT_POSITIONS } from '@/lib/constants'

// Book color palette — varied spines for visual interest
const BOOK_COLORS = [
  '#c0392b', '#2980b9', '#27ae60', '#8e44ad',
  '#e67e22', '#16a085', '#f39c12', '#2c3e50',
  '#d35400', '#1abc9c', '#e74c3c', '#3498db',
]

/**
 * Bookshelf — triggers the Skills overlay on double-click.
 * Placeholder geometry: shelf unit with randomised book spines.
 */
export function BookShelf() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const [px, py, pz] = OBJECT_POSITIONS.bookshelf

  return (
    <InteractiveObject
      id="bookshelf"
      overlayId="skills"
      position={[px, py, pz]}
      materialRef={matRef}
    >
      {/* Shelf carcass */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.4, 2.4, 0.36]} />
        <meshStandardMaterial
          ref={matRef}
          color="#2c1e10"
          emissive="#6b4226"
          emissiveIntensity={0}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Shelves (3) */}
      {[-0.7, 0, 0.7].map((y, i) => (
        <mesh key={i} castShadow position={[0, y, 0.005]}>
          <boxGeometry args={[1.36, 0.03, 0.34]} />
          <meshStandardMaterial color="#3a2818" roughness={0.65} />
        </mesh>
      ))}

      {/* Books per shelf */}
      {[-0.7, 0, 0.7].map((shelfY, si) => {
        const books: ReactElement[] = []
        let xCursor = -0.6
        for (let b = 0; b < 8; b++) {
          const width  = 0.06 + Math.random() * 0.06
          const height = 0.22 + Math.random() * 0.14
          const color  = BOOK_COLORS[(si * 8 + b) % BOOK_COLORS.length] ?? '#555'
          books.push(
            <mesh
              key={b}
              castShadow
              position={[xCursor + width / 2, shelfY + 0.015 + height / 2, 0.06]}
            >
              <boxGeometry args={[width, height, 0.22]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
          )
          xCursor += width + 0.01
        }
        return books
      })}
    </InteractiveObject>
  )
}
