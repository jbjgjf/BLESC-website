import type { ReactNode } from "react";
import { Icon } from "@/components/ui";
import type { IconName } from "@/lib/icons";

/* -------------------------------------------------------------------------- */
/* Row                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * One line of a report: a class, a roll number, and whatever the system has
 * to say about that student.
 *
 * Why it exists, and why it takes `klass` and `no` rather than a `label`:
 * this is the anonymity rule expressed as an API. The real report carries a
 * class and a roll number and nothing else, so the component a mockup builds
 * its rows from has nowhere to put a name — which means no screen on this
 * site can grow one by accident.
 */
export function Row({
  klass,
  no,
  children,
  trailing,
  className = "",
}: {
  /** e.g. 3年2組 */
  klass: string;
  /** e.g. #14 */
  no: string;
  /** The middle of the row — an observation, say. Takes the spare width. */
  children?: ReactNode;
  /** The right end — a <Chip>, a time. */
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <span className="shrink-0 text-[0.75rem] tabular-nums text-muted">
        {klass} <span className="text-ink">{no}</span>
      </span>
      {children && <span className="flex min-w-0 flex-1 items-center">{children}</span>}
      {trailing}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Chip                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * A small filled pill: a count or a state in a title bar.
 *
 * Two tones and deliberately no third. There was a risk tone, for a level
 * chip on the teacher's report; the product draws no levels (docs/claims.md
 * §2), so the kit no longer has a way to draw one.
 */
export function Chip({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "accent";
  children: ReactNode;
}) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-medium tabular-nums ${CHIP_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

const CHIP_TONES = {
  neutral: "bg-inset text-muted",
  accent: "bg-accent/10 text-mark-1",
} as const;

/* -------------------------------------------------------------------------- */
/* TextLine                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The shape of a line of text, without the text.
 *
 * Why it exists: a screen often needs to look like it holds more writing than
 * the one sample entry we are allowed to show — a list with a second and
 * third entry in it, the rest of a page above the part being quoted. Every
 * other way of filling that space means inventing a student's words. This
 * fills it with nothing, honestly.
 *
 * Not a loading skeleton: no shimmer, no animation.
 */
export function TextLine({ w = "100%" }: { w?: string }) {
  return (
    <span
      className="my-[0.3rem] block h-[0.4rem] rounded-full bg-muted/25"
      style={{ width: w }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Composer                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The bar along the foot of the writing screen: what the student is promised,
 * and the button they press.
 *
 * Why it exists: the promise and the button are the two things that make the
 * diary read as the student's own surface rather than as a form a school
 * hands out, and they always travel together. Both strings come from the
 * product's own copy — this component writes no words of its own.
 *
 * Meant for <Screen>'s `footer` slot, which already draws the rule above it.
 */
export function Composer({
  note,
  action,
  icon = "lock",
}: {
  note: string;
  action: string;
  icon?: IconName;
}) {
  return (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-1.5 text-[0.66rem] text-muted sm:text-[0.7rem]">
        <Icon name={icon} size={13} className="shrink-0" />
        <span className="truncate">{note}</span>
      </span>
      <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[0.7rem] font-medium text-on-accent sm:px-3 sm:text-[0.72rem]">
        {action}
      </span>
    </>
  );
}
