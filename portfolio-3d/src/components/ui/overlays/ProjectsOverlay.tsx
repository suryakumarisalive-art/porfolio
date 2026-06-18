'use client'

import { Modal } from '../Modal'
import { PROJECTS } from '@/content/projects'

export function ProjectsOverlay() {
  return (
    <Modal title="Projects">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {PROJECTS.map((project) => (
          <article
            key={project.title}
            style={{
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: 'var(--space-8)',
            }}
          >
            <div
              style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'baseline',
                marginBottom:   'var(--space-2)',
                gap:            'var(--space-4)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize:   'var(--text-lg)',
                  fontWeight: 600,
                  color:      'var(--color-text)',
                }}
              >
                {project.title}
              </h3>
              <span
                style={{
                  fontFamily:  'var(--font-mono)',
                  fontSize:    'var(--text-xs)',
                  color:       'var(--color-text-muted)',
                  flexShrink:  0,
                }}
              >
                {project.year}
              </span>
            </div>

            <p
              style={{
                fontFamily:   'var(--font-sans)',
                fontSize:     'var(--text-sm)',
                color:        'var(--color-text-muted)',
                lineHeight:   1.7,
                marginBottom: 'var(--space-4)',
              }}
            >
              {project.description}
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="tech-badge"
                  style={{
                    fontFamily:   'var(--font-mono)',
                    fontSize:     'var(--text-xs)',
                    color:        'var(--color-accent)',
                    border:       '1px solid var(--color-accent-dim)',
                    borderRadius: 'var(--radius-full)',
                    padding:      '2px var(--space-3)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              {project.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                  style={{
                    fontFamily:   'var(--font-mono)',
                    fontSize:     'var(--text-sm)',
                    color:        'var(--color-accent)',
                    textDecoration: 'none',
                    border:       '1px solid var(--color-accent-dim)',
                    borderRadius: 'var(--radius-sm)',
                    padding:      'var(--space-1) var(--space-3)',
                    display:      'inline-block',
                  }}
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Modal>
  )
}
