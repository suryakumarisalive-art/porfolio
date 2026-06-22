#!/bin/bash
set -e

SRC="/home/user/porfolio/video-raw/a3dafc3b2eeaf20d41d1dabf843b5532.webm"
OUT="/home/user/porfolio/video-raw/edit/launch.mp4"
TMP="/tmp/gi_launch"
mkdir -p "$TMP"

W=1280; H=720; FPS=25
FONTB="/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT="/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

log() { echo -e "\033[1;32m[launch]\033[0m $1"; }

# Cookie banner starts at ~79% height — crop top 78% (562px), scale back to 1280x720
CROP="crop=${W}:562:0:0,scale=${W}:${H}"
# Cinematic grade: desaturate, darken (brightness=-0.22 turns white→medium grey), green lift
GFILT="${CROP},eq=saturation=0.68:contrast=1.08:brightness=-0.22,curves=all='0/0 0.5/0.32 1/0.78',curves=green='0/0 0.4/0.43 1/1'"

# txt <text> <size> <color> <fade_in_end> <hold_end> <fade_out_end> <y> [font]
# All text gets a black drop shadow for visibility on light backgrounds
txt() {
  local t="$1" s="$2" c="$3" ti="$4" th="$5" to="$6" y="$7" f="${8:-$FONTB}"
  echo "drawtext=fontfile='${f}':text='${t}':fontsize=${s}:fontcolor=${c}:x=(w-text_w)/2:y=${y}:shadowx=3:shadowy=3:shadowcolor=black@0.9:alpha='if(lt(t,${ti}),t/${ti},if(lt(t,${th}),1.0,if(lt(t,${to}),(${to}-t)/(${to}-${th}),0)))'"
}

# ── S1 (0-3s): Hook on black ──────────────────────────────────────────────────
log "Scene 1/8 — hook..."
L1a=$(txt "The SEO stack." 74 white 0.5 2.0 3.0 "h*0.38" "$FONTB")
L1b=$(txt "Pay 1/5th what Ahrefs charges." 38 "0x94a3b8" 0.9 2.0 3.0 "h*0.55" "$FONT")
ffmpeg -y -f lavfi -i "color=black:size=${W}x${H}:rate=${FPS}:duration=3" \
  -vf "${L1a},${L1b}" \
  -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p "$TMP/s1.mp4" 2>/dev/null
log "Scene 1 ✓"

# ── S2 (3-8s): Hero headline slow zoom (5s) ───────────────────────────────────
log "Scene 2/8 — hero..."
# Zoom starts at 1.1, grows to ~1.275 over 125 frames @ 25fps
# y=0 anchors to top of frame (where headline lives)
ZOOM2="zoompan=z='if(eq(on,1),1.1,min(zoom+0.0014,1.35))':x='iw/2-(iw/zoom/2)':y='0':d=125:s=${W}x${H}:fps=${FPS}"
L2=$(txt "getindexed.co" 18 "0x16a34a" 1.5 4.5 5.0 "h*0.90" "$FONT")
ffmpeg -y -ss 2.0 -t 8 -i "$SRC" \
  -vf "${GFILT},${ZOOM2},${L2}" \
  -t 5 -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p "$TMP/s2.mp4" 2>/dev/null
log "Scene 2 ✓"

# ── S3 (8-13s): Feature card beats — 4 × 1.25s ───────────────────────────────
log "Scene 3/8 — feature beats..."
declare -a F_SS=(26 27.5 29 30.5)
declare -a F_BEAT=("INDEXED." "MONITORED." "AUDITED." "AI-POWERED.")
# 10% zoom-in crop to fill the card area
ZOOM_F="scale=$((W*112/100)):$((H*112/100)),crop=${W}:${H}:$((W*12/200)):$((H*12/200))"
for i in 0 1 2 3; do
  ss="${F_SS[$i]}"
  beat="${F_BEAT[$i]}"
  LF="drawtext=fontfile='${FONTB}':text='${beat}':fontsize=100:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:borderw=5:bordercolor=black@0.7:shadowx=4:shadowy=4:shadowcolor=black@0.95:alpha='if(lt(t,0.1),t/0.1,if(lt(t,1.0),1.0,if(lt(t,1.25),(1.25-t)/(1.25-1.0),0)))'"
  ffmpeg -y -ss "$ss" -t 3 -i "$SRC" \
    -vf "${GFILT},${ZOOM_F},${LF}" \
    -t 1.25 -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p "$TMP/f${i}.mp4" 2>/dev/null
done
printf "file 'f0.mp4'\nfile 'f1.mp4'\nfile 'f2.mp4'\nfile 'f3.mp4'\n" > "$TMP/feat.txt"
ffmpeg -y -f concat -safe 0 -i "$TMP/feat.txt" \
  -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p \
  "$TMP/s3.mp4" 2>/dev/null
