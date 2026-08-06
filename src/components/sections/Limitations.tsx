"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useRef, useState, useSyncExternalStore } from "react";
import { FIGURES, type FigureName } from "@/components/LimitationFigures";
import { Reveal } from "@/components/Reveal";
import { Section, SectionTitle } from "@/components/ui";

type Limitation = {
  n: string;
  figure: FigureName;
  title: string;
  body: string;
  /** Full class names — Tailwind scans source text, so no interpolation. */
  text: string;
  bar: string;
};

const ITEMS: Limitation[] = [
  {
    n: "01",
    figure: "survey",
    title: "アンケートでは本音が表れない。",
    body: "「はい／いいえ」形式では、生徒は大人が望む無難な回答を選びます。",
    text: "text-mark-1",
    bar: "bg-mark-1",
  },
  {
    n: "02",
    figure: "withdrawal",
    title: "深刻なケースほど見えなくなる。",
    body: "追い詰められた生徒ほど周囲を拒み、孤立します。SOSを待つ仕組みでは間に合いません。",
    text: "text-mark-2",
    bar: "bg-mark-2",
  },
  {
    n: "03",
    figure: "capacity",
    title: "教員のリソースには限界がある。",
    body: "40名を一人ひとり見守り、心の機微まで捉えることは現実的ではありません。",
    text: "text-mark-3",
    bar: "bg-mark-3",
  },
];

/**
 * Is there actually room to pin?
 *
 * Both halves matter. Below 768px the row stacks copy above figure and grows
 * past a viewport height; below 640px tall — a phone held sideways — even the
 * two-column form doesn't fit. A `position: sticky` box taller than the
 * viewport has no way to reveal its own bottom, so the overflow would simply
 * be unreachable. Where it doesn't fit, we don't pin.
 *
 * Server snapshot is `false`, so SSR emits the plain stacked list and the
 * client upgrades it. The section is far below the fold, so that correction
 * is never seen.
 */
const PIN_QUERY = "(min-width: 768px) and (min-height: 640px)";

function useCanPin() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(PIN_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(PIN_QUERY).matches,
    () => false,
  );
}

function Row({ item }: { item: Limitation }) {
  const Figure = FIGURES[item.figure];

  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <div>
        <div className="flex items-baseline gap-4">
          <span
            className={`text-[clamp(2.5rem,5vw,3.75rem)] font-semibold leading-none tabular-nums ${item.text}`}
          >
            {item.n}
          </span>
          <span aria-hidden className={`h-px flex-1 ${item.bar} opacity-40`} />
        </div>

        <h3 className="mt-7 text-[clamp(1.35rem,2.6vw,1.9rem)] font-medium leading-[1.4] tracking-[-0.02em] text-ink">
          {item.title}
        </h3>
        <p className="measure-jp mt-5 max-w-md text-[0.98rem] text-muted">
          {item.body}
        </p>
      </div>

      <div>
        <Figure className={`w-full ${item.text} opacity-90`} />
      </div>
    </div>
  );
}

/**
 * Pinned cross-fade: the three limitations occupy the same patch of screen
 * and swap on scroll, so the viewport itself never moves through them.
 *
 * The track is one screen of scroll per item; the inner box sticks to the
 * top for the whole of it, and progress through the track picks the visible
 * item. Nothing is scroll-jacked — no wheel events are intercepted, the page
 * just has a tall element in it — so trackpad, keyboard and scrollbar all
 * behave normally and Lenis is untouched.
 *
 * Unlike the old alternating layout, every item lands in the same place.
 * That is the point of a cross-fade: sides that swapped underneath a fade
 * would read as the layout glitching rather than as one idea replacing
 * another.
 */
function PinnedDeck() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(
      ITEMS.length - 1,
      Math.max(0, Math.floor(p * ITEMS.length)),
    );
    setIndex((current) => (current === next ? current : next));
  });

  return (
    <div
      ref={trackRef}
      className="relative mt-12"
      style={{ height: `${ITEMS.length * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center">
        {/*
          All three stay in the accessibility tree rather than being
          aria-hidden while faded. They are all real content in a real
          order, and a screen reader that reads the section straight
          through gets exactly the right thing; the fade is a purely
          visual affordance for a sighted reader. There is nothing
          focusable inside, so an invisible item can never be tabbed to.
        */}
        <div className="grid">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.n}
              style={{ gridArea: "1 / 1" }}
              animate={{ opacity: i === index ? 1 : 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={i === index ? undefined : "pointer-events-none"}
            >
              <Row item={item} />
            </motion.div>
          ))}
        </div>

        {/* How many there are, and how far in you are. */}
        <div aria-hidden className="mt-14 flex items-center gap-2">
          {ITEMS.map((item, i) => (
            <span
              key={item.n}
              className={`h-0.5 w-10 rounded-full transition-colors duration-500 ${
                i === index ? item.bar : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Limitations() {
  const reduce = useReducedMotion();
  const pinned = useCanPin() && !reduce;

  return (
    <Section>
      <Reveal>
        <SectionTitle accent="bg-mark-2">構造的な限界</SectionTitle>
      </Reveal>

      <Reveal className="max-w-2xl">
        <p className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink">
          なぜ、これまでの方法では気づけないのか。
        </p>
      </Reveal>

      {!pinned ? (
        /*
          Pinning is motion, and it needs room. With either missing the three
          simply stack and read top to bottom — no tall track, no fading,
          nothing to sit through.
        */
        <div className="mt-20 flex flex-col gap-24 md:gap-32">
          {ITEMS.map((item) => (
            <Reveal key={item.n}>
              <Row item={item} />
            </Reveal>
          ))}
        </div>
      ) : (
        /*
          Its own component, so useScroll resolves the track ref on the same
          commit that attaches it. Hoisted into the parent it would run once
          against a null target — the media query starts false for SSR, so
          the deck arrives a tick later — and then never re-measure, leaving
          the fade permanently stuck on the first item.
        */
        <PinnedDeck />
      )}
    </Section>
  );
}
