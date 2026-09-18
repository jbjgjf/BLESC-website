import { OntologyGraph } from "@/components/OntologyGraph";
import { DOMAINS, TRACE } from "@/components/product/ontology";
import { Reveal } from "@/components/Reveal";
import { SectionTitle, Section } from "@/components/ui";

export function Technology() {
  return (
    <Section id="technology">
      <Reveal>
        <SectionTitle>テクノロジー</SectionTitle>
      </Reveal>

      {/*
        One block rather than the four stacked ones this was: the copy reads
        down five columns while the graph holds the other seven, which is
        what makes the section short. Both columns are shorter than the old
        stack's graph alone.

        items-center because the text runs shorter than the panel — aligning
        to the top would leave an obvious hole under the credits, and the two
        halves read as a pair when their centres line up.

        Stacking order is the source order, text then graph: the lead line
        has to arrive before the picture it introduces, and on a phone the
        graph is the part you scroll past.
      */}
      <div className="grid items-center gap-10 lg:grid-cols-[5fr_7fr] lg:gap-12">
        <Reveal>
          <p className="text-[clamp(1.125rem,2vw,1.5rem)] font-medium leading-[1.55] tracking-[-0.015em] text-ink">
            Blescは、言葉を予測するだけの汎用AIではありません。
          </p>

          {/*
            One paragraph, left to rewrap. The authored line break this had
            was set for a full-width measure; in a five-column column it
            would break the sentence a third of the way into its own line.
          */}
          <p className="measure-jp mt-5 text-[1rem] text-muted">
            心理のつながりを、WHOやNICEなど公開されている医学的ガイドラインをもとに構造化したオントロジー知識グラフをAIに実装しています。
          </p>

          {/*
            The chain, as text.

            The claim this section makes is that a path through the structure
            is what the model follows, and the only place that path existed as
            words was a legend under the figure — so the copy column was two
            paragraphs and a credit list, i.e. the thing it is arguing against
            was the only thing on the page with a shape. Setting the chain
            here gives the column something to land on, puts the example
            before the picture that highlights it, and makes the path readable
            to a screen reader as an ordered list of three constructs rather
            than as one sentence inside an image label.

            Same three nodes as the lit trace, imported from the graph's own
            data: they cannot come to disagree. The dots repeat each
            construct's domain colour, which is what keys the list to the
            figure beside it; the construct names themselves stay ink, so
            nothing here depends on a colour to be read.

            The label above it is the one new string in this section. The
            chain is one path through a graph the paragraph below says covers
            three areas, so "一例" is what this list honestly is.
          */}
          <p className="mt-8 text-[0.8rem] font-medium tracking-[0.02em] text-muted">
            因果連鎖の一例
          </p>
          {/* role="list": see Stagger — WebKit drops unmarked lists. */}
          <ol className="mt-4" role="list">
            {TRACE.map((node, i) => (
              <li key={node.id} className="flex gap-3.5">
                <span aria-hidden className="flex flex-col items-center pt-[0.5rem]">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: DOMAINS[node.domain].color }}
                  />
                  {i < TRACE.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-line-strong" />
                  )}
                </span>
                <span
                  className={`text-[0.95rem] font-medium text-ink ${
                    i < TRACE.length - 1 ? "pb-4" : ""
                  }`}
                >
                  {node.label}
                </span>
              </li>
            ))}
          </ol>

          {/*
            What this section may claim is bounded by docs/claims.md, and the
            bound is written rather than remembered: a named institution goes
            on this page only once its permission is on file. 京都大学 and
            株式会社Hatapro were both named here as settled collaborations
            while the company's own alignment record still had the
            collaborator line blank — an unagreed use of a university's name
            in copy aimed at schools and boards of education. They come back
            the day the permission does.

            What replaces them is the part that is checkable today: curated
            subgraphs, every node and relation carrying a source, and the ones
            that carry none saying so.
          */}
          <p className="measure-jp mt-8 border-t border-line pt-7 text-[0.9rem] text-muted">
            グラフは社内でキュレーションしています。ノードと関係のひとつずつに出典を紐づけ、出典を示せないものは専門家の判断であることを明記しています。現在は睡眠・社会的ひきこもり・学業上の負荷の3領域を整備しており、臨床の専門家によるレビューを準備しています。
          </p>
        </Reveal>

        {/*
          Deliberately NOT wrapped in <Reveal>: the trace inside is
          scroll-linked to this element's own position, and an ancestor that
          is still animating a translate would be measured mid-flight. The
          graph brings its own on-view reveal for the nodes and edges.

          The graph is WebGL now, with the flat SVG it replaced kept as its
          fallback, and both are drawn for this ground. bg-inset rather than
          bg-surface: the scene reads --surface-inset as the colour its far
          nodes and edges recede toward, and the fallback's pills are filled
          with --surface-raised, which on the inset plane read as raised in
          light and sunken in dark — on a surface-coloured panel the dark
          build would fill them with exactly the panel colour.

          The padding stays at p-5 at every width. Going to p-8 on desktop
          would take the fallback's frame below the width at which its labels
          hold 11px, which would put a scrollbar inside a panel that fits.

          min-w-0 is what lets the fallback's own overflow-x-auto do its job
          on a phone. A grid item's minimum width is its content's, and that
          figure sets a 30rem floor on its drawing — so without this the
          column grew to 546px at 375px, the whole page gained a horizontal
          scroll, and the phone zoomed out to fit it. With it, the panel stays
          the width of the page and the drawing scrolls inside the panel. The
          WebGL figure sets no floor at all; it is the width of the panel.

          data-thread marks the panel as where the signal thread ends: the
          page's thread layer finds it by this attribute, and the section
          knows nothing more about it.
        */}
        <div
          data-thread="graph"
          className="min-w-0 rounded-[1.25rem] border border-line bg-inset p-5 shadow-[var(--shadow-card)]"
        >
          <OntologyGraph />
        </div>
      </div>
    </Section>
  );
}
