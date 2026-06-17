/* ───────────────────────────────────────────────────────────
   Henordle — a Wordle clone with a personal twist, mirroring the
   reference app. Answer is a 5-letter word the owner can change.
   ─────────────────────────────────────────────────────────── */
(function () {
  const ROWS = 6, COLS = 5

  function render(root) {
    const ANSWER = (((window.OSConfig || {}).henordleWord) || 'HELLO').toUpperCase().slice(0, 5)
    const wrap = document.createElement('div')
    wrap.className = 'henordle'
    wrap.innerHTML = `
      <div style="text-align:center">
        <h2 style="font-family:'MillenniumBold',serif;font-size:24px">Henordle</h2>
        <p style="font-family:'Millennium',serif">Wordle, but with a personal twist.</p>
      </div>
      <div class="henordle-grid"></div>
      <p class="henordle-msg" style="font-family:'Millennium',serif;height:18px"></p>`
    root.appendChild(wrap)

    const grid = wrap.querySelector('.henordle-grid')
    const msg  = wrap.querySelector('.henordle-msg')
    const cells = []
    for (let r = 0; r < ROWS; r++) {
      const row = document.createElement('div')
      row.className = 'henordle-row'
      const rowCells = []
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div')
        cell.className = 'henordle-cell'
        row.appendChild(cell)
        rowCells.push(cell)
      }
      grid.appendChild(row)
      cells.push(rowCells)
    }

    const state = { row: 0, col: 0, done: false }

    const onKey = (e) => {
      if (state.done) return
      const k = e.key
      if (k === 'Backspace') {
        if (state.col > 0) { state.col--; cells[state.row][state.col].textContent = '' }
      } else if (k === 'Enter') {
        if (state.col === COLS) submit()
      } else if (/^[a-zA-Z]$/.test(k) && state.col < COLS) {
        cells[state.row][state.col].textContent = k.toUpperCase()
        state.col++
      }
    }

    const submit = () => {
      const guess = cells[state.row].map(c => c.textContent).join('').toUpperCase()
      const answer = ANSWER.split('')
      // Two-pass colouring (correct, then present)
      const marks = Array(COLS).fill('absent')
      guess.split('').forEach((ch, i) => { if (ch === answer[i]) { marks[i] = 'correct'; answer[i] = null } })
      guess.split('').forEach((ch, i) => {
        if (marks[i] === 'correct') return
        const idx = answer.indexOf(ch)
        if (idx !== -1) { marks[i] = 'present'; answer[idx] = null }
      })
      marks.forEach((m, i) => cells[state.row][i].classList.add(m))

      if (guess === ANSWER) { msg.textContent = 'You got it! 🎉'; state.done = true; return }
      state.row++; state.col = 0
      if (state.row >= ROWS) { msg.textContent = `The word was ${ANSWER}`; state.done = true }
    }

    // Listen while this window has focus; cleaned up implicitly on close
    document.addEventListener('keydown', onKey)
    root._cleanup = () => document.removeEventListener('keydown', onKey)
  }

  window.OSApps = window.OSApps || {}
  window.OSApps.henordle = render
})()
