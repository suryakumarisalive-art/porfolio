import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Portfolio 3D Showcase Preview'

export const size = { width: 1200, height: 630 }

export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width:           '100%',
          height:          '100%',
          display:         'flex',
          flexDirection:   'column',
          alignItems:      'center',
          justifyContent:  'center',
          background:      'linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0a0a0a 100%)',
          fontFamily:      'monospace',
          color:           '#ffffff',
        }}
      >
        {/* Accent grid lines */}
        <div
          style={{
            position:    'absolute',
            inset:       0,
            backgroundImage:
              'linear-gradient(oklch(68% 0.2 240 / 0.08) 1px, transparent 1px), ' +
              'linear-gradient(90deg, oklch(68% 0.2 240 / 0.08) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Name / role */}
        <div
          style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            gap:            16,
            position:       'relative',
            zIndex:         1,
          }}
        >
          <div
            style={{
              fontSize:    72,
              fontWeight:  700,
              letterSpacing: '-2px',
              color:       '#ffffff',
            }}
          >
            Your Name
          </div>
          <div
            style={{
              fontSize:      24,
              color:         'oklch(68% 0.2 240)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Interactive 3D Portfolio
          </div>
          <div
            style={{
              display:         'flex',
              gap:             12,
              marginTop:       8,
              fontSize:        14,
              color:           '#888',
              letterSpacing:   '0.1em',
            }}
          >
            <span>Three.js</span>
            <span>·</span>
            <span>React Three Fiber</span>
            <span>·</span>
            <span>Next.js 15</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
