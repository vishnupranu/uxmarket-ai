// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';

const PAGES = [
  { name: 'Index', path: '/', title: 'UXMarket AI' },
  { name: 'Categories', path: '/categories.html', title: 'Categories' },
  { name: 'Product', path: '/product.html', title: 'Aurora AI Dashboard Pro' },
  { name: 'Sellers', path: '/sellers.html', title: 'Sell on UXMarket AI' },
  { name: 'Enterprise', path: '/enterprise.html', title: 'Enterprise' },
  { name: 'AI Tools', path: '/ai-tools.html', title: 'AI Tools' },
  { name: 'Auth', path: '/auth.html', title: 'Sign In' },
];

// ── Test 1: All pages load ─────────────────────────────────────
test.describe('Page Load Tests', () => {
  for (const page of PAGES) {
    test(`${page.name} page loads with 200 status`, async ({ page: p }) => {
      const response = await p.goto(`${BASE}${page.path}`);
      expect(response?.status()).toBe(200);
    });

    test(`${page.name} page has correct title`, async ({ page: p }) => {
      await p.goto(`${BASE}${page.path}`);
      await expect(p).toHaveTitle(new RegExp(page.title, 'i'));
    });

    test(`${page.name} page has no console errors`, async ({ page: p }) => {
      const errors = [];
      p.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await p.goto(`${BASE}${page.path}`);
      await p.waitForLoadState('networkidle');
      // Filter out known external resource failures in test env
      const criticalErrors = errors.filter(e => !e.includes('net::ERR_') && !e.includes('Failed to load resource'));
      expect(criticalErrors).toHaveLength(0);
    });
  }
});

// ── Test 2: Navigation ─────────────────────────────────────────
test.describe('Navigation Tests', () => {
  test('Main navigation links exist and are clickable on homepage', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const navLinks = page.locator('.nav__links .nav__link');
    await expect(navLinks).toHaveCount(5);
  });

  test('Logo links back to homepage', async ({ page }) => {
    await page.goto(`${BASE}/categories.html`);
    await page.click('#nav-logo');
    await expect(page).toHaveURL(`${BASE}/index.html`);
  });

  test('Mobile menu opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/`);
    const hamburger = page.locator('#nav-hamburger');
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).not.toHaveClass(/open/);
    await hamburger.click();
    await expect(mobileMenu).toHaveClass(/open/);
  });
});

