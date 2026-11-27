import { Code, Download, FileText, Image, Link2, Video } from "lucide-react";

// Shared formatting for the competition screens. Deadlines are shown in West Africa Time.
const TIME_ZONE = "Africa/Lagos";
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TIME_ZONE });
const dayMonthFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TIME_ZONE });
const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE });
const numberFormat = new Intl.NumberFormat("en-GB");
const scoreFormat = new Intl.NumberFormat("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const usdFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const formatDate = (iso) => (iso ? dateFormat.format(new Date(iso)) : "—");
export const formatDayMonth = (iso) => (iso ? dayMonthFormat.format(new Date(iso)) : "—");
export const formatDateTime = (iso) => (iso ? `${dateFormat.format(new Date(iso))}, ${timeFormat.format(new Date(iso))} WAT` : "—");
export const formatNumber = (value) => numberFormat.format(value ?? 0);
export const formatScore = (value) => scoreFormat.format(value ?? 0);
export const formatUsd = (value) => usdFormat.format(value ?? 0);

// "20 Dec – 6 Jan"
export function formatRange(startIso, endIso) {
  if (!startIso || !endIso) return "—";
  return `${formatDayMonth(startIso)} – ${formatDayMonth(endIso)}`;
}

export function daysUntil(iso) {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export const isRegistrationOpen = (competition) => competition.status === "open" || competition.status === "closing_soon";
export const isFull = (competition) => competition.capacity > 0 && competition.participants >= competition.capacity;
export const placesLeft = (competition) => Math.max(0, (competition.capacity ?? 0) - (competition.participants ?? 0));
export const competitionPath = (id) => `/community/competitions/${encodeURIComponent(id)}`;


export const REQUIREMENT_ICONS = { code: Code, video: Video, download: Download, file: FileText, link: Link2, image: Image };

export function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}
export function avatarTone(username = "") {
  let hash = 0;
  for (const char of username) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return `avatar-${hash % 4}`;
}
