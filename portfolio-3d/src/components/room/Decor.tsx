'use client'

import * as THREE from 'three'

/**
 * Static, non-interactive set dressing that gives the room life and story:
 * a warm desk lamp (with its real point light), a potted plant, a framed
 * picture on the wall, and a soft rug grounding the desk. All real-time PBR.
 */
export function Decor() {
  return (
    <group>
      <DeskLamp />
      <Plant />
      <WallFrame />
      <Rug />
      <Mug />
    </group>
  )
}

// ─── Desk lamp — warm key accent + real light source ──────────────────────────

function DeskLamp() {
  // Lamp lives back-right on the desk
  const base: [number, number, number] = [0.66, 0.75, -1.36]
  return (
    <group position={base}>
      {/* Weighted base */}
      <mesh castShadow position={[0, 0.012, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.024, 24]} />
        <meshStandardMaterial color="#1f2126" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Lower arm */}
      <mesh castShadow position={[0, 0.16, 0.02]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.30, 12]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Upper arm */}
      <mesh castShadow position={[0, 0.30, 0.14]} rotation={[1.25, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.26, 12]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Shade */}
      <mesh castShadow position={[0, 0.345, 0.26]} rotation={[1.0, 0, 0]}>
        <coneGeometry args={[0.06, 0.10, 24, 1, true]} />
        <meshStandardMaterial color="#e8c07a" roughness={0.5} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Glowing bulb */}
      <mesh position={[0, 0.325, 0.275]}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
      </mesh>
      {/* Real warm light cast onto the desk */}
      <pointLight
        position={[0, 0.30, 0.30]}
        intensity={2.4}
        distance={2.2}
        decay={2}
        color="#ffcf96"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
      />
    </group>
  )
}

// ─── Potted plant — back-left corner ──────────────────────────────────────────

function Plant() {
  const base: [number, number, number] = [-0.78, 0.75, -1.34]
  const leaves: Array<[number, number, number]> = [
    [0, 0.16, 0], [0.05, 0.13, 0.03], [-0.05, 0.14, -0.02],
    [0.03, 0.18, -0.04], [-0.04, 0.17, 0.04],
  ]
  return (
    <group position={base}>
      {/* Pot */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.055, 0.045, 0.10, 24]} />
        <meshStandardMaterial color="#c8743f" roughness={0.85} metalness={0} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.10, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.01, 24]} />
        <meshStandardMaterial color="#2e231b" roughness={1} metalness={0} />
      </mesh>
      {/* Foliage clusters */}
      {leaves.map((p, i) => (
        <mesh key={i} castShadow position={p}>
          <icosahedronGeometry args={[0.055, 0]} />
          <meshStandardMaterial color={i % 2 ? '#3f7d4f' : '#4f9460'} roughness={0.8} metalness={0} flatShading />
        </mesh>
      ))}
    </group>
  )
}

// ─── Framed picture on the back wall ──────────────────────────────────────────

function WallFrame() {
  return (
    <group position={[-1.0, 1.55, -1.97]}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.66, 0.025]} />
        <meshStandardMaterial color="#1d1f24" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Mat */}
      <mesh position={[0, 0, 0.014]}>
        <planeGeometry args={[0.44, 0.6]} />
        <meshStandardMaterial color="#f4efe6" roughness={0.95} metalness={0} />
      </mesh>
      {/* Abstract art block */}
      <mesh position={[0, 0.02, 0.015]}>
        <planeGeometry args={[0.34, 0.42]} />
        <meshStandardMaterial color="#5b8cff" roughness={0.8} metalness={0} />
      </mesh>
    </group>
  )
}

// ─── Soft rug grounding the desk ──────────────────────────────────────────────

function Rug() {
  return (
    <mesh position={[0, 0.005, -0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[1.5, 48]} />
      <meshStandardMaterial color="#8a6f88" roughness={0.95} metalness={0} />
    </mesh>
  )
}

// ─── Ceramic mug ──────────────────────────────────────────────────────────────

function Mug() {
  return (
    <group position={[-0.30, 0.75, -0.78]}>
      <mesh castShadow receiveShadow position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.035, 0.032, 0.09, 24]} />
        <meshStandardMaterial color="#e9e4dc" roughness={0.4} metalness={0} />
      </mesh>
      {/* Coffee */}
      <mesh position={[0, 0.088, 0]}>
        <cylinderGeometry args={[0.031, 0.031, 0.004, 24]} />
        <meshStandardMaterial color="#3a2417" roughness={0.3} metalness={0} />
      </mesh>
      {/* Handle */}
      <mesh castShadow position={[0.038, 0.045, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.022, 0.006, 12, 24]} />
        <meshStandardMaterial color="#e9e4dc" roughness={0.4} metalness={0} />
      </mesh>
    </group>
  )
}
