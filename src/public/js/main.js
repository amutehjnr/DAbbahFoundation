/**
 * D'ABBAH FOUNDATION — MAIN.JS
 * Core frontend interactions
 */

'use strict';

// ─── Navbar Scroll ────────────────────────────────────────────────
const nav = document.getElementById('main-nav');
if (nav) {
  const handleScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// ─── Mobile Menu ─────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('open') && !nav.contains(e.target)) {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ─── Dark/Light Mode ─────────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('dabbah-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dabbah-theme', next);
  });
}

// ─── Scroll Reveal ───────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

// ─── Animated Counters ───────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const start = performance.now();

  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  };

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.counter').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('#impact, .hero-stats').forEach(el => counterObserver.observe(el));

// ─── Testimonial Carousel ────────────────────────────────────────
const track = document.getElementById('testimonialTrack');
const prevBtn = document.getElementById('testimPrev');
const nextBtn = document.getElementById('testimNext');
const dotsContainer = document.getElementById('testimDots');

if (track) {
  const cards = Array.from(track.children);
  let current = 0;
  let itemsVisible = 3;
  let autoplayInterval;

  function getItemsVisible() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function buildDots() {
    if (!dotsContainer) return;
    const total = Math.ceil(cards.length / itemsVisible);
    dotsContainer.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.setAttribute('role', 'tab');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(idx) {
    itemsVisible = getItemsVisible();
    const total = Math.ceil(cards.length / itemsVisible);
    current = ((idx % total) + total) % total;

    const cardWidth = cards[0].offsetWidth + 24; // gap
    track.style.transform = `translateX(-${current * itemsVisible * cardWidth}px)`;

    dotsContainer?.querySelectorAll('.testimonial-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function startAutoplay() {
    autoplayInterval = setInterval(() => {
      const total = Math.ceil(cards.length / getItemsVisible());
      goTo((current + 1) % total);
    }, 5000);
  }

  function stopAutoplay() { clearInterval(autoplayInterval); }

  prevBtn?.addEventListener('click', () => { stopAutoplay(); goTo(current - 1); startAutoplay(); });
  nextBtn?.addEventListener('click', () => { stopAutoplay(); goTo(current + 1); startAutoplay(); });

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      stopAutoplay();
      goTo(diff > 0 ? current + 1 : current - 1);
      startAutoplay();
    }
  });

  window.addEventListener('resize', () => { buildDots(); goTo(0); }, { passive: true });

  buildDots();
  startAutoplay();
}

// ─── Floating Particles ──────────────────────────────────────────
const particleContainer = document.getElementById('particles');
if (particleContainer) {
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 4 + 2;
    const opacity = (Math.random() * 0.35 + 0.08).toFixed(2);
    p.style.cssText = `
      position: absolute;
      width: ${size}px; height: ${size}px;
      border-radius: 50%;
      background: rgba(201,150,42,${opacity});
      left: ${(Math.random() * 100).toFixed(1)}%;
      top: ${(Math.random() * 100).toFixed(1)}%;
      animation: particleFloat ${(Math.random() * 20 + 15).toFixed(1)}s linear infinite;
      animation-delay: -${(Math.random() * 20).toFixed(1)}s;
      pointer-events: none;
    `;
    particleContainer.appendChild(p);
  }
}

// ─── Newsletter Subscribe ────────────────────────────────────────
async function subscribeNewsletter() {
  const input = document.getElementById('newsletterEmail');
  const email = input?.value?.trim();
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    input?.classList.add('error');
    setTimeout(() => input?.classList.remove('error'), 2000);
    return;
  }

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      input.value = '';
      input.placeholder = '✓ ' + data.message;
      setTimeout(() => { input.placeholder = 'your@email.com'; }, 4000);
    }
  } catch (e) {
    console.error('Subscribe error:', e);
  }
}
window.subscribeNewsletter = subscribeNewsletter;

// ─── Smooth anchor scrolling ────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});

// ─── Image lazy load fallback ────────────────────────────────────
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  img.addEventListener('error', () => {
    img.src = '/images/placeholder.jpg';
    img.alt = 'Image not available';
  });
});

// ─── Focus trap for mobile menu ──────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    hamburger?.setAttribute('aria-expanded', 'false');
  }
});
