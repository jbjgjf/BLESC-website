"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useRef, useSyncExternalStore, type ReactNode } from "react";

/** The one spring preset this component actually uses. */
const SPRING_MOUSE = { stiffness: 200, damping: 15, mass: 0.3 } as const;

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeHover(onChange: () => void) {
  const mq = window.matchMedia(HOVER_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * True only on devices with a real hover-capable pointer — tilt driven by
 * mousemove fires once on a touchscreen tap and then sticks.
 *
 * useSyncExternalStore rather than useState + useEffect: it is the API built
 * for subscribing to something like matchMedia, it gives a defined server
 * snapshot so hydration stays consistent, and it avoids the synchronous
 * setState-inside-an-effect the original used.
 */
export function useHoverCapable() {
  return useSyncExternalStore(
    subscribeHover,
    () => window.matchMedia(HOVER_QUERY).matches,
    () => false,
  );
}

export interface TiltCardProps {
  children: ReactNode;
  /** Peak rotation in degrees on each axis. */
  max?: number;
  glare?: boolean;
  className?: string;
}

/**
 * Cursor-tracking 3D tilt with a radial glare.
 *
 * Glare runs at the component's shipped 15%. It was held at 12% while
 * --color-text-muted was #868f9a, where 15% dropped card body copy to
 * 4.35:1; at the current brighter muted the same glare leaves it at 5.90:1,
 * so the cap is no longer buying anything.
 *
 * Still gated on hover: idle cards should not carry a permanent centred
 * wash, and the effect is meant to follow the cursor.
 */
export function TiltCard({
  children,
  max = 12,
  glare = true,
  className = "",
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const enabled = !reduce && canHover;

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  const srx = useSpring(rx, SPRING_MOUSE);
  const sry = useSpring(ry, SPRING_MOUSE);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabled) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    ry.set((px - 0.5) * max);
    rx.set((0.5 - py) * max);
    gx.set(px * 100);
    gy.set(py * 100);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const transform = useMotionTemplate`perspective(1000px) rotateX(${srx}deg) rotateY(${sry}deg)`;
  // --color-text, not the component's var(--foreground), which this project
  // has never defined — the gradient would have resolved to nothing.
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, var(--color-glare), transparent 50%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transform, transformStyle: "preserve-3d" }}
      className={`group relative overflow-hidden rounded-2xl will-change-transform ${className}`}
    >
      {children}

      {glare && enabled ? (
        <motion.div
          aria-hidden
          style={{ background: glareBg }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-[var(--glare-opacity)]"
        />
      ) : null}
    </motion.div>
  );
}
