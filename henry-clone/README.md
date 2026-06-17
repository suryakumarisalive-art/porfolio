# Interactive 3D Portfolio

An interactive 3D room (Three.js) with a clickable CRT monitor that zooms in to
reveal a retro Windows-style desktop OS (mounted on the monitor via
`CSS3DRenderer`). Inspired by the interactive-desk portfolio genre.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the production build
```

Open the printed `localhost` URL on a desktop browser (the 3D experience is
desktop-only; mobile gets a fallback message).

## Flow

1. **BIOS boot screen** streams the loading sequence, then a centred **START** popup.
2. **START** eases the camera into the **desk view** — orbit freely (drag to look,
   scroll to zoom).
3. **Click the monitor** to fly into the screen and use the desktop OS.
4. **← Back** (top-left) flies back out to the room.

## Personalise it (where to edit)

Almost everything lives in **one file**:

| What | File |
|------|------|
| Name, role, email, socials, about/experience/projects/contact copy, Henordle word, credits | **`public/os/config.js`** ⭐ |
| Top-left name + role overlay in the 3D room | `index.html` → `#info-name`, `#info-role` |
| BIOS boot screen text (logo, showcase title) | `src/LoadingScreen.js` → `OWNER` |

Edit `public/os/config.js` first — the whole in-monitor site reads from it.

## DOS games

The desktop ships three playable DOS games via [js-dos](https://js-dos.com)
(bundles in `public/os/games/`):

- **Doom** — shareware Doom (freely redistributable).
- **The Oregon Trail**, **Scrabble** — abandonware DOS titles. If their
  distribution is ever a concern, delete the files from `public/os/games/` and
  remove the matching entries from the `REGISTRY` in `public/os/os.js`.

## Tech

- **Three.js** — room, camera, raycasting
- **CSS3DRenderer** — the OS iframe placed on the monitor in 3D space
- **js-dos v8** — DOS game emulation
- **Web Audio API** — startup chime, ambience, keyboard/mouse SFX
- **Vite** — build tooling

## Assets

The 3D models, baked textures, fonts, and audio under `public/` are reference
assets from the original interactive-desk portfolio they were learned from.
Replace them with your own room/models to make the scene fully your own.