log "Scene 3 ✓"

# ── S4 (13-17s): Tools grid (4s) ─────────────────────────────────────────────
log "Scene 4/8 — tools..."
L4a=$(txt "50 free tools." 66 white 0.5 3.2 4.0 "h*0.09" "$FONTB")
L4b=$(txt "No signup. No card." 28 "0x94a3b8" 0.9 3.2 4.0 "h*0.21" "$FONT")
ffmpeg -y -ss 47 -t 6 -i "$SRC" \
  -vf "${GFILT},${L4a},${L4b}" \
  -t 4 -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p "$TMP/s4.mp4" 2>/dev/null
log "Scene 4 ✓"

# ── S5 (17-21s): Price comparison (4s) ───────────────────────────────────────
log "Scene 5/8 — pricing..."
# Source: desktop hero at 84s — shows "at $29/mo" in the subtitle
# Zoom in 20% focused on the upper center (headline + subtext area)
ZOOM5="scale=$((W*120/100)):$((H*120/100)),crop=${W}:${H}:$((W*10/200)):$((H*5/200))"
L5a=$(txt "Ahrefs + Semrush: \$99-500/mo" 34 "0xef4444" 0.4 3.4 4.0 "h*0.70" "$FONTB")
L5b=$(txt "GetIndexed: \$29/mo" 50 "0x16a34a" 0.9 3.4 4.0 "h*0.81" "$FONTB")
ffmpeg -y -ss 84 -t 7 -i "$SRC" \
  -vf "${GFILT},${ZOOM5},${L5a},${L5b}" \
  -t 4 -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p "$TMP/s5.mp4" 2>/dev/null
log "Scene 5 ✓"

# ── S6 (21-25s): Lifetime deal (4s) ──────────────────────────────────────────
log "Scene 6/8 — lifetime..."
# Source: pricing page lifetime card at 40s (green callout)
ZOOM6="scale=$((W*108/100)):$((H*108/100)),crop=${W}:${H}:$((W*4/200)):$((H*4/200))"
L6a=$(txt "\$499 once. Pro forever." 46 white 0.5 3.2 4.0 "h*0.74" "$FONTB")
L6b=$(txt "First 200 slots." 28 "0xfbbf24" 1.0 3.2 4.0 "h*0.85" "$FONT")
ffmpeg -y -ss 40 -t 6 -i "$SRC" \
  -vf "${GFILT},${ZOOM6},${L6a},${L6b}" \
  -t 4 -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p "$TMP/s6.mp4" 2>/dev/null
log "Scene 6 ✓"

# ── S7 (25-28s): PIL tool name flash cards (3s) ──────────────────────────────
log "Scene 7/8 — tool flash (PIL)..."
python3 - <<'PYEOF'
from PIL import Image, ImageDraw, ImageFont
import os

TMP = "/tmp/gi_launch"
W, H = 1280, 720

tools = [
    "Google Index Checker",    "SERP Position Checker",
    "Robots.txt Tester",       "XML Sitemap Validator",
    "Security Headers Grader", "Page Speed Checker",
    "AI Meta Tag Generator",   "Schema Markup Validator",
    "Broken Link Checker",     "Domain Authority Checker",
    "Keyword Density Analyzer","Readability Checker",
]

GREEN  = (22, 163, 74)
WHITE  = (238, 238, 238)
DIM    = (68, 68, 68)
BG     = (6, 6, 6)

try:
    fbig   = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 52)
    fsmall = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", 20)
except Exception:
    fbig = fsmall = ImageFont.load_default()

