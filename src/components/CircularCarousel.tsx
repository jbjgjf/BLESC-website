"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/ui";

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  tag?: string;
  /** Trust-critical aside, shown on the card it belongs to. */
  note?: string;
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
const EASE = [0.22, 1, 0.36, 1] as const;

type Layout = {
  cardW: number;
  cardH: number;
  radiusX: number;
  radiusY: number;
};

const WIDE: Layout = { cardW: 264, cardH: 208, radiusX: 380, radiusY: 124 };
const COMPACT: Layout = { cardW: 200, cardH: 168, radiusX: 200, radiusY: 92 };

/**
 * Where a card sits on the arc relative to the active one.
 *
 * The radius is passed in rather than the constant 220 upstream used: the
 * deck is measured against its container, so it can open right out at full
 * width and still keep its outer cards on screen at 375px.
 */
const HALF = Math.floor(VISIBLE_COUNT / 2);
const MAX_DISTANCE = HALF + 1;

const scaleAt = (distance: number) =>
  Math.max(0, 1 - (distance / MAX_DISTANCE) * 0.28);

/**
 * Vertical extent the deck actually occupies, measured from the arc centre.
 *
 * The arc puts the cards' mass above centre — the front card sits a full
 * radiusY up, the back pair only a third of that — so anchoring the deck at
 * top:50% overflowed the track upward while leaving a large void beneath it.
 * The track is sized from this instead, and the deck is shifted by its own
 * midpoint so it sits centred in the space it needs.
 */
function deckExtent(layout: Layout) {
  let top = Infinity;
  let bottom = -Infinity;
  for (let d = -HALF; d <= HALF; d++) {
    const y = -Math.cos((d / VISIBLE_COUNT) * Math.PI) * layout.radiusY;
    const halfHeight = (layout.cardH * scaleAt(Math.abs(d))) / 2;
    top = Math.min(top, y - halfHeight);
    bottom = Math.max(bottom, y + halfHeight);
  }
  return { top, bottom, height: bottom - top, shift: -(top + bottom) / 2 };
}

function getItemPosition(
  index: number,
  activeIndex: number,
  total: number,
  layout: Layout,
  shift: number,
) {
  const offset = index - activeIndex;
  let adjusted = offset;

  if (offset > HALF) adjusted = offset - total;
  if (offset < -HALF) adjusted = offset + total;

  if (Math.abs(adjusted) > HALF * 2) return null;

  const angle = (adjusted / VISIBLE_COUNT) * Math.PI;
  const distance = Math.abs(adjusted);
  const round = (v: number) => Math.round(v * 100) / 100;

  return {
    x: round(Math.sin(angle) * layout.radiusX),
    y: round(-Math.cos(angle) * layout.radiusY + shift),
    scale: round(scaleAt(distance)),
    // Floor raised from upstream's 0.3: at that level the back cards were
    // unreadable rather than merely recessed.
    opacity: round(Math.max(0.5, 1 - (distance / MAX_DISTANCE) * 0.5)),
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
  const [layout, setLayout] = useState<Layout>(WIDE);

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

  /*
   * Card size and radius both follow the container. Driving the card box from
   * the same constants the arc maths uses keeps them in sync — upstream had
   * the width in a Tailwind class and again in a negative margin, which is
   * two places to forget.
   */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      const base = width < 640 ? COMPACT : WIDE;
      setLayout({
        ...base,
        radiusX: Math.max(
          56,
          Math.min(base.radiusX, (width - base.cardW) / 2),
        ),
      });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /*
   * Auto-advance, paused on hover and focus and switched off entirely under
   * prefers-reduced-motion — a deck that reshuffles itself on a timer is
   * exactly the motion that setting asks us to drop.
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

  /*
   * Was cardH + radiusY + 96, which over-reserved: the whole allowance landed
   * beneath the deck because the arc is top-heavy, leaving 168px of dead
   * track under the cards while they clipped past the top edge.
   */
  const extent = deckExtent(layout);
  const trackHeight = Math.ceil(extent.height) + 24;

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
      className={`relative flex flex-col items-center gap-12 ${className}`}
    >
      <div
        ref={trackRef}
        className="relative w-full"
        style={{ height: trackHeight }}
      >
        {/* Index readout, sitting behind the deck. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="text-[7rem] font-semibold leading-none tabular-nums text-ink/[0.07] md:text-[10rem]">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
        </div>

        {items.map((item, i) => {
          const pos = getItemPosition(
            i,
            activeIndex,
            total,
            layout,
            extent.shift,
          );
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
              style={{
                zIndex: pos.zIndex,
                transformOrigin: "center center",
                width: layout.cardW,
                height: layout.cardH,
                marginLeft: -layout.cardW / 2,
                marginTop: -layout.cardH / 2,
              }}
              onClick={() => goTo(i)}
              aria-label={`ステップ ${i + 1}、${item.title}`}
              aria-current={isActive}
              className={`absolute left-1/2 top-1/2 flex cursor-pointer flex-col items-start justify-between rounded-2xl border p-5 text-left shadow-[var(--shadow-card)] transition-[border-color,background-color] duration-300 ${
                isActive
                  ? "border-mark-1 bg-surface"
                  : "border-line bg-canvas-alt hover:border-ink/30"
              }`}
            >
              {item.tag && (
                <span
                  className={`rounded-full bg-canvas px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] tabular-nums ${
                    item.text ?? "text-mark-1"
                  }`}
                >
                  {item.tag}
                </span>
              )}

              <div className="w-full">
                <h3 className="text-[1.05rem] font-medium leading-tight text-ink">
                  {item.title}
                </h3>
                {/*
                  Clamped for the card only — the string stays whole in the
                  DOM, so nothing is withheld from assistive tech.
                */}
                <p className="mt-2 line-clamp-3 text-[0.82rem] leading-relaxed text-muted">
                  {item.description}
                </p>

                {item.note && (
                  <p className="mt-2.5 flex items-center gap-1.5 text-[0.72rem] text-mark-1">
                    <Icon name="lock" size={14} />
                    {item.note}
                  </p>
                )}
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
