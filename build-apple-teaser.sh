#!/bin/bash
set -e

SRC="/home/user/porfolio/video-raw/a3dafc3b2eeaf20d41d1dabf843b5532.webm"
OUT="/home/user/porfolio/video-raw/edit/apple-teaser.mp4"
TMP="/tmp/gi_apple"
rm -rf "$TMP" && mkdir -p "$TMP"

W=1280; H=720; FPS=25
log() { echo -e "\033[1;32m[apple]\033[0m $1"; }

# ── FRAME GENERATION (PIL) ────────────────────────────────────────────────────
log "Generating cinematic frames..."
python3 << 'PYEOF'
import os, math
from PIL import Image, ImageDraw, ImageFont

TMP = "/tmp/gi_apple"
W, H = 1280, 720
FPS = 25

BG      = (0, 0, 0)
WHITE   = (242, 242, 242)
GREEN   = (22, 163, 74)
DIM     = (100, 100, 100)
DIMMER  = (55, 55, 55)

FONTB = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONTR = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

def ease_out(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3

def ease_in(t):
    t = max(0.0, min(1.0, t))
    return t ** 3

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def text_alpha_y(t, t_in, t_hold, t_out, y_drop=22):
    """Returns (alpha 0-255, y_offset) for Apple-style text reveal."""
    if t >= t_out:
        return 0, 0
    if t < t_in:
        p = ease_out(t / t_in)
        return int(255 * p), int(y_drop * (1 - p))
    if t < t_hold:
        return 255, 0
    p = ease_in((t - t_hold) / (t_out - t_hold))
    return int(255 * (1 - p)), int(-10 * p)

def draw_text(img, text, font_path, size, color, cx, cy, t, t_in, t_hold, t_out):
    alpha, yoff = text_alpha_y(t, t_in, t_hold, t_out)
    if alpha <= 0:
        return
    font = get_font(font_path, size)
    # Measure
    tmp = Image.new("RGBA", (1, 1))
    d = ImageDraw.Draw(tmp)
    bb = d.textbbox((0,0), text, font=font)
    tw, th = bb[2]-bb[0], bb[3]-bb[1]
    x = cx - tw // 2
    y = cy - th // 2 + yoff
    # Overlay with alpha
    overlay = Image.new("RGBA", img.size, (0,0,0,0))
    od = ImageDraw.Draw(overlay)
    od.text((x, y), text, font=font, fill=(*color, alpha))
    img.alpha_composite(overlay)

def render_frames(name, duration, fn):
    d = os.path.join(TMP, f"sc_{name}")
    os.makedirs(d, exist_ok=True)
    n = int(duration * FPS)
    for i in range(n):
        t = i / FPS
        img = Image.new("RGBA", (W, H), (0,0,0,255))
        fn(img, t, duration)
        rgb = Image.new("RGB", img.size, BG)
        rgb.paste(img, mask=img.split()[3])
        rgb.save(os.path.join(d, f"{i:04d}.png"))
    print(f"  Scene {name}: {n} frames")

cx, cy = W//2, H//2

# ─ Scene 1: "SEO." — 3s ──────────────────────────────────────────────────────
def s1(img, t, dur):
    draw_text(img, "SEO.", FONTB, 220, WHITE, cx, cy, t,
              t_in=0.55, t_hold=2.4, t_out=3.0)
render_frames("1", 3.0, s1)

# ─ Scene 2: "Done right." — 3s ───────────────────────────────────────────────
def s2(img, t, dur):
    draw_text(img, "Done right.", FONTB, 158, WHITE, cx, cy, t,
              t_in=0.55, t_hold=2.4, t_out=3.0)
render_frames("2", 3.0, s2)

# ─ Scene 3: "Indexed." — 2.5s (green) ───────────────────────────────────────
def s3(img, t, dur):
    draw_text(img, "Indexed.", FONTB, 200, GREEN, cx, cy, t,
              t_in=0.45, t_hold=2.0, t_out=2.5)
render_frames("3", 2.5, s3)

# ─ Scene 4: "Monitored." — 2s ────────────────────────────────────────────────
def s4(img, t, dur):
    draw_text(img, "Monitored.", FONTB, 180, WHITE, cx, cy, t,
              t_in=0.4, t_hold=1.5, t_out=2.0)
render_frames("4", 2.0, s4)

# ─ Scene 5: "Audited." — 2s ──────────────────────────────────────────────────
def s5(img, t, dur):
    draw_text(img, "Audited.", FONTB, 180, WHITE, cx, cy, t,
              t_in=0.4, t_hold=1.5, t_out=2.0)
render_frames("5", 2.0, s5)

# ─ Scene 6: "AI-Powered." — 2s (green) ──────────────────────────────────────
def s6(img, t, dur):
    draw_text(img, "AI-Powered.", FONTB, 152, GREEN, cx, cy, t,
              t_in=0.4, t_hold=1.5, t_out=2.0)
render_frames("6", 2.0, s6)

# ─ Scene 7: Price reveal "$29" then "/mo" — 4s ───────────────────────────────
def s7(img, t, dur):
    font_big = get_font(FONTB, 260)
    font_mo  = get_font(FONTB, 90)
    # Measure "$29" to anchor "/mo" right of it
    tmp = Image.new("RGBA",(1,1))
    d = ImageDraw.Draw(tmp)
    bb = d.textbbox((0,0), "$29", font=font_big)
    tw_main = bb[2]-bb[0]
    bb2 = d.textbbox((0,0), "/mo", font=font_mo)
    tw_mo = bb2[2]-bb2[0]
    th_mo = bb2[3]-bb2[1]

    # Center the whole "$29 /mo" block
    gap = 18
    total_w = tw_main + gap + tw_mo
    x_start = cx - total_w // 2

    # "$29" alpha
    a29, yoff29 = text_alpha_y(t, 0.5, 3.6, 4.0)
    # "/mo" comes in 1.2s later
    t_mo = max(0, t - 1.2)
    amo, yoffmo = text_alpha_y(t_mo, 0.5, 2.8, 0.8)
    if t < 1.2:
        amo = 0

    if a29 > 0:
        bb = d.textbbox((0,0), "$29", font=font_big)
        th29 = bb[3]-bb[1]
        overlay = Image.new("RGBA", img.size, (0,0,0,0))
        od = ImageDraw.Draw(overlay)
        od.text((x_start, cy - th29//2 + yoff29), "$29", font=font_big, fill=(*WHITE, a29))
        img.alpha_composite(overlay)

    if amo > 0:
        x_mo = x_start + tw_main + gap
        overlay = Image.new("RGBA", img.size, (0,0,0,0))
        od = ImageDraw.Draw(overlay)
        od.text((x_mo, cy - th_mo//2 + yoffmo + 60), "/mo", font=font_mo, fill=(*GREEN, amo))
        img.alpha_composite(overlay)

render_frames("7", 4.0, s7)

# ─ Scene 8: "50 free tools." — 3.5s ─────────────────────────────────────────
def s8(img, t, dur):
    draw_text(img, "50 free tools.", FONTB, 128, WHITE, cx, cy, t,
              t_in=0.5, t_hold=2.8, t_out=3.5)
render_frames("8", 3.5, s8)

# ─ Scene 9: "No signup. No card." — 2.5s (dim) ───────────────────────────────
def s9(img, t, dur):
    draw_text(img, "No signup. No card.", FONTR, 72, DIM, cx, cy, t,
              t_in=0.5, t_hold=1.8, t_out=2.5)
render_frames("9", 2.5, s9)

# ─ Scene 10: "GetIndexed" — 4.5s (green, massive) ────────────────────────────
def s10(img, t, dur):
    # Green accent line above
    alpha_line, _ = text_alpha_y(t, 0.3, 4.1, 4.5)
    if alpha_line > 0:
        overlay = Image.new("RGBA", img.size, (0,0,0,0))
        od = ImageDraw.Draw(overlay)
        line_y = cy - 130
        od.rectangle([cx-60, line_y, cx+60, line_y+3], fill=(*GREEN, alpha_line))
        img.alpha_composite(overlay)
    draw_text(img, "GetIndexed", FONTB, 190, GREEN, cx, cy - 20, t,
              t_in=0.55, t_hold=3.8, t_out=4.5)
render_frames("10", 4.5, s10)

# ─ Scene 11: "getindexed.co" + "Available now." — 3.5s ─────────────────────
def s11(img, t, dur):
    draw_text(img, "Available now.", FONTR, 56, WHITE, cx, cy - 38, t,
              t_in=0.6, t_hold=2.8, t_out=3.5)
    draw_text(img, "getindexed.co", FONTR, 40, DIM, cx, cy + 28, t,
              t_in=0.9, t_hold=2.8, t_out=3.5)
render_frames("11", 3.5, s11)

# ─ Scene 12: Fade to black — 1.5s ────────────────────────────────────────────
def s12(img, t, dur):
    # Already black, nothing needed
    pass
render_frames("12", 1.5, s12)

print("All frames generated.")
PYEOF
log "Frames done ✓"

# ── PRODUCT CLIP (2.5s from source, dark cinematic grade) ────────────────────
log "Extracting product clip..."
mkdir -p "$TMP/sc_prod"
# Extract tools section at 47s, crop banner, ultra-dark grade, then fade in/out
ffmpeg -y -ss 47 -t 4 -i "$SRC" \
  -vf "crop=${W}:562:0:0,scale=${W}:${H},\
eq=saturation=0.5:contrast=1.1:brightness=-0.55,\
curves=all='0/0 0.45/0.28 1/0.72',\
fade=t=in:st=0:d=0.6,fade=t=out:st=1.9:d=0.6" \
  -t 2.5 -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p \
  "$TMP/prod_clip.mp4" 2>/dev/null
log "Product clip ✓"

# ── CONVERT FRAME SEQUENCES TO MP4 ───────────────────────────────────────────
log "Encoding scenes..."
for sc in 1 2 3 4 5 6 7 8 9 10 11 12; do
  ffmpeg -y -r ${FPS} -i "$TMP/sc_${sc}/%04d.png" \
    -c:v libx264 -preset fast -crf 15 -pix_fmt yuv420p \
    "$TMP/s${sc}.mp4" 2>/dev/null
  echo "  scene ${sc} encoded"
done

# ── CONCAT ALL SCENES ─────────────────────────────────────────────────────────
log "Concatenating..."
# Scene order: 1-9, then product clip, then 10-12
cat > "$TMP/concat.txt" << 'CEOF'
file 's1.mp4'
file 's2.mp4'
file 's3.mp4'
file 's4.mp4'
file 's5.mp4'
file 's6.mp4'
file 's7.mp4'
file 's8.mp4'
file 's9.mp4'
file 'prod_clip.mp4'
file 's10.mp4'
file 's11.mp4'
file 's12.mp4'
CEOF

ffmpeg -y -f concat -safe 0 -i "$TMP/concat.txt" \
  -c:v libx264 -preset fast -crf 15 -pix_fmt yuv420p \
  "$TMP/video_only.mp4" 2>/dev/null
log "Video concat ✓"

# ── PREMIUM AUDIO ─────────────────────────────────────────────────────────────
log "Generating premium audio..."

TOTAL=35
# Get actual video duration
DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$TMP/video_only.mp4" | cut -d. -f1)
DUR=${DUR:-35}

# Piano-like tone: quick attack, long exponential decay using aevalsrc
# Note A3=220Hz, E4=330Hz, A4=440Hz, C#5=550Hz → A major chord
# Each hit: attack 30ms, decay ~1.5s tail

make_piano_hit() {
  local freq="$1" delay_ms="$2" vol="$3" pad="$4" out="$5"
  local delay_s=$(echo "scale=3; $delay_ms/1000" | bc)
  # aevalsrc: sine with exponential decay envelope
  ffmpeg -y -f lavfi \
    -i "aevalsrc=sin(2*PI*${freq}*t)*exp(-3.5*t)*${vol}:c=mono:s=44100:d=2.5" \
    -af "adelay=${delay_ms}|${delay_ms},apad=pad_dur=${pad}" \
    -t $((DUR+1)) "$out" 2>/dev/null
}

# Scene timestamps (seconds):
# S1=0, S2=3, S3=6, S4=8.5, S5=10.5, S6=12.5, S7=14.5, S8=18.5
# S9=22, prod=24.5, S10=27, S11=31.5, S12=35

# Opening chord at 0.5s (A3 low drone)
make_piano_hit 110 500 0.18 $((DUR+1)) "$TMP/p_open.wav"

# Each word reveal gets a clean hit
# "SEO." at 0.5s
make_piano_hit 220 500 0.35 $((DUR+1)) "$TMP/p1.wav"
# "Done right." at 3.5s
make_piano_hit 277 3500 0.28 $((DUR+1)) "$TMP/p2.wav"
# "Indexed." at 6.45s (green reveal — higher note)
make_piano_hit 330 6450 0.38 $((DUR+1)) "$TMP/p3.wav"
# "Monitored." at 8.9s
make_piano_hit 294 8900 0.28 $((DUR+1)) "$TMP/p4.wav"
# "Audited." at 10.9s
make_piano_hit 294 10900 0.28 $((DUR+1)) "$TMP/p5.wav"
# "AI-Powered." at 12.9s
make_piano_hit 330 12900 0.30 $((DUR+1)) "$TMP/p6.wav"
# "$29" reveal at 15.0s — BIG moment, A minor chord
make_piano_hit 220 15000 0.42 $((DUR+1)) "$TMP/p7a.wav"
make_piano_hit 330 15000 0.32 $((DUR+1)) "$TMP/p7b.wav"
make_piano_hit 440 15000 0.22 $((DUR+1)) "$TMP/p7c.wav"
# "/mo" at 16.2s
make_piano_hit 392 16200 0.25 $((DUR+1)) "$TMP/p7d.wav"
# "50 free tools." at 19.0s
make_piano_hit 277 19000 0.32 $((DUR+1)) "$TMP/p8.wav"
# "No signup." at 22.5s
make_piano_hit 247 22500 0.20 $((DUR+1)) "$TMP/p9.wav"
# Product clip at 25s — tension rise
make_piano_hit 185 25000 0.22 $((DUR+1)) "$TMP/p_prod.wav"
# "GetIndexed" at 27.5s — triumphant A major chord
make_piano_hit 220 27500 0.45 $((DUR+1)) "$TMP/pa.wav"
make_piano_hit 330 27700 0.35 $((DUR+1)) "$TMP/pb.wav"
make_piano_hit 440 27900 0.28 $((DUR+1)) "$TMP/pc.wav"
make_piano_hit 550 28100 0.18 $((DUR+1)) "$TMP/pd.wav"
# "Available now." at 32s
make_piano_hit 440 32000 0.30 $((DUR+1)) "$TMP/p11.wav"
# Final note fade at 34s
make_piano_hit 330 34000 0.22 $((DUR+1)) "$TMP/p12.wav"

# Sub-bass presence (30hz) throughout
ffmpeg -y -f lavfi -i "sine=frequency=30:duration=$((DUR+1))" \
  -af "lowpass=f=60,volume=0.08,afade=t=in:st=0:d=2,afade=t=out:st=$((DUR-2)):d=2" \
  "$TMP/bass.wav" 2>/dev/null

# High shimmer (8000hz) very subtle from midpoint
ffmpeg -y -f lavfi -i "sine=frequency=8000:duration=$((DUR+1))" \
  -af "highpass=f=6000,volume=0.018,afade=t=in:st=14:d=4,afade=t=out:st=$((DUR-3)):d=3" \
  "$TMP/shimmer.wav" 2>/dev/null

# Mix everything with echo/reverb on piano hits
# Use amix then apply reverb with aecho
ffmpeg -y \
  -i "$TMP/bass.wav" \
  -i "$TMP/shimmer.wav" \
  -i "$TMP/p_open.wav" \
  -i "$TMP/p1.wav" -i "$TMP/p2.wav" -i "$TMP/p3.wav" \
  -i "$TMP/p4.wav" -i "$TMP/p5.wav" -i "$TMP/p6.wav" \
  -i "$TMP/p7a.wav" -i "$TMP/p7b.wav" -i "$TMP/p7c.wav" -i "$TMP/p7d.wav" \
  -i "$TMP/p8.wav" -i "$TMP/p9.wav" -i "$TMP/p_prod.wav" \
  -i "$TMP/pa.wav" -i "$TMP/pb.wav" -i "$TMP/pc.wav" -i "$TMP/pd.wav" \
  -i "$TMP/p11.wav" -i "$TMP/p12.wav" \
  -filter_complex \
    "[0][1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20][21]amix=inputs=22:normalize=0[mix]; \
     [mix]aecho=0.8:0.7:220:0.35,aecho=0.6:0.5:450:0.22[echoout]; \
     [echoout]alimiter=limit=0.9:level=0:attack=5:release=50[aout]" \
  -map "[aout]" -t $((DUR+1)) -ar 44100 "$TMP/audio.aac" 2>/dev/null
log "Audio ✓"

# ── MUX ───────────────────────────────────────────────────────────────────────
log "Muxing final output..."
ffmpeg -y \
  -i "$TMP/video_only.mp4" \
  -i "$TMP/audio.aac" \
  -c:v copy -c:a aac -b:a 256k \
  -shortest -movflags +faststart \
  "$OUT"

echo ""
log "✅  Apple teaser ready: $OUT"
ls -lh "$OUT"
DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUT")
echo "Duration: ${DURATION}s"
