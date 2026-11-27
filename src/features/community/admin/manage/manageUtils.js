import { useCallback, useState } from "react";

// Helpers shared by the admin "manage" screens (A19–A27). Components live in manageControls.jsx.

export const DAY = 86400000;
export const numberFormat = new Intl.NumberFormat("en-GB");
export const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const usdCents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Lagos" });
export const fullDate = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
export const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
export const monthYear = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "Africa/Lagos" });
const watParts = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Lagos",
});

export const isoDay = (date) => date.toISOString().slice(0, 10);
export const daysAgo = (days) => new Date(Date.now() - days * DAY).toISOString();
export const daysAhead = (days) => new Date(Date.now() + days * DAY).toISOString();

// "1 Dec 2026, 09:00 WAT"
export function watDateTime(iso) {
  if (!iso) return "";
  return `${watParts.format(new Date(iso)).replace(/ at /, ", ")} WAT`;
}

// A <input type="datetime-local"> value is read as West Africa Time (UTC+1, no daylight saving).
export function watInputToIso(value) {
  if (!value) return null;
  const date = new Date(`${value}:00+01:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
export function isoToWatInput(iso) {
  if (!iso) return "";
  const shifted = new Date(new Date(iso).getTime() + 3600000);
  return shifted.toISOString().slice(0, 16);
}

export function relativeDays(iso) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY));
  if (days === 0) {
    const minutes = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
    return minutes < 60 ? `${minutes} min ago` : `${Math.floor(minutes / 60)} h ago`;
  }
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "?";
}

// ---------- CSV export ----------

const csvCell = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
export const toCsv = (rows) => rows.map((row) => row.map(csvCell).join(",")).join("\r\n");

export function downloadCsv(filename, rowsOrText) {
  const text = typeof rowsOrText === "string" ? rowsOrText : toCsv(rowsOrText);
  const url = URL.createObjectURL(new Blob([`\ufeff${text}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- toast state ----------

// Toast's onClose must be stable, so the close callback is memoised here.
export function useToastState(initial = null) {
  const [toast, setToast] = useState(initial);
  const closeToast = useCallback(() => setToast(null), [setToast]);
  return [toast, setToast, closeToast];
}

export const isHttpsUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};
