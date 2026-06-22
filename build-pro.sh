#!/bin/bash
set -e
OUT="/home/user/porfolio/video-raw/edit/pro-teaser.mp4"
TMP="/tmp/gi_pro_build"
SHOTS="/tmp/gi_pro"
rm -rf "$TMP" && mkdir -p "$TMP"
W=1280; H=720; FPS=25
log() { echo -e "\033[1;36m[pro]\033[0m $1"; }

log "Rendering all frames..."
python3 << 'PYEOF'
import os, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

TMP   = "/tmp/gi_pro_build"
SHOTS = "/tmp/gi_pro"
W, H  = 1280, 720
FPS   = 25
os.makedirs(TMP, exist_ok=True)

# ── Palette ──
GRN  = (22,  163, 74 )
GRN2 = (74,  222, 128)
WHT  = (238, 238, 238)
DIM  = (88,  88,  88 )
DIM2 = (42,  42,  42 )
BDR  = (32,  32,  32 )

FONTB = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONTR = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

def get_font(p, s):
    try: return ImageFont.truetype(p, s)
    except: return ImageFont.load_default()

def tbounds(txt, font):
    d = ImageDraw.Draw(Image.new("L",(1,1)))
    bb = d.textbbox((0,0), txt, font=font)
    return bb[2]-bb[0], bb[3]-bb[1]

def ease_out(t, p=3): return 1-(1-max(0.,min(1.,t)))**p
def ease_in(t,  p=3): return max(0.,min(1.,t))**p
def ease_io(t):
    t=max(0.,min(1.,t))
    return 4*t**3 if t<.5 else 1-(-2*t+2)**3/2
def lerp(a,b,t): return a+(b-a)*max(0.,min(1.,t))

# ── Alpha-over (float32 RGBA patch into uint8 canvas) ────────────────────────
def aover(canvas, patch, x0, y0, a_mult=1.0):
    sh, sw = patch.shape[:2]
    dx0=max(0,x0); dy0=max(0,y0)
    dx1=min(W,x0+sw); dy1=min(H,y0+sh)
    if dx1<=dx0 or dy1<=dy0: return
    sx0=dx0-x0; sy0=dy0-y0; sx1=sx0+(dx1-dx0); sy1=sy0+(dy1-dy0)
    s = patch[sy0:sy1,sx0:sx1].astype(np.float32)
    d = canvas[dy0:dy1,dx0:dx1].astype(np.float32)
    sa = s[:,:,3:4]/255.*a_mult
    da = d[:,:,3:4]/255.
    oa = sa+da*(1-sa)
    den = np.where(oa>0,oa,1.)
    rgb = (s[:,:,:3]*sa + d[:,:,:3]/255.*da*(1-sa))/den*255
    canvas[dy0:dy1,dx0:dx1,:3] = np.clip(rgb,0,255).astype(np.uint8)
    canvas[dy0:dy1,dx0:dx1, 3] = np.clip(oa[:,:,0]*255,0,255).astype(np.uint8)

# ── Glow text cache ───────────────────────────────────────────────────────────
_gc = {}
def pglow(txt, fp, sz, col, r1=9, r2=30):
    k=(txt,fp,sz,col,r1,r2)
    if k in _gc: return _gc[k]
    f=get_font(fp,sz); tw,th=tbounds(txt,f)
    pad=r2+6; cw,ch=tw+pad*2,th+pad*2
    b=Image.new("RGBA",(cw,ch),(0,0,0,0))
    ImageDraw.Draw(b).text((pad,pad),txt,font=f,fill=(*col,255))
    go=b.filter(ImageFilter.GaussianBlur(radius=r2))
    gi=b.filter(ImageFilter.GaussianBlur(radius=r1))
    res=(np.array(b,dtype=np.float32),np.array(go,dtype=np.float32),
         np.array(gi,dtype=np.float32),tw,th,pad,cw,ch)
    _gc[k]=res; return res

def gtext(canvas, txt, fp, sz, col, cx, cy, alpha, gm=0.85):
    if alpha<=0: return
    ba,go,gi,tw,th,pad,cw,ch=pglow(txt,fp,sz,col)
    x0,y0=cx-cw//2, cy-ch//2; af=alpha/255.
    aover(canvas,go,x0,y0,gm*.65*af)
    aover(canvas,gi,x0,y0,gm*af)
    aover(canvas,ba,x0,y0,af)

