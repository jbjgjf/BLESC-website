import type { ComponentProps } from "react";

/**
 * The class that carries the effect. Compose it onto anything that is
 * already its own element — the 仕組み step buttons and the enquiry options
 * are real controls with their own chrome, and wrapping them in a card would
 * break the tablist and the label/input pairing.
 *
 * The effect itself lives in globals.css rather than in a per-instance
 * <style> tag: the component this was adapted from injected the same rules
 * once per card, so nine cards meant nine identical stylesheets.
 */
export const SPOTLIGHT = "spotlight";

/**
 * A raised card that lights up as the pointer passes it.
 *
 * Sizing is deliberately not a prop. The original took `size`/`width`/
 * `height` and defaulted to a fixed 3:4 box, which suits a standalone demo
 * grid; every card here is sized by its own content or by the grid it sits
 * in, so that would only ever have to be overridden.
 */
export function SpotlightCard({
  className = "",
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={`${SPOTLIGHT} rounded-3xl border border-line bg-surface shadow-[var(--shadow-card)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
