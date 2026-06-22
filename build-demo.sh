#!/bin/bash
set -e
OUT="/home/user/porfolio/video-raw/edit/demo-teaser.mp4"
TMP="/tmp/gi_demo"
REAL="/tmp/gi_real"
rm -rf "$TMP" && mkdir -p "$TMP"
W=1280; H=720; FPS=25
log() { echo -e "\033[1;32m[demo]\033[0m $1"; }

log "Rendering frames..."
python3 << 'PYEOF'
import os, math, textwrap
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

TMP  = "/tmp/gi_demo"
REAL = "/tmp/gi_real"
W, H = 1280, 720
FPS  = 25
os.makedirs(TMP, exist_ok=True)

FONTB = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONTR = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
GREEN = (22, 163, 74)
WHITE = (255, 255, 255)
DARK  = (15, 15, 15)
GRAY  = (100, 100, 100)
LGRAY = (240, 240, 240)

def get_font(p, s):
    try: return ImageFont.truetype(p, s)
    except: return ImageFont.load_default()

def tbounds(txt, font):
    d = ImageDraw.Draw(Image.new("L", (1, 1)))
    bb = d.textbbox((0, 0), txt, font=font)
    return bb[2]-bb[0], bb[3]-bb[1]

def ease_out(t, p=3): return 1 - (1 - max(0., min(1., t)))**p
def ease_io(t):
    t = max(0., min(1., t))
    return 4*t**3 if t < .5 else 1-(-2*t+2)**3/2

def save(arr, path):
    if arr.shape[2] == 4:
        Image.fromarray(arr, 'RGBA').convert('RGB').save(path)
    else:
        Image.fromarray(arr).save(path)

def render(name, dur, fn):
    d = os.path.join(TMP, f"sc_{name}")
    os.makedirs(d, exist_ok=True)
    n = int(dur * FPS)
    for i in range(n):
        arr = np.full((H, W, 3), 255, dtype=np.uint8)  # white bg
        fn(arr, i/FPS, dur)
        save(arr, os.path.join(d, f"{i:04d}.png"))
    print(f"  {name}: {n}fr")

# ── Load screenshot as canvas ─────────────────────────────────────────────────
def load_shot(name, zoom=1.0, pan_x=0, pan_y=0):
    """Return H×W×3 uint8 cropped from screenshot."""
    img = Image.open(f"{REAL}/{name}.png").convert("RGB")
    ow, oh = img.size
    # Crop bottom area if needed (remove any blank footer)
    img = img.crop((0, 0, ow, min(oh, 720)))
    img = img.resize((W, H), Image.LANCZOS)
    if zoom != 1.0:
        nw, nh = int(W*zoom), int(H*zoom)
        img = img.resize((nw, nh), Image.LANCZOS)
        px = int((nw - W) * pan_x)
        py = int((nh - H) * pan_y)
        img = img.crop((px, py, px+W, py+H))
    return np.array(img, dtype=np.uint8)

