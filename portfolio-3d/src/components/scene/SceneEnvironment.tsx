import { Environment } from '@react-three/drei'

/**
 * Image-Based Lighting (IBL) environment.
 * Uses a built-in drei preset to avoid shipping a large HDR file.
 * Replace 'apartment' with a custom HDR path under /public if needed.
 */
export function SceneEnvironment() {
  return (
    <Environment
      preset="apartment"
      environmentIntensity={0.4}
      backgroundBlurriness={1}
    />
  )
}
