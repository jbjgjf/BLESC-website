"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";
import { Container, Icon } from "@/components/ui";

type Step = {
  n: string;
  icon: string;
  label: string;
  body: string;
  /** The trust-critical caveat, shown only on the AI解析 step. */
  note?: string;
  /**
   * Drop a file in /public and point at it to replace the placeholder well,
   * e.g. { src: "/img/step-02.png", alt: "対話画面のモックアップ" }.
   */
  image?: { src: string; alt: string };
};

/**
 * The section's paragraph, broken into one beat per step so the copy advances
 * with the diagram instead of sitting above it.
 */
const STEPS: Step[] = [
  {
    n: "01",
    icon: "person",
    label: "生徒",
    body: "月に一度、ホームルームの時間に。",
  },
  {
    n: "02",
    icon: "forum",
    label: "30往復の対話",
    body: "生徒はAIと30往復ほどの自然な対話を行います。チャットのように、構えずに話せる設計です。",
  },
  {
    n: "03",
    icon: "neurology",
    label: "AI解析",
    body: "会話に含まれる言葉のニュアンスや入力のためらいといった微細なシグナルから、AIが心理的リスクを検知します。",
    note: "（生のログは非公開）",
  },
  {
    n: "04",
    icon: "summarize",
    label: "リスクレポート",
    body: "会話の内容そのものが教員に公開されることはありません。",
  },
  {
    n: "05",
    icon: "school",
    label: "教員",
    body: "届くのは、対応が必要な生徒を示す要点のみのレポートです。",
  },
];

/* -------------------------------------------------------------------------- */
/* Shared pieces                                                              */
/* -------------------------------------------------------------------------- */

/** Placeholder well, or the real asset once `image` is set on the step. */
function Media({ step }: { step: Step }) {
  if (step.image) {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line bg-surface md:aspect-[4/3]">
        <Image
          src={step.image.src}
          alt={step.image.alt}
          fill
          sizes="(min-width: 768px) 55vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface md:aspect-[4/3]">
      <Icon name="add_photo_alternate" size={30} className="text-muted" />
      <p className="text-[0.78rem] tracking-wide text-muted">
        {step.label} — モックアップ / 写真
      </p>
    </div>
  );
}

