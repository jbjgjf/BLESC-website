import { GridField } from "@/components/GridField";
import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Icon, Lines, Section } from "@/components/ui";

/**
 * The escalation, and where each approach catches it.
 *
 * Every phase name here is already in the section's own copy — 早期のサイン,
 * 孤立する前に, 危機が起きてから — so this draws the argument the paragraphs
 * make rather than adding a new claim. The colour ramp is the risk scale
 * that already exists for the teacher report: blue where there is still
 * time, amber, then red. That is the whole point of the section made
 * visible, which is what the heading alone could not do.
 */
type Phase = {
  label: string;
  caption: string;
  /** Full class names — Tailwind scans source text, so no interpolation. */
  dot: string;
  ring: string;
  mark?: string;
  markClass?: string;
  /** The point Blesc acts on, so it gets the halo. */
  lead?: boolean;
};

const PHASES: Phase[] = [
  {
    label: "兆候",
    caption: "本人も言葉にできない、小さな変化",
    dot: "bg-mark-1",
    ring: "ring-mark-1/25",
    mark: "Blescが気づく",
    markClass: "text-mark-1",
    lead: true,
  },
  {
    label: "孤立",
    caption: "周囲を拒み、見えなくなる",
    dot: "bg-risk-mid",
    ring: "ring-risk-mid/25",
  },
  {
    label: "危機",
    caption: "気づいたときには、選べる手が少ない",
    dot: "bg-risk-high",
    ring: "ring-risk-high/25",
    mark: "これまでは、ここ",
    markClass: "text-muted",
  },
];

function Escalation() {
  return (
    <div className="relative">
      {/*
        The track sits behind the nodes and spans centre-to-centre — inset by
        half a column at each end so it does not run past the first and last
        dot. top-[7px] centres it on the 14px nodes.
      */}
      <span
        aria-hidden
        className="absolute left-[16.667%] right-[16.667%] top-[15px] h-[3px] -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,var(--mark-1),var(--risk-mid),var(--risk-high))]"
      />

      <div className="relative grid grid-cols-3 gap-3 md:gap-6">
        {PHASES.map((phase) => (
          <div key={phase.label} className="flex flex-col items-center text-center">
            {/*
              Fixed-height rail so the lead dot can be larger without
              dropping off the track the others sit on.
            */}
            <span aria-hidden className="flex h-[30px] items-center justify-center">
              <span
                className={`rounded-full ${phase.dot} ${phase.ring} ${
                  phase.lead ? "size-[18px] ring-[7px]" : "size-3.5 ring-[5px]"
                }`}
              />
            </span>

            <span className="mt-4 text-[clamp(1.05rem,2.4vw,1.5rem)] font-medium tracking-[-0.02em] text-ink">
              {phase.label}
            </span>

            <span className="measure-jp mt-2 max-w-[16rem] text-[0.8rem] text-muted">
              {phase.caption}
            </span>

            {/* Reserved on every column so the three stay baseline-matched. */}
            <span className="mt-5 min-h-[1.5rem]">
              {phase.mark && (
                <span
                  className={`inline-flex flex-col items-center gap-1 text-[0.78rem] font-medium leading-snug tracking-[0.02em] sm:flex-row sm:gap-1.5 ${phase.markClass}`}
                >
                  <Icon name="arrow_upward" size={14} className="shrink-0" />
                  {phase.mark}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/*
 * Tighter top than the standard section rhythm. The hero centres its copy in
 * a full-viewport box, which already leaves ~246px of air below the CTAs;
 * the default 144px on top of that put this heading 390px clear of them.
 * Tailwind sorts pt-* after py-*, so this wins over Section's own py.
 */
export function Problem() {
  return (
    <Section
      id="problem"
      className="relative overflow-hidden pt-12 md:pt-16"
      backdrop={<GridField />}
    >
      <Reveal>
        {/*
          The page's emotional hook, so it gets hero-adjacent size and the
          break puts 遅い。 alone on its own line.
        */}
        <h2 className="max-w-4xl text-[clamp(2.25rem,6vw,4rem)] font-medium leading-[1.2] tracking-[-0.035em] text-ink">
          危機が起きてからでは、
          <br />
          遅い。
        </h2>
      </Reveal>

      <Reveal className="mt-10 max-w-2xl">
        <Lines className="measure-jp text-[clamp(1rem,1.6vw,1.15rem)] text-ink">
          {`生徒の不調に気づくのが「何かが起きた後」になってしまう。
Blescは、そのタイミングを根本から変えます。`}
        </Lines>
      </Reveal>

      <Reveal className="mt-16 md:mt-20">
        <Escalation />
      </Reveal>

      <Stagger className="mt-16 max-w-2xl md:mt-20" stagger={0.12}>
        <RevealItem>
          <Lines className="measure-jp text-muted">
            {`毎日5分の日記に綴られた言葉から早期のサインをAIが捉え、
支援が必要な生徒を、孤立する前に可視化します。`}
          </Lines>
        </RevealItem>
      </Stagger>
    </Section>
  );
}
