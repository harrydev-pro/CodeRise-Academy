import { BookOpen, Code2, Palette, Server } from "lucide-react";

// Icon for a learning track, from its saved icon name (or title for older records).
export default function TrackIcon({ track, size = 25 }) {
  const props = { size, "aria-hidden": "true" };
  const icon = track?.icon;
  const title = track?.title || "";
  if (icon === "Code2" || /frontend/i.test(title)) return <Code2 {...props} />;
  if (icon === "Server" || /backend/i.test(title)) return <Server {...props} />;
  if (icon === "Palette" || /design/i.test(title)) return <Palette {...props} />;
  return <BookOpen {...props} />;
}