# ── Text overlay helpers ──────────────────────────────────────────────────────
def draw_label(canvas, txt, x, y, size=14, color=WHITE, bg=GREEN, alpha=255):
    """Small pill label."""
    f = get_font(FONTB, size)
    tw, th = tbounds(txt, f)
    pad = 10
    img = Image.fromarray(canvas)
    d = ImageDraw.Draw(img)
    # Draw pill bg
    r = th // 2 + pad
    d.rounded_rectangle([x, y, x+tw+pad*2, y+th+pad], radius=8, fill=(*bg, alpha))
    d.text((x+pad, y+pad//2), txt, font=f, fill=color)
    canvas[:] = np.array(img)

def draw_callout(canvas, txt, x, y, size=22, color=DARK, alpha=255):
    """Simple text callout with semi-transparent bg."""
    f = get_font(FONTB, size)
    lines = txt.split('\n')
    img = Image.fromarray(canvas)
    d = ImageDraw.Draw(img)
    lh = size + 6
    total_h = len(lines) * lh + 20
    max_w = max(tbounds(l, f)[0] for l in lines) + 30
    # White card
    bx, by = x, y
    d.rounded_rectangle([bx-10, by-8, bx+max_w, by+total_h], radius=12,
                         fill=(255, 255, 255, 230), outline=(200, 200, 200, 200), width=1)
    for i, line in enumerate(lines):
        d.text((bx+5, by+4+i*lh), line, font=f, fill=color)
    canvas[:] = np.array(img)

def draw_highlight_box(canvas, x, y, w, h, color=GREEN, alpha=180, width=3):
    """Draw a glowing border box around a region."""
    img = Image.fromarray(canvas)
    d = ImageDraw.Draw(img)
    d.rectangle([x, y, x+w, y+h], outline=(*color, alpha), width=width)
    canvas[:] = np.array(img)

def draw_cursor(canvas, x, y, alpha=255):
    """Draw a simple mouse cursor."""
    img = Image.fromarray(canvas)
    d = ImageDraw.Draw(img)
    # Arrow cursor shape
    pts = [(x, y), (x+12, y+16), (x+5, y+14), (x+7, y+20), (x+4, y+21),
           (x+2, y+15), (x-2, y+18)]
    d.polygon(pts, fill=(30, 30, 30, alpha), outline=(255, 255, 255, alpha))
    canvas[:] = np.array(img)

def crossfade(arr1, arr2, t):
    """Linear blend between two frames."""
    t = max(0., min(1., t))
    return (arr1.astype(np.float32)*(1-t) + arr2.astype(np.float32)*t).astype(np.uint8)

# ── Typing simulation ─────────────────────────────────────────────────────────
def sim_typing(canvas, bg_shot, input_text, chars_done, cx, cy, iw):
    """Overlay typed characters onto the input field area."""
    # Copy bg
    canvas[:] = bg_shot
    # Draw cursor blinking and partial text
    partial = input_text[:chars_done]
    img = Image.fromarray(canvas)
    d = ImageDraw.Draw(img)
    # Input field highlight
    d.rectangle([cx, cy, cx+iw, cy+44], outline=(22,163,74), width=2)
    # Typed text inside
    f = get_font(FONTR, 16)
    d.text((cx+12, cy+13), partial, font=f, fill=(0, 0, 0))
    # Blinking cursor
    tw = tbounds(partial, f)[0] if partial else 0
    cursor_x = cx + 12 + tw + 2
    d.line([(cursor_x, cy+10), (cursor_x, cy+34)], fill=(0,0,0), width=1)
    canvas[:] = np.array(img)

# ── Ken Burns zoom ─────────────────────────────────────────────────────────────
def ken_burns(shot, t, dur, z_start=1.0, z_end=1.12, cx=0.5, cy=0.4):
    """Progressive zoom into a region."""
    progress = ease_io(t/dur)
    zoom = z_start + (z_end - z_start) * progress
    img = Image.fromarray(shot)
    nw, nh = int(W*zoom), int(H*zoom)
    img = img.resize((nw, nh), Image.BILINEAR)
    px = int((nw - W) * cx)
    py = int((nh - H) * cy)
    img = img.crop((px, py, px+W, py+H))
    return np.array(img, dtype=np.uint8)

# ── PRELOAD SHOTS ─────────────────────────────────────────────────────────────
home      = load_shot("home")
home_sc   = load_shot("home_scroll")
meta_emp  = load_shot("meta_empty")
meta_typ  = load_shot("meta_typed")
meta_res  = load_shot("meta_result")
meta_res2 = load_shot("meta_result2")
ssl_emp   = load_shot("ssl_empty")
ssl_typ   = load_shot("ssl_typed")
ssl_res   = load_shot("ssl_result")
idx_typ   = load_shot("index_typed")
idx_res   = load_shot("index_result")

# ── SCENE 1: Homepage intro (3.5s) ────────────────────────────────────────────
def sc_home(arr, t, dur):
    if t < 2.5:
        # Slow scroll: blend home and home_scroll
        blend = ease_io(min(1.0, t/2.0))
        arr[:] = crossfade(home, home_sc, blend)
    else:
        arr[:] = home_sc
    # Fade in from black
    if t < 0.5:
        dark = np.zeros_like(arr)
        arr[:] = crossfade(dark, arr, t/0.5)
    # "GetIndexed — Free SEO Tools" label top center
    fa = min(1., (t-0.4)/0.4)
    if fa > 0:
        img = Image.fromarray(arr)
        d = ImageDraw.Draw(img)
        f = get_font(FONTB, 15)
        txt = "getindexed.co  |  50+ Free SEO Tools"
        tw, th = tbounds(txt, f)
        # Semi-transparent top bar
        d.rectangle([0, 0, W, 40], fill=(0, 0, 0, int(180*fa)))
        d.text(((W-tw)//2, 11), txt, font=f, fill=(255, 255, 255, int(255*fa)))
        arr[:] = np.array(img)
render("home", 3.5, sc_home)

# ── SCENE 2: Meta Tag Analyzer — typing (3.5s) ────────────────────────────────
URL_META = "https://github.com"
# Input field approximate coords on 1280×720 page
META_IX, META_IY, META_IW = 76, 382, 1010

def sc_meta_type(arr, t, dur):
    total_chars = len(URL_META)
    chars = int(total_chars * ease_out(t/(dur*0.75)))
    arr[:] = meta_emp
    # Draw typing
    img = Image.fromarray(arr)
    d = ImageDraw.Draw(img)
    partial = URL_META[:chars]
    f = get_font(FONTR, 16)
    # Highlight input border green while typing
    d.rectangle([META_IX, META_IY, META_IX+META_IW, META_IY+44],
                outline=(22, 163, 74), width=2)
    d.text((META_IX+12, META_IY+13), partial, font=f, fill=(0, 0, 0))
    if chars < total_chars:
        tw = tbounds(partial, f)[0] if partial else 0
        cx2 = META_IX + 12 + tw + 2
        # blinking cursor
        if int(t*8) % 2 == 0:
            d.line([(cx2, META_IY+10), (cx2, META_IY+34)], fill=(0,0,0), width=1)
    arr[:] = np.array(img)
    # Cursor at Analyze button
    if chars == total_chars and t > dur*0.85:
        draw_cursor(arr, 1150, 393, alpha=int(255*(t-dur*0.85)/(dur*0.15)))
render("meta_type", 3.5, sc_meta_type)

# ── SCENE 3: Meta result reveal (5.5s) ────────────────────────────────────────
def sc_meta_res(arr, t, dur):
    if t < 0.4:
        # Snap from loading to result
        arr[:] = crossfade(meta_typ, meta_res, t/0.4)
    else:
        progress = ease_io(min(1., (t-0.4)/1.5))
        # Ken Burns zoom toward the result card
        zoom = 1.0 + progress*0.18
        arr[:] = ken_burns(meta_res, t-0.4, dur-0.4, z_start=1.0, z_end=1.18, cx=0.5, cy=0.55)

    # After 1.5s: highlight the score
    if t > 1.5:
        ha = min(1., (t-1.5)/0.5)
        # Highlight box around "Meta Score: 80/100" region (approx after zoom)
        draw_highlight_box(arr, 74, 456, 1150, 66, color=GREEN, alpha=int(200*ha), width=3)
        # Callout bubble
        if t > 2.2:
            ca = min(1., (t-2.2)/0.4)
            draw_callout(arr, "Meta Score: 80/100\nTitle, OG tags, Canonical — all checked",
                         80, 380, size=20, alpha=int(255*ca))
    # Label
    fa = min(1., t/0.5)
    draw_label(arr, "Meta Tag Analyzer", 20, H-40, size=13, color=WHITE, bg=GREEN)
render("meta_res", 5.5, sc_meta_res)

# ── SCENE 4: SSL Checker — typing (3.0s) ──────────────────────────────────────
URL_SSL = "github.com"
SSL_IX, SSL_IY, SSL_IW = 76, 382, 1010

def sc_ssl_type(arr, t, dur):
    total_chars = len(URL_SSL)
    chars = int(total_chars * ease_out(t/(dur*0.7)))
    arr[:] = ssl_emp
    img = Image.fromarray(arr)
    d = ImageDraw.Draw(img)
    partial = URL_SSL[:chars]
    f = get_font(FONTR, 16)
    d.rectangle([SSL_IX, SSL_IY, SSL_IX+SSL_IW, SSL_IY+44], outline=(22,163,74), width=2)
    d.text((SSL_IX+12, SSL_IY+13), partial, font=f, fill=(0, 0, 0))
    if chars < total_chars:
        tw = tbounds(partial, f)[0] if partial else 0
        cx2 = SSL_IX + 12 + tw + 2
        if int(t*8) % 2 == 0:
            d.line([(cx2, SSL_IY+10), (cx2, SSL_IY+34)], fill=(0,0,0), width=1)
    arr[:] = np.array(img)
    if chars == total_chars and t > dur*0.85:
        draw_cursor(arr, 1150, 393, alpha=int(255*(t-dur*0.85)/(dur*0.15)))
render("ssl_type", 3.0, sc_ssl_type)

# ── SCENE 5: SSL result (5.5s) ────────────────────────────────────────────────
def sc_ssl_res(arr, t, dur):
    if t < 0.4:
        arr[:] = crossfade(ssl_typ, ssl_res, t/0.4)
    else:
        arr[:] = ken_burns(ssl_res, t-0.4, dur-0.4, z_start=1.0, z_end=1.20, cx=0.5, cy=0.60)

    # Highlight the grade "B" circle
    if t > 1.3:
        ha = min(1., (t-1.3)/0.4)
        # The B badge is top-right of result card, approx after zoom
        draw_highlight_box(arr, 1100, 455, 100, 66, color=(59, 130, 246), alpha=int(220*ha), width=3)
        if t > 2.0:
            ca = min(1., (t-2.0)/0.4)
            draw_callout(arr,
                "SSL Grade: B\nTLSv1.3 · Expires 8/2/2026\nIssuer: Sectigo Limited",
                80, 380, size=19, alpha=int(255*ca))
    draw_label(arr, "SSL Certificate Checker", 20, H-40, size=13, color=WHITE, bg=GREEN)
render("ssl_res", 5.5, sc_ssl_res)

# ── SCENE 6: Index Checker (4.5s) ─────────────────────────────────────────────
def sc_idx(arr, t, dur):
    if t < 1.0:
        arr[:] = crossfade(idx_typ, idx_res, min(1., t/0.5))
    else:
        arr[:] = ken_burns(idx_res, t-1.0, dur-1.0, z_start=1.0, z_end=1.15, cx=0.5, cy=0.55)
    if t > 1.8:
        ha = min(1., (t-1.8)/0.4)
        draw_highlight_box(arr, 74, 456, 1150, 66, color=GREEN, alpha=int(200*ha), width=3)
        if t > 2.4:
            ca = min(1., (t-2.4)/0.4)
            draw_callout(arr, "Google Index Checker\nInstant indexing status for any URL",
                         80, 380, size=19, alpha=int(255*ca))
    draw_label(arr, "Google Index Checker", 20, H-40, size=13, color=WHITE, bg=GREEN)
render("idx", 4.5, sc_idx)

# ── SCENE 7: Outro (4.0s) ─────────────────────────────────────────────────────
def sc_outro(arr, t, dur):
    # Fade from last tool to dark
    fade = ease_io(min(1., t/1.2))
    base = (idx_res.astype(np.float32) * (1-fade)).astype(np.uint8)
    dark = np.full_like(idx_res, 12)
    arr[:] = crossfade(base, dark, fade)

    img = Image.fromarray(arr)
    d   = ImageDraw.Draw(img)

    # Big centered text
    ta = max(0., (t-0.8)/0.6)
    if ta > 0:
        # "GetIndexed" in green
        fg = get_font(FONTB, 88)
        txt1 = "GetIndexed"
        tw, th = tbounds(txt1, fg)
        alpha = int(min(255, ta*255))
        d.text(((W-tw)//2, H//2 - 70), txt1, font=fg, fill=(*GREEN, alpha))

    if t > 1.8:
        fa2 = min(1., (t-1.8)/0.5)
        fs = get_font(FONTR, 26)
        txt2 = "50+ free SEO tools. No signup required."
        tw2, _ = tbounds(txt2, fs)
        d.text(((W-tw2)//2, H//2 + 42), txt2, font=fs,
               fill=(200, 200, 200, int(230*fa2)))

    if t > 2.6:
        fa3 = min(1., (t-2.6)/0.5)
        fu = get_font(FONTB, 20)
        url = "getindexed.co"
        tu, _ = tbounds(url, fu)
        d.text(((W-tu)//2, H//2 + 100), url, font=fu,
               fill=(*GREEN, int(255*fa3)))

    # Fade out at end
    if t > dur - 0.8:
        fo = (t - (dur-0.8))/0.8
        overlay = Image.fromarray(np.zeros((H,W,3), dtype=np.uint8))
        img = Image.blend(img.convert('RGB'), overlay.convert('RGB'), fo)

    arr[:] = np.array(img.convert('RGB'))
render("outro", 4.0, sc_outro)

print("All frames done.")
PYEOF
log "Frames done ✓"

# ── ENCODE EACH SCENE ─────────────────────────────────────────────────────────
log "Encoding scenes..."
for sc in home meta_type meta_res ssl_type ssl_res idx outro; do
  ffmpeg -y -r ${FPS} -i "$TMP/sc_${sc}/%04d.png" \
    -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p \
    "$TMP/s_${sc}.mp4" 2>/dev/null && echo "  ${sc} ✓"
done

# ── CONCAT ────────────────────────────────────────────────────────────────────
log "Concatenating..."
cat > "$TMP/concat.txt" << 'EOF'
file 's_home.mp4'
file 's_meta_type.mp4'
file 's_meta_res.mp4'
file 's_ssl_type.mp4'
file 's_ssl_res.mp4'
file 's_idx.mp4'
file 's_outro.mp4'
EOF
ffmpeg -y -f concat -safe 0 -i "$TMP/concat.txt" \
  -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p \
  "$TMP/vid.mp4" 2>/dev/null
DUR_V=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$TMP/vid.mp4")
log "Video: ${DUR_V}s"

# ── AUDIO: upbeat soft background ─────────────────────────────────────────────
log "Generating audio..."
DUR=$(python3 -c "print(int(float('${DUR_V:-30}') + 1))")

# Soft background pad: layered sine waves (ambient chime)
python3 << AEOF
import subprocess, math, os

DUR = $DUR
TMP = "/tmp/gi_demo"
sr  = 44100

notes = [
    (261.6, 0.0,  0.14),  # C4 - intro
    (329.6, 0.3,  0.12),  # E4
    (392.0, 0.6,  0.10),  # G4
    (523.3, 3.5,  0.16),  # C5 - meta
    (659.3, 4.5,  0.12),  # E5
    (523.3, 7.5,  0.14),  # C5 - meta result
    (392.0, 11.0, 0.16),  # G4 - ssl
    (493.9, 12.0, 0.12),  # B4
    (587.3, 15.0, 0.14),  # D5 - ssl result
    (523.3, 19.5, 0.14),  # C5 - index
    (659.3, 23.0, 0.18),  # E5 - outro
    (784.0, 23.6, 0.12),  # G5
    (1046.5, 24.2, 0.08), # C6
]

for i,(f,ms,v) in enumerate(notes):
    f2 = f*2; f3 = f*3
    delay = int(ms*1000)
    pad = max(0.1, DUR - ms - 3.5)
    cmd = (f"ffmpeg -y -f lavfi "
           f"-i \"aevalsrc=(sin(2*PI*{f}*t)*exp(-3*t)*0.7+"
           f"sin(2*PI*{f2}*t)*exp(-5*t)*0.2+"
           f"sin(2*PI*{f3}*t)*exp(-8*t)*0.08)*{v}:c=mono:s={sr}:d=3.2\" "
           f"-af \"adelay={delay}|{delay},apad=pad_dur={pad:.2f},atrim=0:{DUR}\" "
           f"-t {DUR} {TMP}/n{i}.wav")
    subprocess.run(cmd, shell=True, capture_output=True)

# Soft sub-bass heartbeat
subprocess.run(
    f"ffmpeg -y -f lavfi -i \"sine=frequency=55:duration={DUR}\" "
    f"-af \"lowpass=f=80,volume=0.06,afade=t=in:st=0:d=2,afade=t=out:st={DUR-2}:d=2\" "
    f"{TMP}/bass.wav",
    shell=True, capture_output=True
)
print(f"Generated {len(notes)} tones + bass")
AEOF

# Count audio files
INPUTS=""
COUNT=0
for f in "$TMP"/n*.wav "$TMP/bass.wav"; do
  [ -f "$f" ] || continue
  INPUTS="$INPUTS -i $f"; COUNT=$((COUNT+1))
done
echo "  Mixing $COUNT tracks..."

MIX=$(python3 -c "print(''.join(f'[{i}]' for i in range($COUNT))+'amix=inputs=$COUNT:normalize=0[mix]')")

ffmpeg -y $INPUTS \
  -filter_complex "${MIX}; \
    [mix]aecho=0.75:0.6:320:0.32,aecho=0.5:0.4:640:0.16[e]; \
    [e]alimiter=limit=0.88:level=0:attack=5:release=100, \
       equalizer=f=200:width_type=o:width=1:g=3, \
       equalizer=f=4000:width_type=o:width=1.5:g=-2[out]" \
  -map "[out]" -t "$DUR" -ar 44100 "$TMP/audio.aac" 2>/dev/null
log "Audio ✓"

# ── MUX ──────────────────────────────────────────────────────────────────────
log "Muxing..."
ffmpeg -y -i "$TMP/vid.mp4" -i "$TMP/audio.aac" \
  -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT" 2>/dev/null

echo ""
log "✅  $OUT"
ls -lh "$OUT"
ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUT" \
  | xargs -I{} printf "Duration: %.1fs\n" {}