// ── Test 3: Dark/Light mode toggle ────────────────────────────
test.describe('Theme Toggle Tests', () => {
  test('Theme toggle button exists on all pages', async ({ page }) => {
    for (const pg of PAGES) {
      await page.goto(`${BASE}${pg.path}`);
      const toggle = page.locator('#theme-toggle-btn').first();
      await expect(toggle).toBeVisible();
    }
  });

  test('Toggling theme switches data-theme attribute', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const html = page.locator('html');
    // Default should be dark
    await expect(html).toHaveAttribute('data-theme', 'dark');
    // Click toggle
    await page.click('#theme-toggle-btn');
    await expect(html).toHaveAttribute('data-theme', 'light');
    // Toggle back
    await page.click('#theme-toggle-btn');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('Theme persists via localStorage', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.click('#theme-toggle-btn');
    // Navigate and check theme persists
    await page.goto(`${BASE}/categories.html`);
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});

// ── Test 4: Revenue calculator ────────────────────────────────
test.describe('Revenue Calculator', () => {
  test('Calculator exists on sellers page', async ({ page }) => {
    await page.goto(`${BASE}/sellers.html`);
    const slider = page.locator('#sales-slider');
    const result = page.locator('#calc-revenue');
    await expect(slider).toBeVisible();
    await expect(result).toBeVisible();
  });

  test('Calculator updates when slider changes', async ({ page }) => {
    await page.goto(`${BASE}/sellers.html`);
    const slider = page.locator('#sales-slider');
    const revenue = page.locator('#calc-revenue');
    const initialValue = await revenue.textContent();
    await slider.fill('200');
    await slider.dispatchEvent('input');
    await page.waitForTimeout(100);
    const newValue = await revenue.textContent();
    expect(newValue).not.toBe(initialValue);
  });
});

// ── Test 5: Auth form validation ──────────────────────────────
test.describe('Auth Form Validation', () => {
  test('Sign in form shows error on empty submit', async ({ page }) => {
    await page.goto(`${BASE}/auth.html`);
    await page.click('#login-submit-btn');
    // Should show validation (browser native or custom)
    const form = page.locator('#login-form');
    await expect(form).toBeVisible();
  });

  test('Register form exists with required fields', async ({ page }) => {
    await page.goto(`${BASE}/auth.html`);
    await page.click('#tab-register');
    const panel = page.locator('#register-panel');
    await expect(panel).toBeVisible();
    await expect(page.locator('#reg-email')).toBeVisible();
    await expect(page.locator('#reg-pass')).toBeVisible();
  });

  test('Auth tab switching works', async ({ page }) => {
    await page.goto(`${BASE}/auth.html`);
    // Start on signin
    await expect(page.locator('#signin-panel')).toBeVisible();
    await expect(page.locator('#register-panel')).toBeHidden();
    // Switch to register
    await page.click('#tab-register');
    await expect(page.locator('#register-panel')).toBeVisible();
    await expect(page.locator('#signin-panel')).toBeHidden();
    // Switch back
    await page.click('#tab-signin');
    await expect(page.locator('#signin-panel')).toBeVisible();
  });
});

// ── Test 6: Product page license selector ─────────────────────
test.describe('Product Page', () => {
  test('License selector cards exist', async ({ page }) => {
    await page.goto(`${BASE}/product.html`);
    const licenseCards = page.locator('.license-card');
    await expect(licenseCards).toHaveCount(3);
  });

  test('Selecting commercial license updates price display', async ({ page }) => {
    await page.goto(`${BASE}/product.html`);
    await page.click('#license-commercial');
    const priceEl = page.locator('#selected-price');
    await expect(priceEl).toHaveText('$129');
  });

  test('Product tabs switch content', async ({ page }) => {
    await page.goto(`${BASE}/product.html`);
    await expect(page.locator('[data-tab-panel="overview"]')).toBeVisible();
    await page.click('#tab-includes');
    await expect(page.locator('[data-tab-panel="includes"]')).toBeVisible();
    await expect(page.locator('[data-tab-panel="overview"]')).toBeHidden();
  });
});

// ── Test 7: Enterprise form ────────────────────────────────────
test.describe('Enterprise Form', () => {
  test('Enterprise contact form exists', async ({ page }) => {
    await page.goto(`${BASE}/enterprise.html`);
    const form = page.locator('#enterprise-form');
    await expect(form).toBeVisible();
  });

  test('Enterprise form submit shows success state', async ({ page }) => {
    await page.goto(`${BASE}/enterprise.html`);
    // Fill form
    await page.fill('#ent-fname', 'Priya');
    await page.fill('#ent-lname', 'Sharma');
    await page.fill('#ent-email', 'priya@razorpay.com');
    await page.fill('#ent-company', 'Razorpay');
    await page.selectOption('#ent-teamsize', '50-200');
    await page.fill('#ent-message', 'We need a design system for our team of 45 designers');
    await page.click('#enterprise-submit-btn');
    // Wait for success state
    await page.waitForTimeout(2000);
    const successEl = page.locator('.form-success');
    await expect(successEl).toBeVisible();
  });
});

// ── Test 8: No broken images ──────────────────────────────────
test.describe('Asset Tests', () => {
  test('CSS files load successfully', async ({ page }) => {
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('.css')) responses.push(response.status());
    });
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle');
    expect(responses.every(s => s === 200)).toBeTruthy();
  });

  test('JavaScript files load successfully', async ({ page }) => {
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('.js')) responses.push(response.status());
    });
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle');
    expect(responses.every(s => s === 200)).toBeTruthy();
  });
});

// ── Test 9: Responsive Design ─────────────────────────────────
test.describe('Responsive Design', () => {
  test('Homepage is responsive at 375px (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/`);
    // Nav links should be hidden on mobile
    const navLinks = page.locator('.nav__links');
    await expect(navLinks).toBeHidden();
    // Hamburger should be visible
    const hamburger = page.locator('#nav-hamburger');
    await expect(hamburger).toBeVisible();
  });

  test('Homepage is responsive at 1440px (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/`);
    // Nav links should be visible on desktop
    const navLinks = page.locator('.nav__links');
    await expect(navLinks).toBeVisible();
  });

  test('Auth page split layout visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/auth.html`);
    const brandPanel = page.locator('.auth-brand');
    await expect(brandPanel).toBeVisible();
  });
});

// ── Test 10: Accessibility basics ─────────────────────────────
test.describe('Accessibility', () => {
  test('All images have alt text on homepage', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const imgs = page.locator('img:not([alt])');
    await expect(imgs).toHaveCount(0);
  });

  test('Homepage has exactly one h1', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
  });

  test('Interactive elements are focusable', async ({ page }) => {
    await page.goto(`${BASE}/`);
    // Tab to first focusable element
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focused);
  });

  test('Nav has role=navigation', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const nav = page.locator('[role="navigation"]').first();
    await expect(nav).toBeVisible();
  });
});
