import { FileArchive, FileImage, FileText, FolderGit2, Link2, PenTool, PlayCircle } from "lucide-react";

import { avatarTone, initials, useNow } from "./teamHelpers";

// Small pieces shared by the collaboration team screens.

export function Avatar({ name, username, viewer = false, size = "" }) {
  return (
    <span className={`community-avatar ${viewer ? "avatar-you" : avatarTone(username || name)}${size ? ` community-avatar-${size}` : ""}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function ProgressBar({ value, label, className = "" }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={`cmt-progress ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      <span style={{ width: `${clamped}%` }} />
    </div>
  );
}

// Days / hours / mins to the team deadline. One summary label for screen readers.
export function DeadlineCountdown({ target }) {
  const now = useNow(30000);
  const remaining = Math.max(0, new Date(target).getTime() - now);
  const parts = [
    ["days", Math.floor(remaining / 86400000)],
    ["hours", Math.floor(remaining / 3600000) % 24],
    ["mins", Math.floor(remaining / 60000) % 60],
  ];
  const label = remaining > 0 ? `${parts[0][1]} days, ${parts[1][1]} hours and ${parts[2][1]} minutes left` : "The deadline has passed";
  return (
    <div className="cmt-countdown" role="timer" aria-label={label}>
      {parts.map(([unit, value]) => (
        <span key={unit} className="community-countdown-cell" aria-hidden="true">
          <strong>{String(value).padStart(2, "0")}</strong>
          <small>{unit}</small>
        </span>
      ))}
    </div>
  );
}

const FILE_ICONS = {
  figma: { icon: PenTool, tone: "purple" },
  github: { icon: FolderGit2, tone: "blue" },
  drive: { icon: Link2, tone: "green" },
  link: { icon: Link2, tone: "blue" },
  video: { icon: PlayCircle, tone: "red" },
  pdf: { icon: FileText, tone: "red" },
  image: { icon: FileImage, tone: "purple" },
  zip: { icon: FileArchive, tone: "amber" },
  doc: { icon: FileText, tone: "green" },
};

export function FileIcon({ kind }) {
  const { icon: Icon, tone } = FILE_ICONS[kind] ?? FILE_ICONS.doc;
  return <span className={`cmt-file-icon tone-${tone}`} aria-hidden="true"><Icon size={18} /></span>;
}

const STATUS_TAGS = {
  todo: { label: "To do", className: "tag-neutral" },
  in_progress: { label: "In progress", className: "tag-amber" },
  done: { label: "Done", className: "tag-green" },
};

export function TaskStatusTag({ status }) {
  const tag = STATUS_TAGS[status] ?? STATUS_TAGS.todo;
  return <span className={`community-tag ${tag.className}`}>{tag.label}</span>;
}

const LABEL_TONES = { "UI Design": "tag-blue", Frontend: "tag-amber", Backend: "tag-neutral" };
export function TaskLabel({ label }) {
  return <span className={`community-tag ${LABEL_TONES[label] ?? "tag-purple"}`}>{label}</span>;
}

// Open (link) / Download (file). Sample files without a URL show a plain label.
export function FileAction({ file }) {
  const label = file.type === "link" ? "Open" : "Download";
  if (!file.url) {
    return <span className="cmt-muted-small" title="This sample file has nothing to download">{label}</span>;
  }
  return (
    <a href={file.url} className="text-link cmt-file-action" target="_blank" rel="noopener noreferrer" download={file.type === "file" ? file.name : undefined}>
      {label}<span className="sr-only"> {file.name} (opens in a new tab)</span>
    </a>
  );
}
