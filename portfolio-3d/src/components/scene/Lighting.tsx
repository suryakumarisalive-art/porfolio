import { DIRECTIONAL_INTENSITY, AMBIENT_INTENSITY, SHADOW_MAP_SIZE } from '@/lib/constants'

/**
 * Scene lighting — key directional (with shadow), hemisphere fill.
 * No per-frame logic; render once and forget.
 */
export function Lighting() {
  return (
    <>
      {/* Key light — top-right of scene, casts shadows */}
      <directionalLight
        position={[8, 12, 8]}
        intensity={DIRECTIONAL_INTENSITY}
        castShadow
        shadow-mapSize-width={SHADOW_MAP_SIZE}
        shadow-mapSize-height={SHADOW_MAP_SIZE}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.001}
      />

      {/* Soft fill from above — hemisphere for natural ambient gradient */}
      <hemisphereLight
        args={['#c9d5e8', '#3a2a1e', AMBIENT_INTENSITY]}
        position={[0, 10, 0]}
      />

      {/* Rim light — subtle blue-tinted backlight to separate objects from bg */}
      <directionalLight
        position={[-6, 4, -8]}
        intensity={0.3}
        color="#6699cc"
      />

      {/* Desk lamp simulation — warm point at desk level */}
      <pointLight
        position={[0, 1.8, 0.5]}
        intensity={0.8}
        color="#ffcc88"
        distance={4}
        decay={2}
      />
    </>
  )
}
