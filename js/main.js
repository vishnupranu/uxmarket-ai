/**
 * UXMarket AI — Main JavaScript
 * Navigation, animations, interactions
 */

/* ── Nav scroll behavior ─────────────────────────────────── */
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile hamburger
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ── Scroll reveal ────────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  const stagger = document.querySelectorAll('.stagger-children');

  if (!els.length && !stagger.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
  stagger.forEach(el => io.observe(el));
}

/* ── Animated number counter ─────────────────────────────── */
function animateCounter(el, target, duration = 2000, suffix = '') {
  const start = performance.now();
  const startVal = 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const current = Math.round(startVal + (target - startVal) * eased);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.counter, 10);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, 2000, suffix);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
}

/* ── Revenue calculator (Sellers page) ───────────────────── */
function initCalculator() {
  const slider = document.getElementById('sales-slider');
  const priceSlider = document.getElementById('price-slider');
  const resultEl = document.getElementById('calc-result');
  const revenueEl = document.getElementById('calc-revenue');
  const platformEl = document.getElementById('calc-platform');

  if (!slider || !revenueEl) return;

  function calculate() {
    const sales = parseInt(slider.value, 10);
    const price = priceSlider ? parseInt(priceSlider.value, 10) : 49;
    const gross = sales * price;
    const platformFee = Math.round(gross * 0.3);
    const revenue = gross - platformFee;

    if (revenueEl) revenueEl.textContent = '$' + revenue.toLocaleString();
    if (platformEl) platformEl.textContent = '$' + platformFee.toLocaleString();
    if (resultEl) resultEl.textContent = '$' + gross.toLocaleString();

    // Update slider fill
    [slider, priceSlider].forEach(s => {
      if (!s) return;
      const pct = ((s.value - s.min) / (s.max - s.min)) * 100;
      s.style.background = `linear-gradient(to right, var(--accent) ${pct}%, var(--border-strong) ${pct}%)`;
    });
  }

  slider.addEventListener('input', calculate);
  if (priceSlider) priceSlider.addEventListener('input', calculate);
  calculate();
}

/* ── Tab switcher ─────────────────────────────────────────── */
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabContainer => {
    const tabs = tabContainer.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Hide/show panels
        const parent = tabContainer.closest('[data-tabs-parent]') || document.body;
        parent.querySelectorAll('[data-tab-panel]').forEach(panel => {
          panel.hidden = panel.dataset.tabPanel !== target;
        });
      });
    });
  });
}

/* ── Product license selector ────────────────────────────── */
function initLicenseSelector() {
  const cards = document.querySelectorAll('.license-card');
  const priceEl = document.getElementById('selected-price');
  const btnEl = document.getElementById('purchase-btn');

  if (!cards.length) return;

  const prices = { personal: 49, commercial: 129, enterprise: 499 };

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const type = card.dataset.license;
      if (priceEl) priceEl.textContent = '$' + prices[type];
      if (btnEl) btnEl.textContent = 'Purchase ' + type.charAt(0).toUpperCase() + type.slice(1) + ' License — $' + prices[type];
    });
  });
}

/* ── Auth form ────────────────────────────────────────────── */
function initAuthForms() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(field, msg) {
    field.classList.add('error');
    let err = field.parentElement.querySelector('.field-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field-error';
      field.parentElement.appendChild(err);
    }
    err.textContent = msg;
  }

  function clearErrors(form) {
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    form.querySelectorAll('.field-error').forEach(el => el.remove());
  }

  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      clearErrors(loginForm);
      const email = loginForm.querySelector('#login-email');
      const pass = loginForm.querySelector('#login-pass');
      let valid = true;

      if (!validateEmail(email.value)) {
        showError(email, 'Enter a valid email address');
        valid = false;
      }
      if (pass.value.length < 8) {
        showError(pass, 'Password must be at least 8 characters');
        valid = false;
      }

      if (valid) {
        const btn = loginForm.querySelector('button[type="submit"]');
        btn.textContent = 'Signing in…';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = 'Sign In';
          btn.disabled = false;
        }, 2000);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      clearErrors(registerForm);
      const email = registerForm.querySelector('#reg-email');
      const pass = registerForm.querySelector('#reg-pass');
      let valid = true;

      if (!validateEmail(email.value)) {
        showError(email, 'Enter a valid email address');
        valid = false;
      }
      if (pass.value.length < 8) {
        showError(pass, 'Password must be at least 8 characters');
        valid = false;
      }

      if (valid) {
        const btn = registerForm.querySelector('button[type="submit"]');
        btn.textContent = 'Creating account…';
        btn.disabled = true;
      }
    });
  }

  // Auth tabs (sign in / register)
  const authTabBtns = document.querySelectorAll('[data-auth-tab]');
  authTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.authTab;
      authTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('[data-auth-panel]').forEach(panel => {
        panel.hidden = panel.dataset.authPanel !== target;
      });
    });
  });
}

