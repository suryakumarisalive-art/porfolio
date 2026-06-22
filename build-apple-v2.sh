#!/bin/bash
set -e

SRC="/home/user/porfolio/video-raw/a3dafc3b2eeaf20d41d1dabf843b5532.webm"
OUT="/home/user/porfolio/video-raw/edit/apple-teaser-v2.mp4"
TMP="/tmp/gi_apple_v2"
rm -rf "$TMP" && mkdir -p "$TMP"

W=1280; H=720; FPS=25
log() { echo -e "\033[1;35m[v2]\033[0m $1"; }

# ── ALL FRAMES via Python/PIL ─────────────────────────────────────────────────
log "Rendering premium frames..."
python3 << 'PYEOF'
import os, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

TMP  = "/tmp/gi_apple_v2"
W, H = 1280, 720
FPS  = 25

# Palette
BK   = (0,   0,   0  )   # pure black
BK2  = (8,   8,   8  )   # card bg
BK3  = (14,  14,  14 )   # card inner
WHT  = (238, 238, 238)   # primary white
DIM  = (95,  95,  95 )   # secondary
DIMR = (48,  48,  48 )   # tertiary
GRN  = (22,  163, 74 )   # brand green
GRN2 = (74,  222, 128)   # bright green (highlights)
BDR  = (28,  28,  28 )   # border

FONTB = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONTR = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

# ── helpers ──────────────────────────────────────────────────────────────────
def ease_out(t, p=3):
    return 1 - (1 - max(0.0, min(1.0, t))) ** p

def ease_in(t, p=3):
    return max(0.0, min(1.0, t)) ** p

def lerp(a, b, t):
    return a + (b - a) * t

def get_font(path, size):
    try:    return ImageFont.truetype(path, size)
    except: return ImageFont.load_default()

def tbounds(text, font):
    d = ImageDraw.Draw(Image.new("L",(1,1)))
    bb = d.textbbox((0,0), text, font=font)
    return bb[2]-bb[0], bb[3]-bb[1]

# ── particle field (deterministic) ───────────────────────────────────────────
random.seed(7)
PARTS = [(random.randint(4,W-4), random.randint(0,H),
          random.uniform(5,22), random.uniform(0.25,1.0)) for _ in range(70)]

def draw_particles(img_arr, t, alpha_scale=1.0):
    """Draw particles directly into numpy RGBA array."""
    for px, py0, spd, bright in PARTS:
        py = int((py0 - t * spd) % H)
        a  = int(22 * bright * alpha_scale)
        if a <= 0: continue
        if 0 <= py < H and 0 <= px < W:
            # 2x2 dot
            for dy in range(2):
                for dx in range(2):
                    ry, rx = py+dy, px+dx
                    if 0 <= ry < H and 0 <= rx < W:
                        cur = img_arr[ry,rx]
                        nb  = min(255, int(cur[0]*0.7 + 160*0.3))
                        na  = min(255, cur[3] + a)
                        img_arr[ry,rx] = [nb,nb,nb,na]

# ── compact glow-text renderer ────────────────────────────────────────────────
_glow_cache = {}

def prerender_glow(text, font_path, size, color, glow_r1=9, glow_r2=32):
    key = (text, font_path, size, color)
    if key in _glow_cache:
        return _glow_cache[key]
    font = get_font(font_path, size)
    tw, th = tbounds(text, font)
    pad = glow_r2 + 4
    cw, ch = tw + pad*2, th + pad*2
    base = Image.new("RGBA", (cw,ch), (0,0,0,0))
    ImageDraw.Draw(base).text((pad, pad), text, font=font, fill=(*color,255))
    g_out = base.filter(ImageFilter.GaussianBlur(radius=glow_r2))
    g_in  = base.filter(ImageFilter.GaussianBlur(radius=glow_r1))
    _glow_cache[key] = (base, g_out, g_in, tw, th, pad, cw, ch)
    return _glow_cache[key]

