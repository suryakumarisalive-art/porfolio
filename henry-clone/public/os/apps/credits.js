/* ───────────────────────────────────────────────────────────
   Credits — click-to-advance scroller, mirroring the reference
   app's slide structure. Inspiration credit kept to honour the
   original interactive-desk genre this portfolio is built on.
   ─────────────────────────────────────────────────────────── */
(function () {
  const FALLBACK = [
    { role: 'Engineering & Design', who: ['[Your Name] (All)'] },
    { role: 'Built With',           who: ['Three.js', 'CSS3DRenderer', 'js-dos', 'Vite'] },
    { role: 'Inspiration',          who: ['Henry Heffernan', 'Bruno Simon', 'Jesse Zhou'] },
  ]

  function render(root) {
    const SLIDES = (((window.OSConfig || {}).credits) || FALLBACK)
    const el = document.createElement('div')
    el.className = 'credits'
    root.appendChild(el)

    let i = -1
    const next = () => {
      i++
      if (i === 0) {
        el.innerHTML = `<h2>Credits</h2><p class="who">A 3D portfolio, ${new Date().getFullYear()}</p><p class="hint">Click to continue...</p>`
        return
      }
      if (i > SLIDES.length) { i = 0; next(); return }
      const s = SLIDES[i - 1]
      el.innerHTML =
        `<p class="role">${s.role}</p>` +
        s.who.map(w => `<p class="who">${w}</p>`).join('') +
        `<p class="hint">Click to continue...</p>`
    }
    el.addEventListener('click', next)
    next()
  }

  window.OSApps = window.OSApps || {}
  window.OSApps.credits = render
})()
