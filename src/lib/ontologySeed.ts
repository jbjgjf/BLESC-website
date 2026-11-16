/**
 * Blesc's curated ontology seed, as data — a snapshot, not a live import.
 *
 * Upstream (github.com/jbjgjf/BLESC, main):
 *   sentra/backend/app/ontology/seed/sleep.yaml
 *   sentra/backend/app/ontology/seed/social_withdrawal.yaml
 *   sentra/backend/app/ontology/seed/academic_pressure.yaml
 *   sentra/backend/app/ontology/sources.py   (the source registry)
 *
 * Copied from those files as they stood on 2026-09-30. Nothing links the two
 * repositories, so an edit upstream does NOT reach this page: when the seed
 * changes, regenerate this file from the YAML rather than editing it by hand
 * — and then re-apply the citation corrections below, unless upstream has
 * made them by then. The per-edge scope notes — what each source supports
 * and what it does not — live upstream and are not copied; they are prose
 * for reviewers, and this page only needs the fields below.
 *
 * THIS SNAPSHOT DIFFERS FROM UPSTREAM ON CITATIONS (2026-11-16). Every
 * relation that cites a published source was checked against the source
 * itself: the WHO fact sheet as dated 1 September 2025; NICE NG134 through
 * the UK Government Web Archive's copy of 2026-05-07 (nice.org.uk refuses
 * automated fetches); mhGAP-IG 2.0; 生徒指導提要（改訂版）; and
 * 厚生労働省「健康づくりのための睡眠ガイド2023」. Of the fifteen relations
 * then recorded as association, seven cited nothing that says them, seven
 * were only partly supported, and one was supported as cited. Where the
 * cited source does not say what the relation says, the citation was changed
 * here by hand, and upstream needs the same fix — jbjgjf/BLESC,
 * sentra/backend/app/ontology: the three seed files, and sources.py, which
 * has no entry for the MHLW sleep guide (its one MHLW entry, mhlw_kokoro,
 * is a different document). Page numbers are the documents' printed ones.
 * Two mhGAP passages are given by section alone: they were read in WHO's
 * text extract, which does not settle which printed page they fall on.
 *   sleep_deprivation → cognitive_impairment
 *       WHO fact sheet → MHLW guide (p.1 attention and judgement; p.17)
 *   cognitive_impairment → depressed_mood
 *       NICE NG134, WHO fact sheet → mhGAP (DEP 1 p.22; CMH p.80)
 *   sleep_deprivation → depressed_mood
 *       WHO fact sheet, NICE NG134 → MHLW guide (p.15, 抑うつ傾向)
 *   sleep_deprivation → irritability
 *       WHO fact sheet → MHLW guide (p.1, 情動不安定)
 *   depressed_mood → sleep_deprivation
 *       NICE NG134 → mhGAP (DEP 1 p.22), MHLW guide (p.1)
 *   depressed_mood → social_withdrawal
 *       NICE NG134 → mhGAP (CMH Table 1, adolescents)
 *   depressed_mood ⇄ anxiety (co_occurs)
 *       WHO fact sheet → NICE NG134 (Context)
 *   regular_sleep_schedule ⊣ sleep_deprivation
 *       WHO fact sheet → MHLW guide (p.16)
 *   trusted_adult_contact ⊣ depressed_mood
 *       mhGAP, 生徒指導提要 → mhGAP (DEP 2.2–2.3)
 *   peer_conflict → social_withdrawal
 *       WHO fact sheet, 生徒指導提要 → 生徒指導提要 (pp.124, 138, 223)
 *   family_support ⊣ depressed_mood
 *       WHO fact sheet → WHO fact sheet, NICE NG134 (1.3.1, family discord)
 *   loneliness → depressed_mood
 *       WHO fact sheet, association → no source, expert_judgement
 *   peer_friendship ⊣ loneliness
 *       WHO fact sheet, association → no source, expert_judgement
 * The last two have nothing in the cited source behind them and no other
 * source was found, so they are recorded the way upstream records any
 * unsourced relation. That moves the counts: 13 relations are association
 * (was 15) and 29 have no published source (was 27). Unchanged and kept as
 * upstream has them: depressed_mood → anhedonia (NICE NG134, supported) and
 * peer_conflict → anxiety (WHO fact sheet, partly — see below). The
 * concepts' own source_refs are upstream's, unchanged; the page prints no
 * concept's sources, only relations'.
 *
 * Not done here, for upstream's curator to decide, because each would move
 * a relation from no source to association: the MHLW guide also states
 * sleep_deprivation → fatigue (p.1), late_night_screen_use →
 * sleep_deprivation and all_nighter_studying → sleep_deprivation (p.16), and
 * in part sleep_deprivation → school_absence (p.16) and cognitive_impairment
 * → academic_difficulty (p.1); the WHO fact sheet states social_withdrawal →
 * loneliness ("Social withdrawal can exacerbate isolation and loneliness").
 *
 * WHY THIS FILE EXISTS. テクノロジー used to draw an illustration: twelve
 * constructs, nine of which were not in Blesc's ontology at all, and a legend
 * calling every line a causal link. A reviewer called it "vibecoded" with
 * "literally zero validation", and the fair reading is that it was — it was a
 * picture of what an ontology might look like. This is the real one, so the
 * figure, the counts in the copy and the source list are all read off the
 * same data and cannot overstate it.
 *
 * HOW THE THREE FILES WERE MERGED. Nine concepts and seven relations appear
 * in more than one file, on purpose — the upstream headers explain why (a
 * chain has to be traversable inside one loaded subgraph). They are stated
 * identically in every file (checked field by field when this was generated:
 * same label, category and source_refs for a node; same relation type,
 * evidence_strength and source_refs for an edge), so each is ONE concept or
 * ONE relation here, with every subgraph it appears in listed on it. Nodes
 * are de-duplicated on id and edges on (from, to, relation), which is the
 * merge the upstream files themselves specify. Concatenating instead would
 * count one reading of NG134 twice.
 *
 * That is why the counts below are not the "40 nodes / 50 edges" in the
 * company's decision record and docs/claims.md §4: 12 + 13 + 15 = 40 and
 * 15 + 17 + 18 = 50 are the per-file totals added up, shared entries
 * included. The distinct counts are 28 concepts and 42 relations. The nine
 * shared concepts are declared 21 times across the files (six in two files,
 * three in all three) — twelve declarations more than there are concepts —
 * so 40 − 12 = 28; the seven shared relations are declared 15 times (six in
 * two files, one in all three) — eight more — so 50 − 8 = 42. The page
 * prints both: the distinct counts as the headline figures, and the per-file
 * totals, with the overlap that separates them, in the list under the
 * section. COUNTS computes all of them from the arrays below.
 *
 * THE TWO FIELDS THAT MATTER FOR WHAT THE PAGE MAY SAY.
 *   evidence_strength — "association" when the curator recorded a cited
 *     source as reporting the two things together; "expert_judgement" when
 *     no published source supports the relation (sources.py: "Author
 *     judgement. No published source identified."). There is no stronger
 *     value: nothing in the seed is sourced as causal, even where the
 *     relation type is `causes` (the graph models a direction; the seed
 *     records, at most, that a source reports the two together — even
 *     where the source itself states a direction, as the MHLW guide does;
 *     see below).
 *   source_refs — what was consulted. Four relations cite 生徒指導提要 and
 *     are still expert_judgement, because the guideline describes what a
 *     school does, not the relation itself. So "cites a published source"
 *     (17) and "recorded as association" (13) are different numbers, and
 *     the page uses the second.
 *
 * WHAT THE PAGE SAYS ABOUT THE SOURCES, AND WHY IT IS WORDED AS A RECORD.
 * "association" is a reading of each source — upstream's curator's, and
 * since 2026-11-16 checked here against the sources themselves (above). It
 * means the source reports the two things together. Several of the thirteen
 * are partial, the source naming a broader or neighbouring term rather than
 * the concept itself: 情動不安定 for いらだち・情動反応の高まり, sleep
 * problems ("disturbed sleep or sleeping too much") for 睡眠不足, "often
 * wanting to be alone or stay home" for 人との関わりを避ける, bullying as a
 * risk to mental health rather than to 不安 in particular, isolation and
 * long absence rather than withdrawal, and family discord as a risk rather
 * than family support as a buffer. None of it is recorded as a direction,
 * though one source does state one — the MHLW guide says sleep deprivation
 * affects attention and judgement (p.1) and is reported to strengthen
 * 抑うつ傾向 (p.15); the seed has no value for that, and the page claims no
 * direction for any relation. The page therefore says what the seed
 * RECORDS — 「公開資料を出典として関連を記録」, 「出典：」, and in English
 * "association recorded with a published source", "Source:" — and never
 * that a source "reports" or "shows" a relation.
 *
 * THE TWO LANGUAGES. Every concept carries upstream's own two labels,
 * label_ja and label_en, and the English page prints label_en as it stands:
 * lower case, and with upstream's spelling ("counsellor"), because a label
 * reworded here would be a second, uncurated reading of the concept. All 28
 * pairs were compared with the three YAML files on main on 2026-10-11 and
 * match character for character; every node upstream has both labels. What
 * upstream does not carry in two languages — the three areas' names, the
 * short names of the sources and the English titles of the two Japanese
 * documents — is written here, on the entry it belongs to.
 */

