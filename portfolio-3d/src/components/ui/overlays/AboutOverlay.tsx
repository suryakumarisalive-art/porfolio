'use client'

import { Modal } from '../Modal'
import { ABOUT } from '@/content/about'

export function AboutOverlay() {
  return (
    <Modal title="About Me">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {/* Name & role */}
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize:   'var(--text-hero)',
              fontWeight: 700,
              color:      'var(--color-text)',
              lineHeight: 1.1,
              marginBottom: 'var(--space-2)',
            }}
          >
            {ABOUT.name}
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize:   'var(--text-lg)',
              color:      'var(--color-accent)',
            }}
          >
            {ABOUT.role}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize:   'var(--text-sm)',
              color:      'var(--color-text-muted)',
              marginTop:  'var(--space-1)',
            }}
          >
            {ABOUT.location}
          </p>
        </div>

        {/* Bio */}
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize:   'var(--text-base)',
            color:      'var(--color-text-muted)',
            lineHeight: 1.8,
            whiteSpace: 'pre-line',
          }}
        >
          {ABOUT.bio}
        </div>

        {/* Interests */}
        <div>
          <p
            style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      'var(--text-xs)',
              color:         'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom:  'var(--space-3)',
            }}
          >
            Interests
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {ABOUT.interests.map((interest) => (
              <span
                key={interest}
                style={{
                  fontFamily:   'var(--font-mono)',
                  fontSize:     'var(--text-xs)',
                  color:        'var(--color-text)',
                  background:   'var(--color-surface-raised)',
                  border:       '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  padding:      'var(--space-1) var(--space-3)',
                }}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
