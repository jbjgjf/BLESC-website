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
 * changes, regenerate this file from the YAML rather than editing it by hand.
 * The per-edge scope notes — what each source supports and what it does not
 * — live upstream and are not copied; they are prose for reviewers, and this
 * page only needs the fields below.
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
 *     relation type is `causes` (the graph models a direction; the source
 *     reports, at most, a correlation).
 *   source_refs — what was consulted. Four relations cite 生徒指導提要 and
 *     are still expert_judgement, because the guideline describes what a
 *     school does, not the relation itself. So "cites a published source"
 *     (19) and "recorded as association" (15) are different numbers, and
 *     the page uses the second.
 *
 * WHAT THE PAGE SAYS ABOUT THE SOURCES, AND WHY IT IS WORDED AS A RECORD.
 * "association" is the curator's reading of each source, and this snapshot
 * inherits it; it is not re-verified here. Spot-checked on 2026-09-30
 * against the live WHO fact sheet (the 1 September 2025 version, which is
 * also the one sources.py retrieved on 2026-08-09), it holds for some
 * relations — the sheet names bullying, home life and peer relationships
 * among the risks and determinants — and not for others: it says nothing
 * about sleep and concentration, or sleep and irritability, which the seed
 * cites it for (sleep_deprivation → cognitive_impairment, → irritability).
 * NICE blocks automated fetches, so NG134 was not checked. The page
 * therefore says what the seed RECORDS — 「公開資料を出典として関連を記録」,
 * 「出典：」 — and never that WHO or NICE "reports" a relation. Fixing the
 * citations is upstream's job; when it happens, regenerate this file.
 */

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

/** The registry ids the seed actually uses. sources.py holds more. */
export type SourceId =
  | "who_adolescent_mh"
  | "nice_ng134"
  | "who_mhgap"
  | "mext_seitoshido"
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

export const SUBGRAPHS: Record<
  SubgraphId,
  { upstreamId: string; label: string }
> = {
  sleep: { upstreamId: "sleep_deprivation", label: "睡眠" },
  social_withdrawal: { upstreamId: "social_withdrawal", label: "社会的ひきこもり" },
  academic_pressure: { upstreamId: "academic_pressure", label: "学業上の負荷" },
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
  publisher: string;
  title: string;
  /** What kind of document, where the title does not already say. */
  kind?: string;
  /** Publication year, or the year of the version consulted. */
  year: number;
  url: string;
  /** How a relation's citation is written beside it. */
  short: string;
};

