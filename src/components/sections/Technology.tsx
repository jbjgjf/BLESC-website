import { OntologyGraph } from "@/components/OntologyGraph";
import { Reveal } from "@/components/Reveal";
import { Icon, Section, SectionTitle } from "@/components/ui";
import {
  COUNTS,
  EDGES,
  EXAMPLE_PATH,
  NODE_BY_ID,
  SOURCES,
  SUBGRAPHS,
  SUBGRAPH_ORDER,
  conceptsIn,
  publishedRefs,
  type PublishedSourceId,
  type Relation,
  type SeedEdge,
} from "@/lib/ontologySeed";

/**
 * テクノロジー: what Blesc's ontology is, what it rests on, and where it
 * rests on nothing.
 *
 * The section was a claim without a footing — "WHOやNICEなどの医学的
 * ガイドラインをもとに構造化したオントロジー知識グラフをAIに実装しています"
 * beside an illustrated graph whose nodes were mostly not in the real one.
 * The reviewer's note was that it looked vibecoded, with zero validation,
 * and asked for WHO or NICE logos. Logos are the one thing this does not
 * do: neither organisation endorses Blesc, both restrict use of their
 * emblems, and a logo row is precisely what reads as endorsement. What it
 * does instead is the checkable version of the same thing — the sources by
 * name, publisher, year and link, the real graph drawn from the seed, and
 * the seed's own count of how much of it those sources support.
 *
 * What the copy may say is bounded by the company's decision record
 * (lp_claim_alignment.md, claims ①③, converting to option A on 2026-10-01)
 * and docs/claims.md §4:
 *   - It describes the graph as it is: three curated areas, the concepts
 *     and relations counted from src/lib/ontologySeed.ts, never typed here.
 *   - It does not say the graph gives the analysis a rigorous or scientific
 *     basis, or that it is "implemented in the AI" — the seed exists and is
 *     sourced; how far it steers the product is claim ③, which is open.
 *   - It says association, not cause. Every sourced relation in the seed is
 *     `association`; the old "因果連鎖" and "因果リンク" wording claimed more
 *     than any of its sources do.
 *   - It says what the seed RECORDS about a source (「出典として関連を記録」,
 *     「出典：」), never that WHO or NICE "reports" a relation. Whether a
 *     source bears a relation out is the curator's reading, and a spot check
 *     found the WHO fact sheet silent on two relations the seed cites it for
 *     (see the header of lib/ontologySeed.ts).
 *   - It says the unsourced relations are marked as having no published
 *     source — which is how upstream's registry defines expert_judgement —
 *     rather than calling them "専門家の判断", which suggested a reviewer
 *     who has not yet been named.
 *   - It does not call every concept psychological: the graph also holds
 *     school events and an administrative category (不登校, which upstream
 *     is explicit is not a clinical construct), so the copy says 心と生活,
 *     and 気分や行動、学校での出来事.
 *   - The opening line it used to lead with, 「Blescは、言葉を予測するだけの
 *     汎用AIではありません。」, went: set over this graph it said the graph
 *     is what makes the product more than a language model, which is claim
 *     ③ again.
 *   - No collaborating institution is named here. docs/claims.md §3 keeps
 *     the one that may be named to its own section, and not beside this
 *     one, where it would read as having built or checked the graph.
 */
