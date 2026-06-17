import { RoomShell } from './RoomShell'
import { Monitor } from './Monitor'
import { Laptop } from './Laptop'
import { Desk } from './Desk'
import { BookShelf } from './BookShelf'
import { Phone } from './Phone'

/**
 * Composes the entire room scene graph.
 * Object transforms here must match OBJECT_POSITIONS + CAMERA_PRESETS
 * so zoom-to-focus aims correctly.
 *
 * This is the single place to adjust world layout; the interactive objects
 * read their position from OBJECT_POSITIONS (constants.ts) which this
 * component passes through InteractiveObject → position prop.
 */
export function RoomGroup() {
  return (
    <group>
      <RoomShell />
      <Desk />
      <Monitor />
      <Laptop />
      <BookShelf />
      <Phone />
    </group>
  )
}
