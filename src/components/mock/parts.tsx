import type { ReactNode } from "react";
import { Icon } from "@/components/ui";

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
  /** The middle of the row — usually a <Bar>. Takes the spare width. */
  children?: ReactNode;
  /** The right end — usually a <Chip> or a printed level. */
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
 * A small filled pill: a count in a title bar, a state, a risk level.
 *
 * Three tones, and deliberately no 中/低 tone. A level chip is coloured text
 * on 15% of its own colour, and only --risk-high has a darkened text variant
 * (--risk-high-text) for that tint — #b45309 over its own light tint measures
 * 4.08:1, under AA. Mid and low levels are printed as plain coloured text on
 * the window surface instead, where they hold 5.0:1.
 */
export function Chip({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "accent" | "risk";
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
  risk: "bg-risk-high/15 text-risk-high-text",
} as const;

/* -------------------------------------------------------------------------- */
/* Bar                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * A level, as a length in a track.
 *
 * Why it exists: the teacher's report is a list of rows where the only
 * quantity is "how much", and a bar is how software says that. The fill is
 * always accompanied by a printed level — red/amber/green is the worst
 * possible pairing for colour blindness, so colour is never the only signal
 * (WCAG 1.4.1). Every fill tone clears 3:1 against the window surface in
 * both themes.
 */
export function Bar({
  pct,
  tone = "mark-1",
  className = "",
}: {
  /** A CSS length, e.g. "88%". Set as a style, never animated as a width. */
  pct: string;
  tone?: "mark-1" | "risk-high" | "risk-mid" | "risk-low";
  className?: string;
}) {
  return (
    <span
      className={`block h-1.5 w-full overflow-hidden rounded-full bg-inset ${className}`}
    >
      <span
        className={`block h-full rounded-full ${BAR_TONES[tone]}`}
        style={{ width: pct }}
      />
    </span>
  );
}

const BAR_TONES = {
  "mark-1": "bg-mark-1",
  "risk-high": "bg-risk-high",
  "risk-mid": "bg-risk-mid",
  "risk-low": "bg-risk-low",
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
  icon?: string;
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