import type { Locale } from "@/lib/i18n";

/* -------------------------------------------------------------------------- */
/* Vocabulary                                                                 */
/* -------------------------------------------------------------------------- */

/** Keyed by upstream file name; `upstreamId` is the file's own subgraph_id. */
export type SubgraphId = "sleep" | "social_withdrawal" | "academic_pressure";

/** The five node categories upstream's validator allows, and no others. */
export type Category = "Trigger" | "State" | "Behavior" | "Event" | "Protective";

/** The six relation types upstream's validator allows, and no others. */
export type Relation =
  | "causes"
  | "escalates"
  | "precedes"
  | "buffers"
  | "co_occurs"
  | "avoids";

export type EvidenceStrength = "association" | "expert_judgement";

/**
 * The registry ids the seed actually uses. sources.py holds more, and does
 * not hold mhlw_sleep_guide, which is this snapshot's own (see the header).
 */
export type SourceId =
  | "who_adolescent_mh"
  | "nice_ng134"
  | "who_mhgap"
  | "mext_seitoshido"
  | "mhlw_sleep_guide"
  | "expert_judgement";

export type PublishedSourceId = Exclude<SourceId, "expert_judgement">;

export type SeedNode = {
  id: string;
  label_ja: string;
  label_en: string;
  category: Category;
  /** Every subgraph file the concept is declared in. */
  subgraphs: readonly SubgraphId[];
  source_refs: readonly SourceId[];
};

