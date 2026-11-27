import { Headset, Megaphone, Monitor, Palette, Smartphone } from "lucide-react";

// Icon for a competition category (mobile app, graphic design, …). Decorative.
export default function CategoryIcon({ category = "", ...props }) {
  if (/mobile/i.test(category)) return <Smartphone aria-hidden="true" {...props} />;
  if (/graphic/i.test(category)) return <Palette aria-hidden="true" {...props} />;
  if (/marketing/i.test(category)) return <Megaphone aria-hidden="true" {...props} />;
  if (/assist/i.test(category)) return <Headset aria-hidden="true" {...props} />;
  return <Monitor aria-hidden="true" {...props} />;
}
