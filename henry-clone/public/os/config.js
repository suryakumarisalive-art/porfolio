/* ───────────────────────────────────────────────────────────
   ⭐ EDIT THIS FILE to personalise the whole desktop.
   Everything the visitor reads on the in-monitor OS comes from
   here — swap the placeholders for your real details.
   (The BIOS boot screen text lives in ../src/LoadingScreen.js.)
   ─────────────────────────────────────────────────────────── */
window.OSConfig = {
  // — Basic identity —
  owner: {
    name: '[Your Name]',
    role: 'Software Engineer',
    email: 'you@example.com',
    showcaseYear: "'25",          // shown in the Showcase sidebar
  },

  // — Social links (leave '' to hide a row) —
  socials: {
    github:   'https://github.com/',
    linkedin: 'https://linkedin.com/',
    twitter:  'https://twitter.com/',
  },

  // — About page —
  about: {
    intro: `I'm a software engineer currently working at [Company]. In [Year] I
            graduated from [University] with my [Degree].`,
    contactLine: `Thank you for taking the time to check out my portfolio. I hope
            you enjoy exploring it as much as I enjoyed building it. If you'd like
            to get in touch, use <a data-go="contact"><b>this form</b></a> or shoot
            me an email at <b>you@example.com</b>.`,
    story: `From a young age I've been curious about how things work. [Replace this
            with your story — what got you into building software, a formative
            project, where you grew up, what you care about.]`,
  },

  // — Experience page —
  experience: [
    {
      company: '[Company]',
      url: 'https://example.com',
      role: '[Your Role]',
      dates: '[Start] – [End]',
      lines: [
        '[One or two sentences on what the company does and the stack you worked in — e.g. TypeScript, React, Node.]',
        '[A concrete, measurable accomplishment: what you built and the impact it had.]',
      ],
    },
  ],

  // — Projects → Software —
  software: [
    { name: '[Project One]',   desc: '[What it is, why it was interesting, the stack.]', links: [{ label: 'GitHub ↗', url: 'https://github.com/' }] },
    { name: '[Project Two]',   desc: '[Short description.]',                              links: [{ label: 'GitHub ↗', url: 'https://github.com/' }] },
    { name: '[Project Three]', desc: "[Something you're proud of.]",                      links: [{ label: 'GitHub ↗', url: 'https://github.com/' }] },
  ],

  // — Projects → Music / Art (set to '' to leave the page nearly empty) —
  music: `[If you make music or sound, write about it here. Otherwise repurpose
           this page for another creative outlet.]`,
  art:   `[While I love software, art and design hold a special place for me.
           Describe your design/art work here, or remove this page.]`,

  // — Henordle answer (any 5-letter word) —
  henordleWord: 'HELLO',

  // — Credits slides —
  credits: [
    { role: 'Engineering & Design', who: ['[Your Name] (All)'] },
    { role: 'Modeling & Texturing', who: ['[Your Name]', 'Mickael Boitte (Computer Model)', 'Sean Nicolas (Environment Models)'] },
    { role: 'Sound Design',         who: ['[Your Name]', 'Sound Cassette (Office Ambience)', 'Windows 95 Startup Sound (Microsoft)'] },
    { role: 'Built With',           who: ['Three.js', 'CSS3DRenderer', 'js-dos', 'Vite'] },
    { role: 'Inspiration',          who: ['Henry Heffernan', 'Bruno Simon', 'Jesse Zhou'] },
  ],
}
