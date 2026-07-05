/**
 * theme.js — HDI Prediction System Theme Manager
 */
"use strict";

const ThemeManager = (() => {
  const STORAGE_KEY = "hdi-theme";
  const DARK  = "dark";
  const LIGHT = "light";

  function getSystemPreference() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn  = document.getElementById("themeToggleBtn");
    if (!btn) return;
    const icon = btn.querySelector("i");
    if (theme === DARK) {
      icon.className = "bi bi-moon-stars-fill";
      btn.setAttribute("title", "Switch to Light Mode");
    } else {
      icon.className = "bi bi-sun-fill";
      btn.setAttribute("title", "Switch to Dark Mode");
    }
  }

  function saveTheme(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function loadTheme() {
    return localStorage.getItem(STORAGE_KEY) || getSystemPreference();
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || DARK;
    const next    = current === DARK ? LIGHT : DARK;
    applyTheme(next);
    saveTheme(next);
  }

  function init() {
    applyTheme(loadTheme());
    const btn = document.getElementById("themeToggleBtn");
    if (btn) btn.addEventListener("click", toggleTheme);

    // Sync when system preference changes (only if user hasn't saved a preference)
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? DARK : LIGHT);
      }
    });
  }

  return { init, toggleTheme, loadTheme, saveTheme, applyTheme };
})();

document.addEventListener("DOMContentLoaded", ThemeManager.init);
