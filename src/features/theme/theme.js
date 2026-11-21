import { useSyncExternalStore } from "react";

// Theme state for light and dark mode.
// The chosen theme is saved in localStorage. With no saved choice the app follows
// the operating system setting. index.html applies the theme before React loads,
// so the page never flashes the wrong colours.

export const THEME_STORAGE_KEY = "coderise-theme";
const THEME_COLORS = { light: "#2563eb", dark: "#0f1726" };

function readStoredTheme() {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function systemTheme() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function currentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

const listeners = new Set();

function applyTheme(theme) {
  const root = document.documentElement;
  if (root.dataset.theme === theme) return;
  root.classList.add("theme-switching");
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  // Re-enable transitions after the new colours have been painted.
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => root.classList.remove("theme-switching")));
  listeners.forEach((listener) => listener());
}

export function setTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this visit.
  }
  applyTheme(theme);
}

export function toggleTheme() {
  setTheme(currentTheme() === "dark" ? "light" : "dark");
}

// Keep following the system setting until the user picks a theme.
if (typeof window !== "undefined") {
  window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if (!readStoredTheme()) applyTheme(systemTheme());
  });
  // Keep other open tabs in step.
  window.addEventListener("storage", (event) => {
    if (event.key === THEME_STORAGE_KEY) applyTheme(readStoredTheme() || systemTheme());
  });
  // Safety net if the inline script in index.html did not run.
  if (!document.documentElement.dataset.theme) applyTheme(readStoredTheme() || systemTheme());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme() {
  return useSyncExternalStore(subscribe, currentTheme, () => "light");
}
