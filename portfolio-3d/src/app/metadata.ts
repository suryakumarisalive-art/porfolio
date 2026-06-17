import type { Metadata, Viewport } from 'next'

const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://yourname.dev'

// `metadata` and `viewport` are separate exports per Next.js 15
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:  'Portfolio — 3D Interactive Showcase',
    template: '%s | Portfolio',
  },
  description:
    'An interactive 3D portfolio built with Three.js and React Three Fiber. ' +
    'Explore projects, experience, and skills inside an immersive desktop room.',
  keywords: ['portfolio', '3D', 'Three.js', 'React', 'developer', 'interactive'],
  authors: [{ name: 'Your Name', url: siteUrl }],
  creator: 'Your Name',
  openGraph: {
    type:        'website',
    url:         siteUrl,
    title:       'Portfolio — 3D Interactive Showcase',
    description: 'Explore a fully interactive 3D room portfolio.',
    siteName:    'Portfolio',
    images: [
      {
        url:    '/opengraph-image',
        width:  1200,
        height: 630,
        alt:    'Portfolio 3D Showcase Preview',
      },
    ],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Portfolio — 3D Interactive Showcase',
    description: 'Explore a fully interactive 3D room portfolio.',
    images:      ['/opengraph-image'],
  },
  robots: {
    index:  true,
    follow: true,
  },
}

// themeColor and viewport live here in Next.js 15 (not in metadata)
export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor:   '#0a0a0a',
}