def alpha_over(canvas_arr, layer_arr, x0, y0, sw, sh, a_mult=1.0):
    """Alpha-over composite layer_arr (sw×sh float32 RGBA) into canvas_arr at (x0,y0)."""
    dst_x0 = max(0, x0);    dst_y0 = max(0, y0)
    dst_x1 = min(W, x0+sw); dst_y1 = min(H, y0+sh)
    if dst_x1 <= dst_x0 or dst_y1 <= dst_y0: return
    sx0 = dst_x0 - x0; sy0 = dst_y0 - y0
    sx1 = sx0 + (dst_x1 - dst_x0)
    sy1 = sy0 + (dst_y1 - dst_y0)
    patch = layer_arr[sy0:sy1, sx0:sx1]
    dst   = canvas_arr[dst_y0:dst_y1, dst_x0:dst_x1].astype(np.float32)
    src_a = patch[:,:,3:4] / 255.0 * a_mult
    dst_a = dst[:,:,3:4]   / 255.0
    out_a = src_a + dst_a * (1 - src_a)
    with np.errstate(divide='ignore', invalid='ignore'):
        safe_a = np.where(out_a > 0, out_a, 1.0)
        out_rgb = (patch[:,:,:3] * src_a + dst[:,:,:3] / 255.0 * dst_a * (1 - src_a)) / safe_a * 255
    canvas_arr[dst_y0:dst_y1, dst_x0:dst_x1, :3] = np.clip(out_rgb, 0, 255)
    canvas_arr[dst_y0:dst_y1, dst_x0:dst_x1,  3] = np.clip(out_a[:,:,0]*255, 0, 255)

def paste_glow(canvas_arr, text, font_path, size, color, cx, cy, alpha,
               glow_mult=0.85):
    """Composite glowing text into numpy RGBA array at (cx,cy) with alpha."""
    if alpha <= 0: return
    base, g_out, g_in, tw, th, pad, cw, ch = prerender_glow(text, font_path, size, color)
    x0 = cx - cw//2
    y0 = cy - ch//2
    a_f = alpha / 255.0
    for layer, mult in [(g_out, glow_mult*0.7), (g_in, glow_mult), (base, 1.0)]:
        arr = np.array(layer, dtype=np.float32)
        alpha_over(canvas_arr, arr, x0, y0, cw, ch, a_mult=mult*a_f)

def alpha_t(t, t_in, t_hold, t_out, y_drop=0):
    """Returns (alpha, y_offset) — Apple reveal."""
    if t >= t_out: return 0, 0
    if t < t_in:
        p = ease_out(t / t_in)
        return int(255*p), int(y_drop*(1-p))
    if t < t_hold: return 255, 0
    p = ease_in((t - t_hold)/(t_out - t_hold))
    return int(255*(1-p)), int(-8*p)

def blank():
    return np.zeros((H, W, 4), dtype=np.uint8)

def save_frame(arr, path):
    img = Image.fromarray(arr, 'RGBA').convert('RGB')
    img.save(path)

def render(name, duration, fn):
    d = os.path.join(TMP, f"sc_{name}")
    os.makedirs(d, exist_ok=True)
    n = int(duration * FPS)
    for i in range(n):
        t = i / FPS
        arr = blank()
        arr[:,:,3] = 255  # full opaque black
        fn(arr, t, duration)
        save_frame(arr, os.path.join(d, f"{i:04d}.png"))
    print(f"  {name}: {n}fr ({duration:.1f}s)")

# ── GREEN ORB / opening pulse ─────────────────────────────────────────────────
_orb_cache = {}
def get_orb(radius, color, blur):
    key = (radius, color, blur)
    if key not in _orb_cache:
        sz = (radius*2 + blur*3) * 2
        orb = Image.new("RGBA", (sz,sz), (0,0,0,0))
        d   = ImageDraw.Draw(orb)
        cx  = sz//2
        d.ellipse([cx-radius, cx-radius, cx+radius, cx+radius], fill=(*color,255))
        _orb_cache[key] = orb.filter(ImageFilter.GaussianBlur(radius=blur))
    return _orb_cache[key]

def draw_orb(arr, cx, cy, radius, color, alpha, blur=60):
    orb = get_orb(radius, color, blur)
    ow, oh = orb.size
    orb_a = np.array(orb, dtype=np.float32)
    x0 = cx - ow//2; y0 = cy - oh//2
    alpha_over(arr, orb_a, x0, y0, ow, oh, a_mult=alpha/255.0)

# ── SCENES ───────────────────────────────────────────────────────────────────

