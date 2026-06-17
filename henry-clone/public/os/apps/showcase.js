/* ───────────────────────────────────────────────────────────
   "My Showcase" — the site-page app with a 300px sidebar and an
   internal router (home / about / experience / projects[software|
   music|art] / contact). All copy is read from window.OSConfig
   (see ../config.js) so the whole site is personalised in one file.
   ─────────────────────────────────────────────────────────── */
(function () {
  const cfg = () => window.OSConfig || {}
  const esc = (s) => String(s == null ? '' : s)

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
      if (state.route !== '') page.appendChild(sidebar(state, draw))
      page.appendChild(content(state, draw, ctx))
    }
    draw()
  }

  function sidebar(state, draw) {
    const c = cfg()
    const name = (c.owner && c.owner.name) || '[Your Name]'
    const year = (c.owner && c.owner.showcaseYear) || "'25"
    const parts = name.split(' ')
    const first = parts.shift() || name
    const rest  = parts.join(' ') || ''

    const el = document.createElement('div')
    el.className = 'site-sidebar'
    const header = document.createElement('div')
    header.className = 'site-sidebar-header'
    header.innerHTML = `<h2>${esc(first)}<br>${esc(rest)}</h2><span class="yr">Showcase ${esc(year)}</span>`
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
    el.innerHTML = PAGES[state.route] ? PAGES[state.route]() : PAGES['about']()
    // internal nav links (e.g. "this form" → contact)
    el.querySelectorAll('[data-go]').forEach(a =>
      a.addEventListener('click', e => { e.preventDefault(); state.route = a.getAttribute('data-go'); draw() }))
    // external links go through the host page (sandbox-safe)
    el.querySelectorAll('[data-ext]').forEach(a =>
      a.addEventListener('click', e => { e.preventDefault(); ctx.openUrl(a.getAttribute('data-ext')) }))
    wireContactForm(el)
    return el
  }

  function home(state, draw) {
    const c = cfg()
    const el = document.createElement('div')
    el.className = 'site-home'
    el.innerHTML = `
      <h1>${esc((c.owner && c.owner.name) || '[Your Name]')}</h1>
      <h2>${esc((c.owner && c.owner.role) || 'Software Engineer')}</h2>
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

  function wireContactForm(el) {
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
    about() {
      const c = cfg()
      const a = c.about || {}
      const name = (c.owner && c.owner.name) || '[Your Name]'
      return `
        <h1>Welcome</h1>
        <h3>I'm ${esc(name)}</h3>
        <div class="text-block">
          <p>${esc(a.intro || '')}</p>
          <p>${a.contactLine || ''}</p>
        </div>
        <h2>About Me</h2>
        <div class="captioned-image"><div class="ph">[ photo of you ]</div></div>
        <div class="text-block"><p>${esc(a.story || '')}</p></div>`
    },
    experience() {
      const list = cfg().experience || []
      return `<h1>Experience</h1>` + list.map(x => `
        <div class="text-block">
          <h2><a data-ext="${esc(x.url)}">${esc(x.company)}</a></h2>
          <h3>${esc(x.role)}</h3>
          <p><b>${esc(x.dates)}</b></p>
          ${(x.lines || []).map(l => `<p>${esc(l)}</p>`).join('')}
        </div>`).join('')
    },
    'projects/software'() {
      const list = cfg().software || []
      return `<h1>Software</h1><h3>Projects</h3><div class="text-block">` +
        list.map(p => `
          <h2>${esc(p.name)}</h2>
          <p>${esc(p.desc)}</p>
          <p>${(p.links || []).map(l => `<a data-ext="${esc(l.url)}">${esc(l.label)}</a>`).join('&nbsp;&nbsp;')}</p>`
        ).join('') + `</div>`
    },
    'projects/music'() {
      return `<h1>Music &amp; Sound</h1><h3>Ventures</h3>
        <div class="text-block"><p>${esc(cfg().music || '')}</p></div>
        <div class="captioned-image"><div class="ph">[ figure / waveform ]</div></div>`
    },
    'projects/art'() {
      return `<h1>Art &amp; Design</h1><h3>Endeavors</h3>
        <div class="text-block"><p>${esc(cfg().art || '')}</p></div>`
    },
    contact() {
      const c = cfg()
      const s = c.socials || {}
      const email = (c.owner && c.owner.email) || 'you@example.com'
      const row = []
      if (s.github)   row.push(`<a data-ext="${esc(s.github)}" title="GitHub">🐙 GitHub</a>`)
      if (s.linkedin) row.push(`<a data-ext="${esc(s.linkedin)}" title="LinkedIn">💼 LinkedIn</a>`)
      if (s.twitter)  row.push(`<a data-ext="${esc(s.twitter)}" title="Twitter">🐦 Twitter</a>`)
      return `
        <h1>Contact</h1>
        <div class="social-row">${row.join('')}</div>
        <p>Email: <a data-ext="mailto:${esc(email)}">${esc(email)}</a></p>
        <form class="contact-form">
          <input name="name" placeholder="Name" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="company" placeholder="Company" />
          <textarea name="message" placeholder="Message" required></textarea>
          <button type="submit" class="site-button">Send Message</button>
          <p class="form-status muted"></p>
        </form>`
    },
  }

  window.OSApps = window.OSApps || {}
  window.OSApps.showcase = render
})()
