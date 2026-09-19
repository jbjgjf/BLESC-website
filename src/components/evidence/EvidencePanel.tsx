import { Counter } from "@/components/Counter";
import { SatisfactionChart } from "@/components/evidence/SatisfactionChart";
import { StudentCrowd } from "@/components/evidence/StudentCrowd";
import { RC16 } from "@/lib/wellbeing";

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
 *
 * The captions under the figures are gone too, so each half is now a label, a
 * number and one figure — which is why the craft in this block sits in those
 * three things rather than in anything around them. The digits are drums that
 * settle (see Counter), the rank is shown as the indicator it is made of — a
 * handful of countries' life-satisfaction figures with Japan's bar shortest
 * (see SatisfactionChart) — and the crowd is scattered and receding rather
 * than a lattice (see StudentCrowd). Each of the three is the same argument
 * as the number it belongs to, made in a second way.
 */


/*
 * Both figures are set at one size, so neither reads as the larger claim.
 *
 * They are much larger than they were because the sentences that used to sit
 * under them are gone — the label above and the figure itself now carry the
 * whole statement, so the number is the block rather than its illustration.
 *
 * The ceiling is set by the tightest cell rather than by the widest. The
 * figure, its unit and the plus are one flex row: at 9.5vw the digits alone
 * measured 299px inside a 334px cell just above the md breakpoint, so 人 and
 * + were pushed out through the panel edge. The row comes to roughly 4.4x the
 * figure size and the narrowest cell it has to sit in is about 305px, which
 * puts the limit near 8.6vw.
 */
const FIGURE =
  "text-[clamp(3.5rem,8.6vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.045em] tabular-nums";
const UNIT =
  "text-[clamp(1.5rem,3.2vw,2.25rem)] font-normal leading-none tracking-[-0.02em]";

export function EvidencePanel() {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-line bg-surface shadow-[var(--shadow-card)]">
      {/*
        Not two equal halves. "37位 / 38" is four glyphs and "350,000人+" is
        ten, so at one figure size the long one ran past its cell and clipped
        the 人 against the panel edge. The split is weighted to the number
        that needs the room, which also stops the short figure floating in a
        half-empty box.
      */}
      <div className="grid md:grid-cols-[5fr_7fr]">
        <div className="p-8 md:p-12">
          <p className="text-[0.95rem] text-muted">日本の子どもの精神的幸福度</p>

          <p className="mt-5 flex items-baseline text-ink">
            <Counter to={RC16.japanMentalRank} className={FIGURE} />
            <span className={UNIT}>位</span>
            <span className={`ml-2 text-muted ${UNIT}`}>/ {RC16.countriesRanked}</span>
          </p>

          <SatisfactionChart />
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
