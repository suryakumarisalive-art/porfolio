'use client'

/**
 * Static desk furniture — the oak-topped writing desk the whole scene sits on.
 * Non-interactive (the interactive props live in their own components). Real
 * PBR wood + powder-coated steel legs, casts and receives shadows.
 *
 * Top surface is at y = 0.75 (standard desk height); all desk props are
 * authored to rest on that plane.
 */

const TOP_Y     = 0.73   // centre of the 0.04-thick top → surface at 0.75
const TOP_W     = 1.8
const TOP_D     = 0.85
const TOP_THICK = 0.04
const CENTER_Z  = -1.12
const LEG_X     = 0.82

export function DeskFurniture() {
  return (
    <group>
      {/* Oak top */}
      <mesh position={[0, TOP_Y, CENTER_Z]} castShadow receiveShadow>
        <boxGeometry args={[TOP_W, TOP_THICK, TOP_D]} />
        <meshStandardMaterial color="#c79a63" roughness={0.55} metalness={0} />
      </mesh>

      {/* Side panel legs (powder-coated steel) */}
      {[LEG_X, -LEG_X].map((x) => (
        <mesh key={x} position={[x, 0.355, CENTER_Z]} castShadow receiveShadow>
          <boxGeometry args={[0.03, 0.71, TOP_D - 0.05]} />
          <meshStandardMaterial color="#2c2e33" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}

      {/* Cross stretcher for stability / visual weight */}
      <mesh position={[0, 0.10, CENTER_Z - 0.3]} castShadow>
        <boxGeometry args={[LEG_X * 2, 0.025, 0.025]} />
        <meshStandardMaterial color="#2c2e33" roughness={0.5} metalness={0.7} />
      </mesh>
    </group>
  )
}