export type SeedEdge = {
  from: string;
  to: string;
  relation: Relation;
  evidence_strength: EvidenceStrength;
  source_refs: readonly SourceId[];
  /** Every subgraph file the relation is declared in. */
  subgraphs: readonly SubgraphId[];
};

/* -------------------------------------------------------------------------- */
/* Subgraphs                                                                  */
/* -------------------------------------------------------------------------- */

/*
 * The areas' names are the page's, in both languages: upstream names a
 * subgraph by its id and a sentence of description, not by a label.
 */
export const SUBGRAPHS: Record<
  SubgraphId,
  { upstreamId: string; label: Record<Locale, string> }
> = {
  sleep: {
    upstreamId: "sleep_deprivation",
    label: { ja: "睡眠", en: "Sleep" },
  },
  social_withdrawal: {
    upstreamId: "social_withdrawal",
    label: { ja: "社会的ひきこもり", en: "Social withdrawal" },
  },
  academic_pressure: {
    upstreamId: "academic_pressure",
    label: { ja: "学業上の負荷", en: "Academic pressure" },
  },
};

/** Page order: the chain the page illustrates lives in 睡眠, so it leads. */
export const SUBGRAPH_ORDER: readonly SubgraphId[] = [
  "sleep",
  "social_withdrawal",
  "academic_pressure",
];

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

export type PublishedSource = {
  id: PublishedSourceId;
  /** In Japanese. Not printed: the page cites by `short` and its own prefix. */
  publisher: string;
  /** The document's own title, in the language it was published in. */
  title: string;
  /** The language of the document, and so of `title`. */
  lang: Locale;
  /**
   * An English title for a document that is not in English, for the English
   * page: a gloss, or the title of the publisher's own English edition where
   * there is one. Either way the document cited is still `title`, and the
   * page keeps it in the link's name.
   */
  title_en?: string;
  /** What kind of document, where the title does not already say. In Japanese; not printed. */
  kind?: string;
  /** Publication year, or the year of the version consulted. */
  year: number;
  url: string;
  /** How a relation's citation is written beside it, in each language. */
  short: Record<Locale, string>;
};