/* ── Mesh hero animation (index) ─────────────────────────── */
function initMeshHero() {
  const hero = document.querySelector('.hero--index');
  if (!hero) return;
  // Parallax orbs on mouse move
  const orbs = hero.querySelectorAll('.mesh-orb');
  hero.addEventListener('mousemove', e => {
    const { left, top, width, height } = hero.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / width;
    const y = (e.clientY - top - height / 2) / height;
    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 20;
      orb.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  });
}

/* ── Token stream (product page) ────────────────────────────*/
function initTokenStream() {
  const container = document.querySelector('.token-stream');
  if (!container) return;

  const tokens = [
    '--color-accent', 'font-weight: 800', 'border-radius: 14px',
    'gap: 24px', 'display: grid', 'var(--bg-card)', 'z-index: 1',
    'animation-delay', 'backdrop-filter', 'letter-spacing: -0.04em',
    'cubic-bezier', 'translate(-50%)', 'opacity: 0.8', 'pointer-events',
    'transition: all 250ms', 'clamp(3rem, 6vw, 5rem)', 'isolation: isolate',
    'mask-image', 'color-scheme: dark', 'font-feature-settings',
  ];

  for (let i = 0; i < 25; i++) {
    const el = document.createElement('span');
    el.className = 'token-item';
    el.textContent = tokens[Math.floor(Math.random() * tokens.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.top = Math.random() * 100 + '%';
    el.style.animationDuration = (6 + Math.random() * 8) + 's';
    el.style.animationDelay = -(Math.random() * 10) + 's';
    el.style.fontSize = (9 + Math.random() * 4) + 'px';
    el.style.opacity = (0.2 + Math.random() * 0.4).toString();
    container.appendChild(el);
  }
}

/* ── Constellation SVG (categories) ─────────────────────── */
function initConstellation() {
  const svg = document.getElementById('constellation-svg');
  if (!svg) return;

  const W = svg.viewBox.baseVal.width || 1440;
  const H = svg.viewBox.baseVal.height || 600;
  const nodes = [];
  const numNodes = 30;

  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    });
  }

  const edgesGroup = svg.querySelector('#constellation-edges');
  const nodesGroup = svg.querySelector('#constellation-nodes');

  function render() {
    // Move nodes
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    // Draw edges
    let edgeHTML = '';
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const opacity = (1 - dist / 180) * 0.5;
          edgeHTML += `<line x1="${nodes[i].x.toFixed(1)}" y1="${nodes[i].y.toFixed(1)}" x2="${nodes[j].x.toFixed(1)}" y2="${nodes[j].y.toFixed(1)}" stroke="rgba(99,102,241,${opacity.toFixed(2)})" stroke-width="0.8"/>`;
        }
      }
    }
    if (edgesGroup) edgesGroup.innerHTML = edgeHTML;

    // Draw nodes
    let nodeHTML = '';
    nodes.forEach(n => {
      nodeHTML += `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="2" fill="rgba(129,140,248,0.6)"/>`;
    });
    if (nodesGroup) nodesGroup.innerHTML = nodeHTML;

    requestAnimationFrame(render);
  }
  render();
}

