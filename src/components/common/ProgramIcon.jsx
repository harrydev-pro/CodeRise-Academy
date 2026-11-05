import { BookOpen, Code2, Palette, Server, Headset } from "lucide-react";

// Icon for a training program, chosen by its id (or title for older records).
export default function ProgramIcon({ program, size = 28 }) {
  const props = { size, "aria-hidden": "true" };
  const id = program?.id;
  const title = program?.title;
  if (id === "product-design" || title === "Product Design") return <Palette {...props} />;
  if (id === "frontend-development" || title === "Frontend Development") return <Code2 {...props} />;
  if (id === "backend-development" || title === "Backend Development") return <Server {...props} />;
  if (id === "virtual-assistant" || title === "Virtual Assistant") return <Headset {...props} />;
  return <BookOpen {...props} />;
}
