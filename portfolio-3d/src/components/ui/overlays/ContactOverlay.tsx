'use client'

import { useRef, type FormEvent } from 'react'
import { Modal } from '../Modal'

const INPUT_STYLE: React.CSSProperties = {
  width:        '100%',
  background:   'var(--color-surface-raised)',
  border:       '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color:        'var(--color-text)',
  fontFamily:   'var(--font-mono)',
  fontSize:     'var(--text-sm)',
  padding:      'var(--space-3) var(--space-4)',
  outline:      'none',
}

/**
 * Contact form overlay.
 *
 * - Client-side validation via `required` + custom checks before submit
 * - Honeypot field to deter spam bots (hidden from humans, caught on any real backend)
 * - No secrets client-side; submission can be wired to a serverless route or mailto
 */
export function ContactOverlay() {
  const statusRef  = useRef<HTMLParagraphElement>(null)
  const formRef    = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    // Honeypot check — bots fill hidden fields; humans leave them empty
    if (data.get('_honey') !== '') return

    const name    = String(data.get('name')    ?? '').trim()
    const email   = String(data.get('email')   ?? '').trim()
    const message = String(data.get('message') ?? '').trim()

    if (!name || !email || !message) return

    // TODO: wire to a real API route — e.g. POST /api/contact
    // For now, shows a success message
    if (statusRef.current) {
      statusRef.current.textContent = `Message received, ${name}. I'll be in touch soon.`
      statusRef.current.style.color = 'var(--color-accent)'
    }
    form.reset()
  }

  return (
    <Modal title="Contact">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        {/* Honeypot — hidden from humans, filled by bots */}
        <input
          name="_honey"
          type="text"
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="contact-name" className="sr-only">Name</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              placeholder="Name"
              required
              autoComplete="name"
              style={INPUT_STYLE}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="contact-email" className="sr-only">Email</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              placeholder="Email"
              required
              autoComplete="email"
              style={INPUT_STYLE}
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-subject" className="sr-only">Subject</label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            placeholder="Subject (optional)"
            style={INPUT_STYLE}
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="sr-only">Message</label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="Message"
            required
            rows={6}
            style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: 120 }}
          />
        </div>

        <button
          type="submit"
          style={{
            background:   'var(--color-accent)',
            border:       'none',
            borderRadius: 'var(--radius-sm)',
            color:        'var(--color-bg)',
            fontFamily:   'var(--font-mono)',
            fontSize:     'var(--text-sm)',
            fontWeight:   600,
            padding:      'var(--space-3) var(--space-6)',
            cursor:       'pointer',
            alignSelf:    'flex-start',
          }}
        >
          Send Message →
        </button>

        <p
          ref={statusRef}
          role="status"
          aria-live="polite"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize:   'var(--text-sm)',
            color:      'var(--color-text-muted)',
            minHeight:  '1.5em',
          }}
        />
      </form>
    </Modal>
  )
}
