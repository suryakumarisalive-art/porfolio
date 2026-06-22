#!/bin/bash
set -e

SRC="/home/user/porfolio/video-raw/a3dafc3b2eeaf20d41d1dabf843b5532.webm"
OUT="/home/user/porfolio/getindexed-trailer.mp4"
TMP="/tmp/gi_trailer"
mkdir -p "$TMP"

W=1280; H=720; FPS=30
FONT="/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
FONTB="/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

log() { echo -e "\033[1;36m[trailer]\033[0m $1"; }

# ─── Helper: text overlay with fade in/out ───────────────────────────────────
# Usage: txt "text" size color tin_end thold_end tout_end ypos font
txt() {
  local text="$1" size="$2" color="$3" ti="$4" th="$5" to="$6" yy="$7" fnt="${8:-$FONTB}"
  echo "drawtext=fontfile='${fnt}':text='${text}':fontsize=${size}:fontcolor=${color}:x=(w-text_w)/2:y=${yy}:alpha='if(lt(t,${ti}),t/${ti},if(lt(t,${th}),1.0,if(lt(t,${to}),(${to}-t)/(${to}-${th}),0)))'"
}

# ─── SCENE 1 (0-3s): Black intro ─────────────────────────────────────────────
log "Scene 1/8 — Black intro..."
T1=$(txt "Something bigger is coming." 40 white 0.7 2.2 3.0 "(h-text_h)/2" "$FONT")
ffmpeg -y -f lavfi -i "color=black:size=${W}x${H}:rate=${FPS}:duration=3" \
  -vf "$T1" \
  -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p "$TMP/s1.mp4" 2>/dev/null
log "Scene 1 ✓"

# ─── SCENE 2 (3-7s): Homepage hero — slow zoom in ────────────────────────────
log "Scene 2/8 — Hero zoom..."
T2=$(txt "Built for modern SEO." 36 white 0.5 3.2 4.0 "h*0.74" "$FONTB")
ffmpeg -y -ss 1.5 -t 8 -i "$SRC" \
  -vf "eq=saturation=0.85:contrast=1.12,\
zoompan=z='if(eq(on,1),1,min(zoom+0.0018,1.32))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=${W}x${H}:fps=${FPS},\
${T2}" \
  -t 4 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p "$TMP/s2.mp4" 2>/dev/null
log "Scene 2 ✓"

# ─── SCENE 3 (7-12s): Feature montage — speed ramp "Faster." ─────────────────
log "Scene 3/8 — Feature montage..."
T3=$(txt "Faster." 90 white 0.2 2.5 5.0 "(h-text_h)/2" "$FONTB")
ffmpeg -y -ss 8 -t 14 -i "$SRC" \
  -vf "eq=saturation=0.85:contrast=1.15,\
setpts=0.38*PTS,\
tmix=frames=4:weights='1 1 1 1',\
${T3}" \
  -t 5 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p "$TMP/s3.mp4" 2>/dev/null
log "Scene 3 ✓"

# ─── SCENE 4 (12-16s): Features page — "Smarter." ───────────────────────────
log "Scene 4/8 — Capabilities..."
T4=$(txt "Smarter." 90 white 0.4 3.0 4.0 "(h-text_h)/2" "$FONTB")
ffmpeg -y -ss 26 -t 6 -i "$SRC" \
  -vf "eq=saturation=0.85:contrast=1.12,\
scale=$((W*108/100)):$((H*108/100)),crop=${W}:${H}:$((W*8/200)):$((H*8/200)),\
${T4}" \
  -t 4 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p "$TMP/s4.mp4" 2>/dev/null
log "Scene 4 ✓"

# ─── SCENE 5 (16-20s): Tools page — "Simpler." ──────────────────────────────
log "Scene 5/8 — Tools..."
T5=$(txt "Simpler." 90 white 0.4 3.0 4.0 "(h-text_h)/2" "$FONTB")
ffmpeg -y -ss 53 -t 7 -i "$SRC" \
  -vf "eq=saturation=0.85:contrast=1.12,\
zoompan=z='if(eq(on,1),1.12,max(zoom-0.001,1))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=${W}x${H}:fps=${FPS},\
${T5}" \
  -t 4 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p "$TMP/s5.mp4" 2>/dev/null
log "Scene 5 ✓"

# ─── SCENE 6 (20-25s): Pricing — "Everything you need." ─────────────────────
log "Scene 6/8 — Pricing..."
T6a=$(txt "Everything you need." 38 white 0.5 3.8 5.0 "h*0.68" "$FONTB")
T6b=$(txt "At a fraction of the cost." 28 "0xfbbf24" 1.0 3.8 5.0 "h*0.77" "$FONT")
ffmpeg -y -ss 41 -t 9 -i "$SRC" \
  -vf "eq=saturation=0.85:contrast=1.12,\
scale=$((W*105/100)):$((H*105/100)),crop=${W}:${H}:$((W*5/200)):$((H*5/200)),\
${T6a},${T6b}" \
  -t 5 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p "$TMP/s6.mp4" 2>/dev/null
log "Scene 6 ✓"

