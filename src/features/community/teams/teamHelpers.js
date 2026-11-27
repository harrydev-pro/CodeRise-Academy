import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

// Formatting helpers and hooks for the collaboration team screens. Components live in
// teamComponents.jsx. Event deadlines are shown in West Africa Time.

const LAGOS = "Africa/Lagos";
export const numberFormat = new Intl.NumberFormat("en-GB");
export const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: LAGOS });
export const fullDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: LAGOS });
export const timeOfDay = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: LAGOS });
export const longDay = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: LAGOS });
const lagosDayKey = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: LAGOS });

// "2 Dec, 23:59 WAT"
export function formatDeadline(iso) {
  const date = new Date(iso);
  return `${dayMonth.format(date)}, ${timeOfDay.format(date)} WAT`;
}

// Task due dates are calendar days ("YYYY-MM-DD").
export function formatDueDate(key) {
  return key ? dayMonth.format(new Date(`${key}T12:00:00Z`)) : "";
}
export const dayKeyOf = (iso) => lagosDayKey.format(new Date(iso));
export const todayKey = () => lagosDayKey.format(new Date());

// "Today, 11:05" / "18 Nov"
export function formatUpdated(iso) {
  const date = new Date(iso);
  return dayKeyOf(iso) === todayKey() ? `Today, ${timeOfDay.format(date)}` : dayMonth.format(date);
}

export function timeAgo(iso) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

export function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}
export const firstName = (name = "") => name.trim().split(/\s+/)[0] ?? "";

// The same person always gets the same avatar colour.
export function avatarTone(username = "") {
  let hash = 0;
  for (const char of username) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return `avatar-${hash % 4}`;
}

export function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Ticks every `intervalMs` so countdowns stay current.
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

// The workspace tabs read the team from TeamWorkspaceLayout:
// { team, sample, reloadTeam, notify(toast) }
export function useTeamWorkspace() {
  return useOutletContext();
}