export function Technology() {
  return (
    <Section id="technology">
      <Reveal>
        <SectionTitle>テクノロジー</SectionTitle>
      </Reveal>

      {/*
        Copy in five columns, the figure in seven, as before. items-start
        now rather than items-center: the copy column grew a list of counts
        and a sourced path and is about the panel's height, and top-aligned
        the two start on the same line.

        Stacking order is the source order, text then figure: the numbers
        and the path are the claim, and the figure is the picture of it.
      */}
      <div className="grid items-start gap-10 lg:grid-cols-[5fr_7fr] lg:gap-12">
        <Reveal>
          {/*
            「公開資料に照らして」, not 「公開資料から」: most of the relations
            are not from a published source (the count two paragraphs down
            says how many), but every one was checked against the source
            registry and recorded as supported or not.
          */}
          <p className="text-[clamp(1.125rem,2vw,1.5rem)] font-medium leading-[1.55] tracking-[-0.015em] text-ink">
            心と生活のつながりを、公開資料に照らして整理しています。
          </p>

          <p className="measure-jp mt-5 text-[1rem] text-muted">
            睡眠・社会的ひきこもり・学業上の負荷の3領域について、気分や行動、学校での出来事などの概念どうしのつながりを知識グラフ（オントロジー）にまとめています。つながりの一本ずつに、裏付けとなる公開資料があるかどうかを記録しています。
          </p>

          {/*
            The size of the graph, counted from the seed. These are the
            distinct counts — the "40 nodes / 50 edges" in older notes adds
            up the three files with their shared entries counted in each
            file (see the header of lib/ontologySeed.ts). The list under the
            section prints those totals and the overlap between them.

            dt before dd in the markup, so a screen reader hears "領域 3";
            flex-col-reverse puts the figure on top for everyone else.
            Helvetica Neue Light for the figures, the site's display face.
          */}
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
            {(
              [
                ["領域", COUNTS.subgraphs],
                ["概念", COUNTS.concepts],
                ["つながり", COUNTS.relations],
              ] as const
            ).map(([label, n]) => (
              <div key={label} className="flex flex-col-reverse gap-1.5">
                <dt className="text-[0.8rem] text-muted">{label}</dt>
                <dd className="text-[clamp(1.75rem,3.2vw,2.5rem)] font-light leading-none tracking-[-0.02em] tabular-nums text-ink">
                  {n}
                </dd>
              </div>
            ))}
          </dl>

          {/*
            The number that makes the rest believable. "Supported" is
            evidence_strength "association" — the seed records a cited
            source as reporting the two together — and nothing weaker: four
            of the unsupported relations cite a guideline they were checked
            against, and they are counted as unsupported, because the
            guideline does not state them. Worded as what the seed records,
            not as what the source says (see the header above).

            It leads with the sourced count and says in words that the rest
            are the company's own judgement, rather than printing the
            unsupported count as the headline of the paragraph: the section
            exists because the old one read as having no validation at all,
            and the exact split for every relation is one click below, in
            the full list.
          */}
          <p className="measure-jp mt-5 text-[0.9rem] text-muted">
            このうち{COUNTS.supported}
            のつながりは、公開資料を出典として記録しています。出典のないつながりは社内の判断として区別して明記し、臨床の専門家によるレビューを準備しています。
          </p>

          {/*
            The example path, as text, with the source for each step.

            Read off EXAMPLE_PATH, which resolves both legs against the seed
            and fails the build if either leaves it — so the path named here
            is always a path the graph contains, and the one the figure
            lights. Each step names the source the seed cites for it, by the
            short name the list below uses in full; the sr-only clause says
            which two concepts the citation is for, which the vertical rule
            says to a sighted reader.

            The dots repeat the figure's path marker — ink in a ring of the
            logo's blue — which is what ties the list to the picture; the
            names stay ink, so nothing depends on the colour.
          */}
          <h3 className="mt-9 text-[0.8rem] font-medium tracking-[0.02em] text-muted">
            つながりの一例
          </h3>
          {/* role="list": see Stagger — WebKit drops unmarked lists. */}
          <ol className="mt-4" role="list">
            {EXAMPLE_PATH.nodes.map((node, i) => {
              const leg = EXAMPLE_PATH.legs[i];
              return (
                <li key={node.id} className="flex gap-3.5">
                  <span aria-hidden className="flex flex-col items-center pt-[0.45rem]">
                    <span className="size-2.5 shrink-0 rounded-full bg-ink ring-[3px] ring-accent" />
                    {leg && <span className="mt-1.5 w-px flex-1 bg-line-strong" />}
                  </span>
                  <div className={leg ? "pb-5" : ""}>
                    <span className="text-[0.95rem] font-medium text-ink">
                      {node.label_ja}
                    </span>
                    {leg && (
                      <p className="mt-1 text-[0.8rem] text-muted">
                        <span className="sr-only">
                          {node.label_ja}と{NODE_BY_ID[leg.to].label_ja}の関連の
                        </span>
                        出典：
                        {publishedRefs(leg.source_refs)
                          .map((s) => s.short)
                          .join("・")}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="measure-jp mt-4 text-[0.8rem] text-muted">
            いずれも関連として記録したもので、どちらが原因かを示すものではありません。
          </p>
        </Reveal>

        {/*
          Deliberately NOT wrapped in <Reveal>: the figure fades itself in,
          and a translate on an ancestor would carry its absolutely placed
          names with it mid-flight.

          A white panel now, not the inset grey it was. The figure tints its
          own discs, and every contrast in it was measured over white: on
          --surface-inset the relation lines would drop to 2.91:1 where the
          three discs overlap, under the 3:1 they hold on white.

          min-w-0 so the grid item can be narrower than its content's
          minimum, which keeps a phone from gaining a horizontal scroll.

          data-thread marks the panel as where the signal thread ends: the
          page's thread layer finds it by this attribute, and the section
          knows nothing more about it.
        */}
        <div
          data-thread="graph"
          className="min-w-0 rounded-[1.25rem] border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-6"
        >
          <OntologyGraph />
        </div>
      </div>

      {/*
        Less air above the sources than when they were a bordered list of
        full titles: 96px from the grid above to the sources at md and up —
        64 to the rule, 32 below it — down from 120, so a strip about a
        hundred pixels tall is not set off by more space than it takes.
      */}
      <Reveal className="mt-12 border-t border-line pt-8 md:mt-16">
        <Sources />
      </Reveal>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The relation types, as labelled arrows, for the full list. The graph's
 * relations are directed and typed; a bare arrow from 規則的な睡眠 to
 * 睡眠不足 would read as the one leading to the other, when the relation is
 * that it eases it. The verb sits on the arrow, between the two concepts,
 * so it reads subject–verb–object and cannot be taken as describing the
 * second concept alone. `causes` is the bare arrow — the graph's direction,
 * which the note under the list says no source establishes — and
 * `co_occurs` has no head, because it has no direction.
 *
 * `mark` is drawn and hidden from assistive tech; `spoken` is what a screen
 * reader hears in its place, since "罫線 強める 右矢印" is what the drawn
 * one would be read as.
 */
const RELATION: Record<Relation, { mark: string; spoken: string }> = {
  causes: { mark: "→", spoken: "から" },
  escalates: { mark: "─強める→", spoken: "は次を強める：" },
  precedes: { mark: "─先立つ→", spoken: "は次に先立つ：" },
  buffers: { mark: "─和らげる→", spoken: "は次を和らげる：" },
  co_occurs: { mark: "─ともに見られる─", spoken: "とともに見られる：" },
  avoids: { mark: "─遠ざける→", spoken: "は次を遠ざける：" },
};

const SUPPORTED = EDGES.filter((e) => e.evidence_strength === "association");
const UNSUPPORTED = EDGES.filter((e) => e.evidence_strength === "expert_judgement");

/** The guidelines the unsupported relations were checked against. */
const CONSULTED = Array.from(
  new Set(UNSUPPORTED.flatMap((e) => publishedRefs(e.source_refs).map((s) => s.short))),
);

/**
 * How each source is cited in the strip: who published it, and the opening
 * words of its title.
 *
 * `by` is the publisher by the name a teacher knows it by — WHO, NICE,
 * 文部科学省 — rather than the full 世界保健機関（WHO）, plus the document's
 * type or number where the title alone would not say which document it is.
 * That makes every short name the example path cites (「出典：WHO
 * ファクトシート」, 「NICE NG134」, …) findable in the strip: the first two
 * are the prefix, and mhGAP and 生徒指導提要 are in the titles.
 *
 * `label` is what is shown of the title, and it must be the title's own
 * opening words — the check below fails the build otherwise. The rest of the
 * title is still in the link, visually hidden, so a screen reader hears the
 * full title and the name it hears contains the words on screen (WCAG 2.5.3,
 * which is also what lets a voice-control user say the link). A reader
 * searching for the document can search for the words they see.
 */
const CITE: Record<PublishedSourceId, { by: string; label: string }> = {
  who_adolescent_mh: { by: "WHO ファクトシート", label: "Mental health of adolescents" },
  nice_ng134: { by: "NICE NG134", label: "Depression in children and young people" },
  who_mhgap: { by: "WHO", label: "mhGAP Intervention Guide" },
  mext_seitoshido: { by: "文部科学省", label: "生徒指導提要（改訂版）" },
};

for (const s of SOURCES) {
  if (!s.title.startsWith(CITE[s.id].label)) {
    throw new Error(
      `Technology: the short title for ${s.id} is not the start of its title in lib/ontologySeed.ts`,
    );
  }
}

/*
 * The sources as a citation strip, not a list: the four of them were a
 * bordered list of full titles and full publisher names, about 375px tall
 * at desktop, and the section's claim is carried by the graph and the
 * counts above, not by the bibliography. Two columns of two lines each —
 * publisher and year small and muted, the title as the link — about 93px;
 * one column on a phone.
 *
 * The item's type size is set on the <li>, not only on the link: the link
 * is inline, and an inline box cannot make its line shorter than the
 * block's own strut, which would otherwise be the body's 18px at 1.6.
 *
 * The first column is `auto`, sized to its entries, so the second gets the
 * rest of the row: NICE's is the longest title shown, and that is what
 * keeps it on one line down to about the narrowest desktop width (it wraps
 * a word early where a scrollbar takes its 15px there, which is harmless).
 *
 * Links open in a new tab, and say so to a screen reader: the reader is
 * checking a claim and should not lose their place on the page to do it.
 * mark-1 underlined, the site's link style — 5.44:1 on the page ground,
 * 4.98:1 where ScrollWash's blue is at its densest; the muted heading,
 * prefix and disclaimer are 6.25:1 and 5.72:1 on the same two. The arrow
 * is the same mark-1, and the last word travels with it (whitespace-nowrap)
 * so a wrapped title never leaves the arrow alone on a line.
 */
function Sources() {
  return (
    <div className="grid gap-5 lg:grid-cols-[5fr_7fr] lg:gap-12">
      <div>
        <h3 className="text-[0.8rem] font-medium tracking-[0.02em] text-muted">
          参照している公開資料
        </h3>
        {/*
          The non-endorsement line, word for word as the company set it. It
          sits under the heading rather than at the foot of the list so that
          it is read before the institutions' names are, not after.

          One line wherever it fits, which is everywhere but a phone. On a
          phone it runs a character or two past the measure (about 343px of
          text in 327 at 375px wide), and plain wrapping left 「ん。」 alone
          on the second line. break-keep lets it break only after its
          punctuation, and text-balance picks the break that evens the two
          lines: after 「推奨・」. Even from 「Blesc」 to the end, unbroken,
          it is about 250px, so a 320px screen cannot overflow.
        */}
        <p className="mt-1.5 text-balance break-keep text-[0.75rem] leading-[1.6] text-muted">
          掲載の各機関は、Blescを推奨・承認するものではありません。
        </p>
      </div>

      <div>
        <ol
          className="grid gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-10 sm:gap-y-4"
          role="list"
        >
          {SOURCES.map((s) => {
            const { by, label } = CITE[s.id];
            const cut = label.lastIndexOf(" ") + 1;
            return (
              <li key={s.id} className="min-w-0 text-[0.875rem] leading-[1.45]">
                <span className="block text-[0.75rem] leading-[1.5] tabular-nums text-muted">
                  {by}・{s.year}
                </span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/src text-mark-1 underline decoration-mark-1/40 underline-offset-2 transition-colors duration-300 hover:decoration-mark-1"
                >
                  {label.slice(0, cut)}
                  <span className="whitespace-nowrap">
                    {label.slice(cut)}
                    <Icon
                      name="arrow_outward"
                      size={12}
                      className="ml-0.5 inline-block align-[-0.1em] transition-[translate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/src:translate-x-px group-hover/src:-translate-y-px motion-reduce:transition-none"
                    />
                  </span>
                  <span className="sr-only">
                    {s.title.slice(label.length)}（新しいタブで開きます）
                  </span>
                </a>
              </li>
            );
          })}
        </ol>

        {/*
          Every relation, with its direction, its type and what supports it.
          Collapsed, so the section stays short for the reader who takes the
          counts on trust; native <details>, so it opens without hydration
          and a crawler reads it closed. The same open/close mark as the
          FAQ, in the section's own ink.

          This is also the figure's text equivalent: which area each concept
          is in (what the discs show), and every relation with what the seed
          records for it (what the lines show). Every concept in the picture
          is in both.
        */}
        <details className="group mt-6">
          <summary className="flex cursor-pointer list-none items-baseline gap-4 py-2 text-[0.95rem] font-medium text-ink transition-opacity duration-300 hover:opacity-70 motion-reduce:transition-none">
            <span className="flex-1">
              {COUNTS.relations}のつながりと、それぞれの出典
            </span>
            <span
              aria-hidden
              className="relative mt-2 h-[1px] w-4 shrink-0 bg-ink before:absolute before:inset-0 before:bg-ink before:transition-transform before:duration-300 motion-reduce:before:transition-none before:content-[''] before:[transform:rotate(90deg)] group-open:before:[transform:rotate(0deg)]"
            />
          </summary>

          <div className="pt-4 pb-2">
            {/*
              Membership first, because it is what the discs draw and the
              relation rows below do not say. The note under it is where the
              "40 / 50" of older notes is accounted for: those are these
              per-area figures added up, and the overlap is the difference.
            */}
            <h4 className="text-[0.8rem] font-medium text-ink">領域ごとの概念</h4>
            <dl className="mt-2 divide-y divide-line">
              {SUBGRAPH_ORDER.map((s) => {
                const concepts = conceptsIn(s);
                return (
                  <div key={s} className="py-2 text-[0.85rem] leading-snug">
                    <dt className="font-medium text-ink">
                      {SUBGRAPHS[s].label}（{concepts.length}）
                    </dt>
                    <dd className="mt-0.5 text-muted">
                      {concepts.map((n) => n.label_ja).join("、")}
                    </dd>
                  </div>
                );
              })}
            </dl>
            {/*
              No subtraction is implied, on purpose: 40 − 9 is not 28,
              because three of the nine are in all three areas. The sentence
              says why the totals differ, not by how much.
            */}
            <p className="measure-jp mt-1.5 text-[0.8rem] text-muted">
              3領域の概念を合わせると延べ{COUNTS.conceptsDeclared}
              、つながりは延べ{COUNTS.relationsDeclared}
              です。複数の領域に含まれる概念（{COUNTS.sharedConcepts}
              ）とつながり（{COUNTS.sharedRelations}
              ）を領域ごとに数えているためで、重複を除くと概念
              {COUNTS.concepts}、つながり{COUNTS.relations}です。
            </p>

            <h4 className="mt-7 text-[0.8rem] font-medium text-ink">
              公開資料を出典として関連を記録（{COUNTS.supported}）
            </h4>
            <RelationList edges={SUPPORTED} />

            <h4 className="mt-7 text-[0.8rem] font-medium text-ink">
              公開資料の裏付けなし（{COUNTS.unsupported}）
            </h4>
            <p className="measure-jp mt-1.5 text-[0.8rem] text-muted">
              社内の判断によるつながりです。うち{COUNTS.unsupportedCitingSource}
              件は{CONSULTED.join("・")}
              を参照していますが、つながりそのものを示す記述ではないため、こちらに含めています。
            </p>
            <RelationList edges={UNSUPPORTED} />

            <p className="measure-jp mt-6 text-[0.8rem] text-muted">
              矢印はグラフ上の向きです。どの出典も、向き（どちらが原因か）までは裏付けていません。
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}

function RelationList({ edges }: { edges: readonly SeedEdge[] }) {
  return (
    <ul className="mt-2 divide-y divide-line" role="list">
      {edges.map((e) => {
        const refs = publishedRefs(e.source_refs).map((s) => s.short);
        const supported = e.evidence_strength === "association";
        return (
          <li
            key={`${e.from}-${e.to}-${e.relation}`}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2 text-[0.85rem] leading-snug"
          >
            <span className="text-ink">
              {NODE_BY_ID[e.from].label_ja}
              <span aria-hidden className="mx-1.5 text-muted">
                {RELATION[e.relation].mark}
              </span>
              <span className="sr-only">{RELATION[e.relation].spoken}</span>
              {NODE_BY_ID[e.to].label_ja}
            </span>
            {refs.length > 0 && (
              <span className="text-[0.8rem] text-muted">
                {supported ? refs.join("・") : `参照：${refs.join("・")}`}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