/**
 * The five published sources the seed cites: the three international ones
 * first, then Japan's two. Titles are the documents' own, so a reader can
 * search for them.
 *
 * The last two are in this order for テクノロジー's source strip, which sets
 * them in two columns, the first sized to its entries: the MHLW guide's long
 * Japanese title falls in the second column, where there is room for it,
 * and 生徒指導提要's short one in the first, which so stays as narrow on the
 * Japanese page as it was with four.
 *
 * Years: the WHO fact sheet is revised in place, and the version consulted
 * (sources.py records retrieval on 2026-08-09) is the one dated 1 September
 * 2025 — the date the live page still carries on 2026-11-16; NG134 is 2019,
 * as sources.py cites it; mhGAP-IG v2.0 is the 2016 second version, which is
 * what ISBN 978-92-4-154979-0 identifies (WHO's page shows it dated 24 June
 * 2019, its upload date there); 生徒指導提要 is the revision published in
 * 令和4年12月, i.e. December 2022; the MHLW guide is dated 令和6年2月 on its
 * cover (with a partial correction of 令和6年9月18日 in the PDF), so 2024,
 * though its title says 2023.
 *
 * URLs are sources.py's, with two exceptions. The registry points 文部科学省
 * at the 生徒指導 index page, and this links the 改訂版 page on it, which is
 * the document actually cited — the index also links the superseded 2010
 * edition, and a reader checking the claim should land on the right one.
 * Checked on 2026-09-30: that page's heading is 「生徒指導提要（改訂版）」
 * and it dates the revision to 令和4年12月. And the MHLW guide is not in
 * sources.py at all: it links the original document, the 51-page PDF on
 * MHLW's site, which MHLW's sleep page links under the guide's heading
 * (https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/suimin/index.html).
 * Its title is written as MHLW's page and the PDF's metadata write it, with
 * no space before 2023 (the cover sets one). Its title_en is MHLW's own: the
 * ministry publishes an English edition, "Sleep Guide for Health Promotion
 * 2023" (https://www.mhlw.go.jp/content/001732662.pdf). The link stays on
 * the Japanese original, which is the document the page numbers in the
 * header refer to.
 *
 * This list names institutions whose published material Blesc uses. It is
 * not an endorsement by any of them, and the page says so in words. No logos:
 * WHO and NICE both restrict use of their emblems and any implied
 * endorsement, and a logo row is exactly what implies one.
 */
export const SOURCES: readonly PublishedSource[] = [
  {
    id: "who_adolescent_mh",
    publisher: "世界保健機関（WHO）",
    title: "Mental health of adolescents",
    lang: "en",
    kind: "ファクトシート",
    year: 2025,
    url: "https://www.who.int/news-room/fact-sheets/detail/adolescent-mental-health",
    short: { ja: "WHO ファクトシート", en: "WHO fact sheet" },
  },
  {
    id: "nice_ng134",
    publisher: "英国国立医療技術評価機構（NICE）",
    title:
      "Depression in children and young people: identification and management",
    lang: "en",
    kind: "NICEガイドライン NG134",
    year: 2019,
    url: "https://www.nice.org.uk/guidance/ng134",
    short: { ja: "NICE NG134", en: "NICE NG134" },
  },
  {
    id: "who_mhgap",
    publisher: "世界保健機関（WHO）",
    // The full title, as WHO's page gives it (heading and subtitle).
    title:
      "mhGAP Intervention Guide for mental, neurological and substance use disorders in non-specialized health settings, version 2.0",
    lang: "en",
    year: 2016,
    url: "https://www.who.int/publications/i/item/9789241549790",
    short: { ja: "WHO mhGAP", en: "WHO mhGAP" },
  },
  {
    id: "mhlw_sleep_guide",
    publisher: "厚生労働省",
    title: "健康づくりのための睡眠ガイド2023",
    lang: "ja",
    title_en: "Sleep Guide for Health Promotion 2023",
    year: 2024,
    url: "https://www.mhlw.go.jp/content/001305530.pdf",
    // "MHLW" in the English one, as "MEXT" in the next: whose guide it is.
    short: { ja: "厚生労働省 睡眠ガイド", en: "MHLW Sleep Guide" },
  },
  {
    id: "mext_seitoshido",
    publisher: "文部科学省",
    title: "生徒指導提要（改訂版）",
    lang: "ja",
    title_en: "Student Guidance Guidelines (revised)",
    year: 2022,
    url: "https://www.mext.go.jp/a_menu/shotou/seitoshidou/1404008_00001.htm",
    // "MEXT" in the English one: the title alone does not say whose it is.
    short: { ja: "生徒指導提要", en: "MEXT Student Guidance Guidelines" },
  },
];

