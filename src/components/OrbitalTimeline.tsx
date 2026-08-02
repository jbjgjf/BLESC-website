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

/*
 * Degrees per millisecond. Slowed to roughly a three-minute revolution: at
 * the old 60s the ring visibly moved while you were reading it, which is
 * most of why the running order was hard to hold on to.
 */
const DEG_PER_MS = 0.002;
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

  /*
   * Stage 1 is selected from the start and parked at the top of the ring, so
   * the sequence reads without anyone having to click first. There is no
   * "nothing selected" state any more — with the panel beside the orbit, an
   * empty one would collapse the layout.
   */
  const [rotation, setRotation] = useState(FOCUS_ANGLE);
  const [activeId, setActiveId] = useState<number>(() => stages[0]?.id ?? 1);
  const [radius, setRadius] = useState(175);

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
      // Leave room for the node, its number badge and its label on both sides.
      setRadius(Math.max(104, Math.min(180, (width - 190) / 2)));
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

  /** Resumes the drift but keeps the selection — the panel never empties. */
  const resumeDrift = useCallback(() => {
    targetRef.current = null;
    autoRotateRef.current = true;
  }, []);

  // Escape releases the ring back to its drift, matching click-outside.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") resumeDrift();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resumeDrift]);

  const activeIndex = Math.max(
    0,
    stages.findIndex((s) => s.id === activeId),
  );
  const active = stages[activeIndex];
  const relatedToActive = active.relatedIds;

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

      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
        {/* Orbit ------------------------------------------------------ */}
        <div
          ref={orbitRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) resumeDrift();
          }}
          className="relative mx-auto flex w-full max-w-[34rem] items-center justify-center"
          style={{ height: radius * 2 + 130 }}
        >
          {/* Ring */}
          <div
            aria-hidden
            className="absolute rounded-full border-2 border-line-strong"
            style={{ width: radius * 2, height: radius * 2 }}
          />

          {/*
          Direction markers. The ring alone says these five things are
          related; it does not say which way round they go. A chevron sits at
          each midpoint between consecutive nodes, rotated to the tangent, so
          the flow reads clockwise at a glance.
        */}
          {stages.map((stage, index) => {
            const midAngle =
              (((index + 0.5) / stages.length) * 360 + rotation) % 360;
            const radian = (midAngle * Math.PI) / 180;
            const x = Math.round(radius * Math.cos(radian) * 100) / 100;
            const y = Math.round(radius * Math.sin(radian) * 100) / 100;

            return (
              <span
                key={`dir-${stage.id}`}
                aria-hidden
                className="absolute text-mark-1/70"
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(${
                    Math.round((midAngle + 90) * 100) / 100
                  }deg)`,
                }}
              >
                <Icon name="chevron_right" size={20} />
              </span>
            );
          })}

          {/* Core */}
          <div
            aria-hidden
            className="absolute flex size-20 items-center justify-center rounded-full border border-line bg-canvas-alt"
          >
            {!reduce && (
              <span className="absolute size-24 animate-ping rounded-full border border-accent/20 [animation-duration:3.5s]" />
            )}
            <div className="text-center">
              <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted">
                STEP
              </p>
              <p className="text-lg font-semibold tabular-nums leading-tight text-mark-1">
                {active.n}
              </p>
            </div>
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
                onClick={() => focusStage(stage.id)}
                aria-pressed={isActive}
                aria-label={`ステップ${index + 1}、${stage.label} の詳細を表示`}
                className="absolute flex flex-col items-center rounded-lg focus-visible:outline-offset-8"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  zIndex: isActive ? 40 : Math.round(10 + 20 * depth),
                  // Far-side nodes dim, but never so far that the step number
                  // stops being readable — that number is the running order.
                  opacity: isActive ? 1 : opacity,
                }}
              >
                <span
                  className={`relative flex size-14 items-center justify-center rounded-full border-2 shadow-[var(--shadow-card)] transition-[background-color,border-color,color,scale] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive
                      ? "scale-110 border-mark-1 bg-accent text-on-accent"
                      : isRelated
                        ? "border-mark-1/60 bg-surface text-ink"
                        : "border-line-strong bg-surface text-ink"
                  }`}
                >
                  <Icon name={stage.icon} size={24} />

                  {/*
                  The whole point of the redesign: the running order is on
                  the node itself, so it survives the rotation and needs no
                  click to discover.
                */}
                  <span
                    className={`absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full border-2 border-canvas text-[0.65rem] font-semibold tabular-nums transition-colors duration-500 ${
                      isActive
                        ? "bg-ink text-canvas"
                        : "bg-mark-1 text-on-accent"
                    }`}
                  >
                    {index + 1}
                  </span>
                </span>

                <span
                  className={`mt-3 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.78rem] transition-colors duration-500 ${
                    isActive
                      ? "bg-accent/15 font-medium text-ink"
                      : "text-muted"
                  }`}
                >
                  {stage.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail panel ----------------------------------------------
          Beside the orbit on wide screens, beneath it when the grid stacks.
          It is never empty, so the column cannot collapse mid-interaction. */}
        <div className="w-full">
          <TiltCard className="border border-line bg-surface p-7 shadow-[var(--shadow-card)] md:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-full bg-mark-1 text-[0.7rem] font-semibold tabular-nums text-on-accent">
                {activeIndex + 1}
              </span>
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted">
                ステップ {active.n} / {String(stages.length).padStart(2, "0")}
              </p>
            </div>

            <h3 className="mt-4 text-xl font-medium tracking-[-0.01em] text-ink">
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
                <Icon
                  name="add_photo_alternate"
                  size={26}
                  className="text-muted"
                />
                <p className="text-[0.75rem] text-muted">
                  {active.label} — モックアップ / 写真
                </p>
              </div>
            )}

            {active.note && (
              <p className="mt-5 flex items-center gap-2 text-[0.85rem] text-muted">
                <Icon name="lock" size={16} className="text-mark-1" />
                {active.note}
              </p>
            )}

            {active.relatedIds.length > 0 && (
              <div className="mt-6 border-t border-line pt-5">
                <p className="text-[0.78rem] font-medium uppercase tracking-[0.15em] text-muted">
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
                            transition:
                              "background 300ms cubic-bezier(0.16,1,0.3,1)",
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
        </div>
      </div>
    </div>
  );
}
