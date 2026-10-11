"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { useLocale } from "@/components/LocaleProvider";
import { CHART_ROWS, JAPAN, RC16 } from "@/lib/wellbeing";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";

/**
 * The 37位 figure, shown as what it is made of.
 *
 * A rank on its own says "near the bottom" and nothing more. This is the
 * indicator behind the rank — the share of 15-year-olds who rate their life
 * 6 or better out of 10 — for a handful of countries, with Japan last. The
 * bars start at zero: a truncated axis would make the gap look larger than
 * it is, and the honest gap is already the point. Japan's 62% is second-
 * lowest of the 33 countries measured.
 *
 * The numbers are real text and the names are real text, so the chart is
 * readable without the bars; the bars are the only decoration, and they are
 * drawn from the same rows as the labels, so the two cannot disagree. Japan
 * takes the one colour that carries meaning on this page; the others are a
 * neutral at 45%, which clears 3:1 as a mark against the card (3.11:1,
 * computed from the tokens).
 *
 * The bars grow from the left as the panel arrives — scaleX on a fixed
 * width, so no frame animates a width — staggered so the eye reads down the
 * list to Japan. Reduced motion puts them at full length the moment the
 * panel arrives, with no growth and no stagger.
 *
 * The hidden state is scaleX 0 either way and only the transition differs.
 * The hidden state is written into the server HTML; if it depended on the
 * setting, the server (which cannot know it) and a reduced-motion visitor's
 * hydration pass would disagree. A transition is read when the animation
 * starts, which is after hydration, so motion's useReducedMotion is the right
 * flag for it.
 *
 * The chart speaks the page's language: the country names, the label and the
 * citation each come in Japanese and English (lib/wellbeing), and the
 * figures are the same rows either way. It reads the language with
 * useLocale, which the server and the browser agree on.
 */
const MAX = 100;

/* What the bars measure, and the year: the list's accessible name and the
   caption's first sentence. */
const LABEL = {
  ja: `${RC16.indicator.ja}（${RC16.dataYear}年）`,
  en: `${RC16.indicator.en} (${RC16.dataYear})`,
} as const;

/*
 * A row is three columns — name, bar, value — and the name column is the one
 * thing sized per language. The Japanese names run to six full-width
 * characters (フィンランド, 72px at this size) and sit in 5.5rem. English
 * runs longer: "Republic of Korea" is 96px in Helvetica Neue and 101px in
 * Inter, the fallback face, so its column is 6.5rem (104px). `truncate` on
 * the name stays as the backstop for a face wider than either.
 */
const ROW = {
  ja: "grid grid-cols-[5.5rem_1fr_2.25rem] items-center gap-x-3",
  en: "grid grid-cols-[6.5rem_1fr_2.25rem] items-center gap-x-3",
} as const;

/* English breaks at spaces, so its caption asks not to end on a stray
   "(2020)."; the Japanese one wraps as it always has. */
const CAPTION = {
  ja: "mt-4 text-[0.7rem] leading-relaxed text-muted",
  en: "mt-4 text-pretty text-[0.7rem] leading-relaxed text-muted",
} as const;

const SOURCE_LINK =
  "text-mark-1 underline decoration-mark-1/40 underline-offset-2 transition-colors duration-300 hover:decoration-mark-1";

const barVariants = (reduce: boolean): Variants => ({
  hidden: { scaleX: 0 },
  show: {
    scaleX: 1,
    transition: reduce ? { duration: 0 } : { duration: 0.8, ease: EXPO_OUT },
  },
});

export function SatisfactionChart() {
  const reduce = useReducedMotion() ?? false;
  const locale = useLocale();

  return (
    <figure className="mt-7">
      <motion.ol
        role="list"
        aria-label={LABEL[locale]}
        className="space-y-2"
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
        }}
      >
        {CHART_ROWS.map((row) => {
          const japan = row.ja === JAPAN;
          return (
            <li key={row.ja} className={ROW[locale]}>
              <span
                className={`truncate text-[0.75rem] ${
                  japan ? "font-medium text-ink" : "text-muted"
                }`}
              >
                {row[locale]}
              </span>

              <span className="block h-1.5 overflow-hidden rounded-full bg-inset">
                {/* Cut to its true length as a static width; only the fill's
                    scale animates, so the resting state is the true value
                    with or without JavaScript. */}
                <span
                  className="block h-full overflow-hidden rounded-full"
                  style={{ width: `${(row.value / MAX) * 100}%` }}
                >
                  <motion.span
                    className={`block h-full w-full origin-left rounded-full ${
                      japan ? "bg-mark-1" : "bg-ink/45"
                    }`}
                    variants={barVariants(reduce)}
                  />
                </span>
              </span>

              <span
                className={`text-right text-[0.75rem] tabular-nums ${
                  japan ? "font-medium text-ink" : "text-muted"
                }`}
              >
                {row.value}%
              </span>
            </li>
          );
        })}
      </motion.ol>

      {/*
        The one caption the panel carries: what the bars measure, and where
        the figure comes from. Linked, because it is a real source and the
        reader should be able to check it — so each language links the
        edition its reader can read (see RC16.url).

        Two sentences in two punctuations rather than one template: the
        Japanese runs publisher and title together inside the link, and
        English needs the comma between them and a closing full stop.
      */}
      <figcaption className={CAPTION[locale]}>
        {locale === "ja" ? (
          <>
            {LABEL.ja}。出典:{" "}
            <a
              href={RC16.url.ja}
              target="_blank"
              rel="noopener noreferrer"
              className={SOURCE_LINK}
            >
              {RC16.publisher.ja}
              {RC16.title.ja}
            </a>
            （{RC16.year}）
          </>
        ) : (
          <>
            {LABEL.en}. Source:{" "}
            <a
              href={RC16.url.en}
              target="_blank"
              rel="noopener noreferrer"
              className={SOURCE_LINK}
            >
              {RC16.publisher.en}, {RC16.title.en}
            </a>{" "}
            ({RC16.year}).
          </>
        )}
      </figcaption>
    </figure>
  );
}