export const SOURCE_BY_ID = Object.fromEntries(
  SOURCES.map((s) => [s.id, s]),
) as Record<PublishedSourceId, PublishedSource>;

/** Published sources on a relation, in SOURCES order; expert_judgement dropped. */
export function publishedRefs(refs: readonly SourceId[]): PublishedSource[] {
  return SOURCES.filter((s) => refs.includes(s.id));
}

/* -------------------------------------------------------------------------- */
/* The seed                                                                   */
/* -------------------------------------------------------------------------- */

/*
 * Generated from the three YAML files, in the order sleep, social_withdrawal,
 * academic_pressure — each file's new entries after the previous file's — so
 * a diff against a regenerated copy stays readable.
 */
export const NODES: readonly SeedNode[] = [
  { id: "sleep_deprivation", label_ja: "睡眠不足", label_en: "sleep deprivation", category: "Trigger", subgraphs: ["sleep", "academic_pressure"], source_refs: ["who_adolescent_mh"] },
  { id: "late_night_screen_use", label_ja: "夜更かし・就寝前のスマホ", label_en: "late-night screen use", category: "Behavior", subgraphs: ["sleep"], source_refs: ["expert_judgement"] },
  { id: "cognitive_impairment", label_ja: "認知機能の低下", label_en: "reduced concentration and memory", category: "State", subgraphs: ["sleep", "academic_pressure"], source_refs: ["who_adolescent_mh"] },
  { id: "depressed_mood", label_ja: "抑うつ傾向", label_en: "depressed mood", category: "State", subgraphs: ["sleep", "social_withdrawal", "academic_pressure"], source_refs: ["nice_ng134", "who_adolescent_mh"] },
  { id: "irritability", label_ja: "いらだち・情動反応の高まり", label_en: "irritability and heightened emotional reactivity", category: "State", subgraphs: ["sleep"], source_refs: ["who_adolescent_mh"] },
  { id: "anxiety", label_ja: "不安", label_en: "anxiety", category: "State", subgraphs: ["sleep", "social_withdrawal", "academic_pressure"], source_refs: ["who_adolescent_mh"] },
  { id: "fatigue", label_ja: "疲労感", label_en: "fatigue", category: "State", subgraphs: ["sleep"], source_refs: ["nice_ng134"] },
  { id: "academic_difficulty", label_ja: "学業のつまずき", label_en: "difficulty keeping up at school", category: "Event", subgraphs: ["sleep", "academic_pressure"], source_refs: ["mext_seitoshido"] },
  { id: "school_absence", label_ja: "遅刻・欠席", label_en: "lateness or absence", category: "Event", subgraphs: ["sleep", "social_withdrawal"], source_refs: ["mext_seitoshido"] },
  { id: "social_withdrawal", label_ja: "人との関わりを避ける", label_en: "withdrawing from others", category: "Behavior", subgraphs: ["sleep", "social_withdrawal"], source_refs: ["nice_ng134"] },
  { id: "regular_sleep_schedule", label_ja: "規則的な睡眠", label_en: "regular sleep schedule", category: "Protective", subgraphs: ["sleep", "academic_pressure"], source_refs: ["who_adolescent_mh"] },
  { id: "trusted_adult_contact", label_ja: "信頼できる大人とのつながり", label_en: "contact with a trusted adult", category: "Protective", subgraphs: ["sleep", "social_withdrawal", "academic_pressure"], source_refs: ["who_mhgap", "mext_seitoshido"] },
  { id: "help_seeking", label_ja: "相談する・助けを求める", label_en: "asking someone for help", category: "Behavior", subgraphs: ["social_withdrawal"], source_refs: ["mext_seitoshido", "who_mhgap"] },
  { id: "loneliness", label_ja: "孤独感", label_en: "loneliness", category: "State", subgraphs: ["social_withdrawal"], source_refs: ["who_adolescent_mh"] },
  { id: "shame_about_returning", label_ja: "教室に戻りにくさ・引け目", label_en: "shame about going back", category: "State", subgraphs: ["social_withdrawal"], source_refs: ["expert_judgement"] },
  { id: "peer_conflict", label_ja: "いじめ・友人関係のトラブル", label_en: "bullying or trouble with friends", category: "Trigger", subgraphs: ["social_withdrawal"], source_refs: ["who_adolescent_mh", "mext_seitoshido"] },
  { id: "futoko", label_ja: "不登校（年間30日以上の欠席）", label_en: "futoko — administrative non-attendance category, 30+ days per school year", category: "Event", subgraphs: ["social_withdrawal"], source_refs: ["mext_seitoshido"] },
  { id: "peer_friendship", label_ja: "友人とのつながり", label_en: "friendship with peers", category: "Protective", subgraphs: ["social_withdrawal"], source_refs: ["who_adolescent_mh"] },
  { id: "family_support", label_ja: "家庭の支え", label_en: "support at home", category: "Protective", subgraphs: ["social_withdrawal"], source_refs: ["who_adolescent_mh"] },
  { id: "school_counselor_access", label_ja: "スクールカウンセラー等への接続", label_en: "access to a school counsellor or equivalent", category: "Protective", subgraphs: ["social_withdrawal"], source_refs: ["mext_seitoshido"] },
  { id: "exam_pressure", label_ja: "試験・成績へのプレッシャー", label_en: "exam pressure", category: "Trigger", subgraphs: ["academic_pressure"], source_refs: ["mext_seitoshido"] },
  { id: "assignment_deadline", label_ja: "課題の提出期限", label_en: "assignment deadline", category: "Event", subgraphs: ["academic_pressure"], source_refs: ["expert_judgement"] },
  { id: "performance_expectation", label_ja: "成績への期待（家庭・学校から）", label_en: "expectation to do well", category: "Trigger", subgraphs: ["academic_pressure"], source_refs: ["expert_judgement"] },
  { id: "sleep_onset_difficulty", label_ja: "寝つけない・眠りが浅い", label_en: "trouble falling or staying asleep", category: "State", subgraphs: ["academic_pressure"], source_refs: ["expert_judgement"] },
  { id: "anhedonia", label_ja: "興味や楽しさを感じない", label_en: "loss of interest or pleasure", category: "State", subgraphs: ["academic_pressure"], source_refs: ["nice_ng134"] },
  { id: "all_nighter_studying", label_ja: "徹夜・深夜までの勉強", label_en: "studying late into the night", category: "Behavior", subgraphs: ["academic_pressure"], source_refs: ["expert_judgement"] },
  { id: "avoiding_schoolwork", label_ja: "課題に手をつけられない", label_en: "putting off schoolwork", category: "Behavior", subgraphs: ["academic_pressure"], source_refs: ["expert_judgement"] },
  { id: "study_plan_support", label_ja: "学習の見通しを一緒に立てる支援", label_en: "help planning the workload", category: "Protective", subgraphs: ["academic_pressure"], source_refs: ["mext_seitoshido"] },
];

