import {
  Bot,
  CalendarDays,
  ChartNoAxesColumn,
  CodeXml,
  Gamepad2,
  Layers,
  Megaphone,
  Palette,
  ReceiptText,
  Server,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { FILE_KINDS, LINK_FIELDS } from "./projectsService";

// Shared helpers for the student community project screens (S03, S04, S05, S24 tab).

// Cover icon and colour for each skill category (same as the Project Library cards).
export const CATEGORY_STYLE = {
  "Frontend Development": { icon: CodeXml, tone: "blue" },
  "Backend Development": { icon: Server, tone: "orange" },
  "Fullstack Development": { icon: Layers, tone: "purple" },
  "Product Design (UI/UX)": { icon: Smartphone, tone: "purple" },
  "Graphic Design": { icon: Palette, tone: "pink" },
  "Data Analysis": { icon: ChartNoAxesColumn, tone: "teal" },
  "Mobile App Development": { icon: ReceiptText, tone: "sky" },
  "Virtual Assistance": { icon: CalendarDays, tone: "slate" },
  "Game Development": { icon: Gamepad2, tone: "purple" },
  Cybersecurity: { icon: ShieldCheck, tone: "slate" },
  "Digital Marketing": { icon: Megaphone, tone: "orange" },
  "AI & Machine Learning": { icon: Bot, tone: "sky" },
};
export const categoryStyle = (category) => CATEGORY_STYLE[category] ?? { icon: CodeXml, tone: "blue" };

export const numberFormat = new Intl.NumberFormat("en-GB");
const fullDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Lagos" });
const deadlineFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Lagos" });

const valid = (iso) => iso && !Number.isNaN(new Date(iso).getTime());
export const formatFullDate = (iso) => (valid(iso) ? fullDate.format(new Date(iso)) : "");
export const formatShortDate = (iso) => (valid(iso) ? shortDate.format(new Date(iso)) : "");
// Event deadlines are shown in West Africa Time.
export const formatDeadline = (iso) => (valid(iso) ? `${deadlineFormat.format(new Date(iso))} WAT` : "");

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function timeAgo(iso) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return formatShortDate(iso);
}

// ---------- S04 submission rules (the backend checks them again) ----------

export function acceptFor(kinds = []) {
  return kinds.flatMap((kind) => FILE_KINDS[kind]?.accept ?? []).join(",");
}

export function fileKindsText(kinds = []) {
  const labels = kinds.map((kind) => FILE_KINDS[kind]?.label).filter(Boolean).join(", ");
  return labels.replace(/, ([^,]*)$/, " or $1");
}

export function fileMatchesKinds(file, kinds = []) {
  const name = file.name.toLowerCase();
  return kinds.some((kind) => (FILE_KINDS[kind]?.accept ?? []).some((rule) => (rule.startsWith(".") ? name.endsWith(rule) : file.type === rule)));
}

function checkUrl(value, type) {
  const field = LINK_FIELDS[type];
  let url;
  try {
    url = new URL(value);
  } catch {
    return `Enter a full URL starting with https:// — for example ${field.example}`;
  }
  if (url.protocol !== "https:") return `Enter a full URL starting with https:// — for example ${field.example}`;
  if (field.host && !(url.hostname === field.host || url.hostname.endsWith(`.${field.host}`))) {
    return type === "github" ? `Enter a link to a repository, for example ${field.example}` : `Enter a ${field.label} on ${field.host}, for example ${field.example}`;
  }
  return "";
}

// Returns { fieldName: message }. Drafts only check the format of links that were filled in.
export function validateSubmission({ links, files, confirmations }, rules, { submitting, confirmationKeys }) {
  const errors = {};
  for (const { type, required } of rules.links ?? []) {
    const value = (links[type] ?? "").trim();
    if (!value) {
      if (submitting && required) errors[`link-${type}`] = `A ${LINK_FIELDS[type].label.toLowerCase()} is required for this project.`;
    } else {
      const message = checkUrl(value, type);
      if (message) errors[`link-${type}`] = message;
    }
  }
  if (!submitting) return errors;
  const anyLink = (rules.links ?? []).some(({ type }) => (links[type] ?? "").trim());
  if ((rules.links ?? []).length > 0 && !anyLink && !errors["link-github"] && !errors["link-live"] && !errors["link-figma"]) {
    errors[`link-${rules.links[0].type}`] = "Add at least one link.";
  }
  if (rules.files?.required && files.length === 0) errors.files = "Upload at least one file.";
  if (files.some((file) => file.uploading)) errors.files = "Wait for your files to finish uploading.";
  if (confirmationKeys.some((key) => !confirmations[key])) errors.confirmations = "Tick every box in “Before you submit”.";
  return errors;
}
