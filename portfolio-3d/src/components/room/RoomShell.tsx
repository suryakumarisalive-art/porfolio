'use client'

/**
 * Procedural room — a warm, minimalist studio built from clean PBR primitives.
 * NO baked textures: every surface is a real-time MeshStandardMaterial, so
 * there is zero baked noise and nothing to pop in.
 *
 * Composition: a soft plaster back wall + side wall meeting at a corner behind
 * the desk, a matte oak floor, and a simple skirting board for grounding. The
 * neutral warm palette lets the monitor's glow and the lamp read as focal
 * points.
 */

const FLOOR_Y = 0
const WALL_Z  = -2.0    // back wall
const WALL_X  = -2.6    // left wall
const WALL_H  = 3.2

export function RoomShell() {
  return (
    <group>
      {/* ── Floor — warm matte oak ─────────────────────────────────────────── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, FLOOR_Y, 0]}
        receiveShadow
      >
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#b9986b" roughness={0.72} metalness={0} />
      </mesh>

      {/* ── Back wall — soft plaster ───────────────────────────────────────── */}
      <mesh position={[0, WALL_H / 2, WALL_Z]} receiveShadow>
        <planeGeometry args={[14, WALL_H]} />
        <meshStandardMaterial color="#e8e2d8" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Left wall ──────────────────────────────────────────────────────── */}
      <mesh
        position={[WALL_X, WALL_H / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[14, WALL_H]} />
        <meshStandardMaterial color="#ded7cb" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Skirting boards — ground the walls to the floor ────────────────── */}
      <mesh position={[0, 0.05, WALL_Z + 0.01]} receiveShadow castShadow>
        <boxGeometry args={[14, 0.1, 0.03]} />
        <meshStandardMaterial color="#f2ede4" roughness={0.6} metalness={0} />
      </mesh>
      <mesh
        position={[WALL_X + 0.01, 0.05, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[14, 0.1, 0.03]} />
        <meshStandardMaterial color="#f2ede4" roughness={0.6} metalness={0} />
      </mesh>
    </group>
  )
}
