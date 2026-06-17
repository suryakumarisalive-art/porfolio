import * as THREE from 'three'

// File-scope geometry instances — shared, never disposed (static room geometry)
const floorGeo = new THREE.PlaneGeometry(20, 20)
const wallGeo  = new THREE.PlaneGeometry(20, 10)

/**
 * Static room enclosure — floor, back wall, left wall.
 * No interaction; establishes the [0,1,0] focal origin.
 * Replace with a GLTF model by dropping a .glb in /public/models/ and
 * swapping this component to use useGLTFLoader.
 */
export function RoomShell() {
  return (
    <group>
      {/* Floor */}
      <mesh
        geometry={floorGeo}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#1a1a24"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Back wall */}
      <mesh
        geometry={wallGeo}
        position={[0, 5, -5]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#12121a"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Left wall */}
      <mesh
        geometry={wallGeo}
        position={[-5, 5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#111118"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Subtle floor grid for depth cue */}
      <gridHelper
        args={[20, 20, '#1e1e2e', '#1e1e2e']}
        position={[0, 0.001, 0]}
      />
    </group>
  )
}