function StepCopy({ step }: { step: Step }) {
  return (
    <>
      <p className="text-[0.78rem] font-medium tabular-nums tracking-[0.22em] text-accent">
        {step.n}
      </p>
      <h3 className="mt-4 text-2xl font-medium tracking-[-0.02em] text-ink md:text-3xl">
        {step.label}
      </h3>
      <p className="measure-jp mt-5 max-w-md text-[0.95rem] text-muted md:text-base">
        {step.body}
      </p>
      {step.note && (
        <p className="mt-5 flex items-center gap-2 text-[0.85rem] text-muted">
          <Icon name="lock" size={16} className="text-accent" />
          {step.note}
        </p>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Progress indicator                                                         */
/* -------------------------------------------------------------------------- */

function Indicator({ active }: { active: number }) {
  return (
    <div className="flex items-start">
      {STEPS.map((step, i) => {
        const isActive = i === active;
        const isDone = i < active;

        return (
          <Fragment key={step.n}>
            <div className="flex shrink-0 flex-col items-center">
              <motion.span
                animate={{
                  backgroundColor: isActive
                    ? "var(--color-primary)"
                    : "rgba(133,192,237,0)",
                  borderColor:
                    isActive || isDone
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                  color: isActive
                    ? "var(--color-bg)"
                    : isDone
                      ? "var(--color-primary)"
                      : "var(--color-text-muted)",
                }}
                transition={{ duration: 0.4, ease: EXPO_OUT }}
                className="flex size-10 items-center justify-center rounded-full border md:size-12"
              >
                <Icon name={step.icon} size={20} />
              </motion.span>
              <motion.span
                animate={{ opacity: isActive ? 1 : 0.45 }}
                transition={{ duration: 0.4, ease: EXPO_OUT }}
                className="mt-3 hidden whitespace-nowrap text-[0.78rem] text-ink md:block"
              >
                {step.label}
              </motion.span>
            </div>

            {i < STEPS.length - 1 && (
              <div className="relative mt-5 h-0.5 flex-1 md:mt-6">
                {/* Track */}
                <div className="absolute inset-0 rounded-full bg-line" />
                {/* Fill, drawn left to right as each step is passed. */}
                <svg
                  viewBox="0 0 100 2"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full overflow-visible"
                >
                  <motion.path
                    d="M0 1 H100"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    initial={false}
                    animate={{ pathLength: isDone ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: EXPO_OUT }}
                  />
                </svg>
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Scroll-driven variant                                                      */
/* -------------------------------------------------------------------------- */

function ScrollSteps() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /*
   * Measured off the container on rAF rather than from scroll events.
   *
   * Neither `useScroll({ target })` nor a plain scroll listener is dependable
   * here: Lenis drives the page with its own loop, and a smooth-scroll
   * library sitting between the wheel and the scroll position is exactly the
   * kind of setup where scroll events arrive late, coalesced, or not at all.
   * Reading the rect each frame is immune to all of that, and an
   * IntersectionObserver gates the loop so it only runs while the section is
   * actually on screen.
   */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let frame = 0;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel > 0) {
        const progress = Math.min(1, Math.max(0, -rect.top / travel));
        const next = Math.min(
          STEPS.length - 1,
          Math.floor(progress * STEPS.length),
        );
        setActive((current) => (current === next ? current : next));
      }
      frame = requestAnimationFrame(measure);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !frame) {
          frame = requestAnimationFrame(measure);
        } else if (!entry.isIntersecting && frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { threshold: 0 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    // One viewport of scroll per step, read by the sticky panel inside.
    <div ref={containerRef} className="relative h-[500svh]">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <Container>
          <Indicator active={active} />

          <div className="mt-12 grid items-center gap-8 md:mt-16 md:grid-cols-[1fr_1.15fr] md:gap-16">
            {/* All five panels stay mounted and stacked so fast scrolling
                cross-fades cleanly instead of queueing enter/exit pairs.
                Document order still matches the narrative for screen readers. */}
            <div className="relative min-h-[13rem] md:min-h-[16rem]">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={false}
                  animate={{
                    opacity: i === active ? 1 : 0,
                    y: i === active ? 0 : 12,
                  }}
                  transition={{ duration: 0.45, ease: EXPO_OUT }}
                  className={`absolute inset-x-0 top-0 ${
                    i === active ? "" : "pointer-events-none"
                  }`}
                >
                  <StepCopy step={step} />
                </motion.div>
              ))}
            </div>

            <div className="relative">
              {/* The first panel holds the grid cell open; the rest overlay it. */}
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={false}
                  animate={{ opacity: i === active ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: EXPO_OUT }}
                  className={
                    i === 0
                      ? "relative"
                      : "pointer-events-none absolute inset-0"
                  }
                >
                  <Media step={step} />
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reduced-motion variant                                                     */
/* -------------------------------------------------------------------------- */

/**
 * No sticky viewport and no scroll-linked state — the same five steps simply
 * stack down the page. Scroll-jacking is precisely what the reduced-motion
 * preference is asking us to drop.
 */
function StaticSteps() {
  return (
    <Container>
      <div className="space-y-20">
        {STEPS.map((step) => (
          <div
            key={step.n}
            className="grid items-center gap-8 md:grid-cols-[1fr_1.15fr] md:gap-16"
          >
            <div>
              <StepCopy step={step} />
            </div>
            <Media step={step} />
          </div>
        ))}
      </div>
    </Container>
  );
}

export function HowSteps() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.3 }}
      >
        <StaticSteps />
      </motion.div>
    );
  }

  return <ScrollSteps />;
}
