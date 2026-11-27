import { useEffect, useState } from "react";

// Shared helpers for the hackathon screens (S12–S14). Components live in the page files.

// All hackathon times are shown in West Africa Time, whatever the viewer's own time zone.
export const TIME_ZONE = "Africa/Lagos";
export const fullDateTime = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE });
export const dayDateTime = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE });
export const dayDate = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: TIME_ZONE });
export const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TIME_ZONE });
export const timeOnly = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE });
export const numberFormat = new Intl.NumberFormat("en-GB");

export const wat = (formatter, iso) => (iso ? `${formatter.format(new Date(iso))} WAT` : "");

// Current time, corrected to the server clock by `offset` ms, ticking every `intervalMs`.
export function useServerNow(offset = 0, intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now + offset;
}

// 49330000 -> "13:42:10" (hours can go past 24).
export function clockText(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const seconds = total % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

// "13 hours and 42 minutes" for screen readers.
export function spokenDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours} hour${hours === 1 ? "" : "s"} and ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

// The same person always gets the same avatar colour (matches the Showcase).
export function avatarTone(username = "") {
  let hash = 0;
  for (const char of username) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return `avatar-${hash % 4}`;
}

export function timeAgo(iso, now = Date.now()) {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hour${minutes < 120 ? "" : "s"} ago`;
  return wat(dayDateTime, iso);
}

// ---------- Submission form rules (the backend checks them again) ----------

export const DESCRIPTION_LIMIT = 1000;
export const MAX_SCREENSHOTS = 5;
export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
export const SCREENSHOT_TYPES = ["image/png", "image/jpeg"];

function isUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
const GITHUB_REPO = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/i;
const VIDEO_HOST = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|loom\.com)\//i;

// Returns { field: message }. Drafts only check what has been filled in; a final submission
// needs every required field and the confirmation.
export function validateSubmission(fields, { final, teamSize }) {
  const errors = {};
  const name = fields.projectName.trim();
  if (final && !name) errors.projectName = "Enter your project name.";
  else if (name.length > 80) errors.projectName = "Keep the project name under 80 characters.";

  const github = fields.githubUrl.trim();
  if (final && !github) errors.githubUrl = "Add your public GitHub repository link.";
  else if (github && !GITHUB_REPO.test(github)) errors.githubUrl = "Enter a link to a repository, for example https://github.com/team-byte/stockmate";

  const live = fields.liveUrl.trim();
  if (final && !live) errors.liveUrl = "A live link (or APK download link) is required.";
  else if (live && !isUrl(live)) errors.liveUrl = "Enter a full link starting with https://";

  const video = fields.videoUrl.trim();
  if (final && !video) errors.videoUrl = "Add a YouTube or Loom link to your demo video.";
  else if (video && !VIDEO_HOST.test(video)) errors.videoUrl = "Use a YouTube (unlisted is fine) or Loom link.";

  const description = fields.description.trim();
  if (final && !description) errors.description = "Describe what your project does.";
  else if (fields.description.length > DESCRIPTION_LIMIT) errors.description = `The description can be up to ${numberFormat.format(DESCRIPTION_LIMIT)} characters.`;

  if (fields.screenshots.length > MAX_SCREENSHOTS) errors.screenshots = `Upload up to ${MAX_SCREENSHOTS} screenshots.`;
  if (final && !fields.confirmed) {
    errors.confirmed = teamSize > 1
      ? "Confirm that every team member contributed and the work was created during the hackathon."
      : "Confirm that the work is your own and was created during the hackathon.";
  }
  return errors;
}

export const FIELD_ORDER = ["projectName", "githubUrl", "liveUrl", "videoUrl", "description", "screenshots", "confirmed"];
