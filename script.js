// --- LENIS SMOOTH SCROLL ---
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- GSAP & SCROLLTRIGGER ---
gsap.registerPlugin(ScrollTrigger);

// 0. Initial Load Animation
window.addEventListener('load', () => {
  const tl = gsap.timeline();
  
  // Fade in glow
  tl.fromTo('.hero-glow', { opacity: 0 }, { opacity: 1, duration: 2, ease: "power2.out" }, 0);
  
  // Snap up huge text
  const heroTextSpan = document.querySelectorAll('.hero .char-reveal span');
  if(heroTextSpan.length) {
    tl.fromTo(heroTextSpan, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, stagger: 0.05, ease: "back.out(1.5)" }, 0.2);
  } else {
    tl.fromTo('.hero .char-reveal', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "back.out(1.5)" }, 0.2);
  }
  
  // Fade in side text and bottom text
  tl.fromTo('.vertical-text', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 1, ease: "power2.out" }, 1);
  tl.fromTo('.hero-bottom-text', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, 1.2);
});

// 1. Theme Color Change on Scroll
const sections = document.querySelectorAll('.section[data-theme]');
sections.forEach(section => {
  ScrollTrigger.create({
    trigger: section,
    start: "top 50%", 
    end: "bottom 50%",
    onEnter: () => changeTheme(section.dataset.theme),
    onEnterBack: () => changeTheme(section.dataset.theme)
  });
});

function changeTheme(theme) {
  const body = document.body;
  if (theme === 'white') {
    body.style.setProperty('--current-bg', 'var(--bg-white)');
    body.style.setProperty('--current-fg', 'var(--fg-white)');
  } else {
    body.style.setProperty('--current-bg', 'var(--bg-black)');
    body.style.setProperty('--current-fg', 'var(--fg-black)');
  }
}

// 2. Circular Nav Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const menuContainer = document.getElementById('menuContainer');
let menuOpen = false;

menuBtn.addEventListener('click', () => {
  menuOpen = !menuOpen;
  if(menuOpen) {
    menuBtn.classList.add('active');
    menuContainer.classList.add('active');
    lenis.stop();
  } else {
    menuBtn.classList.remove('active');
    menuContainer.classList.remove('active');
    lenis.start();
  }
});

document.querySelectorAll('.menu-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      lenis.scrollTo(targetSection, { immediate: true });
      ScrollTrigger.refresh();
    }
    setTimeout(() => {
      menuOpen = false;
      menuBtn.classList.remove('active');
      menuContainer.classList.remove('active');
      setTimeout(() => { lenis.start(); }, 700);
    }, 100);
  });
});

// 3. Stacking Cards & 3D Image Tilt
const cards = gsap.utils.toArray('.stack-card');
cards.forEach((card, i) => {
  ScrollTrigger.create({
    trigger: card,
    start: "top 10vh",
    endTrigger: ".projects-stack",
    end: "bottom bottom",
    pin: true,
    pinSpacing: false
  });
  
  if (i > 0) {
    gsap.to(cards[i - 1], {
      scale: 0.95,
      opacity: 0.5,
      scrollTrigger: {
        trigger: card,
        start: "top 80%",
        end: "top 10vh",
        scrub: true
      }
    });
  }

  // 3D Image Hover Effect
  const img = card.querySelector('.css-effect-box');
  if(img) {
    card.addEventListener('mouseenter', () => {
      card.classList.add('is-hovering');
    });
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      // Add the mouse offset to the baseline isometric rotation
      img.style.transform = `rotateY(${-20 + x * 20}deg) rotateX(${10 - y * 20}deg) rotateZ(2deg) scale(0.95)`;
      img.style.boxShadow = `${-30 - x*20}px ${40 - y*20}px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.15)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-hovering');
      img.style.transform = ''; // reset to CSS animation state
      img.style.boxShadow = '';
    });
  }
});

// 4. Circular Quote Reveal 
// A black circle expands as you scroll down the quote section
gsap.to('.quote-circle-bg', {
  scale: 4, // expands to cover the section
  scrollTrigger: {
    trigger: '.quote-section',
    start: "top 80%",
    end: "center center",
    scrub: true
  }
});

// 5. Skills Marquee Infinite Scroll
gsap.to('.marquee-text', {
  xPercent: -50,
  ease: "none",
  duration: 20,
  repeat: -1
});

// 6. Text Reveals
const charReveals = document.querySelectorAll('.char-reveal');
charReveals.forEach(text => {
  const chars = text.innerText.split('');
  text.innerHTML = '';
  chars.forEach(char => {
    text.innerHTML += `<span style="display:inline-block; opacity:0; transform:translateY(50px);">${char === ' ' ? '&nbsp;' : char}</span>`;
  });
  
  gsap.to(text.querySelectorAll('span'), {
    scrollTrigger: { trigger: text, start: "top 85%" },
    opacity: 1, y: 0, duration: 1, stagger: 0.05, ease: "back.out(1.5)"
  });
});

// Fade Ups
gsap.utils.toArray('.fade-up').forEach(el => {
  gsap.fromTo(el, { opacity: 0, y: 40 }, {
    scrollTrigger: { trigger: el, start: "top 85%" },
    opacity: 1, y: 0, duration: 1, ease: "power3.out"
  });
});

// Giant Footer Name Reveal
const giantName = document.querySelector('.giant-name');
if(giantName) {
  gsap.fromTo(giantName, 
    { y: "100%", opacity: 0 },
    {
      scrollTrigger: {
        trigger: ".footer",
        start: "top 80%",
        end: "bottom bottom",
        scrub: 1
      },
      y: "0%",
      opacity: 1,
      ease: "power2.out"
    }
  );
}

// Contact form
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.innerHTML = '✓';
  e.target.reset();
  setTimeout(() => { btn.innerHTML = '→'; }, 3000);
});

// Floating Image Cursor Reveal
const eduItems = document.querySelectorAll('.edu-item');
eduItems.forEach(item => {
  const img = item.querySelector('.edu-hover-img');
  
  item.addEventListener('mousemove', (e) => {
    gsap.to(img, {
      left: e.clientX,
      top: e.clientY,
      duration: 0.6,
      ease: "power3.out"
    });
  });
});