def alpha_y(t,ti,th,to,yd=0):
    if t>=to: return 0,0
    if t<ti:
        p=ease_out(t/ti); return int(255*p),int(yd*(1-p))
    if t<th: return 255,0
    p=ease_in((t-th)/(to-th)); return int(255*(1-p)),int(-8*p)

# ── Particles ─────────────────────────────────────────────────────────────────
random.seed(7)
PARTS=[(random.randint(4,W-4),random.randint(0,H),
        random.uniform(4,18),random.uniform(.2,.75)) for _ in range(65)]

def particles(canvas, t, sc=1.0):
    for px,py0,spd,b in PARTS:
        py=int((py0-t*spd)%H)
        a=int(16*b*sc)
        if a<=0 or not(0<=py<H) or not(0<=px<W): continue
        v=min(255,int(canvas[py,px,0]+a))
        canvas[py,px]=np.array([v,v,v,255],dtype=np.uint8)

# ── Orb ───────────────────────────────────────────────────────────────────────
_oc={}
def orb_arr(r,col,blur):
    k=(r,col,blur)
    if k not in _oc:
        sz=(r+blur*2)*2+8
        img=Image.new("RGBA",(sz,sz),(0,0,0,0))
        c=sz//2
        ImageDraw.Draw(img).ellipse([c-r,c-r,c+r,c+r],fill=(*col,255))
        _oc[k]=np.array(img.filter(ImageFilter.GaussianBlur(radius=blur)),dtype=np.float32)
    return _oc[k]