/* ── Neural network SVG (ai-tools) ──────────────────────── */
function initNeuralNet() {
  const svg = document.getElementById('neural-svg');
  if (!svg) return;

  const layers = [
    [{ x: 200, y: 150 }, { x: 200, y: 300 }, { x: 200, y: 450 }],
    [{ x: 500, y: 100 }, { x: 500, y: 225 }, { x: 500, y: 350 }, { x: 500, y: 475 }],
    [{ x: 800, y: 150 }, { x: 800, y: 300 }, { x: 800, y: 450 }],
    [{ x: 1100, y: 225 }, { x: 1100, y: 375 }],
  ];

  let edgeHTML = '';
  let nodeHTML = '';

  layers.forEach((layer, li) => {
    if (li < layers.length - 1) {
      layer.forEach(src => {
        layers[li + 1].forEach(dst => {
          const delay = Math.random() * 3;
          edgeHTML += `<line x1="${src.x}" y1="${src.y}" x2="${dst.x}" y2="${dst.y}" stroke="rgba(99,102,241,0.2)" stroke-width="1" stroke-dasharray="6 6">
            <animate attributeName="stroke-dashoffset" from="12" to="0" dur="${1.5 + Math.random()}s" repeatCount="indefinite" begin="${delay}s"/>
          </line>`;
        });
      });
    }
    layer.forEach((node, ni) => {
      const delay = li * 0.3 + ni * 0.15;
      nodeHTML += `<circle cx="${node.x}" cy="${node.y}" r="8" fill="rgba(99,102,241,0.15)" stroke="rgba(129,140,248,0.6)" stroke-width="1.5">
        <animate attributeName="r" values="7;10;7" dur="${2 + Math.random()}s" repeatCount="indefinite" begin="${delay}s"/>
        <animate attributeName="opacity" values="1;0.5;1" dur="${2 + Math.random()}s" repeatCount="indefinite" begin="${delay}s"/>
      </circle>`;
    });
  });

  const edgesGroup = svg.querySelector('#neural-edges');
  const nodesGroup = svg.querySelector('#neural-nodes');
  if (edgesGroup) edgesGroup.innerHTML = edgeHTML;
  if (nodesGroup) nodesGroup.innerHTML = nodeHTML;
}

/* ── Product filter ───────────────────────────────────────── */
function initProductFilter() {
  const filterBtns = document.querySelectorAll('[data-filter]');
  const products = document.querySelectorAll('[data-category]');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      products.forEach(product => {
        const show = filter === 'all' || product.dataset.category === filter;
        product.style.display = show ? '' : 'none';
        if (show) {
          product.style.animation = 'fade-in 0.3s var(--ease-smooth) both';
        }
      });
    });
  });
}

/* ── Enterprise form ─────────────────────────────────────── */
function initEnterpriseForm() {
  const form = document.getElementById('enterprise-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      form.innerHTML = `
        <div class="form-success">
          <div class="icon-box icon-box--accent" style="width:56px;height:56px;margin:0 auto var(--space-4)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 style="font-size:var(--text-xl);font-weight:700;letter-spacing:-0.03em;margin-bottom:var(--space-2)">Message received</h3>
          <p style="color:var(--text-secondary);font-size:var(--text-sm)">Our enterprise team will reach out within 1 business day.</p>
        </div>`;
    }, 1500);
  });
}

/* ── Lazy load images ─────────────────────────────────────── */
function initLazyImages() {
  if (!('IntersectionObserver' in window)) return;
  const imgs = document.querySelectorAll('img[data-src]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        io.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  imgs.forEach(img => io.observe(img));
}

/* ── Search suggestions ───────────────────────────────────── */
function initSearchSuggestions() {
  const input = document.querySelector('.hero-search input');
  const suggestions = document.querySelector('.hero-search__suggestions');
  if (!input || !suggestions) return;

  const items = [
    'SaaS Dashboard UI Kit', 'AI Chat Interface', 'FinTech Design System',
    'Healthcare UX Kit', 'Mobile App Components', 'E-commerce UI', 'Analytics Dashboard',
    'Admin Panel Template', 'Landing Page Kit', 'Design Token System',
  ];

  input.addEventListener('input', () => {
    const val = input.value.trim().toLowerCase();
    if (!val) { suggestions.hidden = true; return; }
    const matches = items.filter(i => i.toLowerCase().includes(val)).slice(0, 5);
    if (!matches.length) { suggestions.hidden = true; return; }
    suggestions.innerHTML = matches.map(m =>
      `<button class="search-suggestion" type="button">${m}</button>`
    ).join('');
    suggestions.hidden = false;
    suggestions.querySelectorAll('.search-suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.textContent;
        suggestions.hidden = true;
        input.focus();
      });
    });
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target)) suggestions.hidden = true;
  });
}

/* ── Init all ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initCounters();
  initCalculator();
  initTabs();
  initLicenseSelector();
  initAuthForms();
  initMeshHero();
  initTokenStream();
  initConstellation();
  initNeuralNet();
  initProductFilter();
  initEnterpriseForm();
  initLazyImages();
  initSearchSuggestions();
});