for i, tool in enumerate(tools):
    img  = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    # Green accent bar
    draw.rectangle([W//2 - 50, H//2 - 52, W//2 + 50, H//2 - 48], fill=GREEN)
    # Tool name (centered)
    bbox = draw.textbbox((0, 0), tool, font=fbig)
    tw   = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, H//2 - 36), tool, font=fbig, fill=WHITE)
    # Counter
    cstr  = f"{i+1:02d} / {len(tools)}"
    cbbox = draw.textbbox((0, 0), cstr, font=fsmall)
    cw    = cbbox[2] - cbbox[0]
    draw.text(((W - cw) // 2, H//2 + 32), cstr, font=fsmall, fill=DIM)
    img.save(os.path.join(TMP, f"tool_{i:02d}.png"))

# Write ffmpeg image concat list
imgs = sorted(f for f in os.listdir(TMP) if f.startswith("tool_") and f.endswith(".png"))
with open(os.path.join(TMP, "tools_imgs.txt"), "w") as fh:
    for img in imgs:
        fh.write(f"file '{img}'\nduration 0.25\n")
    fh.write(f"file '{imgs[-1]}'\n")

print(f"Generated {len(tools)} tool cards")
PYEOF

ffmpeg -y -f concat -safe 0 -i "$TMP/tools_imgs.txt" \
  -vf "scale=${W}:${H},format=yuv420p" \
  -c:v libx264 -preset fast -crf 16 -r ${FPS} \
  "$TMP/s7.mp4" 2>/dev/null
log "Scene 7 ✓"

# ── S8 (28-30s): Logo reveal on black (2s) ───────────────────────────────────
log "Scene 8/8 — logo..."
L8a=$(txt "GetIndexed" 82 "0x16a34a" 0.3 1.7 2.0 "h*0.37" "$FONTB")
L8b=$(txt "Available now." 32 white 0.7 1.7 2.0 "h*0.55" "$FONT")
L8c=$(txt "getindexed.co" 20 "0x64748b" 1.1 1.7 2.0 "h*0.65" "$FONT")
ffmpeg -y -f lavfi -i "color=black:size=${W}x${H}:rate=${FPS}:duration=2" \
  -vf "${L8a},${L8b},${L8c}" \
  -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p "$TMP/s8.mp4" 2>/dev/null
log "Scene 8 ✓"

# ── AUDIO ─────────────────────────────────────────────────────────────────────
log "Generating audio..."
# Bass drone 48hz
ffmpeg -y -f lavfi -i "sine=frequency=48:duration=30" \
  -af "lowpass=f=80,volume=0.12,afade=t=in:st=0:d=1.5,afade=t=out:st=27:d=3" \
  "$TMP/bass.wav" 2>/dev/null
# Mid presence 96hz
ffmpeg -y -f lavfi -i "sine=frequency=96:duration=30" \
  -af "lowpass=f=110,volume=0.05,afade=t=in:st=2:d=2,afade=t=out:st=26:d=4" \
  "$TMP/mid.wav" 2>/dev/null
# Opening impact at 3s
ffmpeg -y -f lavfi -i "sine=frequency=380:duration=0.4" \
  -af "volume=0.50,afade=t=in:st=0:d=0.02,afade=t=out:st=0.15:d=0.25,apad=pad_dur=26.6" \
  -t 30 "$TMP/hit3.wav" 2>/dev/null
# Beat pulses at scene transitions
for BT in 8 13 17 21; do
  PAD_DUR=$(echo "30 - $BT - 0.3" | bc -l)
  ffmpeg -y -f lavfi -i "sine=frequency=220:duration=0.3" \
    -af "volume=0.22,afade=t=in:st=0:d=0.02,afade=t=out:st=0.1:d=0.2,apad=pad_dur=${PAD_DUR}" \
    -t 30 "$TMP/beat${BT}.wav" 2>/dev/null
done
# Logo hit at 28s
ffmpeg -y -f lavfi -i "sine=frequency=528:duration=2" \
  -af "volume=0.40,afade=t=in:st=0:d=0.1,afade=t=out:st=1.0:d=1.0,adelay=28000|28000" \
  -t 30 "$TMP/logo.wav" 2>/dev/null

ffmpeg -y \
  -i "$TMP/bass.wav" -i "$TMP/mid.wav" -i "$TMP/hit3.wav" \
  -i "$TMP/beat8.wav" -i "$TMP/beat13.wav" -i "$TMP/beat17.wav" -i "$TMP/beat21.wav" \
  -i "$TMP/logo.wav" \
  -filter_complex "[0][1][2][3][4][5][6][7]amix=inputs=8:normalize=0[aout]" \
  -map "[aout]" -t 30 "$TMP/audio.aac" 2>/dev/null
log "Audio ✓"

# ── CONCAT SCENES ─────────────────────────────────────────────────────────────
log "Concatenating scenes..."
cat > "$TMP/concat.txt" <<CEOF
file 's1.mp4'
file 's2.mp4'
file 's3.mp4'
file 's4.mp4'
file 's5.mp4'
file 's6.mp4'
file 's7.mp4'
file 's8.mp4'
CEOF

ffmpeg -y -f concat -safe 0 -i "$TMP/concat.txt" \
  -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p \
  "$TMP/video_only.mp4" 2>/dev/null
log "Video concat ✓"

# ── MUX VIDEO + AUDIO ─────────────────────────────────────────────────────────
log "Muxing..."
ffmpeg -y \
  -i "$TMP/video_only.mp4" \
  -i "$TMP/audio.aac" \
  -c:v copy -c:a aac -b:a 192k \
  -shortest -movflags +faststart \
  "$OUT" 2>/dev/null

echo ""
log "✅  Launch video ready: $OUT"
ls -lh "$OUT"
ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUT" | xargs -I{} echo "Duration: {}s"
