'use client'

import { Modal } from '../Modal'
import { RESUME_PDF_PATH, EXPERIENCE } from '@/content/resume'

export function ResumeOverlay() {
  return (
    <Modal title="Resume">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {/* Download CTA */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        'var(--space-4) var(--space-6)',
            background:     'var(--color-surface-raised)',
            borderRadius:   'var(--radius-md)',
            border:         '1px solid var(--color-border)',
          }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Full resume as PDF
          </p>
          <a
            href={RESUME_PDF_PATH}
            download
            style={{
              fontFamily:     'var(--font-mono)',
              fontSize:       'var(--text-sm)',
              fontWeight:     600,
              color:          'var(--color-bg)',
              background:     'var(--color-accent)',
              textDecoration: 'none',
              borderRadius:   'var(--radius-sm)',
              padding:        'var(--space-2) var(--space-4)',
            }}
          >
            Download PDF ↓
          </a>
        </div>

        {/* Experience timeline */}
        <section>
          <h3
            style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      'var(--text-xs)',
              color:         'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom:  'var(--space-6)',
            }}
          >
            Experience
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {EXPERIENCE.map((exp) => (
              <div
                key={`${exp.company}-${exp.period}`}
                style={{
                  borderLeft:  '2px solid var(--color-accent-dim)',
                  paddingLeft: 'var(--space-6)',
                }}
              >
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
                  {exp.period}
                </p>
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
                  {exp.role}
                </h4>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-accent)', marginBottom: 'var(--space-3)' }}>
                  {exp.company}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  )
}
