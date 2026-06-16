export class AudioManager {
  constructor() {
    this._ctx    = null
    this._sounds = {}
    this._muted  = false
    this._ready  = false

    // Preload manifest — paths relative to /public/audio/
    this._manifest = {
      startup:   'audio/startup/startup.mp3',
      office:    'audio/atmosphere/office.mp3',
      mouseDown: 'audio/mouse/mouse_down.mp3',
      mouseUp:   'audio/mouse/mouse_up.mp3',
      type:      'audio/cc/type.mp3',
      key1:      'audio/keyboard/key_1.mp3',
      key2:      'audio/keyboard/key_2.mp3',
      key3:      'audio/keyboard/key_3.mp3',
    }
  }

  // Call after first user gesture (browser policy)
  async init() {
    if (this._ready) return
    this._ctx = new AudioContext()
    await Promise.all(
      Object.entries(this._manifest).map(([k, path]) =>
        this._load(k, path)
      )
    )
    this._ready = true
  }

  async _load(key, path) {
    try {
      const res  = await fetch(path)
      const buf  = await res.arrayBuffer()
      this._sounds[key] = await this._ctx.decodeAudioData(buf)
    } catch { /* asset not present yet — graceful silent fail */ }
  }

  play(key, { volume = 1, loop = false } = {}) {
    if (this._muted || !this._ready || !this._sounds[key]) return
    const src  = this._ctx.createBufferSource()
    const gain = this._ctx.createGain()
    src.buffer = this._sounds[key]
    src.loop   = loop
    gain.gain.value = volume
    src.connect(gain).connect(this._ctx.destination)
    src.start()
    return src
  }

  playStartup()  { this.init().then(() => this.play('startup')) }
  playMouseDown() { this.play('mouseDown', { volume: 0.6 }) }
  playMouseUp()   { this.play('mouseUp',   { volume: 0.6 }) }
  playType()      { const k = `key${Math.ceil(Math.random()*3)}`; this.play(k, { volume: 0.4 }) }

  startAmbience() {
    this._ambienceNode = this.play('office', { volume: 0.15, loop: true })
  }

  toggle() { this._muted = !this._muted }
}