def draw_orb(canvas, cx, cy, r, col, alpha, blur=55):
    a=orb_arr(r,col,blur); sz=a.shape[0]
    aover(canvas,a,cx-sz//2,cy-sz//2,alpha/255.)

# ── Frame save ────────────────────────────────────────────────────────────────
def blank():
    a=np.zeros((H,W,4),dtype=np.uint8); a[:,:,3]=255; return a

def save(arr,path):
    Image.fromarray(arr,'RGBA').convert('RGB').save(path)

def render(name, dur, fn):
    d=os.path.join(TMP,f"sc_{name}"); os.makedirs(d,exist_ok=True)
    n=int(dur*FPS)
    for i in range(n):
        arr=blank(); fn(arr,i/FPS,dur)
        save(arr,os.path.join(d,f"{i:04d}.png"))
    print(f"  {name}: {n}fr")

# ── Load & prep tool screenshots ──────────────────────────────────────────────
def prep_shot(path, crop_top=56):
    """Load screenshot, crop nav, return float32 RGBA array sized to card."""
    img = Image.open(path).convert("RGB")
    # Crop nav bar
    arr = np.array(img, dtype=np.float32)
    arr = arr[crop_top:, :]  # remove top 56px nav
    sh, sw = arr.shape[:2]

    # Card dimensions: 720px wide, proportional height
    CARD_W = 720
    CARD_H = int(CARD_W * sh / sw)

    # PIL resize
    scaled = Image.fromarray(arr.astype(np.uint8)).resize((CARD_W, CARD_H), Image.LANCZOS)
    s = np.array(scaled, dtype=np.float32)

    # Cinematic grade: darken to 0.70, slight cool desaturate
    luma = 0.299*s[:,:,0] + 0.587*s[:,:,1] + 0.114*s[:,:,2]
    s[:,:,0] = s[:,:,0]*0.80*0.70 + luma*0.20*0.70
    s[:,:,1] = s[:,:,1]*0.83*0.70 + luma*0.17*0.70
    s[:,:,2] = s[:,:,2]*0.85*0.70 + luma*0.15*0.70

    # Left vignette: fade left 30% of card to black
    vx = np.linspace(0,1,CARD_W).astype(np.float32)
    vign = np.clip((vx - 0.05)/0.30, 0, 1)  # 0→black, 0.35→full
    vign = vign[np.newaxis,:,np.newaxis]
    s = s * vign

    # Add RGBA alpha channel
    rgba = np.zeros((CARD_H, CARD_W, 4), dtype=np.float32)
    rgba[:,:,:3] = s
    rgba[:,:,3]  = 255
    return rgba, CARD_W, CARD_H

# Preload shots for 3 tools
T1, T1W, T1H = prep_shot(f"{SHOTS}/t1_typed.png")   # Index Checker
T2, T2W, T2H = prep_shot(f"{SHOTS}/t2_typed.png")   # SERP Checker
T3, T3H2, T3HH = prep_shot(f"{SHOTS}/t3_typed.png") # Keywords

# ── Tool demo scene builder ────────────────────────────────────────────────────
def scene_tool(canvas, t, dur,
               card_arr, card_w, card_h,
               tool_label, big_text, big_color, sub_text,
               result_beat=1.6):
    """
    Split-screen tool demo:
      Right: graded screenshot with Ken Burns + slide-in
      Left:  Apple callout glow text
    """
    particles(canvas, t, 0.25)

    # Card position
    CARD_X = W - card_w - 32
    CARD_Y = (H - card_h) // 2

    # Slide in from right
    slide = ease_out(max(0, (t-0.15)/0.55))
    card_off = int((W - CARD_X + 50) * (1-slide))
    card_a   = ease_out(max(0, (t-0.15)/0.55))

    if slide > 0.02:
        # Ken Burns: slow zoom 1.0 → 1.07
        zoom = 1.0 + ease_io(t/dur)*0.07
        zw = int(card_w*zoom); zh = int(card_h*zoom)
        zx = (zw - card_w)//2; zy = (zh - card_h)//2

        src = Image.fromarray(card_arr.astype(np.uint8),'RGBA')
        z   = src.resize((zw,zh), Image.BILINEAR)
        z   = np.array(z.crop((zx,zy,zx+card_w,zy+card_h)), dtype=np.float32)

        # Thin border (1px inside card edges)
        z[ 0,:,  :3] = 30; z[ 0,:,  3] = 255
        z[-1,:,  :3] = 30; z[-1,:,  3] = 255
        z[:, 0,  :3] = 30; z[:, 0,  3] = 255
        z[:,-1,  :3] = 30; z[:,-1,  3] = 255

        aover(canvas, z, CARD_X+card_off, CARD_Y, card_a)

    # LEFT callout (center of left zone: 0→CARD_X)
    lx = (CARD_X-30)//2  # horizontal center of left zone
    ly = H//2

    callout_a, cyo = alpha_y(t, 0.7, dur-0.4, dur, yd=22)
    sub_a,    _    = alpha_y(max(0,t-0.25), 0.7, dur-0.4, dur, yd=16)

    # Thin green accent line above text
    if callout_a > 60:
        la = min(255,callout_a)
        line_y = ly - 110 + cyo
        if 0<=line_y<H:
            x0l = max(0, lx-35); x1l = min(W-1, lx+35)
            canvas[line_y, x0l:x1l, :3] = np.array(GRN,dtype=np.uint8)
            canvas[line_y, x0l:x1l,  3] = la

    # Small tool label
    gtext(canvas, tool_label, FONTR, 17, DIM, lx, ly-82+cyo, sub_a, gm=0.2)

    # Big result text (pulses at result_beat)
    ra = callout_a
    if t > result_beat:
        pulse_t = (t - result_beat) / 0.35
        if pulse_t < 1.0:
            ra = min(255, int(callout_a * (1.0 + 0.18 * ease_out(pulse_t) * ease_in(1-pulse_t))))
    gtext(canvas, big_text, FONTB, 88, big_color, lx, ly+8+cyo, ra, gm=1.15)

    # Sub result
    gtext(canvas, sub_text, FONTR, 16, DIM, lx, ly+82+cyo, sub_a, gm=0.2)

    # "Free Tool" badge at bottom
    badge_a, _ = alpha_y(max(0,t-1.4), 0.4, dur-0.4, dur)
    if badge_a > 0:
        badge_txt = "Free Tool"
        f_badge = get_font(FONTR, 13)
        bw,bh = tbounds(badge_txt, f_badge)
        bx = lx - bw//2 - 10; by = ly + 118 + cyo
        if 0<=by<H and 0<=bx<W:
            # Badge border
            img_tmp = Image.fromarray(canvas,'RGBA')
            dt = ImageDraw.Draw(img_tmp)
            dt.rounded_rectangle([bx,by,bx+bw+20,by+bh+10], radius=6,
                                  outline=(*GRN, badge_a), width=1)
            dt.text((bx+10,by+5), badge_txt, font=f_badge,
                    fill=(*GRN, badge_a))
            canvas[:] = np.array(img_tmp,dtype=np.uint8)

# ── SCENES ────────────────────────────────────────────────────────────────────

# 1 — Intro orb (1.5s)
def sc_intro(arr, t, dur):
    particles(arr, t, ease_out(t/1.0)*0.6)
    r = int(lerp(60, 110, 0.5+0.5*math.sin(t*math.pi*2)))
    draw_orb(arr, W//2, H//2, r, GRN, int(ease_out(t/0.8)*110))
render("intro", 1.5, sc_intro)

# 2 — "SEO. Done right." (2.5s)
def sc_hook(arr, t, dur):
    particles(arr, t, 0.5)
    a1,y1 = alpha_y(t, 0.4, 1.6, 2.5, yd=24)
    a2,y2 = alpha_y(max(0,t-0.5), 0.45, 1.4, 2.2, yd=18)
    gtext(arr,"SEO.",      FONTB, 170, WHT, W//2, H//2-55+y1, a1, gm=0.65)
    gtext(arr,"Done right.",FONTB, 82,  WHT, W//2, H//2+52+y2, a2, gm=0.5)
render("hook", 2.5, sc_hook)

# 3 — Tool 1: Google Index Checker (4.0s)
def sc_t1(arr, t, dur):
    scene_tool(arr, t, dur, T1, T1W, T1H,
               "Index Checker", "Indexed.", GRN, "getindexed.co")
render("t1", 4.0, sc_t1)

# 4 — Tool 2: SERP Position Checker (4.0s)
def sc_t2(arr, t, dur):
    scene_tool(arr, t, dur, T2, T2W, T2H,
               "SERP Checker", "#3 Rank", WHT, "seo audit tool")
render("t2", 4.0, sc_t2)

# 5 — Tool 3: Related Keywords (4.0s)
def sc_t3(arr, t, dur):
    scene_tool(arr, t, dur, T3, T3H2, T3HH,
               "Keyword Finder", "38 found.", GRN2, "seo tools")
render("t3", 4.0, sc_t3)

# 6 — Fast feature lightning round (1.8s)
FLASH_WORDS = ["Indexed.", "Monitored.", "Audited.", "AI-Powered."]
FLASH_COLORS= [GRN, WHT, WHT, GRN]
def sc_flash(arr, t, dur):
    per = dur / len(FLASH_WORDS)
    for i,(w,c) in enumerate(zip(FLASH_WORDS,FLASH_COLORS)):
        wt = t - i*per
        if wt < 0 or wt >= per: continue
        prog = wt/per
        a = int(255 * math.sin(prog * math.pi))  # sine in/out
        gtext(arr, w, FONTB, 132, c, W//2, H//2, a, gm=0.9)
render("flash", 1.8, sc_flash)

# 7 — "$29" + "/mo" price reveal (3.5s)
f_big = get_font(FONTB, 250); f_mo = get_font(FONTB, 84)
tw29,th29 = tbounds("$29", f_big); twmo,thmo = tbounds("/mo", f_mo)
GAP=14; TOT=tw29+GAP+twmo
X29 = W//2 - TOT//2; XMO = X29+tw29+GAP

def sc_price(arr, t, dur):
    particles(arr, t, 0.5)
    a29,y29 = alpha_y(t, 0.45, 3.1, 3.5, yd=24)
    gtext(arr,"$29", FONTB, 250, WHT, X29+tw29//2, H//2+y29, a29, gm=0.55)
    tmo = max(0,t-1.0)
    amo,ymo = alpha_y(tmo, 0.4, 2.5, 0.7, yd=18)
    if t>=1.0 and amo>0:
        gtext(arr,"/mo", FONTB, 84, GRN, XMO+twmo//2, H//2+55+ymo, amo, gm=1.1)
render("price", 3.5, sc_price)

# 8 — "50 free tools." (2.5s)
def sc_tools(arr, t, dur):
    particles(arr, t, 0.5)
    a,yo = alpha_y(t, 0.45, 1.9, 2.5, yd=20)
    gtext(arr,"50 free tools.", FONTB, 116, WHT, W//2, H//2+yo, a)
render("tools", 2.5, sc_tools)

# 9 — "GetIndexed" logo (4.5s)
def sc_logo(arr, t, dur):
    particles(arr, t, 0.8)
    draw_orb(arr, W//2, H//2-25, 200, GRN, int(ease_out(min(1,t/0.7))*80), blur=90)
    al, yo = alpha_y(t, 0.5, 3.8, 4.5, yd=22)
    gtext(arr,"GetIndexed", FONTB, 178, GRN, W//2, H//2-25+yo, al, gm=1.3)
render("logo", 4.5, sc_logo)

# 10 — CTA (2.0s)
def sc_cta(arr, t, dur):
    particles(arr, t, 0.35)
    a1,y1 = alpha_y(t, 0.5, 1.5, 2.0, yd=16)
    a2,y2 = alpha_y(max(0,t-0.3), 0.5, 1.4, 1.9, yd=14)
    gtext(arr,"Available now.", FONTR, 50, WHT, W//2, H//2-26+y1, a1, gm=0.4)
    gtext(arr,"getindexed.co",  FONTR, 36, DIM, W//2, H//2+24+y2, a2, gm=0.25)
render("cta", 2.0, sc_cta)

# 11 — Black (1.0s)
render("black", 1.0, lambda a,t,d: None)

print("All frames done.")
PYEOF
log "Frames done ✓"

# ── ENCODE EACH SCENE ─────────────────────────────────────────────────────────
log "Encoding..."
for sc in intro hook t1 t2 t3 flash price tools logo cta black; do
  ffmpeg -y -r ${FPS} -i "$TMP/sc_${sc}/%04d.png" \
    -c:v libx264 -preset fast -crf 14 -pix_fmt yuv420p \
    "$TMP/s_${sc}.mp4" 2>/dev/null && echo "  ${sc} ✓"
done

# ── CONCAT ────────────────────────────────────────────────────────────────────
log "Concatenating..."
cat > "$TMP/concat.txt" << 'EOF'
file 's_intro.mp4'
file 's_hook.mp4'
file 's_t1.mp4'
file 's_t2.mp4'
file 's_t3.mp4'
file 's_flash.mp4'
file 's_price.mp4'
file 's_tools.mp4'
file 's_logo.mp4'
file 's_cta.mp4'
file 's_black.mp4'
EOF
ffmpeg -y -f concat -safe 0 -i "$TMP/concat.txt" \
  -c:v libx264 -preset fast -crf 14 -pix_fmt yuv420p \
  "$TMP/vid.mp4" 2>/dev/null
DUR_V=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$TMP/vid.mp4")
log "Video: ${DUR_V}s ✓"

# ── PREMIUM AUDIO ─────────────────────────────────────────────────────────────
log "Generating audio..."
DUR=$(python3 -c "print(int(float('${DUR_V:-31}') + 2))")

piano() {
  local f="$1" ms="$2" v="$3" out="$4"
  local f2=$(echo "$f*2"|bc) f3=$(echo "$f*3"|bc)
  local pad=$(python3 -c "print(max(0.1, $DUR - $ms/1000 - 2.5))")
  ffmpeg -y -f lavfi \
    -i "aevalsrc=(sin(2*PI*${f}*t)*exp(-2.5*t)*0.75+sin(2*PI*${f2}*t)*exp(-4*t)*0.3+sin(2*PI*${f3}*t)*exp(-6*t)*0.1)*${v}:c=mono:s=44100:d=2.8" \
    -af "adelay=${ms}|${ms},apad=pad_dur=${pad},atrim=0:${DUR}" \
    -t "$DUR" "$out" 2>/dev/null
}

# Scene timestamps (ms):
# intro=0, hook=1500, t1=4000, t2=8000, t3=12000
# flash=16000, price=17800, tools=21300, logo=23800, cta=28300

piano 220  0     0.18 "$TMP/p0.wav"    # intro drone
piano 330  1500  0.38 "$TMP/p1.wav"    # SEO hook
piano 294  3800  0.30 "$TMP/p2.wav"    # hook 2
piano 440  4000  0.40 "$TMP/p3.wav"    # tool 1 in
piano 523  5600  0.32 "$TMP/p4.wav"    # tool 1 result
piano 392  8000  0.38 "$TMP/p5.wav"    # tool 2 in
piano 523  9600  0.30 "$TMP/p6.wav"    # tool 2 result
piano 349 12000  0.36 "$TMP/p7.wav"    # tool 3 in
piano 440 13600  0.28 "$TMP/p8.wav"    # tool 3 result

# Flash: quick staccato hits
for i in 0 1 2 3; do
  MS=$((16000 + i*450))
  piano 440 $MS 0.22 "$TMP/pf${i}.wav"
done

# Price: big chord
piano 220 17800 0.50 "$TMP/pa1.wav"
piano 330 17800 0.38 "$TMP/pa2.wav"
piano 440 18000 0.28 "$TMP/pa3.wav"
piano 392 19000 0.24 "$TMP/pa4.wav"

piano 330 21300 0.32 "$TMP/pb1.wav"   # 50 tools

# Logo: triumphant cascade
for i in 0 1 2 3 4; do
  NOTES=(220 330 440 550 660)
  VOLS=(0.50 0.40 0.32 0.22 0.15)
  piano ${NOTES[$i]} $((23800+i*200)) ${VOLS[$i]} "$TMP/pl${i}.wav"
done

piano 440 28300 0.28 "$TMP/pc1.wav"   # CTA

# Sub-bass
ffmpeg -y -f lavfi -i "sine=frequency=36:duration=${DUR}" \
  -af "lowpass=f=65,volume=0.08,afade=t=in:st=0:d=1.5,afade=t=out:st=$((DUR-2)):d=2" \
  "$TMP/bass.wav" 2>/dev/null

# Mix all + reverb + EQ
INPUTS=""
FILES=""
COUNT=0
for f in "$TMP"/p0.wav "$TMP"/p1.wav "$TMP"/p2.wav "$TMP"/p3.wav "$TMP"/p4.wav \
          "$TMP"/p5.wav "$TMP"/p6.wav "$TMP"/p7.wav "$TMP"/p8.wav \
          "$TMP"/pf0.wav "$TMP"/pf1.wav "$TMP"/pf2.wav "$TMP"/pf3.wav \
          "$TMP"/pa1.wav "$TMP"/pa2.wav "$TMP"/pa3.wav "$TMP"/pa4.wav \
          "$TMP"/pb1.wav \
          "$TMP"/pl0.wav "$TMP"/pl1.wav "$TMP"/pl2.wav "$TMP"/pl3.wav "$TMP"/pl4.wav \
          "$TMP"/pc1.wav "$TMP"/bass.wav; do
  INPUTS="$INPUTS -i $f"
  FILES="$FILES[$COUNT]"
  COUNT=$((COUNT+1))
done

MIX=$(python3 -c "print(''.join(f'[{i}]' for i in range($COUNT))+'amix=inputs=$COUNT:normalize=0[mix]')")

ffmpeg -y $INPUTS \
  -filter_complex "${MIX}; \
    [mix]aecho=0.8:0.65:260:0.38,aecho=0.6:0.45:520:0.20[e]; \
    [e]alimiter=limit=0.92:level=0:attack=3:release=80, \
       equalizer=f=90:width_type=o:width=1:g=4, \
       equalizer=f=3500:width_type=o:width=1.5:g=-3[out]" \
  -map "[out]" -t "$DUR" -ar 44100 "$TMP/audio.aac" 2>/dev/null
log "Audio ✓"

# ── MUX ──────────────────────────────────────────────────────────────────────
log "Muxing..."
ffmpeg -y -i "$TMP/vid.mp4" -i "$TMP/audio.aac" \
  -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT" 2>/dev/null

echo ""
log "✅  $OUT"
ls -lh "$OUT"
ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUT" | xargs -I{} printf "Duration: %.1fs\n" {}
