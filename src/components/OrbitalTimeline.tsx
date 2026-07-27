"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { GlassSurface } from "@/components/GlassSurface";
import { TiltCard } from "@/components/TiltCard";
import { Icon } from "@/components/ui";

export type OrbitalStage = {
  id: number;
  /** Display index, e.g. "01". */
  n: string;
  /** Material Symbols name — the site uses no other icon set. */
  icon: string;
  label: string;
  body: string;
  /** Shown only on the stage where it matters. */
  note?: string;
  /**
   * Optional mockup or photo for the detail panel. Drop a file in /public
   * and point at it, e.g. { src: "/img/stage-02.png", alt: "対話画面" };
   * the placeholder well is shown until then.
   */
  image?: { src: string; alt: string };
  /** Neighbouring stages, offered as jump targets in the detail panel. */
  relatedIds: number[];
};

/** Degrees per millisecond — one revolution just under a minute. */
const DEG_PER_MS = 0.006;
/** Where a focused node parks: 270° puts it at the top of the ring. */
const FOCUS_ANGLE = 270;

/** Signed shortest path between two angles, in (-180, 180]. */
function angleDelta(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

export function OrbitalTimeline({ stages }: { stages: OrbitalStage[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  const reduce = useReducedMotion() ?? false;
  const inView = useInView(sectionRef, { amount: 0.15 });

  const [rotation, setRotation] = useState(0);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [radius, setRadius] = useState(200);

  // Read by the animation loop without re-subscribing it every render.
  const autoRotateRef = useRef(true);
  const targetRef = useRef<number | null>(null);

  /* ---------------------------------------------------------------- */
  /* Responsive radius                                                */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const el = orbitRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      // Leave room for the 40px node plus its label on both sides.
      setRadius(Math.max(104, Math.min(200, (width - 150) / 2)));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ---------------------------------------------------------------- */
  /* Rotation                                                         */
  /* ---------------------------------------------------------------- */

  /*
   * One rAF loop drives both the idle drift and the ease-to-focus tween,
   * time-based so speed is identical at 60Hz and 120Hz. It only runs while
   * the section is on screen — an off-screen orbit should cost nothing.
   */
  useEffect(() => {
    if (!inView || reduce) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      // Clamp so a backgrounded tab doesn't resume with a huge jump.
      const dt = Math.min(64, now - last);
      last = now;

      setRotation((prev) => {
        const target = targetRef.current;

        if (target !== null) {
          const delta = angleDelta(prev, target);
          if (Math.abs(delta) < 0.2) {
            targetRef.current = null;
            return target;
          }
          return prev + delta * Math.min(1, dt / 170);
        }

        if (!autoRotateRef.current) return prev;
        return (prev + DEG_PER_MS * dt) % 360;
      });

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduce]);

  /* ---------------------------------------------------------------- */
  /* Interaction                                                      */
  /* ---------------------------------------------------------------- */

  const focusStage = useCallback(
    (id: number) => {
      const index = stages.findIndex((s) => s.id === id);
      if (index < 0) return;

      const target = FOCUS_ANGLE - (index / stages.length) * 360;
      autoRotateRef.current = false;
      setActiveId(id);

      if (reduce) {
        targetRef.current = null;
        setRotation(((target % 360) + 360) % 360);
      } else {
        targetRef.current = target;
      }
    },
    [stages, reduce],
  );

  const clearFocus = useCallback(() => {
    setActiveId(null);
    targetRef.current = null;
    autoRotateRef.current = true;
  }, []);

  const toggleStage = useCallback(
    (id: number) => {
      if (activeId === id) clearFocus();
      else focusStage(id);
    },
    [activeId, clearFocus, focusStage],
  );

  // Escape closes the detail panel, matching the click-outside affordance.
  useEffect(() => {
    if (activeId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearFocus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, clearFocus]);

  const active = stages.find((s) => s.id === activeId) ?? null;
  const relatedToActive = active ? active.relatedIds : [];

  return (
    <div ref={sectionRef}>
      {/*
        The orbit only reveals a stage's copy once it is clicked, which would
        otherwise leave screen-reader and no-JS visitors with no explanation
        of the product at all. This list carries the full sequence in the
        markup at all times; the noscript rule in the root layout unhides it
        when scripting is off.
      */}
      <ol className="orbital-fallback sr-only">
        {stages.map((stage) => (
          <li key={stage.id}>
            <h3>{`${stage.n} ${stage.label}`}</h3>
            <p>{stage.body}</p>
            {stage.note && <p>{stage.note}</p>}
          </li>
        ))}
      </ol>

      {/* Orbit ------------------------------------------------------ */}
      <div
        ref={orbitRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) clearFocus();
        }}
        className="relative mx-auto flex w-full max-w-[34rem] items-center justify-center"
        style={{ height: radius * 2 + 120 }}
      >
        {/* Ring */}
        <div
          aria-hidden
          className="absolute rounded-full border border-line"
          style={{ width: radius * 2, height: radius * 2 }}
        />

        {/* Core */}
        <div
          aria-hidden
          className="absolute flex size-16 items-center justify-center rounded-full bg-accent/15"
        >
          {!reduce && (
            <>
              <span className="absolute size-20 animate-ping rounded-full border border-accent/25 [animation-duration:3s]" />
              <span
                className="absolute size-24 animate-ping rounded-full border border-accent/15 [animation-duration:3s]"
                style={{ animationDelay: "0.9s" }}
              />
            </>
          )}
          <span className="flex size-8 items-center justify-center rounded-full bg-accent text-[0.7rem] font-medium tabular-nums text-canvas">
            {active ? active.n : ""}
          </span>
        </div>

        {/* Nodes */}
        {stages.map((stage, index) => {
          const angle = ((index / stages.length) * 360 + rotation) % 360;
          const radian = (angle * Math.PI) / 180;

          /*
           * Rounded before they reach the DOM. The browser normalises CSS
           * lengths and opacities to a few decimals, so raw trig output makes
           * the server string and the client value disagree and React reports
           * a hydration mismatch it refuses to patch up.
           */
          const x = Math.round(radius * Math.cos(radian) * 100) / 100;
          const y = Math.round(radius * Math.sin(radian) * 100) / 100;

          // Depth cue: nodes on the far side sit behind and dim slightly.
          const depth = (1 + Math.sin(radian)) / 2;
          const opacity = Math.round((0.55 + 0.45 * depth) * 1000) / 1000;
          const isActive = stage.id === activeId;
          const isRelated = relatedToActive.includes(stage.id);

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => toggleStage(stage.id)}
              aria-pressed={isActive}
              aria-label={`${stage.label} の詳細を表示`}
              className="absolute flex flex-col items-center rounded-lg focus-visible:outline-offset-8"
              style={{
                transform: `translate(${x}px, ${y}px)`,
                zIndex: isActive ? 40 : Math.round(10 + 20 * depth),
                opacity: isActive ? 1 : opacity,
              }}
            >
              <span
                className={`flex size-10 items-center justify-center rounded-full border transition-[background-color,border-color,color,scale] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive
                    ? "scale-125 border-accent bg-accent text-canvas"
                    : isRelated
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-line bg-surface text-muted"
                }`}
              >
                <Icon name={stage.icon} size={18} />
              </span>
              <span
                className={`mt-3 whitespace-nowrap text-[0.72rem] transition-colors duration-500 ${
                  isActive ? "text-ink" : "text-muted"
                }`}
              >
                {stage.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail panel ----------------------------------------------
          Held in a fixed slot under the orbit rather than floating beside
          the clicked node: the panel can't then overflow the ring or the
          viewport at any width, and the copy stays in one place to read. */}
      <div className="mx-auto mt-4 min-h-[13rem] w-full max-w-xl">
        {active ? (
          <TiltCard className="border border-line bg-surface p-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_18px_40px_-24px_rgba(0,0,0,0.9)] md:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[0.75rem] font-medium tabular-nums tracking-[0.22em] text-accent">
                {active.n}
              </p>
              <button
                type="button"
                onClick={clearFocus}
                className="flex items-center gap-1 text-[0.75rem] text-muted transition-colors duration-300 hover:text-ink"
              >
                <Icon name="close" size={14} />
                閉じる
              </button>
            </div>

            <h3 className="mt-3 text-xl font-medium tracking-[-0.01em] text-ink">
              {active.label}
            </h3>
            <p className="measure-jp mt-4 text-[0.95rem] text-muted">
              {active.body}
            </p>

            {active.image ? (
              <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl border border-line bg-canvas-alt">
                <Image
                  src={active.image.src}
                  alt={active.image.alt}
                  fill
                  sizes="(min-width: 768px) 36rem, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="mt-6 flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-canvas-alt">
                <Icon name="add_photo_alternate" size={26} className="text-muted" />
                <p className="text-[0.75rem] text-muted">
                  {active.label} — モックアップ / 写真
                </p>
              </div>
            )}

            {active.note && (
              <p className="mt-5 flex items-center gap-2 text-[0.85rem] text-muted">
                <Icon name="lock" size={16} className="text-accent" />
                {active.note}
              </p>
            )}

            {active.relatedIds.length > 0 && (
              <div className="mt-6 border-t border-line pt-5">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                  関連する段階
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {active.relatedIds.map((relatedId) => {
                    const related = stages.find((s) => s.id === relatedId);
                    if (!related) return null;
                    return (
                      <button
                        key={relatedId}
                        type="button"
                        onClick={() => focusStage(relatedId)}
                        className="glass-btn-secondary rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02]"
                      >
                        <GlassSurface
                          className="flex items-center gap-1.5 text-[0.8rem] text-ink"
                          style={{
                            background: "var(--glass-tint)",
                            borderRadius: 9999,
                            padding: "0.375rem 0.875rem",
                            border: "1px solid rgba(242,241,238,0.16)",
                            transition: "background 300ms cubic-bezier(0.16,1,0.3,1)",
                          }}
                        >
                          {related.label}
                          <Icon name="arrow_forward" size={14} />
                        </GlassSurface>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </TiltCard>
        ) : (
          <p className="pt-6 text-center text-[0.85rem] text-muted">
            各段階を選択すると、詳細が表示されます。
          </p>
        )}
      </div>
    </div>
  );
}
