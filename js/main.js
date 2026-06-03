// ═══════════════════════════════════════════════════════════
// UXMarket AI — Main JavaScript
// ═══════════════════════════════════════════════════════════

'use strict';

// ── NAV SCROLL ──
const nav = document.getElementById('nav');
const handleNavScroll = () => {
  if (window.scrollY > 20) nav?.classList.add('scrolled');
  else nav?.classList.remove('scrolled');
};
window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

// ── HAMBURGER MENU ──
const hamburger = document.getElementById('nav-hamburger');
const navLinks = document.querySelector('.nav__links');
hamburger?.addEventListener('click', () => {
  const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!isOpen));
  navLinks?.classList.toggle('nav__links--open');
});

// ── SEARCH OVERLAY ──
const searchBtn = document.getElementById('nav-search-btn');
const searchOverlay = document.getElementById('search-overlay');
const searchClose = document.getElementById('search-close');
const searchInput = document.getElementById('search-input');

const openSearch = () => {
  searchOverlay?.classList.add('open');
  searchOverlay?.setAttribute('aria-hidden', 'false');
  searchInput?.focus();
};

const closeSearch = () => {
  searchOverlay?.classList.remove('open');
  searchOverlay?.setAttribute('aria-hidden', 'true');
};

searchBtn?.addEventListener('click', openSearch);
searchClose?.addEventListener('click', closeSearch);
searchOverlay?.addEventListener('click', (e) => {
  if (e.target === searchOverlay) closeSearch();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSearch();
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
});

// Search tags
document.querySelectorAll('.search-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    if (searchInput) searchInput.value = tag.dataset.query || tag.textContent;
    searchInput?.focus();
  });
});

// ── INTERSECTION OBSERVER REVEAL ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal], [data-stagger]').forEach(el => {
  revealObserver.observe(el);
});

// ── COUNTER ANIMATION ──
const formatNumber = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
  return num.toLocaleString('en-IN');
};

const animateCounter = (el) => {
  const target = parseInt(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const duration = 1800;
  const start = performance.now();

  const update = (current) => {
    const elapsed = current - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = prefix + formatNumber(value);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = prefix + formatNumber(target);
  };

  requestAnimationFrame(update);
};

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.target.dataset.count) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ── HERO CANVAS PARTICLES ──
const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '#6366f1' : '#8b5cf6';
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Initialize particles
  for (let i = 0; i < 80; i++) particles.push(new Particle());

  // Draw connections
  const drawConnections = () => {
    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach(p2 => {
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (dist < 120) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 120) * 0.08;
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.restore();
        }
      });
    });
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animFrame = requestAnimationFrame(animate);
  };

  animate();

  // Pause when not visible for performance
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animFrame);
    else animate();
  });
}

// ── PRODUCT FILTER ──
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('filter-btn--active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('filter-btn--active');
    btn.setAttribute('aria-selected', 'true');

    const filter = btn.dataset.filter;
    productCards.forEach(card => {
      const categories = card.dataset.category || '';
      const show = filter === 'all' || categories.includes(filter);
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';

      setTimeout(() => {
        card.style.display = show ? 'block' : 'none';
        if (show) {
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          });
        }
      }, 150);
    });
  });
});

// ── PRICING TOGGLE ──
const pricingMonthly = document.getElementById('pricing-monthly');
const pricingAnnual = document.getElementById('pricing-annual');
const pricingAmounts = document.querySelectorAll('.pricing-amount');

const updatePricing = (period) => {
  pricingAmounts.forEach(el => {
    const val = el.dataset[period];
    if (val) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        el.textContent = val;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      }, 150);
    }
  });
};

pricingMonthly?.addEventListener('click', () => {
  pricingMonthly.classList.add('pricing-toggle__btn--active');
  pricingAnnual?.classList.remove('pricing-toggle__btn--active');
  updatePricing('monthly');
});

pricingAnnual?.addEventListener('click', () => {
  pricingAnnual.classList.add('pricing-toggle__btn--active');
  pricingMonthly?.classList.remove('pricing-toggle__btn--active');
  updatePricing('annual');
});

