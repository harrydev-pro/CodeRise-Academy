import { useEffect, useState } from "react";

// Shared constants, formatters and small hooks for the admin Collaboration, Team and Hackathon
// screens (A05–A11). Components live in EventControls.jsx; requests in adminEventsService.js.

export const TIME_ZONE = "Africa/Lagos"; // West Africa Time (UTC+1, no daylight saving)
export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;

// Team sizes the platform allows (Community settings). The backend enforces the same range.
export const TEAM_SIZE_RANGE = { min: 2, max: 3 };
export const LEVELS = ["Beginner", "Intermediate", "Advanced"];
export const COLLAB_FORMATS = [
  { value: "github", label: "GitHub link" },
  { value: "live", label: "Live URL" },
  { value: "figma", label: "Figma link" },
  { value: "pdf", label: "PDF" },
  { value: "zip", label: "ZIP file" },
];

export const COLLAB_STATUS = {
  published: { label: "Published", tone: "green" },
  draft: { label: "Draft", tone: "amber" },
  closed: { label: "Closed", tone: "neutral" },
};
export const TEAM_STATUS = {
  forming: { label: "Forming", tone: "amber" },
  active: { label: "Active", tone: "green" },
  submitted: { label: "Submitted", tone: "blue" },
  completed: { label: "Completed", tone: "teal" },
  incomplete: { label: "Did not finish", tone: "neutral" },
  flagged: { label: "Flagged", tone: "red" },
};
export const HACKATHON_TABS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "live", label: "Live" },
  { value: "ended", label: "Ended" },
  { value: "drafts", label: "Drafts" },
];
export const MEMBERSHIP = {
  free: { label: "Free", tone: "neutral" },
  premium: { label: "Premium", tone: "purple" },
  premium_plus: { label: "Premium Plus", tone: "purple" },
};
export const JUDGING_STATUS = {
  judged: { label: "Judged", tone: "green" },
  partial: { label: "Partly judged", tone: "blue" },
  awaiting: { label: "Awaiting judge", tone: "amber" },
  late: { label: "Late – excluded", tone: "red" },
};

// ---------- formatting ----------

export const numberFormat = new Intl.NumberFormat("en-GB");
export const fullDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TIME_ZONE });
export const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TIME_ZONE });
export const dateTimeWat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE });
export const dayTimeWat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE });
export const timeWat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE });

export const formatDate = (iso) => (iso ? fullDate.format(new Date(iso)) : "—");
export const formatDateTime = (iso) => (iso ? dateTimeWat.format(new Date(iso)).replace(" at ", ", ") : "—");
export const formatDayTime = (iso) => (iso ? dayTimeWat.format(new Date(iso)).replace(" at ", ", ") : "—");

// "2 hours ago", "Yesterday", "3 days ago", then a date.
export function relativeTime(iso, now = Date.now()) {
  if (!iso) return "—";
  const diff = now - new Date(iso).getTime();
  if (diff < HOUR) return "Just now";
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  if (diff < 2 * DAY) return "Yesterday";
  if (diff < 10 * DAY) return `${Math.floor(diff / DAY)} days ago`;
  return dayMonth.format(new Date(iso));
}

export function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "?";
}

// <input type="datetime-local"> values are West Africa Time wall-clock times.
export function toWatInput(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() + HOUR).toISOString().slice(0, 16);
}
export function fromWatInput(value) {
  if (!value) return "";
  const date = new Date(`${value}:00+01:00`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

// draft stays draft; otherwise the timing decides (the backend does the same).
export function hackathonStatus(hackathon, now = Date.now()) {
  if (hackathon.status === "draft") return "draft";
  if (!hackathon.startsAt || now < new Date(hackathon.startsAt).getTime()) return "scheduled";
  if (now < new Date(hackathon.endsAt).getTime()) return "live";
  return "ended";
}

export function criteriaTotal(criteria) {
  return criteria.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
}

// ---------- CSV export (built in the browser) ----------

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  // Neutralise spreadsheet formulas and quote every cell.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

// columns: [{ label, value: (row) => any }]
export function downloadCsv(filename, columns, rows) {
  const lines = [columns.map((column) => csvCell(column.label)).join(",")];
  rows.forEach((row) => lines.push(columns.map((column) => csvCell(column.value(row))).join(",")));
  const blob = new Blob([String.fromCharCode(0xfeff), lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const fileDate = () => new Date().toISOString().slice(0, 10);

// ---------- hooks ----------

// Current time, updated every `intervalMs`.
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

// Editor autosave: a copy of the form is kept in this browser while there are unsaved changes,
// so a closed tab or crash does not lose work. It is a per-device convenience only; "Save draft"
// stores the draft on the server. Returns the time of the last autosave (ISO) or null.
export function readLocalDraft(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function clearLocalDraft(key) {
  try { window.localStorage.removeItem(key); } catch { /* storage unavailable */ }
}
export function useLocalDraft(key, value, dirty) {
  const [savedAt, setSavedAt] = useState(null);
  const json = JSON.stringify(value);
  useEffect(() => {
    if (!dirty) return undefined;
    const timer = window.setTimeout(() => {
      const at = new Date().toISOString();
      try {
        window.localStorage.setItem(key, JSON.stringify({ value: JSON.parse(json), savedAt: at }));
        setSavedAt(at);
      } catch { /* storage unavailable: no autosave */ }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [key, json, dirty]);
  return savedAt;
}

// Moves keyboard focus to the first invalid field (ids are `field-<name>`), else the summary.
export function focusFirstError(order, errors, summary) {
  const first = order.find((field) => errors[field]);
  window.requestAnimationFrame(() => {
    const target = document.getElementById(`field-${first}`);
    if (target) { target.scrollIntoView({ behavior: "smooth", block: "center" }); target.focus?.({ preventScroll: true }); }
    else summary?.focus();
  });
}
