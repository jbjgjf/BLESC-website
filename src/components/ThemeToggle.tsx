"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Icon } from "@/components/ui";

/**
 * Theme switch.
 *
 * A real `role="switch"` rather than the upstream's icon pair, so the control
 * announces its state and works from the keyboard. The upstream version also
 * held the theme in component state and applied it from a useEffect, which
 * forgets the choice on navigation and flashes the wrong theme on load —
 * persistence and the pre-paint script live in ThemeProvider instead.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="flex items-center gap-3">
      <Icon
        name="light_mode"
        size={18}
        className={isLight ? "text-ink" : "text-muted"}
      />

      <button
        type="button"
        role="switch"
        aria-checked={isLight}
        onClick={toggle}
        aria-label="ライトモードとダークモードを切り替える"
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-line-strong bg-canvas-alt transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-ink/40"
      >
        <span
          aria-hidden
          className={`ml-0.5 block size-4 rounded-full bg-accent transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isLight ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>

      <Icon
        name="dark_mode"
        size={18}
        className={isLight ? "text-muted" : "text-ink"}
      />
    </div>
  );
}
