/**
 * The illustrated slice of the ontology, as data.
 *
 * Split out of <OntologyGraph> so the テクノロジー copy can set the same
 * chain as text beside the figure that highlights it. The graph is a client
 * component; a server component cannot reach into a "use client" module for
 * a plain value, so the data has to live somewhere both can import. Nothing
 * here renders — it is the single source for both, which is the point: the
 * chain named in the prose and the chain lit in the picture cannot drift
 * apart.
 *
 * (Location is only a function of which directories this change was allowed
 * to add files to; src/lib/ would be the natural home.)
 */

/**
 * Constructs are grouped by domain and coloured by it. The colour is not
 * decoration — an ontology's whole structure is that constructs belong to
 * classes, so showing the classes is showing more of the model, and it is
 * what stops twelve identical grey pills reading as a diagram of nothing.
 */
export const DOMAINS = {
  physical: { label: "生活・身体", color: "var(--mark-3)" },
  cognitive: { label: "認知・学業", color: "var(--mark-1)" },
  affective: { label: "情緒・対人", color: "var(--mark-2)" },
} as const;

export type Domain = keyof typeof DOMAINS;

export type Node = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  domain: Domain;
  lit?: boolean;
};

/**
 * Laid out for a 560x440 frame rather than the 900x440 this used to occupy.
 *
 * The figure now sits in seven of twelve columns beside the section's copy
 * instead of running the full measure, so it renders about 500–560px wide.
 * The label size is fixed at 13 user units and the frame is what scales, so
 * the frame had to lose width for the labels to keep their size: at 560
 * units across they land between 11.1px (at the panel's scroll threshold)
 * and 12.3px (at the widest desktop measure), where the old 900-unit frame
 * would have rendered them at roughly 8px.
 *
 * Nothing was dropped to buy that width — all twelve constructs and all
 * seventeen links are still here, re-placed so the frame is portrait rather
 * than landscape. Every pill keeps at least 20 units of clearance from every
 * other, and no edge passes under a pill that is not one of its endpoints,
 * which is what would otherwise read as a link that isn't there.
 */
export const NODES: Node[] = [
  { id: "rhythm", domain: "physical", label: "生活リズムの乱れ", x: 75, y: 48, w: 128 },
  { id: "sleep", domain: "physical", label: "睡眠不足", x: 108, y: 150, w: 76, lit: true },
  { id: "fatigue", domain: "physical", label: "疲労の蓄積", x: 71, y: 258, w: 89 },
  { id: "appetite", domain: "physical", label: "食欲の変化", x: 77, y: 368, w: 89 },
  { id: "cognition", domain: "cognitive", label: "認知機能の低下", x: 280, y: 100, w: 115, lit: true },
  { id: "focus", domain: "cognitive", label: "集中力の低下", x: 243, y: 208, w: 102 },
  { id: "grades", domain: "cognitive", label: "学業不振", x: 181, y: 312, w: 76 },
  { id: "rumination", domain: "cognitive", label: "反すう思考", x: 394, y: 36, w: 89 },
  { id: "efficacy", domain: "affective", label: "自己効力感の低下", x: 315, y: 346, w: 128 },
  { id: "depression", domain: "affective", label: "抑うつ傾向", x: 465, y: 166, w: 89, lit: true },
  { id: "avoidance", domain: "affective", label: "対人回避", x: 439, y: 290, w: 76 },
  { id: "isolation", domain: "affective", label: "孤立", x: 511, y: 404, w: 50 },
];

/** `lit` marks the chain the section's copy walks through. */
export const EDGES: [string, string, boolean?][] = [
  ["rhythm", "sleep"],
  ["sleep", "cognition", true],
  ["sleep", "fatigue"],
  ["fatigue", "appetite"],
  ["sleep", "focus"],
  ["cognition", "focus"],
  ["cognition", "rumination"],
  ["focus", "grades"],
  ["focus", "efficacy"],
  ["grades", "efficacy"],
  ["rumination", "depression"],
  ["cognition", "depression", true],
  ["efficacy", "depression"],
  ["efficacy", "avoidance"],
  ["depression", "avoidance"],
  ["depression", "isolation"],
  ["avoidance", "isolation"],
];

export const BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<
  string,
  Node
>;

/**
 * The named chain, in the order it is walked. Read off the nodes themselves
 * so moving a pill moves the trace — and the prose beside the figure — with
 * it.
 */
export const TRACE = ["sleep", "cognition", "depression"].map((id) => BY_ID[id]);
