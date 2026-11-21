import { Moon, Sun } from "lucide-react";

import { toggleTheme, useTheme } from "./theme";

export default function ThemeToggle({ className = "" }) {
  const theme = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`.trim()}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
