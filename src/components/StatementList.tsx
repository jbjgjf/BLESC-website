"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { VIEWPORT } from "@/lib/motion";
import { Icon } from "@/components/ui";

export type Statement = {
  /** Material Symbols name — the site uses no other icon set. */
  icon: string;
  title: string;
  body: string;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};

const flatVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

/**
 * A panel with a header and a stacked list of icon + statement rows.
 *
 * Adapted from a cashback-partners card. Its rows were pill-shaped external
 * links carrying a logo, a name and a percentage; these carry a sentence and
 * link nowhere, so the anchor, the hover-scale and the target="_blank" are
 * gone. Only the header arrow is a real control — a row that lifts under the
 * cursor but cannot be clicked is a promise the page can't keep.
 *
 * Reveals on scroll rather than on mount: the section sits well below the
 * fold, so an on-mount animation would already be over on arrival.
 */
export function StatementList({
  title,
  items,
  href,
  hrefLabel,
  className = "",
}: {
  title: string;
  items: Statement[];
  /** Target for the header arrow. */
  href: string;
  hrefLabel: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const container = reduce ? flatVariants : containerVariants;
  const item = reduce ? flatVariants : itemVariants;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={container}
      className={`w-full rounded-2xl border border-line bg-surface p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_18px_40px_-24px_rgba(0,0,0,0.9)] md:p-10 ${className}`}
    >
      <div className="mb-8 flex items-start justify-between gap-6 md:mb-10">
        <h2 className="text-xl font-medium leading-snug tracking-[-0.02em] text-ink md:text-2xl">
          {title}
        </h2>
        <a
          href={href}
          aria-label={hrefLabel}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-canvas-alt text-muted transition-[color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] hover:border-ink/30 hover:text-ink"
        >
          <Icon name="arrow_outward" size={20} />
        </a>
      </div>

      <motion.ul variants={container} className="flex flex-col gap-3">
        {items.map((statement) => (
          <motion.li key={statement.title} variants={item}>
            <div className="flex items-start gap-4 rounded-2xl border border-line bg-canvas-alt p-5 md:gap-6 md:p-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-accent">
                <Icon name={statement.icon} size={22} />
              </span>
              <div>
                <p className="font-medium leading-snug text-ink">
                  {statement.title}
                </p>
                <p className="measure-jp mt-2 text-[0.9rem] text-muted">
                  {statement.body}
                </p>
              </div>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </motion.section>
  );
}
