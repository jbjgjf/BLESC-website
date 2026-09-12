import { Counter } from "@/components/Counter";

/**
 * The whole evidence half of the 課題 argument, in one panel.
 *
 * This replaces two separate figure blocks that used to sit in their own
 * section: a four-row ranking table beside the 37位 figure, and a full-width
 * band with the 35万人 figure standing on a blurred crowd. As two blocks they
 * read as a list of statistics; side by side inside one panel they read as a
 * single piece of evidence for the sentence above them, which is what the
 * rest of the page now does with its product panels.
 *
 * The table went rather than moved. It named New Zealand at 38th and left
 * ranks 35 and 36 as dashes, so three of its four rows were either an
 * unverified claim about another country or an admission that we did not
 * know — a lot of apparatus to say "37th of 38". The scale below says the
 * same thing and names only Japan.
 */

const COUNTRY_COUNT = 38;
const JAPAN_RANK = 37;

/** Shared by the label row and the mark row so their grid lines agree. */
const SCALE_COLUMNS = {
  gridTemplateColumns: `repeat(${COUNTRY_COUNT}, minmax(0, 1fr))`,
};

/**
 * Thirty-eight marks for thirty-eight countries, with the thirty-seventh
 * picked out and named. Every mark is the same height on purpose: giving them
 * descending heights would look like a chart of per-country scores, and we
 * publish no such numbers.
 *
 * Decorative — the sentence under the figure carries all three facts — so the
 * whole thing is aria-hidden, axis labels included.
 */
function RankScale() {
  return (
    <div aria-hidden className="mt-7">
      {/*
        The label's grid span ends on line 38, which is the right edge of the
        37th column, so right-aligning it inside that span lands its final
        character directly above Japan's mark. It also carries the same colour
        as that mark, which is what ties the two together at a glance.
      */}
      <div className="grid gap-x-[2px]" style={SCALE_COLUMNS}>
        <span
          className="justify-self-end whitespace-nowrap text-right text-[0.75rem] font-medium text-mark-1"
          style={{ gridColumn: `${JAPAN_RANK - 9} / ${JAPAN_RANK + 1}` }}
        >
          日本
        </span>
      </div>

      <div className="mt-1.5 grid items-end gap-x-[2px]" style={SCALE_COLUMNS}>
        {Array.from({ length: COUNTRY_COUNT }, (_, i) => (
          <span
            key={i}
            className={
              i + 1 === JAPAN_RANK
                ? "h-10 rounded-full bg-mark-1"
                : "h-6 rounded-full bg-ink/20"
            }
          />
        ))}
      </div>

      <div className="mt-2.5 flex justify-between text-[0.75rem] text-muted">
        <span>1位</span>
        <span>38位</span>
      </div>
    </div>
  );
}

/**
 * A crowd, not a count.
 *
 * Deliberately not a unit chart: nobody is meant to count these, and the
 * count is not a multiple of anything the copy claims. Blurred back at low
 * opacity it gives the figure a crowd to stand on, and the text over it still
 * clears AA in both themes — 5.2:1 for muted copy at this opacity, which is
 * the whole reason it is this faint.
 */
const CROWD_COUNT = 112;

function StudentCrowd() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.14] blur-[3px]"
    >
      <div className="grid w-full grid-cols-16 gap-x-3 gap-y-2">
        {Array.from({ length: CROWD_COUNT }, (_, i) => (
          <svg
            key={i}
            viewBox="0 0 12 17"
            className="h-auto w-full text-mark-1"
            fill="currentColor"
          >
            <circle cx="6" cy="3.4" r="3.4" />
            <path d="M6 8.2c-3.1 0-5.4 2.1-5.4 5.1V17h10.8v-3.7c0-3-2.3-5.1-5.4-5.1Z" />
          </svg>
        ))}
      </div>
    </div>
  );
}

/*
 * Both figures are set at one size, so neither reads as the larger claim.
 *
 * They are much larger than they were because the sentences that used to sit
 * under them are gone — the label above and the figure itself now carry the
 * whole statement, so the number is the block rather than its illustration.
 */
const FIGURE = "text-[clamp(3.75rem,9.5vw,7rem)] font-medium leading-[0.9] tracking-[-0.045em] tabular-nums";
const UNIT = "text-[clamp(1.5rem,3.2vw,2.25rem)] font-normal leading-none tracking-[-0.02em]";

export function EvidencePanel() {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-line bg-surface shadow-[var(--shadow-card)]">
      <div className="grid md:grid-cols-2">
        <div className="p-8 md:p-12">
          <p className="text-[0.95rem] text-muted">
            日本の子どもの精神的幸福度
          </p>

          <p className="mt-5 flex items-baseline text-ink">
            <Counter to={JAPAN_RANK} className={FIGURE} />
            <span className={UNIT}>位</span>
            <span className={`ml-2 text-muted ${UNIT}`}>/ 38</span>
          </p>

          <RankScale />
        </div>

        {/*
          The divider is this cell's own edge rather than a rule element: a
          top border while the cells are stacked, a left border once they sit
          side by side.
        */}
        <div className="relative flex flex-col justify-center overflow-hidden border-t border-line p-8 md:border-t-0 md:border-l md:p-12">
          <StudentCrowd />

          <div className="relative">
            <p className="text-[0.95rem] text-muted">不登校児童・生徒</p>

            <p className="mt-5 flex items-baseline text-ink">
              <Counter to={350000} className={FIGURE} />
              <span className={UNIT}>人</span>
              <span className={`text-muted ${UNIT}`}>+</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
