/**
 * UXMarket AI — Theme System
 * Dark/Light mode with localStorage persistence
 */

(function () {
  const STORAGE_KEY = 'uxmarket-theme';
  const DEFAULT_THEME = 'dark';

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
    updateToggleIcons(theme);
  }

  function updateToggleIcons(theme) {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
      const iconDark = toggle.querySelector('.icon-moon');
      const iconLight = toggle.querySelector('.icon-sun');
      if (iconDark) iconDark.style.display = theme === 'dark' ? 'block' : 'none';
      if (iconLight) iconLight.style.display = theme === 'light' ? 'block' : 'none';
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Apply theme immediately (before paint) to avoid flash
  const initialTheme = getStoredTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);

  // Wire up toggles after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    updateToggleIcons(initialTheme);

    document.querySelectorAll('.theme-toggle').forEach(toggle => {
      toggle.addEventListener('click', toggleTheme);
    });
  });

  // Expose globally
  window.UXTheme = { setTheme, toggleTheme, getTheme: () => getStoredTheme() };
})();
