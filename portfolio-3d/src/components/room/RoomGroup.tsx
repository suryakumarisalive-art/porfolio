import { RoomShell } from './RoomShell'
import { DeskFurniture } from './DeskFurniture'
import { Decor } from './Decor'
import { Monitor } from './Monitor'
import { Laptop } from './Laptop'
import { Desk } from './Desk'
import { BookShelf } from './BookShelf'
import { Phone } from './Phone'

/**
 * The entire room scene graph — all real-time PBR, zero baked textures.
 *
 * Static layer:   RoomShell (floor/walls), DeskFurniture, Decor (lamp/plant/…)
 * Interactive:    Monitor, Laptop, Desk(notebook), BookShelf(books), Phone
 *
 * Interactive object positions come from OBJECT_POSITIONS (constants.ts) and
 * their camera focus targets from CAMERA_PRESETS (store) — keep them in sync.
 */
export function RoomGroup() {
  return (
    <group>
      {/* Static set */}
      <RoomShell />
      <DeskFurniture />
      <Decor />

      {/* Interactive props */}
      <Monitor />
      <Laptop />
      <Desk />
      <BookShelf />
      <Phone />
    </group>
  )
}
