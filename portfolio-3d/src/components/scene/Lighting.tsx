import { AMBIENT_INTENSITY } from '@/lib/constants'

/**
 * Minimal scene lighting for the baked-texture room.
 * MeshBasicMaterial ignores all lights — ambient is kept
 * as a fallback in case any non-baked materials are ever added.
 */
export function Lighting() {
  return (
    <ambientLight intensity={AMBIENT_INTENSITY} />
  )
}
