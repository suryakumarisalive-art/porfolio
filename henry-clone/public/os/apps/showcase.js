/* ───────────────────────────────────────────────────────────
   "My Showcase" — the site-page app with a 300px sidebar and an
   internal router, mirroring the reference structure:
   home / about / experience / projects(software|music|art) / contact.
   All personal copy is placeholder ([...]) for the owner to swap.
   ─────────────────────────────────────────────────────────── */
(function () {
  const NAV = [
    { label: 'HOME',       route: '' },
    { label: 'ABOUT',      route: 'about' },
    { label: 'EXPERIENCE', route: 'experience' },
    { label: 'PROJECTS',   route: 'projects', sub: [
      { label: 'SOFTWARE', route: 'projects/software' },
      { label: 'MUSIC',    route: 'projects/music' },
      { label: 'ART',      route: 'projects/art' },
    ] },
    { label: 'CONTACT',    route: 'contact' },
  ]

  function render(root, ctx) {
    const state = { route: '' }
    const page = document.createElement('div')
    page.className = 'site-page'
    root.appendChild(page)

    const draw = () => {
      page.innerHTML = ''
      const isHome = state.route === ''
      if (!isHome) page.appendChild(sidebar(state, draw))
      page.appendChild(content(state, draw, ctx))
    }
    draw()
  }

  function sidebar(state, draw) {
    const el = document.createElement('div')
    el.className = 'site-sidebar'
    const header = document.createElement('div')
    header.className = 'site-sidebar-header'
    header.innerHTML = `<h2>[Your<br>Name]</h2><span class="yr">Showcase '25</span>`
    el.appendChild(header)

    NAV.forEach(item => {
      const link = document.createElement('a')
      link.className = 'site-nav-link' + (state.route === item.route ? ' active' : '')
      link.textContent = item.label
      link.addEventListener('click', () => { state.route = item.route; draw() })
      el.appendChild(link)

      if (item.sub && state.route.startsWith('projects')) {
        const wrap = document.createElement('div')
        wrap.className = 'site-sub'
        item.sub.forEach(s => {
          const sl = document.createElement('a')
          sl.className = 'site-nav-link' + (state.route === s.route ? ' active' : '')
          sl.textContent = s.label
          sl.addEventListener('click', () => { state.route = s.route; draw() })
          wrap.appendChild(sl)
        })
        el.appendChild(wrap)
      }
    })
    return el
  }

  function content(state, draw, ctx) {
    if (state.route === '') return home(state, draw)
    const el = document.createElement('div')
    el.className = 'site-page-content'
    el.innerHTML = PAGES[state.route] || PAGES['about']
    // External links go through the host page (sandbox-safe)
    el.querySelectorAll('[data-ext]').forEach(a => {
      a.addEventListener('click', ev => {
        ev.preventDefault()
        ctx.openUrl(a.getAttribute('data-ext'))
      })
    })
    wireContactForm(el, ctx)
    return el
  }

  function home(state, draw) {
    const el = document.createElement('div')
    el.className = 'site-home'
    el.innerHTML = `
      <h1>[Your Name]</h1>
      <h2>Software Engineer</h2>
      <div class="site-home-buttons">
        <button class="site-button" data-go="about">ABOUT</button>
        <button class="site-button" data-go="experience">EXPERIENCE</button>
        <button class="site-button" data-go="projects/software">PROJECTS</button>
        <button class="site-button" data-go="contact">CONTACT</button>
      </div>`
    el.querySelectorAll('[data-go]').forEach(b =>
      b.addEventListener('click', () => { state.route = b.getAttribute('data-go'); draw() }))
    return el
  }

  function wireContactForm(el, ctx) {
    const form = el.querySelector('.contact-form')
    if (!form) return
    form.addEventListener('submit', e => {
      e.preventDefault()
      const name = form.querySelector('[name="name"]').value || 'there'
      const btn  = form.querySelector('button[type="submit"]')
      btn.textContent = 'Sending'
      setTimeout(() => {
        form.reset()
        btn.textContent = 'Send Message'
        const ok = el.querySelector('.form-status')
        if (ok) ok.textContent = `Message successfully sent. Thank you ${name}!`
      }, 700)
    })
  }

  const PAGES = {
    about: `
      <h1>Welcome</h1>
      <h3>I'm [Your Name]</h3>
      <div class="text-block">
        <p>I'm a software engineer currently working at [Company]. In [Year] I
           graduated from [University] with my [Degree].</p>
        <p>Thank you for taking the time to check out my portfolio. I hope you
           enjoy exploring it as much as I enjoyed building it. If you'd like to
           get in touch, use <a data-ext="#contact"><b>this form</b></a> or shoot
           me an email at <b>you@example.com</b>.</p>
      </div>
      <h2>About Me</h2>
      <div class="captioned-image"><div class="ph">[ photo of you ]</div></div>
      <div class="text-block">
        <p>From a young age I've been curious about how things work. [Replace this
           with your story — what got you into building software, a formative
           project, where you grew up, what you care about.]</p>
      </div>`,

    experience: `
      <h1><a data-ext="https://example.com">[Company]</a></h1>
      <h3>[Your Role]</h3>
      <div class="text-block">
        <p><b>[Start] – [End]</b></p>
        <p>[One or two sentences on what the company does and the stack you worked
           in — e.g. TypeScript, React, Node, etc.]</p>
        <p>[A concrete, measurable accomplishment: what you built and the impact
           it had.]</p>
      </div>`,

    'projects/software': `
      <h1>Software</h1><h3>Projects</h3>
      <div class="text-block">
        <h2>[Project One]</h2>
        <p>[What it is, why it was interesting, the stack.]</p>
        <p><a data-ext="https://github.com/">GitHub ↗</a></p>
        <h2>[Project Two]</h2>
        <p>[Short description.]</p>
        <p><a data-ext="https://github.com/">GitHub ↗</a></p>
        <h2>[Project Three]</h2>
        <p>[Short description.]</p>
        <p><a data-ext="https://github.com/">GitHub ↗</a></p>
      </div>`,

    'projects/music': `
      <h1>Music &amp; Sound</h1><h3>Ventures</h3>
      <div class="text-block">
        <p>[If you make music or sound, write about it here. Otherwise repurpose
           this page for another creative outlet.]</p>
      </div>
      <div class="captioned-image"><div class="ph">[ figure / waveform ]</div></div>`,

    'projects/art': `
      <h1>Art &amp; Design</h1><h3>Endeavors</h3>
      <div class="text-block">
        <p>[While I love software, art and design hold a special place for me.
           Describe your design/art work here, or remove this page.]</p>
      </div>`,

    contact: `
      <h1>Contact</h1>
      <div class="social-row">
        <a data-ext="https://github.com/" title="GitHub">🐙 GitHub</a>
        <a data-ext="https://linkedin.com/" title="LinkedIn">💼 LinkedIn</a>
        <a data-ext="https://twitter.com/" title="Twitter">🐦 Twitter</a>
      </div>
      <p>Email: <a data-ext="mailto:you@example.com">you@example.com</a></p>
      <form class="contact-form">
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="company" placeholder="Company" />
        <textarea name="message" placeholder="Message" required></textarea>
        <button type="submit" class="site-button">Send Message</button>
        <p class="form-status muted"></p>
      </form>`,
  }

  window.OSApps = window.OSApps || {}
  window.OSApps.showcase = render
})()