export const EDGES: readonly SeedEdge[] = [
  { from: "sleep_deprivation", to: "cognitive_impairment", relation: "causes", evidence_strength: "association", source_refs: ["mhlw_sleep_guide"], subgraphs: ["sleep", "academic_pressure"] },
  { from: "cognitive_impairment", to: "depressed_mood", relation: "causes", evidence_strength: "association", source_refs: ["who_mhgap"], subgraphs: ["sleep", "academic_pressure"] },
  { from: "sleep_deprivation", to: "depressed_mood", relation: "causes", evidence_strength: "association", source_refs: ["mhlw_sleep_guide"], subgraphs: ["sleep"] },
  { from: "sleep_deprivation", to: "irritability", relation: "causes", evidence_strength: "association", source_refs: ["mhlw_sleep_guide"], subgraphs: ["sleep"] },
  { from: "sleep_deprivation", to: "fatigue", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["sleep"] },
  { from: "depressed_mood", to: "sleep_deprivation", relation: "causes", evidence_strength: "association", source_refs: ["who_mhgap", "mhlw_sleep_guide"], subgraphs: ["sleep"] },
  { from: "cognitive_impairment", to: "academic_difficulty", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["sleep", "academic_pressure"] },
  { from: "sleep_deprivation", to: "school_absence", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["sleep"] },
  { from: "depressed_mood", to: "social_withdrawal", relation: "causes", evidence_strength: "association", source_refs: ["who_mhgap"], subgraphs: ["sleep", "social_withdrawal"] },
  { from: "depressed_mood", to: "anxiety", relation: "co_occurs", evidence_strength: "association", source_refs: ["nice_ng134"], subgraphs: ["sleep"] },
  { from: "irritability", to: "social_withdrawal", relation: "precedes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["sleep"] },
  { from: "regular_sleep_schedule", to: "sleep_deprivation", relation: "buffers", evidence_strength: "association", source_refs: ["mhlw_sleep_guide"], subgraphs: ["sleep", "academic_pressure"] },
  { from: "trusted_adult_contact", to: "depressed_mood", relation: "buffers", evidence_strength: "association", source_refs: ["who_mhgap"], subgraphs: ["sleep", "social_withdrawal", "academic_pressure"] },
  { from: "late_night_screen_use", to: "sleep_deprivation", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["sleep"] },
  { from: "school_absence", to: "social_withdrawal", relation: "co_occurs", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["sleep", "social_withdrawal"] },
  { from: "peer_conflict", to: "anxiety", relation: "causes", evidence_strength: "association", source_refs: ["who_adolescent_mh"], subgraphs: ["social_withdrawal"] },
  { from: "peer_conflict", to: "social_withdrawal", relation: "causes", evidence_strength: "association", source_refs: ["mext_seitoshido"], subgraphs: ["social_withdrawal"] },
  { from: "shame_about_returning", to: "social_withdrawal", relation: "escalates", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["social_withdrawal"] },
  { from: "social_withdrawal", to: "loneliness", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["social_withdrawal"] },
  { from: "loneliness", to: "depressed_mood", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["social_withdrawal"] },
  { from: "social_withdrawal", to: "help_seeking", relation: "avoids", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["social_withdrawal"] },
  { from: "social_withdrawal", to: "trusted_adult_contact", relation: "avoids", evidence_strength: "expert_judgement", source_refs: ["mext_seitoshido"], subgraphs: ["social_withdrawal"] },
  { from: "peer_friendship", to: "loneliness", relation: "buffers", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["social_withdrawal"] },
  { from: "family_support", to: "depressed_mood", relation: "buffers", evidence_strength: "association", source_refs: ["who_adolescent_mh", "nice_ng134"], subgraphs: ["social_withdrawal"] },
  { from: "school_counselor_access", to: "help_seeking", relation: "precedes", evidence_strength: "expert_judgement", source_refs: ["mext_seitoshido"], subgraphs: ["social_withdrawal"] },
  { from: "school_absence", to: "futoko", relation: "precedes", evidence_strength: "expert_judgement", source_refs: ["mext_seitoshido"], subgraphs: ["social_withdrawal"] },
  { from: "social_withdrawal", to: "futoko", relation: "precedes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["social_withdrawal"] },
  { from: "depressed_mood", to: "futoko", relation: "precedes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["social_withdrawal"] },
  { from: "futoko", to: "shame_about_returning", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["social_withdrawal"] },
  { from: "exam_pressure", to: "sleep_deprivation", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["academic_pressure"] },
  { from: "depressed_mood", to: "anhedonia", relation: "causes", evidence_strength: "association", source_refs: ["nice_ng134"], subgraphs: ["academic_pressure"] },
  { from: "exam_pressure", to: "sleep_onset_difficulty", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["academic_pressure"] },
  { from: "sleep_onset_difficulty", to: "sleep_deprivation", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["academic_pressure"] },
  { from: "assignment_deadline", to: "exam_pressure", relation: "escalates", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["academic_pressure"] },
  { from: "performance_expectation", to: "exam_pressure", relation: "escalates", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["academic_pressure"] },
  { from: "academic_difficulty", to: "exam_pressure", relation: "precedes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["academic_pressure"] },
  { from: "exam_pressure", to: "anxiety", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["academic_pressure"] },
  { from: "exam_pressure", to: "all_nighter_studying", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["academic_pressure"] },
  { from: "all_nighter_studying", to: "sleep_deprivation", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["academic_pressure"] },
  { from: "anxiety", to: "avoiding_schoolwork", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["academic_pressure"] },
  { from: "avoiding_schoolwork", to: "academic_difficulty", relation: "precedes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["academic_pressure"] },
  { from: "study_plan_support", to: "exam_pressure", relation: "buffers", evidence_strength: "expert_judgement", source_refs: ["mext_seitoshido"], subgraphs: ["academic_pressure"] },
];

export const NODE_BY_ID = Object.fromEntries(
  NODES.map((n) => [n.id, n]),
) as Record<string, SeedNode>;

/** A concept's name in the page's language: upstream's label, unaltered. */
export const labelOf = (node: SeedNode, locale: Locale): string =>
  locale === "en" ? node.label_en : node.label_ja;

/* -------------------------------------------------------------------------- */
/* What the page may say, derived                                             */
/* -------------------------------------------------------------------------- */

const supported = EDGES.filter((e) => e.evidence_strength === "association");

/** The concepts one subgraph file declares, in NODES order. */
export function conceptsIn(subgraph: SubgraphId): SeedNode[] {
  return NODES.filter((n) => n.subgraphs.includes(subgraph));
}

/** Declarations across the three files, shared entries counted once per file. */
const declared = (items: readonly { subgraphs: readonly SubgraphId[] }[]) =>
  items.reduce((sum, item) => sum + item.subgraphs.length, 0);

/**
 * Every number the section prints, counted here rather than typed there, so
 * a regenerated seed cannot leave the copy describing the old one.
 *
 * concepts and relations are the distinct counts (one entry per id, one per
 * from–to–relation), and are what the page leads with. The *Declared counts
 * are the per-file totals the "40 / 50" in older notes came from; the page
 * prints them with the overlap in the list under the section, so a reader
 * holding the old figure can see where it went.
 */
export const COUNTS = {
  subgraphs: SUBGRAPH_ORDER.length,
  concepts: NODES.length,
  relations: EDGES.length,
  /** 12 + 13 + 15 = 40. */
  conceptsDeclared: declared(NODES),
  /** 15 + 17 + 18 = 50. */
  relationsDeclared: declared(EDGES),
  /** Concepts declared in more than one file (9). */
  sharedConcepts: NODES.filter((n) => n.subgraphs.length > 1).length,
  /** Relations declared in more than one file (7). */
  sharedRelations: EDGES.filter((e) => e.subgraphs.length > 1).length,
  /**
   * evidence_strength "association": the seed records a cited source as
   * reporting the pair together. Upstream's curator's reading, checked
   * against the sources and corrected here on 2026-11-16 — see the header.
   */
  supported: supported.length,
  /** evidence_strength "expert_judgement": no published source supports it. */
  unsupported: EDGES.length - supported.length,
  /**
   * The unsupported relations that nonetheless cite a guideline — consulted,
   * not established. The page names them so that the two lists add up to
   * what the source_refs show.
   */
  unsupportedCitingSource: EDGES.filter(
    (e) =>
      e.evidence_strength === "expert_judgement" &&
      e.source_refs.some((r) => r !== "expert_judgement"),
  ).length,
} as const;

/* -------------------------------------------------------------------------- */
/* The example path                                                           */
/* -------------------------------------------------------------------------- */

const PATH_IDS = ["sleep_deprivation", "cognitive_impairment", "depressed_mood"];

/**
 * 睡眠不足 → 認知機能の低下 → 抑うつ傾向: the chain the page has always used
 * as its example, and which upstream's sleep.yaml was written to encode. Both
 * legs are in the seed, both are "association", and both cite a published
 * source — the MHLW sleep guide for the first, WHO mhGAP for the second.
 *
 * Both citations are this snapshot's correction (2026-11-16; see the header).
 * Upstream cites the WHO fact sheet for the first leg, and it says nothing
 * about sleep and concentration; the MHLW guide does (p.1: sleep deprivation
 * lowers attention and judgement; p.17: enough sleep raises concentration).
 * For the second, upstream cites NICE NG134 and the fact sheet, and neither
 * names reduced concentration; mhGAP lists it among the additional symptoms
 * of depression (DEP 1, p.22; for adolescents, CMH p.80). That is a feature
 * of the same condition, not a direction — upstream already calls this leg
 * the weakest in the chain, its direction a modelling choice — which is why
 * the page says the legs are recorded as association and not as a direction.
 *
 * Resolved against EDGES rather than restated: if either leg ever leaves the
 * seed, this throws at build time instead of the page naming a path that
 * does not exist.
 */
export const EXAMPLE_PATH = {
  nodes: PATH_IDS.map((id) => NODE_BY_ID[id]),
  legs: PATH_IDS.slice(1).map((to, i) => {
    const from = PATH_IDS[i];
    const edge = EDGES.find((e) => e.from === from && e.to === to);
    if (!edge) {
      throw new Error(`ontologySeed: example path leg ${from} → ${to} is not in the seed`);
    }
    return edge;
  }),
};