/**
 * The four published sources the seed cites, in the order a reader should
 * meet them. Titles are the documents' own, so a reader can search for them.
 *
 * Years: the WHO fact sheet is revised in place, and the version consulted
 * (sources.py records retrieval on 2026-08-09) is the one dated 1 September
 * 2025 — the date the live page still carries on 2026-09-30; NG134 is 2019,
 * as sources.py cites it; mhGAP-IG v2.0 is the 2016 second version, which is
 * what ISBN 978-92-4-154979-0 identifies (WHO's page shows it dated 24 June
 * 2019, its upload date there); 生徒指導提要 is the revision published in
 * 令和4年12月, i.e. December 2022.
 *
 * URLs are sources.py's, with one exception: the registry points 文部科学省
 * at the 生徒指導 index page, and this links the 改訂版 page on it, which is
 * the document actually cited — the index also links the superseded 2010
 * edition, and a reader checking the claim should land on the right one.
 * Checked on 2026-09-30: that page's heading is 「生徒指導提要（改訂版）」
 * and it dates the revision to 令和4年12月.
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
    kind: "ファクトシート",
    year: 2025,
    url: "https://www.who.int/news-room/fact-sheets/detail/adolescent-mental-health",
    short: "WHO ファクトシート",
  },
  {
    id: "nice_ng134",
    publisher: "英国国立医療技術評価機構（NICE）",
    title:
      "Depression in children and young people: identification and management",
    kind: "NICEガイドライン NG134",
    year: 2019,
    url: "https://www.nice.org.uk/guidance/ng134",
    short: "NICE NG134",
  },
  {
    id: "who_mhgap",
    publisher: "世界保健機関（WHO）",
    // The full title, as WHO's page gives it (heading and subtitle).
    title:
      "mhGAP Intervention Guide for mental, neurological and substance use disorders in non-specialized health settings, version 2.0",
    year: 2016,
    url: "https://www.who.int/publications/i/item/9789241549790",
    short: "WHO mhGAP",
  },
  {
    id: "mext_seitoshido",
    publisher: "文部科学省",
    title: "生徒指導提要（改訂版）",
    year: 2022,
    url: "https://www.mext.go.jp/a_menu/shotou/seitoshidou/1404008_00001.htm",
    short: "生徒指導提要",
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
  { from: "sleep_deprivation", to: "cognitive_impairment", relation: "causes", evidence_strength: "association", source_refs: ["who_adolescent_mh"], subgraphs: ["sleep", "academic_pressure"] },
  { from: "cognitive_impairment", to: "depressed_mood", relation: "causes", evidence_strength: "association", source_refs: ["nice_ng134", "who_adolescent_mh"], subgraphs: ["sleep", "academic_pressure"] },
  { from: "sleep_deprivation", to: "depressed_mood", relation: "causes", evidence_strength: "association", source_refs: ["who_adolescent_mh", "nice_ng134"], subgraphs: ["sleep"] },
  { from: "sleep_deprivation", to: "irritability", relation: "causes", evidence_strength: "association", source_refs: ["who_adolescent_mh"], subgraphs: ["sleep"] },
  { from: "sleep_deprivation", to: "fatigue", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["sleep"] },
  { from: "depressed_mood", to: "sleep_deprivation", relation: "causes", evidence_strength: "association", source_refs: ["nice_ng134"], subgraphs: ["sleep"] },
  { from: "cognitive_impairment", to: "academic_difficulty", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["sleep", "academic_pressure"] },
  { from: "sleep_deprivation", to: "school_absence", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["sleep"] },
  { from: "depressed_mood", to: "social_withdrawal", relation: "causes", evidence_strength: "association", source_refs: ["nice_ng134"], subgraphs: ["sleep", "social_withdrawal"] },
  { from: "depressed_mood", to: "anxiety", relation: "co_occurs", evidence_strength: "association", source_refs: ["who_adolescent_mh"], subgraphs: ["sleep"] },
  { from: "irritability", to: "social_withdrawal", relation: "precedes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["sleep"] },
  { from: "regular_sleep_schedule", to: "sleep_deprivation", relation: "buffers", evidence_strength: "association", source_refs: ["who_adolescent_mh"], subgraphs: ["sleep", "academic_pressure"] },
  { from: "trusted_adult_contact", to: "depressed_mood", relation: "buffers", evidence_strength: "association", source_refs: ["who_mhgap", "mext_seitoshido"], subgraphs: ["sleep", "social_withdrawal", "academic_pressure"] },
  { from: "late_night_screen_use", to: "sleep_deprivation", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["sleep"] },
  { from: "school_absence", to: "social_withdrawal", relation: "co_occurs", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["sleep", "social_withdrawal"] },
  { from: "peer_conflict", to: "anxiety", relation: "causes", evidence_strength: "association", source_refs: ["who_adolescent_mh"], subgraphs: ["social_withdrawal"] },
  { from: "peer_conflict", to: "social_withdrawal", relation: "causes", evidence_strength: "association", source_refs: ["who_adolescent_mh", "mext_seitoshido"], subgraphs: ["social_withdrawal"] },
  { from: "shame_about_returning", to: "social_withdrawal", relation: "escalates", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["social_withdrawal"] },
  { from: "social_withdrawal", to: "loneliness", relation: "causes", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["social_withdrawal"] },
  { from: "loneliness", to: "depressed_mood", relation: "causes", evidence_strength: "association", source_refs: ["who_adolescent_mh"], subgraphs: ["social_withdrawal"] },
  { from: "social_withdrawal", to: "help_seeking", relation: "avoids", evidence_strength: "expert_judgement", source_refs: ["expert_judgement"], subgraphs: ["social_withdrawal"] },
  { from: "social_withdrawal", to: "trusted_adult_contact", relation: "avoids", evidence_strength: "expert_judgement", source_refs: ["mext_seitoshido"], subgraphs: ["social_withdrawal"] },
  { from: "peer_friendship", to: "loneliness", relation: "buffers", evidence_strength: "association", source_refs: ["who_adolescent_mh"], subgraphs: ["social_withdrawal"] },
  { from: "family_support", to: "depressed_mood", relation: "buffers", evidence_strength: "association", source_refs: ["who_adolescent_mh"], subgraphs: ["social_withdrawal"] },
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
   * reporting the pair together. The curator's reading, not re-verified —
   * see the header.
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
 * source — WHO for the first, NICE NG134 and WHO for the second. Upstream
 * calls the second leg the weakest link in the chain (NG134 lists reduced
 * concentration as a feature of depression, so the direction is a modelling
 * choice), which is why the page says the legs are recorded as association
 * and not as a direction.
 *
 * NOTE, 2026-09-30: the WHO fact sheet the first leg cites does not mention
 * sleep and concentration (see the header). The page names the citation as
 * the seed records it — 「出典：」 — without saying WHO reports the link, and
 * the upstream citation needs correcting or the example changing.
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
