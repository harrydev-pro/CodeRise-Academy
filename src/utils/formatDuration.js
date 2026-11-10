// 75 -> "1:15", 3725 -> "1:02:05". Returns "" for missing values.
export function formatDuration(totalSeconds) {
  const seconds = Number(totalSeconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = Math.floor(seconds % 60);
  const pad = (value) => String(value).padStart(2, "0");
  return hours ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

// 5400 -> "1 h 30 min", 600 -> "10 min".
export function formatLongDuration(totalSeconds) {
  const seconds = Number(totalSeconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return [hours ? `${hours} h` : "", minutes ? `${minutes} min` : ""].filter(Boolean).join(" ") || "1 min";
}
