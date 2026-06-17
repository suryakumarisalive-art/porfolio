'use client'

import { Modal } from '../Modal'
import { SKILLS } from '@/content/skills'

export function SkillsOverlay() {
  return (
    <Modal title="Skills">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {SKILLS.map((group) => (
          <section key={group.category}>
            <h3
              style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      'var(--text-xs)',
                color:         'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom:  'var(--space-4)',
              }}
            >
              {group.category}
            </h3>

            <div
              style={{
                display:  'flex',
                flexWrap: 'wrap',
                gap:      'var(--space-2)',
              }}
            >
              {group.items.map((skill, i) => (
                <span
                  key={skill}
                  style={{
                    fontFamily:    'var(--font-mono)',
                    fontSize:      'var(--text-sm)',
                    color:         'var(--color-text)',
                    background:    'var(--color-surface-raised)',
                    border:        '1px solid var(--color-border)',
                    borderRadius:  'var(--radius-md)',
                    padding:       'var(--space-2) var(--space-4)',
                    // Staggered accent underline for visual hierarchy
                    borderBottom:  i % 3 === 0 ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                    transition:    'border-color var(--duration-fast)',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Modal>
  )
}