// ── AI CHAT DEMO ANIMATION ──
const chatTyping = document.getElementById('chat-typing');
const chatMsgText = document.querySelector('.chat-msg__text');

const runChatDemo = () => {
  if (!chatTyping || !chatMsgText) return;

  setTimeout(() => {
    chatTyping.style.display = 'none';
    chatMsgText.style.display = 'block';
    chatMsgText.style.animation = 'fade-in-up 0.4s ease both';
  }, 2500);

  setTimeout(() => {
    chatTyping.style.display = 'flex';
    chatMsgText.style.display = 'none';
  }, 7000);
};

// Run when AI section is in view
const aiSection = document.getElementById('ai-tools');
if (aiSection) {
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) runChatDemo();
  }, { threshold: 0.4 }).observe(aiSection);
}

// ── TABS ──
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${target}`)?.classList.add('active');
  });
});

// ── LICENSE SELECTOR ──
const licenseOptions = document.querySelectorAll('.license-option');
licenseOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    licenseOptions.forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    const radio = opt.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  });
});

// ── SMOOTH ANCHOR SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── TOOLTIP ──
const addTooltip = (el, text) => {
  el.addEventListener('mouseenter', () => {
    const tip = document.createElement('div');
    tip.className = 'tooltip';
    tip.textContent = text;
    tip.style.cssText = `
      position: fixed; background: rgba(0,0,0,0.9); color: #f1f5f9;
      padding: 6px 12px; border-radius: 6px; font-size: 12px; z-index: 9999;
      pointer-events: none; white-space: nowrap;
      border: 1px solid rgba(255,255,255,0.1);
    `;
    document.body.appendChild(tip);
    const rect = el.getBoundingClientRect();
    tip.style.top = `${rect.bottom + 8}px`;
    tip.style.left = `${rect.left + rect.width / 2 - tip.offsetWidth / 2}px`;
    el._tooltip = tip;
  });
  el.addEventListener('mouseleave', () => el._tooltip?.remove());
};

// ── FLOATING NOTIFICATION ──
const showNotification = (message, type = 'success') => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: ${type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)'};
    border: 1px solid ${type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.4)'};
    color: #f1f5f9; padding: 14px 20px; border-radius: 12px;
    font-size: 14px; font-weight: 500; font-family: 'Inter', sans-serif;
    backdrop-filter: blur(10px); max-width: 320px;
    animation: fade-in-up 0.3s ease both;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'fade-in 0.3s ease reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3500);
};

// ── WISHLIST / SAVE BUTTONS ──
document.querySelectorAll('.product-card').forEach(card => {
  const btn = document.createElement('button');
  btn.style.cssText = `
    position: absolute; top: 10px; right: 10px; z-index: 10;
    width: 34px; height: 34px; border-radius: 50%;
    background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15);
    color: #94a3b8; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s ease; font-size: 14px;
    backdrop-filter: blur(8px);
  `;
  btn.innerHTML = '♡';
  btn.setAttribute('aria-label', 'Save to wishlist');

  const media = card.querySelector('.product-card__media');
  if (media) {
    media.style.position = 'relative';
    media.appendChild(btn);
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = btn.dataset.saved === 'true';
    btn.dataset.saved = saved ? 'false' : 'true';
    btn.innerHTML = saved ? '♡' : '♥';
    btn.style.color = saved ? '#94a3b8' : '#ef4444';
    showNotification(saved ? 'Removed from wishlist' : 'Saved to wishlist ❤️');
  });
});

// ── PAGE ENTRY ANIMATION ──
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-loaded');

  // Animate hero elements
  const heroEls = ['.hero__eyebrow', '.hero__title', '.hero__subtitle', '.hero__stats', '.hero__cta', '.hero__trusted'];
  heroEls.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 100 + i * 100);
    }
  });
});

console.log('%cUXMarket AI 🚀', 'color:#6366f1;font-size:20px;font-weight:900;font-family:Space Grotesk,sans-serif;');
console.log('%cThe World\'s First AI UX Marketplace', 'color:#8b5cf6;font-size:12px;');
