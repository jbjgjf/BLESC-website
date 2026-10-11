import { OntologyGraph } from "@/components/OntologyGraph";
import { Reveal } from "@/components/Reveal";
import { Icon, Section, SectionTitle } from "@/components/ui";
import type { Locale } from "@/lib/i18n";
import {
  COUNTS,
  EDGES,
  EXAMPLE_PATH,
  NODE_BY_ID,
  SOURCES,
  SUBGRAPHS,
  SUBGRAPH_ORDER,
  conceptsIn,
  labelOf,
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
 *   - The section now opens on what Blesc takes from a diary — only the
 *     change, 「日記から抽出するのは、変化だけです。」 — at the company's
 *     direction, and the graph follows in a paragraph of its own that
 *     begins 「これとは別に」 / "Separately". The separation is the point:
 *     a headline about extraction set straight over this figure would say
 *     the graph does the extracting, which is claim ③ once more. Every
 *     statement in that opening is one the site already makes or
 *     docs/claims.md §1 lists as what the implementation does: change
 *     against the student's own baseline, wording, 入力のためらい and
 *     書き直し, teachers receiving the observation with its time and basis
 *     and never the diary, and no 判定. Nothing in it is new.
 *   - No collaborating institution is named here. docs/claims.md §3 keeps
 *     the one that may be named to its own section, and not beside this
 *     one, where it would read as having built or checked the graph.
 *
 * IN TWO LANGUAGES. `locale` comes down from the page, and every sentence
 * is in COPY below, the English beside the Japanese it has to agree with.
 * The bounds above bind both: the English says "links", says a link is
 * "recorded with a published source" and an "association", and never that a
 * source shows, proves or causes anything. scripts/check-claims.mjs looks
 * for Japanese wording in this section, so the English keeps to the bounds
 * by hand. The concepts' names are upstream's own label_en, unaltered
 * (lib/ontologySeed.ts), and the figure takes its language from the layout
 * (OntologyGraph).
 */

/**
 * The section's words.
 *
 * A function where a sentence carries a number or a name from the seed, so
 * the count is still read from the data and each language puts it where its
 * grammar wants it.
 *
 * How the English was chosen, where it was a choice:
 *   - つながり is "link" and 関連 is "association", kept apart as the
 *     Japanese keeps them: a link is a line in the graph, an association is
 *     what a source is recorded as reporting.
 *   - 社内の判断 is "our own judgment" — the authors', not an expert's.
 *   - 参照 is "consulted", against 出典, "source": a guideline that was read
 *     for a link and does not state it is not that link's source.
 *   - 準備しています is "we are preparing": the clinical review has not
 *     happened, and the English must not read as if it had.
 *   - The FAQ says the same things about the graph (lib/faqEn.ts), and the
 *     two use one set of words for them: 整理 is "organize", まとめる is
 *     "compile", 公開資料に照らして is "checking them against published
 *     sources", and a list takes a comma before its "and". Change one and
 *     change the other.
 */
type Copy = {
  title: string;
  /**
   * In phrases. Each is set as a unit that does not break inside itself
   * until it has to, so a line can only end between two of them: the
   * Japanese wrapped as 「…変化だけで／す。」 when it was one string.
   */
  headline: readonly string[];
  body: string;
  /** The graph's own paragraph: what it is, kept apart from `body`. */
  graph: string;
  counts: { subgraphs: string; concepts: string; relations: string };
  sourced: (supported: number) => string;
  exampleHeading: string;
  /**
   * The citation under a step of the example path, in three parts: what is
   * shown before the clause only a screen reader hears, that clause (which
   * two concepts the citation is for), and what is shown after it.
   */
  exampleSource: (
    from: string,
    to: string,
    refs: readonly string[],
  ) => readonly [before: string, hidden: string, after: string];
  exampleNote: string;
  sourcesHeading: string;
  disclaimer: string;
  /** Publisher and year, over a source's title. */
  byline: (by: string, year: number) => string;
  /** Between an English gloss and the title it glosses, for a screen reader. */
  glossed: string;
  newTab: string;
  listSummary: (relations: number) => string;
  membershipHeading: string;
  /** A heading with its count: an area and its concepts. */
  counted: (label: string, n: number) => string;
  /** Between the names in a list of concepts. */
  conceptJoin: string;
  totals: (c: typeof COUNTS) => string;
  supportedHeading: (n: number) => string;
  unsupportedHeading: (n: number) => string;
  unsupportedNote: (citing: number, consulted: readonly string[]) => string;
  /** The sources beside a relation: its own, or the ones only consulted. */
  refs: (refs: readonly string[], supported: boolean) => string;
  directionNote: string;
};

const COPY: Record<Locale, Copy> = {
  ja: {
    title: "テクノロジー",
    headline: ["日記から抽出するのは、", "変化だけです。"],
    body: "Blescが日記から取り出すのは、本文そのものではなく、その生徒のこれまでと比べた変化です。言葉づかいの変化と、入力のためらいや書き直しといった書きぶりの変化を捉えます。変化だけを抽出するから、先生が日記を読むことはありません。届くのは、観測された変化と、その時刻と根拠だけです。変化が何を意味するかの判定は行わず、判断は先生が行います。",
    graph:
      "これとは別に、心と生活のつながりを公開資料に照らして整理しています。睡眠・社会的ひきこもり・学業上の負荷の3領域について、気分や行動、学校での出来事などの概念どうしのつながりを知識グラフ（オントロジー）にまとめています。つながりの一本ずつに、裏付けとなる公開資料があるかどうかを記録しています。",
    counts: { subgraphs: "領域", concepts: "概念", relations: "つながり" },
    sourced: (supported) =>
      `このうち${supported}のつながりは、公開資料を出典として記録しています。出典のないつながりは社内の判断として区別して明記し、臨床の専門家によるレビューを準備しています。`,
    exampleHeading: "つながりの一例",
    exampleSource: (from, to, refs) => [
      "",
      `${from}と${to}の関連の`,
      `出典：${refs.join("・")}`,
    ],
    exampleNote:
      "いずれも関連として記録したもので、どちらが原因かを示すものではありません。",
    sourcesHeading: "参照している公開資料",
    disclaimer: "掲載の各機関は、Blescを推奨・承認するものではありません。",
    byline: (by, year) => `${by}・${year}`,
    glossed: "",
    newTab: "（新しいタブで開きます）",
    listSummary: (relations) => `${relations}のつながりと、それぞれの出典`,
    membershipHeading: "領域ごとの概念",
    counted: (label, n) => `${label}（${n}）`,
    conceptJoin: "、",
    totals: (c) =>
      `3領域の概念を合わせると延べ${c.conceptsDeclared}、つながりは延べ${c.relationsDeclared}です。複数の領域に含まれる概念（${c.sharedConcepts}）とつながり（${c.sharedRelations}）を領域ごとに数えているためで、重複を除くと概念${c.concepts}、つながり${c.relations}です。`,
    supportedHeading: (n) => `公開資料を出典として関連を記録（${n}）`,
    unsupportedHeading: (n) => `公開資料の裏付けなし（${n}）`,
    unsupportedNote: (citing, consulted) =>
      `社内の判断によるつながりです。うち${citing}件は${consulted.join("・")}を参照していますが、つながりそのものを示す記述ではないため、こちらに含めています。`,
    refs: (refs, supported) =>
      supported ? refs.join("・") : `参照：${refs.join("・")}`,
    directionNote:
      "矢印はグラフ上の向きです。どの出典も、向き（どちらが原因か）までは裏付けていません。",
  },
  en: {
    title: "Technology",
    headline: ["From each diary, we extract only what has changed."],
    body: "What Blesc takes from a diary is not the text itself, but what has changed compared with that student’s own writing so far. It captures changes in wording and changes in how a student writes, such as hesitating before typing or rewriting. Because we extract only the change, teachers never see the diary itself. What reaches them is only the change that was observed, with its time and its basis. Blesc does not assess what a change means. That judgment is made by teachers.",
    graph:
      "Separately, we organize the links between mind and daily life, checking them against published sources. We compile the links between concepts such as mood, behavior, and events at school into a knowledge graph (an ontology), covering three areas: sleep, social withdrawal, and academic pressure. For each link, we record whether a published source supports it.",
    counts: { subgraphs: "Areas", concepts: "Concepts", relations: "Links" },
    sourced: (supported) =>
      `Of these, ${supported} links are recorded with a published source. Links without a source are marked separately as our own judgment, and we are preparing a review by clinical experts.`,
    exampleHeading: "An example of these links",
    exampleSource: (from, to, refs) => [
      refs.length > 1 ? "Sources" : "Source",
      ` for the association between “${from}” and “${to}”`,
      `: ${refs.join(", ")}`,
    ],
    exampleNote:
      "Each is recorded as an association, and does not show which one is the cause.",
    sourcesHeading: "Published sources we refer to",
    disclaimer: "The organizations listed do not recommend or endorse Blesc.",
    byline: (by, year) => `${by} · ${year}`,
    glossed: ", ",
    newTab: " (opens in a new tab)",
    listSummary: (relations) => `The ${relations} links and their sources`,
    membershipHeading: "Concepts by area",
    counted: (label, n) => `${label} (${n})`,
    conceptJoin: "; ",
    totals: (c) =>
      `Added up area by area, the three areas hold ${c.conceptsDeclared} concepts and ${c.relationsDeclared} links. That is because the concepts (${c.sharedConcepts}) and links (${c.sharedRelations}) that belong to more than one area are counted in each of them. With the duplicates removed, there are ${c.concepts} concepts and ${c.relations} links.`,
    supportedHeading: (n) =>
      `Association recorded with a published source (${n})`,
    unsupportedHeading: (n) => `Not supported by a published source (${n})`,
    unsupportedNote: (citing, consulted) =>
      `These links are our own judgment. For ${citing} of them we consulted ${consulted.join(", ")}, but nothing there states the link itself, so they are included here.`,
    refs: (refs, supported) =>
      supported ? refs.join(", ") : `Consulted: ${refs.join(", ")}`,
    directionNote:
      "Arrows show the direction in the graph. No source goes as far as supporting the direction (which one is the cause).",
  },
};

/**
 * Type that differs by language. Each value is a whole run of classes.
 *
 * `prose` is a paragraph's leading. Japanese takes .measure-jp, which opens
 * the lines to 1.9 and tracks them out — right for kana and kanji, too
 * loose for Latin, which reads best nearer 1.65 and can ask the browser for
 * better line endings (text-pretty), there being spaces to break at.
 *
 * `headline` likewise: set at 1.55 in Japanese; the English one runs
 * longer, so it is balanced and set tighter.
 *
 * `disclaimer`: break-keep is what stops the Japanese line breaking inside
 * a phrase. English already breaks only at its spaces, so it takes
 * text-balance alone.
 *
 * `mark` is the verb drawn on a relation's arrow. Japanese may break inside
 * it, as it always could; an English one has spaces in it ("─seen together
 * with─") and must not be split from its arrow, so it does not wrap. Where
 * an English line may then end is RelationList's business (see the <wbr>
 * there).
 */
const TYPE = {
  ja: {
    headline: "leading-[1.55]",
    prose: "measure-jp",
    disclaimer: "text-balance break-keep",
    mark: "mx-1.5 text-muted",
  },
  en: {
    headline: "text-balance leading-[1.35]",
    prose: "text-pretty leading-[1.65]",
    disclaimer: "text-balance",
    mark: "mx-1.5 whitespace-nowrap text-muted",
  },
} as const;

export function Technology({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const type = TYPE[locale];

  return (
    <Section id="technology">
      <Reveal>
        <SectionTitle>{copy.title}</SectionTitle>
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
          <p
            className={`text-[clamp(1.125rem,2vw,1.5rem)] font-medium ${type.headline} tracking-[-0.015em] text-ink`}
          >
            {copy.headline.map((phrase) => (
              <span key={phrase} className="inline-block">
                {phrase}
              </span>
            ))}
          </p>

          <p className={`${type.prose} mt-5 text-[1rem] text-muted`}>
            {copy.body}
          </p>

          {/*
            Its own paragraph, opening 「これとは別に」 / "Separately": the
            lines above are about what is taken from a diary, and the graph
            is not what takes it (see the header).

            「公開資料に照らして」, not 「公開資料から」: most of the relations
            are not from a published source (the count below says how many),
            but every one was checked against the source registry and
            recorded as supported or not. In English that is "checking them
            against", not "drawn from" or "based on".
          */}
          <p className={`${type.prose} mt-4 text-[1rem] text-muted`}>
            {copy.graph}
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
                [copy.counts.subgraphs, COUNTS.subgraphs],
                [copy.counts.concepts, COUNTS.concepts],
                [copy.counts.relations, COUNTS.relations],
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
          <p className={`${type.prose} mt-5 text-[0.9rem] text-muted`}>
            {copy.sourced(COUNTS.supported)}
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

            The sr-only clause sits where each language's sentence wants it:
            before 「出典：」 in Japanese, and in English after the word,
            "Source for the association between … and …: …", so what is on
            screen still reads "Source: …". "Sources" when a step cites two.
          */}
          <h3 className="mt-9 text-[0.8rem] font-medium tracking-[0.02em] text-muted">
            {copy.exampleHeading}
          </h3>
          {/* role="list": see Stagger — WebKit drops unmarked lists. */}
          <ol className="mt-4" role="list">
            {EXAMPLE_PATH.nodes.map((node, i) => {
              const leg = EXAMPLE_PATH.legs[i];
              const [before, hidden, after] = leg
                ? copy.exampleSource(
                    labelOf(node, locale),
                    labelOf(NODE_BY_ID[leg.to], locale),
                    publishedRefs(leg.source_refs).map((s) => s.short[locale]),
                  )
                : [];
              return (
                <li key={node.id} className="flex gap-3.5">
                  <span aria-hidden className="flex flex-col items-center pt-[0.45rem]">
                    <span className="size-2.5 shrink-0 rounded-full bg-ink ring-[3px] ring-accent" />
                    {leg && <span className="mt-1.5 w-px flex-1 bg-line-strong" />}
                  </span>
                  <div className={leg ? "pb-5" : ""}>
                    <span className="text-[0.95rem] font-medium text-ink">
                      {labelOf(node, locale)}
                    </span>
                    {leg && (
                      <p className="mt-1 text-[0.8rem] text-muted">
                        {before}
                        <span className="sr-only">{hidden}</span>
                        {after}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <p className={`${type.prose} mt-4 text-[0.8rem] text-muted`}>
            {copy.exampleNote}
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
        <Sources locale={locale} />
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
 *
 * The English verbs are the Japanese ones, not upstream's type names:
 * 和らげる is "eases", 強める "intensifies", ともに見られる "seen together
 * with"; 先立つ and 遠ざける come out as upstream's own "precedes" and
 * "avoids". `causes` stays a bare arrow and is spoken as "to" — never
 * "causes" or "leads to", which is the reading the note under the list
 * rules out. English is subject–verb–object already, so `spoken` is the
 * verb between two spaces.
 */
const RELATION: Record<
  Locale,
  Record<Relation, { mark: string; spoken: string }>
> = {
  ja: {
    causes: { mark: "→", spoken: "から" },
    escalates: { mark: "─強める→", spoken: "は次を強める：" },
    precedes: { mark: "─先立つ→", spoken: "は次に先立つ：" },
    buffers: { mark: "─和らげる→", spoken: "は次を和らげる：" },
    co_occurs: { mark: "─ともに見られる─", spoken: "とともに見られる：" },
    avoids: { mark: "─遠ざける→", spoken: "は次を遠ざける：" },
  },
  en: {
    causes: { mark: "→", spoken: " to " },
    escalates: { mark: "─intensifies→", spoken: " intensifies " },
    precedes: { mark: "─precedes→", spoken: " precedes " },
    buffers: { mark: "─eases→", spoken: " eases " },
    co_occurs: { mark: "─seen together with─", spoken: " is seen together with " },
    avoids: { mark: "─avoids→", spoken: " avoids " },
  },
};

const SUPPORTED = EDGES.filter((e) => e.evidence_strength === "association");
const UNSUPPORTED = EDGES.filter((e) => e.evidence_strength === "expert_judgement");

/** The guidelines the unsupported relations were checked against. */
const consulted = (locale: Locale) =>
  Array.from(
    new Set(
      UNSUPPORTED.flatMap((e) =>
        publishedRefs(e.source_refs).map((s) => s.short[locale]),
      ),
    ),
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
 *
 * In English `by` is the same name in English — "WHO fact sheet", and MEXT
 * spelled out, since the abbreviation means little outside Japan — and the
 * titles stay as they are: a document is cited under its own title. The one
 * Japanese title is the exception a reader of English needs: the strip shows
 * the seed's gloss of it (title_en) and the link keeps 生徒指導提要（改訂版）
 * after it, visually hidden and marked as Japanese, so the name a screen
 * reader hears still holds the words on screen and the title to search for.
 * The short names the path and the list cite are findable the same way:
 * "WHO fact sheet" and "NICE NG134" are prefixes, mhGAP is in its title,
 * and "MEXT Student Guidance Guidelines" is its prefix and its gloss.
 */
const CITE: Record<
  PublishedSourceId,
  { by: Record<Locale, string>; label: string }
> = {
  who_adolescent_mh: {
    by: { ja: "WHO ファクトシート", en: "WHO fact sheet" },
    label: "Mental health of adolescents",
  },
  nice_ng134: {
    by: { ja: "NICE NG134", en: "NICE NG134" },
    label: "Depression in children and young people",
  },
  who_mhgap: {
    by: { ja: "WHO", en: "WHO" },
    label: "mhGAP Intervention Guide",
  },
  mext_seitoshido: {
    by: { ja: "文部科学省", en: "MEXT (Japan’s Ministry of Education)" },
    label: "生徒指導提要（改訂版）",
  },
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
function Sources({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const type = TYPE[locale];

  return (
    <div className="grid gap-5 lg:grid-cols-[5fr_7fr] lg:gap-12">
      <div>
        <h3 className="text-[0.8rem] font-medium tracking-[0.02em] text-muted">
          {copy.sourcesHeading}
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

          The English line is about 330px in Helvetica Neue and 350 in
          Inter: one line beside the strip, where the column is 373px at its
          narrowest, and one line or two balanced ones on a phone. It needs
          no break-keep (see TYPE).
        */}
        <p
          className={`mt-1.5 ${type.disclaimer} text-[0.75rem] leading-[1.6] text-muted`}
        >
          {copy.disclaimer}
        </p>
      </div>

      <div>
        <ol
          className="grid gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-10 sm:gap-y-4"
          role="list"
        >
          {SOURCES.map((s) => {
            const { by, label } = CITE[s.id];
            /*
              What the strip shows of the title: its opening words, or on
              the English page the gloss of a title that is not in English.
              hrefLang on that link too — the page it opens is Japanese.
            */
            const gloss = locale === "en" ? s.title_en : undefined;
            const shown = gloss ?? label;
            const cut = shown.lastIndexOf(" ") + 1;
            return (
              <li key={s.id} className="min-w-0 text-[0.875rem] leading-[1.45]">
                <span className="block text-[0.75rem] leading-[1.5] tabular-nums text-muted">
                  {copy.byline(by[locale], s.year)}
                </span>
                <a
                  href={s.url}
                  hrefLang={gloss ? s.lang : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/src text-mark-1 underline decoration-mark-1/40 underline-offset-2 transition-colors duration-300 hover:decoration-mark-1"
                >
                  {shown.slice(0, cut)}
                  <span className="whitespace-nowrap">
                    {shown.slice(cut)}
                    <Icon
                      name="arrow_outward"
                      size={12}
                      className="ml-0.5 inline-block align-[-0.1em] transition-[translate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/src:translate-x-px group-hover/src:-translate-y-px motion-reduce:transition-none"
                    />
                  </span>
                  <span className="sr-only">
                    {gloss ? (
                      <>
                        {copy.glossed}
                        <span lang={s.lang}>{s.title}</span>
                      </>
                    ) : (
                      s.title.slice(label.length)
                    )}
                    {copy.newTab}
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
            <span className="flex-1">{copy.listSummary(COUNTS.relations)}</span>
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
            <h4 className="text-[0.8rem] font-medium text-ink">
              {copy.membershipHeading}
            </h4>
            <dl className="mt-2 divide-y divide-line">
              {SUBGRAPH_ORDER.map((s) => {
                const concepts = conceptsIn(s);
                return (
                  <div key={s} className="py-2 text-[0.85rem] leading-snug">
                    <dt className="font-medium text-ink">
                      {copy.counted(SUBGRAPHS[s].label[locale], concepts.length)}
                    </dt>
                    <dd className="mt-0.5 text-muted">
                      {concepts
                        .map((n) => labelOf(n, locale))
                        .join(copy.conceptJoin)}
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
            <p className={`${type.prose} mt-1.5 text-[0.8rem] text-muted`}>
              {copy.totals(COUNTS)}
            </p>

            <h4 className="mt-7 text-[0.8rem] font-medium text-ink">
              {copy.supportedHeading(COUNTS.supported)}
            </h4>
            <RelationList edges={SUPPORTED} locale={locale} />

            <h4 className="mt-7 text-[0.8rem] font-medium text-ink">
              {copy.unsupportedHeading(COUNTS.unsupported)}
            </h4>
            <p className={`${type.prose} mt-1.5 text-[0.8rem] text-muted`}>
              {copy.unsupportedNote(
                COUNTS.unsupportedCitingSource,
                consulted(locale),
              )}
            </p>
            <RelationList edges={UNSUPPORTED} locale={locale} />

            <p className={`${type.prose} mt-6 text-[0.8rem] text-muted`}>
              {copy.directionNote}
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}

function RelationList({
  edges,
  locale,
}: {
  edges: readonly SeedEdge[];
  locale: Locale;
}) {
  const copy = COPY[locale];
  const relation = RELATION[locale];

  return (
    <ul className="mt-2 divide-y divide-line" role="list">
      {edges.map((e) => {
        const refs = publishedRefs(e.source_refs).map((s) => s.short[locale]);
        const supported = e.evidence_strength === "association";
        return (
          <li
            key={`${e.from}-${e.to}-${e.relation}`}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2 text-[0.85rem] leading-snug"
          >
            <span className="text-ink">
              {labelOf(NODE_BY_ID[e.from], locale)}
              <span aria-hidden className={TYPE[locale].mark}>
                {relation[e.relation].mark}
              </span>
              {/*
                English only: somewhere for the line to end. Japanese breaks
                between any two characters; English breaks at its spaces, and
                there is none between a name and the mark, nor (the spoken
                verb being out of flow) between the mark and the next name.
                So the last word of one name, the mark and the first word of
                the next were a single run — "absence─seen together
                with─withdrawing" is 277px in Helvetica Neue and about 293
                in Inter, more than the 272px a 320px phone gives the list,
                so the row ran out of its column into the page's gutter.
                With a break allowed after the mark the longest run is 203px
                (214 in Inter), and a wrapped row reads name–verb, then the
                second name on its own line.
              */}
              {locale === "en" && <wbr />}
              <span className="sr-only">{relation[e.relation].spoken}</span>
              {labelOf(NODE_BY_ID[e.to], locale)}
            </span>
            {refs.length > 0 && (
              <span className="text-[0.8rem] text-muted">
                {copy.refs(refs, supported)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
