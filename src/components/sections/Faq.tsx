import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Section, SectionTitle } from "@/components/ui";
import { FAQ } from "@/lib/seo";

/**
 * The questions live in lib/seo alongside the FAQPage structured data that
 * quotes them, because Google requires the answer text in the markup to
 * match the answer text in the JSON-LD — two copies would drift on the first
 * edit.
 *
 * Native <details>/<summary> rather than a JS accordion: it is open-able
 * without hydration, it is keyboard- and screen-reader-correct for free, and
 * every answer is in the server-rendered HTML whether or not it has been
 * expanded — a crawler reads collapsed content here, which it would not if
 * the panels were mounted on click.
 */
export function Faq() {
  return (
    /*
      Not `alt`: ニュース immediately above is already the page's one
      canvas-alt band, and two in a row would merge into one grey block. The
      rules between the questions carry the separation from the closing
      statement below.
    */
    <Section id="faq">
      <Reveal>
        <SectionTitle>よくあるご質問</SectionTitle>
      </Reveal>

      <Reveal className="max-w-3xl">
        <p className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.4] tracking-[-0.02em] text-ink">
          導入前に、よくいただくご質問。
        </p>
      </Reveal>

      <Stagger className="mt-10 max-w-3xl" stagger={0.06}>
        {FAQ.map(({ q, a }) => (
          <RevealItem key={q}>
            <details className="group border-t border-line">
              <summary className="flex cursor-pointer list-none items-baseline gap-4 py-6 text-[1.05rem] font-medium leading-snug tracking-[-0.01em] text-ink transition-opacity duration-300 hover:opacity-70 motion-reduce:transition-none md:text-[1.15rem]">
                <span className="flex-1">{q}</span>
                {/*
                  A rotating rule rather than an icon: two hairlines that
                  cross into a plus and fold into a minus as the answer opens,
                  which needs nothing loaded and nothing but CSS.
                */}
                <span
                  aria-hidden
                  className="relative mt-2 h-[1px] w-4 shrink-0 bg-mark-2 before:absolute before:inset-0 before:bg-mark-2 before:transition-transform before:duration-300 motion-reduce:before:transition-none before:content-[''] before:[transform:rotate(90deg)] group-open:before:[transform:rotate(0deg)]"
                />
              </summary>
              <p className="measure-jp pb-7 pr-8 text-[0.95rem] leading-relaxed text-muted">
                {a}
              </p>
            </details>
          </RevealItem>
        ))}
      </Stagger>
    </Section>
  );
}