# 1 — Green orb intro (2.0s)
def sc_intro(arr, t, dur):
    # Pulsing orb
    pulse  = 0.5 + 0.5*math.sin(t*math.pi*1.5)
    radius = int(lerp(80, 130, pulse * ease_out(t/0.8)))
    a_orb  = int(lerp(60, 120, ease_out(t/1.0)))
    draw_orb(arr, W//2, H//2, radius, GRN, a_orb)
    # Particles fade in with orb
    draw_particles(arr, t, ease_out(t/1.0)*0.5)
render("intro", 2.0, sc_intro)

# 2 — "SEO." (3.2s)
def sc_seo(arr, t, dur):
    draw_particles(arr, t, 0.55)
    a, yo = alpha_t(t, 0.5, 2.5, 3.2, y_drop=24)
    paste_glow(arr, "SEO.", FONTB, 218, WHT, W//2, H//2 + yo, a, glow_mult=0.65)
render("seo", 3.2, sc_seo)

# 3 — "Done right." (3.0s)
def sc_done(arr, t, dur):
    draw_particles(arr, t, 0.45)
    a, yo = alpha_t(t, 0.5, 2.3, 3.0, y_drop=20)
    paste_glow(arr, "Done right.", FONTB, 150, WHT, W//2, H//2 + yo, a, glow_mult=0.6)
render("done", 3.0, sc_done)

# 4 — "Indexed." green (2.5s)
def sc_indexed(arr, t, dur):
    draw_particles(arr, t, 0.7)
    a, yo = alpha_t(t, 0.4, 1.9, 2.5, y_drop=20)
    paste_glow(arr, "Indexed.", FONTB, 198, GRN, W//2, H//2 + yo, a, glow_mult=1.1)
render("indexed", 2.5, sc_indexed)

# 5 — "Monitored." (2.0s)
def sc_monitored(arr, t, dur):
    draw_particles(arr, t, 0.5)
    a, yo = alpha_t(t, 0.35, 1.5, 2.0, y_drop=18)
    paste_glow(arr, "Monitored.", FONTB, 175, WHT, W//2, H//2 + yo, a)
render("monitored", 2.0, sc_monitored)

# 6 — "Audited." (2.0s)
def sc_audited(arr, t, dur):
    draw_particles(arr, t, 0.5)
    a, yo = alpha_t(t, 0.35, 1.5, 2.0, y_drop=18)
    paste_glow(arr, "Audited.", FONTB, 175, WHT, W//2, H//2 + yo, a)
render("audited", 2.0, sc_audited)

# 7 — "AI-Powered." green (2.0s)
def sc_ai(arr, t, dur):
    draw_particles(arr, t, 0.7)
    a, yo = alpha_t(t, 0.35, 1.5, 2.0, y_drop=18)
    paste_glow(arr, "AI-Powered.", FONTB, 148, GRN, W//2, H//2 + yo, a, glow_mult=1.1)
render("ai", 2.0, sc_ai)

# ── 8 — PRODUCT DEMO (6.0s) ──────────────────────────────────────────────────
URL_TYPED = "https://getindexed.co"

def draw_tool_ui(arr, t):
    """
    Renders the Google Index Checker UI mockup into arr.
    0.0-0.7: fade in
    0.7-2.2: URL types in
    2.2-3.0: button glow + loading dots
    3.0-6.0: result revealed
    """
    img = Image.fromarray(arr, 'RGBA')
    d   = ImageDraw.Draw(img)

    # Overall fade-in
    ui_alpha = int(255 * ease_out(t / 0.7))

    # Card dimensions
    cw, ch = 860, 400
    cx0 = (W - cw)//2; cy0 = (H - ch)//2

    # Card bg
    def aa(base_alpha):
        return int(base_alpha * ui_alpha / 255)

    # Subtle outer glow on card
    card_glow = Image.new("RGBA", img.size, (0,0,0,0))
    cg_draw = ImageDraw.Draw(card_glow)
    cg_draw.rounded_rectangle([cx0-2, cy0-2, cx0+cw+2, cy0+ch+2],
                               radius=14, fill=(*GRN, aa(18)))
    card_glow = card_glow.filter(ImageFilter.GaussianBlur(radius=20))
    img.alpha_composite(card_glow)

    # Card body
    d.rounded_rectangle([cx0, cy0, cx0+cw, cy0+ch],
                         radius=12, fill=(*BK2, aa(255)))
    d.rounded_rectangle([cx0, cy0, cx0+cw, cy0+ch],
                         radius=12, outline=(*BDR, aa(255)), width=1)

    # Green accent top bar (3px)
    bar_w = int(cw * min(1.0, t / 0.7))
    if bar_w > 0:
        d.rectangle([cx0, cy0, cx0+bar_w, cy0+3], fill=(*GRN, aa(255)))

    # Header
    f_label = get_font(FONTR, 13)
    f_title = get_font(FONTB, 34)
    f_sub   = get_font(FONTR, 17)

    label_txt = "getindexed.co  ·  Free Tools"
    tw, _ = tbounds(label_txt, f_label)
    d.text(((W - tw)//2, cy0 + 26), label_txt, font=f_label,
           fill=(*GRN, aa(200)))

    title_txt = "Google Index Checker"
    tw, _ = tbounds(title_txt, f_title)
    d.text(((W - tw)//2, cy0 + 52), title_txt, font=f_title,
           fill=(*WHT, aa(255)))

    sub_txt = "Check if any URL is indexed in Google Search"
    tw, _ = tbounds(sub_txt, f_sub)
    d.text(((W - tw)//2, cy0 + 100), sub_txt, font=f_sub,
           fill=(*DIM, aa(255)))

    # Separator
    d.line([(cx0+40, cy0+138), (cx0+cw-40, cy0+138)],
           fill=(*BDR, aa(255)), width=1)

    # Input row
    inp_x = cx0 + 40; inp_y = cy0 + 160
    inp_w = cw - 80 - 145 - 12; inp_h = 54
    btn_x = inp_x + inp_w + 12; btn_w = 145

    # Input bg
    d.rounded_rectangle([inp_x, inp_y, inp_x+inp_w, inp_y+inp_h],
                         radius=8, fill=(*BK3, aa(255)))
    d.rounded_rectangle([inp_x, inp_y, inp_x+inp_w, inp_y+inp_h],
                         radius=8, outline=(*BDR, aa(255)), width=1)

    # Typed text
    f_url = get_font(FONTR, 18)
    chars_done = 0
    if t > 0.7:
        type_dur = 1.4
        type_prog = min(1.0, (t - 0.7) / type_dur)
        chars_done = int(type_prog * len(URL_TYPED))

    typed = URL_TYPED[:chars_done]
    if typed:
        d.text((inp_x + 16, inp_y + 17), typed, font=f_url,
               fill=(*WHT, aa(255)))
    else:
        placeholder = "Enter a URL to check..." if t > 0.3 else ""
        d.text((inp_x + 16, inp_y + 17), placeholder, font=f_url,
               fill=(*DIMR, aa(200)))

    # Cursor blink
    blink = math.sin(t * math.pi * 3.5) > 0 and t < 2.5
    if blink and t > 0.4:
        cur_x = inp_x + 16
        if typed:
            tw, _ = tbounds(typed, f_url)
            cur_x += tw + 2
        d.line([(cur_x, inp_y+15), (cur_x, inp_y+39)],
               fill=(*WHT, aa(200)), width=2)

    # Button
    loading = 2.2 < t < 3.0
    btn_color = GRN2 if (t > 2.1 and t < 3.0) else GRN
    btn_alpha = aa(255)
    btn_pulse = 1.0
    if 2.0 < t < 2.5:
        btn_pulse = 1.0 + 0.06 * math.sin((t - 2.0) * math.pi * 4)

    d.rounded_rectangle([btn_x, inp_y, btn_x+btn_w, inp_y+inp_h],
                         radius=8, fill=(*btn_color, btn_alpha))
    f_btn = get_font(FONTB, 18)
    btn_txt = "Checking..." if loading else "Check  →"
    bw, bh = tbounds(btn_txt, f_btn)
    d.text((btn_x + (btn_w-bw)//2, inp_y + (inp_h-bh)//2),
           btn_txt, font=f_btn, fill=(*BK2, btn_alpha))

    # Loading dots (2.2-3.0s)
    if loading:
        ld_t = (t - 2.2) / 0.8
        for di in range(3):
            dot_a = ease_out(max(0, math.sin((ld_t * 3 - di * 0.5) * math.pi)))
            dot_x = W//2 - 20 + di * 20
            dot_y = cy0 + 252
            dot_col = int(lerp(60, 255, dot_a))
            d.ellipse([dot_x-5, dot_y-5, dot_x+5, dot_y+5],
                      fill=(*GRN, int(dot_col * ui_alpha/255)))

    # Result (3.0s+)
    if t >= 2.95:
        res_prog = ease_out((t - 2.95) / 0.7)
        res_a    = int(255 * res_prog * ui_alpha/255)
        res_y    = cy0 + 240

        # Result card bg
        d.rounded_rectangle([cx0+40, res_y-8, cx0+cw-40, res_y+82],
                             radius=10, fill=(6, 30, 16, res_a))
        d.rounded_rectangle([cx0+40, res_y-8, cx0+cw-40, res_y+82],
                             radius=10, outline=(*GRN, int(res_a*0.5)), width=1)

        # Check icon (big green circle with checkmark)
        ck_x = cx0 + 80; ck_y = res_y + 30
        d.ellipse([ck_x-18, ck_y-18, ck_x+18, ck_y+18],
                  fill=(*GRN, res_a))
        # Checkmark lines
        ck_pts = [(ck_x-8, ck_y+1), (ck_x-2, ck_y+8), (ck_x+9, ck_y-8)]
        d.line(ck_pts, fill=(0,0,0,res_a), width=3)

        # Result text
        f_res  = get_font(FONTB, 24)
        f_meta = get_font(FONTR, 15)
        d.text((ck_x+30, res_y+10), "Indexed by Google",
               font=f_res, fill=(*WHT, res_a))
        d.text((ck_x+30, res_y+42), "Last crawled: June 2025  ·  0.28s",
               font=f_meta, fill=(*DIM, res_a))

    # Write back
    arr[:] = np.array(img, dtype=np.uint8)

def sc_demo(arr, t, dur):
    # Subtle dark particles
    draw_particles(arr, t, 0.25)
    draw_tool_ui(arr, t)
render("demo", 6.0, sc_demo)

# 9 — "$29" then "/mo" (3.8s) ─────────────────────────────────────────────────
f_price_big = get_font(FONTB, 252)
f_price_mo  = get_font(FONTB,  86)
tw_29, th_29 = tbounds("$29", f_price_big)
tw_mo, th_mo = tbounds("/mo", f_price_mo)

gap_x  = 16
# Center the combination
total_w = tw_29 + gap_x + tw_mo
x_29    = W//2 - total_w//2
x_mo    = x_29 + tw_29 + gap_x
y_29    = H//2 - th_29//2
y_mo    = H//2 + 50   # slightly below center-baseline

def sc_price(arr, t, dur):
    draw_particles(arr, t, 0.5)
    a29, yo29 = alpha_t(t, 0.5, 3.4, 3.8, y_drop=26)
    paste_glow(arr, "$29", FONTB, 252, WHT, W//2 - total_w//2 + tw_29//2, H//2 + yo29, a29, glow_mult=0.6)
    # /mo comes in 1.1s later
    t_mo = max(0, t - 1.1)
    amo, yomo = alpha_t(t_mo, 0.45, 2.6, 0.7, y_drop=20)
    if t >= 1.1 and amo > 0:
        paste_glow(arr, "/mo", FONTB, 86, GRN, x_mo + tw_mo//2, y_mo + yomo, amo, glow_mult=1.1)
render("price", 3.8, sc_price)

# 10 — "50 free tools." (3.2s) ─────────────────────────────────────────────────
def sc_tools(arr, t, dur):
    draw_particles(arr, t, 0.5)
    a, yo = alpha_t(t, 0.5, 2.5, 3.2, y_drop=20)
    paste_glow(arr, "50 free tools.", FONTB, 126, WHT, W//2, H//2 + yo, a)
render("tools", 3.2, sc_tools)

# 11 — "GetIndexed" massive green (5.0s) ──────────────────────────────────────
def sc_logo(arr, t, dur):
    draw_particles(arr, t, 0.8)
    # Orb behind the logo text
    orb_a = int(90 * ease_out(min(1.0, t / 0.8)))
    draw_orb(arr, W//2, H//2 - 20, 180, GRN, orb_a, blur=80)
    a, yo = alpha_t(t, 0.55, 4.2, 5.0, y_drop=24)
    paste_glow(arr, "GetIndexed", FONTB, 184, GRN, W//2, H//2 + yo - 20, a, glow_mult=1.3)
render("logo", 5.0, sc_logo)

# 12 — "Available now." + URL (3.5s) ─────────────────────────────────────────
def sc_cta(arr, t, dur):
    draw_particles(arr, t, 0.4)
    a1, yo1 = alpha_t(t, 0.55, 2.8, 3.5, y_drop=18)
    a2, yo2 = alpha_t(max(0, t-0.45), 0.55, 2.5, 3.1, y_drop=16)
    paste_glow(arr, "Available now.", FONTR, 54, WHT, W//2, H//2 - 30 + yo1, a1, glow_mult=0.4)
    paste_glow(arr, "getindexed.co",  FONTR, 38, DIM, W//2, H//2 + 26 + yo2, a2, glow_mult=0.3)
render("cta", 3.5, sc_cta)

# 13 — Fade to black (1.5s) ───────────────────────────────────────────────────
def sc_black(arr, t, dur):
    # Already black — nothing
    pass
render("black", 1.5, sc_black)

print("All frames rendered.")
PYEOF
log "Frames done ✓"

# ── ENCODE EACH SCENE ─────────────────────────────────────────────────────────
log "Encoding scenes..."
for sc in intro seo done indexed monitored audited ai demo price tools logo cta black; do
  ffmpeg -y -r ${FPS} -i "$TMP/sc_${sc}/%04d.png" \
    -c:v libx264 -preset fast -crf 14 -pix_fmt yuv420p \
    "$TMP/s_${sc}.mp4" 2>/dev/null
  echo "  ${sc} ✓"
done

# ── CONCAT ────────────────────────────────────────────────────────────────────
log "Concatenating..."
cat > "$TMP/concat.txt" << 'CEOF'
file 's_intro.mp4'
file 's_seo.mp4'
file 's_done.mp4'
file 's_indexed.mp4'
file 's_monitored.mp4'
file 's_audited.mp4'
file 's_ai.mp4'
file 's_demo.mp4'
file 's_price.mp4'
file 's_tools.mp4'
file 's_logo.mp4'
file 's_cta.mp4'
file 's_black.mp4'
CEOF

ffmpeg -y -f concat -safe 0 -i "$TMP/concat.txt" \
  -c:v libx264 -preset fast -crf 14 -pix_fmt yuv420p \
  "$TMP/video_only.mp4" 2>/dev/null
log "Video concat ✓"

# ── PREMIUM AUDIO ─────────────────────────────────────────────────────────────
log "Generating audio..."
DUR_RAW=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$TMP/video_only.mp4")
DUR=$(python3 -c "print(int(float('${DUR_RAW:-38}') + 2))")

# Piano hit: aevalsrc with exponential decay + harmonic overtones
piano() {
  local freq="$1" delay_ms="$2" vol="$3" out="$4"
  local h2=$(echo "$freq * 2" | bc)
  local h3=$(echo "$freq * 3" | bc)
  local pad=$(echo "scale=2; $DUR - ($delay_ms/1000) - 2.0" | bc)
  [ $(echo "$pad < 0.1" | bc -l) -eq 1 ] && pad="0.1"
  ffmpeg -y -f lavfi \
    -i "aevalsrc=(sin(2*PI*${freq}*t)*exp(-2.8*t)*0.8 + sin(2*PI*${h2}*t)*exp(-4.5*t)*0.35 + sin(2*PI*${h3}*t)*exp(-7*t)*0.12)*${vol}:c=mono:s=44100:d=2.8" \
    -af "adelay=${delay_ms}|${delay_ms},apad=pad_dur=${pad},atrim=0:${DUR}" \
    -t "$DUR" "$out" 2>/dev/null
}

# Scene hit times (ms):
# intro=0, seo=2000, done=5200, indexed=8200, monitored=10700, audited=12700
# ai=14700, demo=16700, demo_result=19700, price=22700, /mo=23800,
# tools=26500, logo=29700, cta=34700

piano 220 0    0.22 "$TMP/p_drone.wav"     # low A drone (intro)
piano 330 2000 0.38 "$TMP/p_seo.wav"       # E4 — "SEO."
piano 294 5200 0.30 "$TMP/p_done.wav"      # D4 — "Done right."
piano 440 8200 0.42 "$TMP/p_idx.wav"       # A4 — "Indexed." (green — higher)
piano 330 10700 0.28 "$TMP/p_mon.wav"
piano 330 12700 0.28 "$TMP/p_aud.wav"
piano 392 14700 0.32 "$TMP/p_ai.wav"       # G4 — "AI-Powered."
piano 262 16700 0.20 "$TMP/p_demo.wav"     # C4 — demo opens
piano 523 19700 0.28 "$TMP/p_res.wav"      # C5 — result revealed

# Price reveal — minor chord hit
piano 220 22700 0.48 "$TMP/p_price_a.wav"  # A3
piano 330 22700 0.36 "$TMP/p_price_e.wav"  # E4
piano 440 22750 0.28 "$TMP/p_price_aa.wav" # A4
piano 392 23800 0.24 "$TMP/p_mo.wav"       # G4 — /mo

piano 349 26500 0.34 "$TMP/p_tools.wav"   # F4 — 50 tools

# Logo reveal — triumphant A major chord cascade
piano 220 29700 0.50 "$TMP/p_logo1.wav"
piano 330 29900 0.40 "$TMP/p_logo2.wav"
piano 440 30100 0.32 "$TMP/p_logo3.wav"
piano 550 30300 0.22 "$TMP/p_logo4.wav"
piano 660 30500 0.14 "$TMP/p_logo5.wav"

piano 440 34700 0.30 "$TMP/p_cta.wav"

# Sub-bass presence
ffmpeg -y -f lavfi -i "sine=frequency=38:duration=${DUR}" \
  -af "lowpass=f=70,volume=0.09,afade=t=in:st=0:d=2,afade=t=out:st=$((DUR-3)):d=3" \
  "$TMP/bass.wav" 2>/dev/null

# High shimmer from demo scene onward
ffmpeg -y -f lavfi -i "aevalsrc=sin(2*PI*6000*t)*0.015:c=mono:s=44100:d=${DUR}" \
  -af "highpass=f=5000,afade=t=in:st=16:d=5,afade=t=out:st=$((DUR-3)):d=3" \
  "$TMP/shimmer.wav" 2>/dev/null

# Mix all, add reverb
ffmpeg -y \
  -i "$TMP/bass.wav" -i "$TMP/shimmer.wav" \
  -i "$TMP/p_drone.wav" -i "$TMP/p_seo.wav" -i "$TMP/p_done.wav" \
  -i "$TMP/p_idx.wav"   -i "$TMP/p_mon.wav" -i "$TMP/p_aud.wav"  -i "$TMP/p_ai.wav" \
  -i "$TMP/p_demo.wav"  -i "$TMP/p_res.wav" \
  -i "$TMP/p_price_a.wav" -i "$TMP/p_price_e.wav" -i "$TMP/p_price_aa.wav" -i "$TMP/p_mo.wav" \
  -i "$TMP/p_tools.wav" \
  -i "$TMP/p_logo1.wav" -i "$TMP/p_logo2.wav" -i "$TMP/p_logo3.wav" \
  -i "$TMP/p_logo4.wav" -i "$TMP/p_logo5.wav" -i "$TMP/p_cta.wav" \
  -filter_complex \
    "[0][1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20][21]amix=inputs=22:normalize=0[raw];\
     [raw]aecho=0.8:0.65:280:0.4,aecho=0.6:0.45:550:0.22[echoed];\
     [echoed]alimiter=limit=0.92:level=0:attack=3:release=80,\
              equalizer=f=80:width_type=o:width=1:g=3,\
              equalizer=f=4000:width_type=o:width=1.5:g=-2[aout]" \
  -map "[aout]" -t "$DUR" -ar 44100 "$TMP/audio.aac" 2>/dev/null
log "Audio ✓"

# ── MUX ───────────────────────────────────────────────────────────────────────
log "Muxing..."
ffmpeg -y \
  -i "$TMP/video_only.mp4" \
  -i "$TMP/audio.aac" \
  -c:v copy -c:a aac -b:a 256k \
  -shortest -movflags +faststart \
  "$OUT" 2>/dev/null

echo ""
log "✅  Done: $OUT"
ls -lh "$OUT"
DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUT")
echo "Duration: ${DURATION}s"