# ─── SCENE 7 (25-28s): Ultra-fast beat montage ───────────────────────────────
log "Scene 7/8 — Fast montage..."
# Pull 3 snippets, blast them at 6x speed, concat
ffmpeg -y -ss 3 -t 3 -i "$SRC" \
  -vf "eq=saturation=0.85:contrast=1.15,setpts=0.17*PTS,tmix=frames=5:weights='1 1 1 1 1'" \
  -t 1 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p "$TMP/m1.mp4" 2>/dev/null

ffmpeg -y -ss 52 -t 3 -i "$SRC" \
  -vf "eq=saturation=0.85:contrast=1.15,setpts=0.17*PTS,tmix=frames=5:weights='1 1 1 1 1'" \
  -t 1 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p "$TMP/m2.mp4" 2>/dev/null

ffmpeg -y -ss 75 -t 3 -i "$SRC" \
  -vf "eq=saturation=0.85:contrast=1.15,setpts=0.17*PTS,tmix=frames=5:weights='1 1 1 1 1'" \
  -t 1 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p "$TMP/m3.mp4" 2>/dev/null

printf "file 'm1.mp4'\nfile 'm2.mp4'\nfile 'm3.mp4'\n" > "$TMP/montage.txt"
ffmpeg -y -f concat -safe 0 -i "$TMP/montage.txt" \
  -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p "$TMP/s7.mp4" 2>/dev/null
log "Scene 7 ✓"

# ─── SCENE 8 (28-30s): Logo reveal ───────────────────────────────────────────
log "Scene 8/8 — Logo reveal..."
T8a=$(txt "GetIndexed" 64 white 0.4 2.0 2.0 "h*0.38" "$FONTB")
T8b=$(txt "Built from scratch." 24 "0xfbbf24" 0.7 2.0 2.0 "h*0.54" "$FONT")
T8c=$(txt "Available now." 20 "0x94a3b8" 1.0 2.0 2.0 "h*0.63" "$FONT")
ffmpeg -y -f lavfi -i "color=black:size=${W}x${H}:rate=${FPS}:duration=2" \
  -vf "${T8a},${T8b},${T8c}" \
  -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p "$TMP/s8.mp4" 2>/dev/null
log "Scene 8 ✓"

# ─── GENERATE CINEMATIC AUDIO ────────────────────────────────────────────────
log "Generating audio..."

# Layer 1: deep bass drone (52hz sub-bass, fades in/out)
ffmpeg -y -f lavfi -i "sine=frequency=52:duration=30" \
  -af "lowpass=f=90,volume=0.13,afade=t=in:st=0:d=2,afade=t=out:st=27:d=3" \
  "$TMP/bass.wav" 2>/dev/null

# Layer 2: mid hum (110hz, lighter presence)
ffmpeg -y -f lavfi -i "sine=frequency=110:duration=30" \
  -af "lowpass=f=130,volume=0.06,afade=t=in:st=1:d=3,afade=t=out:st=26:d=4" \
  "$TMP/mid.wav" 2>/dev/null

# Layer 3: short impact at 3s — 0.5s tone burst then silence
ffmpeg -y -f lavfi -i "sine=frequency=440:duration=0.5" \
  -af "volume=0.45,afade=t=in:st=0:d=0.05,afade=t=out:st=0.2:d=0.3,apad=pad_dur=26.5" \
  -t 30 "$TMP/hit3.wav" 2>/dev/null

# Layer 4: short impact at 28s — logo reveal
ffmpeg -y -f lavfi -i "sine=frequency=660:duration=2" \
  -af "volume=0.3,afade=t=in:st=0:d=0.2,afade=t=out:st=1.2:d=0.8,adelay=28000|28000" \
  -t 30 "$TMP/hit28.wav" 2>/dev/null

# Mix all 4 layers
ffmpeg -y \
  -i "$TMP/bass.wav" \
  -i "$TMP/mid.wav" \
  -i "$TMP/hit3.wav" \
  -i "$TMP/hit28.wav" \
  -filter_complex "[0][1][2][3]amix=inputs=4:normalize=0[aout]" \
  -map "[aout]" -t 30 \
  "$TMP/audio.aac" 2>/dev/null
log "Audio ✓"

# ─── CONCAT ALL SCENES ───────────────────────────────────────────────────────
log "Concatenating scenes..."
cat > "$TMP/concat.txt" <<CONCATEOF
file 's1.mp4'
file 's2.mp4'
file 's3.mp4'
file 's4.mp4'
file 's5.mp4'
file 's6.mp4'
file 's7.mp4'
file 's8.mp4'
CONCATEOF

ffmpeg -y -f concat -safe 0 -i "$TMP/concat.txt" \
  -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p \
  "$TMP/video_only.mp4" 2>/dev/null
log "Video concat ✓"

# ─── MUX VIDEO + AUDIO ───────────────────────────────────────────────────────
log "Muxing audio..."
ffmpeg -y \
  -i "$TMP/video_only.mp4" \
  -i "$TMP/audio.aac" \
  -c:v copy -c:a aac -b:a 128k \
  -shortest \
  -movflags +faststart \
  "$OUT" 2>/dev/null

echo ""
log "✅ Trailer ready: $OUT"
ls -lh "$OUT"
ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUT" | xargs -I{} echo "Duration: {}s"
