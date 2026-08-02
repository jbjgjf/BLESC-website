"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/ui";

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  tag?: string;
  /** Full class name — Tailwind scans source text, so no interpolation. */
  text?: string;
}

export interface CircularCarouselProps {
  items: CarouselItem[];
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const VISIBLE_COUNT = 5;
const CARD_W = 200;
const RADIUS_Y = 92;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Where a card sits on the arc relative to the active one.
 *
 * `radiusX` is passed in rather than fixed at 220 as upstream: the deck has
 * to live inside a measured column, and a constant radius pushed the outer
 * cards straight out of it at anything narrower than a full-width desktop.
 */
function getItemPosition(
  index: number,
  activeIndex: number,
  total: number,
  radiusX: number,
) {
  const offset = index - activeIndex;
  const half = Math.floor(VISIBLE_COUNT / 2);
  let adjusted = offset;

  if (offset > half) adjusted = offset - total;
  if (offset < -half) adjusted = offset + total;

  if (Math.abs(adjusted) > half * 2) return null;

  const angle = (adjusted / VISIBLE_COUNT) * Math.PI;
  const distance = Math.abs(adjusted);
  const maxDistance = half + 1;

  return {
    x: Math.round(Math.sin(angle) * radiusX * 100) / 100,
    y: Math.round(-Math.cos(angle) * RADIUS_Y * 100) / 100,
    scale: Math.round(Math.max(0, 1 - (distance / maxDistance) * 0.3) * 1000) / 1000,
    // Floor raised from 0.3: at that level the back cards were unreadable
    // rather than merely recessed.
    opacity: Math.round(Math.max(0.45, 1 - (distance / maxDistance) * 0.55) * 1000) / 1000,
    zIndex: VISIBLE_COUNT - distance,
  };
}

export function CircularCarousel({
  items,
  activeIndex: controlledIndex,
  onActiveChange,
  autoPlay = true,
  autoPlayInterval = 6000,
  className = "",
}: CircularCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [radiusX, setRadiusX] = useState(200);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion() ?? false;

  const total = items.length;
  const activeIndex = controlledIndex ?? internalIndex;

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      const next = ((index % total) + total) % total;
      if (controlledIndex === undefined) setInternalIndex(next);
      onActiveChange?.(next);
    },
    [total, controlledIndex, onActiveChange],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  /* Radius follows the column so the outer cards stay inside it. */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      setRadiusX(Math.max(64, Math.min(220, (width - CARD_W) / 2)));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /*
   * Auto-advance. Paused on hover and on focus, and switched off entirely
   * under prefers-reduced-motion — a deck that reshuffles itself every few
   * seconds is exactly the motion that setting is asking us to drop.
   */
  useEffect(() => {
    if (!autoPlay || paused || reduce || total <= 1) return;
    const id = setInterval(next, autoPlayInterval);
    return () => clearInterval(id);
  }, [autoPlay, paused, reduce, total, autoPlayInterval, next]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  };

  // Upstream read items[activeIndex].id unguarded, which throws on an empty list.
  if (total === 0) return null;

  return (
    <div
      role="group"
      aria-roledescription="カルーセル"
      aria-label="仕組みのステップ"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`relative flex flex-col items-center gap-10 ${className}`}
    >
      <div ref={trackRef} className="relative h-[300px] w-full">
        {/* Index readout, behind the deck. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          <span className="text-[3.5rem] font-semibold leading-none tabular-nums text-ink/10">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
        </div>

        {items.map((item, i) => {
          const pos = getItemPosition(i, activeIndex, total, radiusX);
          if (!pos) return null;

          const isActive = i === activeIndex;

          return (
            <motion.button
              key={item.id}
              type="button"
              initial={false}
              animate={{
                x: pos.x,
                y: pos.y,
                scale: reduce ? 1 : pos.scale,
                opacity: pos.opacity,
              }}
              transition={
                reduce ? { duration: 0.2 } : { duration: 0.65, ease: EASE }
              }
              style={{ zIndex: pos.zIndex, transformOrigin: "center center" }}
              onClick={() => goTo(i)}
              aria-label={`ステップ ${i + 1}、${item.title}`}
              aria-current={isActive}
              className={`absolute left-1/2 top-1/2 -ml-[100px] -mt-[70px] flex h-[140px] w-[200px] cursor-pointer flex-col items-start justify-between rounded-2xl border p-4 text-left shadow-[var(--shadow-card)] transition-[border-color,background-color] duration-300 ${
                isActive
                  ? "border-mark-1 bg-surface"
                  : "border-line bg-canvas-alt hover:border-ink/30"
              }`}
            >
              {item.tag && (
                <span
                  className={`rounded-full bg-canvas px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] tabular-nums ${
                    item.text ?? "text-mark-1"
                  }`}
                >
                  {item.tag}
                </span>
              )}

              <div className="w-full">
                <h3
                  className={`font-medium leading-tight text-ink ${
                    isActive ? "text-[1.05rem]" : "text-[0.95rem]"
                  }`}
                >
                  {item.title}
                </h3>
                {/*
                  Clamped for the card only — the string stays whole in the
                  DOM, so nothing is hidden from assistive tech, and the panel
                  below shows it in full.
                */}
                <p className="mt-1.5 line-clamp-2 text-[0.78rem] leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={prev}
          aria-label="前のステップ"
          className="flex size-11 items-center justify-center rounded-full border-2 border-line-strong text-muted transition-[color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 hover:border-ink/40 hover:text-ink"
        >
          <Icon name="chevron_left" size={22} />
        </button>

        <div className="flex items-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`ステップ ${i + 1} へ`}
              aria-current={i === activeIndex}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-7 bg-mark-1"
                  : "w-2 bg-line-strong hover:bg-ink/50"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="次のステップ"
          className="flex size-11 items-center justify-center rounded-full border-2 border-line-strong text-muted transition-[color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 hover:border-ink/40 hover:text-ink"
        >
          <Icon name="chevron_right" size={22} />
        </button>
      </div>
    </div>
  );
}
