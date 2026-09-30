"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  AREAS,
  FRAME,
  POSITIONS,
  STANDING_LABELS,
  type Placement,
} from "@/components/product/ontology";
import {
  EDGES,
  EXAMPLE_PATH,
  NODES,
  NODE_BY_ID,
  SUBGRAPHS,
  SUBGRAPH_ORDER,
  type SeedNode,
} from "@/lib/ontologySeed";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";

/**
 * Blesc's curated ontology seed, drawn whole: all twenty-eight concepts and
 * all forty-two relations of the three subgraphs in src/lib/ontologySeed.ts
 * (as forty-one lines — one pair is related both ways; see LINES).
 *
 * It used to be a picture of what an ontology might look like — twelve
 * constructs, nine of which the real graph does not contain, on a shell the
 * reader could spin, with every line called a causal link. That is what a
 * reviewer read as "vibecoded", and they were right to. This draws the data
 * the section's copy counts, so the picture and the numbers beside it are
 * the same thing.
 *
 * WHAT IT ENCODES, and nothing else:
 *   - Area, twice: the three discs, and each dot sitting in the region of the
 *     discs whose files declare it (see product/ontology.ts). A concept in
 *     one area takes that area's mark colour; one shared between areas is
 *     ink, since no single area's colour is true of it.
 *   - Support: a solid line where the seed records a published source for
 *     the pair ("association"), a dashed one where it records none and the
 *     relation is the authors' judgement. This is the distinction the
 *     section exists to make visible, so it is the one the lines carry.
 *   - The example path, 睡眠不足 → 認知機能の低下 → 抑うつ傾向, in ink over a
 *     wash of the logo's blue, with its three names standing wherever the
 *     frame is wide enough to set them clear of the other dots.
 * Direction is deliberately not drawn. The seed's relations are directed,
 * but its sources report association; arrowheads on a figure this size read
 * as "leads to" before any caption can say otherwise. The list under the
 * section gives every relation with its direction and type, in words.
 *
 * WHAT WAS REMOVED WITH THE 3D SCENE. The WebGL shell, its flat SVG fallback,
 * the error boundary and the hydration swap between them, and the trace that
 * drew itself along the chain as the page scrolled with a dot riding its
 * head. At forty-odd lines a sphere is unreadable from most angles, and a
 * dot travelling 睡眠不足 → 抑うつ傾向 animates exactly the causal reading
 * the sources do not support. What is left moves only when asked: the
 * figure fades in once, and a pointed-at concept lights its own relations.
 *
 * Everything the drawing shows is text in the section — the counts, the path
 * with the source for each step, the source list, and under it which area
 * each concept is in and every relation — so the drawing itself (discs,
 * lines, names laid over it, legend) is hidden from assistive tech: a screen
 * reader walking forty lines would hear noise.
 *
 * What a pointer can do, a keyboard can too. Once hydrated, the SVG is a
 * single tab stop with the listbox pattern: the arrow keys step through the
 * concepts from left to right, each one named in the same label a pointer
 * gets and announced through aria-activedescendant with the areas and the
 * concepts it is joined to; Escape clears it. The dots are the options, so
 * the announcement and the picture are the same state. Before hydration,
 * and without JavaScript, the SVG is aria-hidden and not focusable — a tab
 * stop that did nothing would be worse than none.
 *
 * Server-rendered as it stands, with nothing swapped after hydration but
 * those attributes: the picture a reader without JavaScript gets is the same
 * one everyone gets, minus the hover.
 */

/* -------------------------------------------------------------------------- */
/* Geometry, derived once                                                     */
/* -------------------------------------------------------------------------- */

const PATH_IDS = EXAMPLE_PATH.nodes.map((n) => n.id);
const ON_PATH = new Set(PATH_IDS);

const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

const PATH_PAIRS = new Set(
  EXAMPLE_PATH.legs.map((leg) => pairKey(leg.from, leg.to)),
);

/**
 * One line per pair of concepts. The seed holds one pair in both directions
 * (睡眠不足 ⇄ 抑うつ傾向, both association — upstream encodes the reverse on
 * purpose), and since the figure draws no direction, two lines would lie on
 * top of each other. A pair is solid if any of its relations is supported.
 */
type Line = { key: string; a: string; b: string; supported: boolean };

const LINES: Line[] = [];
{
  const byPair = new Map<string, Line>();
  for (const edge of EDGES) {
    const key = pairKey(edge.from, edge.to);
    const supported = edge.evidence_strength === "association";
    const line = byPair.get(key);
    if (line) line.supported ||= supported;
    else byPair.set(key, { key, a: edge.from, b: edge.to, supported });
  }
  LINES.push(...byPair.values());
}
const BASE_LINES = LINES.filter((l) => !PATH_PAIRS.has(l.key));
const PATH_LINES = LINES.filter((l) => PATH_PAIRS.has(l.key));

const NEIGHBOURS: Record<string, Set<string>> = Object.fromEntries(
  NODES.map((n) => [n.id, new Set<string>()]),
);
for (const { a, b } of LINES) {
  NEIGHBOURS[a].add(b);
  NEIGHBOURS[b].add(a);
}

/**
 * Dot radius in frame units, by how many concepts it is joined to, so the
 * hubs read as hubs — 睡眠不足 is joined to ten (by eleven relations), most
 * leaves to one. The path's dots are held to a floor so 認知機能の低下,
 * which has only three, still reads as a stop on the path.
 */
const radius = (id: string) =>
  Math.max(ON_PATH.has(id) ? 8 : 0, 4.5 + NEIGHBOURS[id].size * 0.55);

/** One area's mark for a concept only in that area; ink for a shared one. */
const dotColor = (node: SeedNode) =>
  node.subgraphs.length === 1
    ? AREAS[node.subgraphs[0]].color
    : "var(--color-text)";

/** Percentages of the frame, for the HTML laid over the SVG. */
const leftOf = (id: string) => `${(POSITIONS[id][0] / FRAME.width) * 100}%`;
const topOf = (id: string) => `${(POSITIONS[id][1] / FRAME.height) * 100}%`;

const areaNames = (node: SeedNode) =>
  SUBGRAPH_ORDER.filter((s) => node.subgraphs.includes(s))
    .map((s) => SUBGRAPHS[s].label)
    .join("・");

/**
 * The keyboard's order: left to right across the frame, top to bottom where
 * two dots share a column, so the arrow keys move the label the way the
 * eye would.
 */
const KEY_ORDER = NODES.map((n) => n.id).sort(
  (a, b) => POSITIONS[a][0] - POSITIONS[b][0] || POSITIONS[a][1] - POSITIONS[b][1],
);

/**
 * What a screen reader hears for a concept: its name, its areas, its
 * neighbours. And where it sits in the keyboard's order — the options are
 * drawn in seed order, which is not the order the arrows take, so the
 * position is stated rather than left to be counted from the markup.
 */
const SPOKEN: Record<string, string> = Object.fromEntries(
  NODES.map((node) => [
    node.id,
    `${node.label_ja}（${areaNames(node)}）。つながる概念：${KEY_ORDER.filter((id) =>
      NEIGHBOURS[node.id].has(id),
    )
      .map((id) => NODE_BY_ID[id].label_ja)
      .join("、")}`,
  ]),
);
const POSINSET: Record<string, number> = Object.fromEntries(
  KEY_ORDER.map((id, i) => [id, i + 1]),
);

/**
 * False on the server and through hydration, true from the render after —
 * useSyncExternalStore's server snapshot is what makes the two passes agree.
 */
const noSubscribe = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

/*
 * Names are HTML over the drawing rather than SVG text, because SVG text
 * scales with the frame: sized to hold 11px on a 320px phone, it would set
 * at twice that on a desktop. HTML keeps one size at every width.
 *
 * Placed with left/top percentages from the frame and pushed off their dot
 * with Tailwind's translate utilities, which write the `translate` property,
 * not `transform` — so the layout's noscript rule, which clears transforms
 * on anything with a style attribute, leaves them where they are. The
 * offsets clear the largest dot plus the path's blue ring.
 *
 * Every string below is written out in full so Tailwind can see it.
 */
const PLACEMENT: Record<Placement, string> = {
  left: "-translate-x-[calc(100%+0.7rem)] -translate-y-1/2",
  aboveLeft: "-translate-x-[calc(100%+0.5rem)] -translate-y-[calc(100%+0.5rem)]",
  aboveRight: "translate-x-[0.5rem] -translate-y-[calc(100%+0.5rem)]",
  belowRight: "translate-x-[0.5rem] translate-y-[0.5rem]",
};

/**
 * When each kind of standing name is drawn, by the frame's own width — a
 * container query, because the figure is 473–510px wide in the desktop
 * column (a 1024px viewport to the 68rem container's cap), 542px stacked at
 * 640px, its 576px cap from about 675px, and 308px on a 390px phone, so the
 * viewport says little about the room it has. The widths are the ones
 * product/ontology.ts checked placements at.
 */
const STANDING_SIZE = {
  path: "hidden text-[11px] font-medium text-ink @min-[25rem]:block @min-[30rem]:text-[12px]",
  hub: "hidden text-[12px] text-muted @min-[30rem]:block",
} as const;

/**
 * White at 90% under every standing name. The names sit on the discs' tints
 * and across lines, and a pill is what keeps them legible over both: ink on
 * it measures 19.10:1 and muted 6.15:1 even over the three-way overlap,
 * where muted set straight onto the tint would be 5.23:1 and crossed by a
 * line.
 */
const PILL =
  "pointer-events-none absolute whitespace-nowrap rounded-full bg-surface/90 px-1.5 py-[0.2rem] leading-none";

/**
 * The hover label's anchoring. Centred over its dot in the middle fifth of
 * the frame, and started or ended at the dot outside it, so that — capped at
 * 60% of the frame's width, and wrapping inside that on the narrowest phone —
 * it can never run out of the frame on either side. Under the dot for the
 * few concepts at the very top.
 */
const TIP_X = {
  start: "-translate-x-3",
  center: "-translate-x-1/2",
  end: "-translate-x-[calc(100%-0.75rem)]",
} as const;
const TIP_Y = {
  above: "-translate-y-[calc(100%+0.85rem)]",
  below: "translate-y-[0.85rem]",
} as const;

function tipClasses(id: string) {
  const [x, y] = POSITIONS[id];
  const tx =
    x < FRAME.width * 0.4 ? TIP_X.start : x > FRAME.width * 0.6 ? TIP_X.end : TIP_X.center;
  const ty = y < FRAME.height * 0.2 ? TIP_Y.below : TIP_Y.above;
  return `${tx} ${ty}`;
}

/* -------------------------------------------------------------------------- */
/* Figure                                                                     */
/* -------------------------------------------------------------------------- */

export function OntologyGraph() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);
  // The last value handed to setActive, so a pointer moving across the same
  // dot — or across empty panel — sets nothing: state changes only when the
  // pointed-at concept does.
  const current = useRef<string | null>(null);
  const point = (id: string | null) => {
    if (current.current === id) return;
    current.current = id;
    setActive(id);
  };

  const nodeAt = (e: PointerEvent<SVGSVGElement>) =>
    (e.target as Element).closest("[data-node]")?.getAttribute("data-node") ?? null;

  /*
   * A mouse names what it rests on. A finger or a pen has nothing to rest,
   * so a tap names a dot and a second tap, or a tap on empty panel, clears
   * it. pointerup rather than click: a touch that turns into a scroll ends in
   * pointercancel, so scrolling the page across the figure names nothing.
   */
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === "mouse") point(nodeAt(e));
  };
  const onPointerLeave = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === "mouse") point(null);
  };
  const onPointerUp = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === "mouse") return;
    const id = nodeAt(e);
    point(id === current.current ? null : id);
  };

  /*
   * The keyboard. Nothing is chosen on focus — the path's standing names
   * stay up until an arrow is pressed — and the ends do not wrap, so a
   * screen reader hears the last concept rather than being sent back to the
   * first without a word. Leaving the figure clears it, which also gives a
   * tapped label somewhere to go: a tap elsewhere on the page blurs the SVG.
   */
  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    const last = KEY_ORDER.length - 1;
    const i = current.current ? KEY_ORDER.indexOf(current.current) : -1;
    let next: string | null;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = KEY_ORDER[Math.min(i + 1, last)];
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = KEY_ORDER[i < 0 ? last : Math.max(i - 1, 0)];
        break;
      case "Home":
        next = KEY_ORDER[0];
        break;
      case "End":
        next = KEY_ORDER[last];
        break;
      case "Escape":
        if (!current.current) return;
        next = null;
        break;
      default:
        return;
    }
    e.preventDefault();
    point(next);
  };
  const onBlur = (e: FocusEvent<SVGSVGElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) point(null);
  };

  const hydrated = useHydrated();
  const optionId = useId();
  const idOf = (id: string) => `${optionId}-${id}`;

  const lit = active ? NEIGHBOURS[active] : null;
  const lineOn = (l: Line) => !active || l.a === active || l.b === active;
  const nodeOn = (id: string) => !active || id === active || !!lit?.has(id);

  return (
    <figure>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={reduce ? { duration: 0.3, ease: "linear" } : { duration: 0.7, ease: EXPO_OUT }}
        className="@container relative mx-auto aspect-[72/66] w-full max-w-[36rem] select-none font-sans"
      >
        {/*
          The focus ring is the site's own (:focus-visible in globals.css),
          drawn round the SVG's box, which is the frame; a click or a tap
          focuses it without one.
        */}
        <svg
          viewBox={`0 0 ${FRAME.width} ${FRAME.height}`}
          className="absolute inset-0 h-full w-full touch-manipulation"
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onPointerUp={onPointerUp}
          {...(hydrated
            ? {
                role: "listbox",
                tabIndex: 0,
                "aria-label": `知識グラフの図。概念${NODES.length}。矢印キーで概念をひとつずつ選ぶと、名前とつながりを表示します。`,
                "aria-activedescendant": active ? idOf(active) : undefined,
                onKeyDown,
                onBlur,
              }
            : { "aria-hidden": true })}
        >
          {/*
            The discs: a 4.5% wash of each area's mark and an outline at 85%.
            The wash is set by the relation lines (--color-border-strong),
            which have to hold 3:1 where all three discs overlap: 3.11:1 at
            4.5%, where 6% had them at 2.93:1. They are 3.72:1 on the white
            outside. The outline has to hold 3:1 on every ground it crosses
            — white, its own tint, and the overlaps, where it runs through
            the other two discs — and --mark-3 needs 80.5% for that. 85%
            leaves it 3.22:1 at worst; the 75% this used to be only cleared
            the white outside and fell to 2.76:1 in the overlaps.
          */}
          <g aria-hidden>
            {SUBGRAPH_ORDER.map((s) => (
              <circle
                key={s}
                cx={AREAS[s].cx}
                cy={AREAS[s].cy}
                r={AREAS[s].r}
                fill={AREAS[s].color}
                fillOpacity={0.045}
              />
            ))}
            {SUBGRAPH_ORDER.map((s) => (
              <circle
                key={s}
                cx={AREAS[s].cx}
                cy={AREAS[s].cy}
                r={AREAS[s].r}
                fill="none"
                stroke={AREAS[s].color}
                strokeOpacity={0.85}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/*
              Relations. Widths and dashes are screen pixels at every size
              (non-scaling-stroke), so a phone does not get hairlines and a
              desktop does not get ropes.
            */}
            {BASE_LINES.map((l) => (
              <line
                key={l.key}
                x1={POSITIONS[l.a][0]}
                y1={POSITIONS[l.a][1]}
                x2={POSITIONS[l.b][0]}
                y2={POSITIONS[l.b][1]}
                stroke={active && lineOn(l) ? "var(--color-text)" : "var(--color-border-strong)"}
                strokeWidth={l.supported ? 1.25 : 1}
                strokeDasharray={l.supported ? undefined : "3 3"}
                vectorEffect="non-scaling-stroke"
                className={`motion-safe:transition-opacity motion-safe:duration-200 ${
                  lineOn(l) ? "opacity-100" : "opacity-15"
                }`}
              />
            ))}

            {/*
              The example path: a wash of the logo's blue under an ink core.
              The blue is a fill colour at 1.95:1 on white, so it is only the
              highlight; the ink line inside it is what carries the contrast.
              It dims less than the rest when another concept is pointed at —
              it is the one the copy talks about, and should still be there.
            */}
            {PATH_LINES.map((l) => (
              <g
                key={l.key}
                className={`motion-safe:transition-opacity motion-safe:duration-200 ${
                  lineOn(l) ? "opacity-100" : "opacity-40"
                }`}
              >
                <line
                  x1={POSITIONS[l.a][0]}
                  y1={POSITIONS[l.a][1]}
                  x2={POSITIONS[l.b][0]}
                  y2={POSITIONS[l.b][1]}
                  stroke="var(--color-primary)"
                  strokeWidth={8}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1={POSITIONS[l.a][0]}
                  y1={POSITIONS[l.a][1]}
                  x2={POSITIONS[l.b][0]}
                  y2={POSITIONS[l.b][1]}
                  stroke="var(--color-text)"
                  strokeWidth={2.25}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
          </g>

          {/*
            Concepts. Each dot is ringed in the panel's white so that where
            lines converge on a hub the dot still reads as a dot. The larger
            transparent disc behind it is the hit area: a leaf's dot is
            under 4px across on a phone, which no finger can find.

            Each is also an option of the listbox the SVG becomes once
            hydrated, named as the keyboard announces it. While the SVG is
            aria-hidden the roles are inert.
          */}
          {NODES.map((node) => {
            const [cx, cy] = POSITIONS[node.id];
            const r = radius(node.id);
            return (
              <g
                key={node.id}
                id={idOf(node.id)}
                data-node={node.id}
                role="option"
                aria-selected={active === node.id}
                aria-label={SPOKEN[node.id]}
                aria-posinset={POSINSET[node.id]}
                aria-setsize={KEY_ORDER.length}
                className={`motion-safe:transition-opacity motion-safe:duration-200 ${
                  nodeOn(node.id) ? "opacity-100" : "opacity-30"
                }`}
              >
                <circle cx={cx} cy={cy} r={r + 16} fill="transparent" />
                {ON_PATH.has(node.id) && (
                  <circle cx={cx} cy={cy} r={r + 4} fill="var(--color-primary)" />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={dotColor(node)}
                  stroke="var(--surface-raised)"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>

        {/*
          The area names, in the frame's top centre and bottom corners —
          outside the discs, each beside its own. Set in the area's mark:
          --mark-1 5.44:1, --mark-3 4.88:1 and --mark-2 6.68:1 on the white
          panel, all clear of AA at this size.
        */}
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 text-[11px] font-medium leading-none text-mark-1 @min-[30rem]:text-[12px]">
          {SUBGRAPHS.sleep.label}
        </span>
        <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 text-[11px] font-medium leading-none text-mark-3 @min-[30rem]:text-[12px]">
          {SUBGRAPHS.academic_pressure.label}
        </span>
        <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 text-[11px] font-medium leading-none text-mark-2 @min-[30rem]:text-[12px]">
          {SUBGRAPHS.social_withdrawal.label}
        </span>

        {/*
          Standing names. The path's are ink and medium, the two hubs' muted
          and regular, so the path is still the first thing read. Each kind
          appears only from the frame width its placement was checked at
          (STANDING_SIZE above; product/ontology.ts for why).
        */}
        {STANDING_LABELS.map(({ id, placement, minWidth }) => (
          <span
            key={id}
            aria-hidden
            style={{ left: leftOf(id), top: topOf(id) }}
            className={`${PILL} ${PLACEMENT[placement]} ${STANDING_SIZE[minWidth]} motion-safe:transition-opacity motion-safe:duration-200 ${
              active ? "opacity-0" : "opacity-100"
            }`}
          >
            {NODE_BY_ID[id].label_ja}
          </span>
        ))}

        {/*
          The pointed-at concept's name and the areas it belongs to. Only
          ever rendered on a pointer, a tap or an arrow key, so a page
          without JavaScript never has it. Hidden from assistive tech, which
          hears the same name through aria-activedescendant. Every standing name steps aside while it shows —
          including the pointed-at concept's own, which it repeats — so no
          two names can sit on top of each other. Opaque white, where the
          standing pills are 90%: it can land over other dots, and they
          should not show through it.
        */}
        {active && (
          <span
            aria-hidden
            style={{ left: leftOf(active), top: topOf(active) }}
            className={`pointer-events-none absolute flex w-max max-w-[60cqw] flex-col gap-1 rounded-[0.6rem] bg-surface px-2 py-1.5 leading-tight shadow-[var(--shadow-card)] ring-1 ring-line ${tipClasses(active)}`}
          >
            <span className="text-[12px] font-medium text-ink">
              {NODE_BY_ID[active].label_ja}
            </span>
            <span className="text-[11px] text-muted">{areaNames(NODE_BY_ID[active])}</span>
          </span>
        )}
      </motion.div>

      <Legend />
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Legend                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The encodings, in the order a reader needs them: which area, which lines
 * are sourced, which is the example. The swatches are drawn with the same
 * strokes as the figure. Muted on the white panel, 6.25:1.
 *
 * The line wording follows the data, not a gloss of it: "association" is a
 * published source the seed records for the pair (what the source itself
 * bears out is the curator's reading — see lib/ontologySeed.ts), and the
 * dashed lines are the ones the seed records as having no published
 * source — "社内の判断" because upstream defines expert_judgement as the
 * authors' judgement, not an expert panel's.
 *
 * Hidden from assistive tech with the rest of the drawing: it explains
 * swatches a screen reader never meets. The last line is how to use the
 * figure, so it waits for the `js:` variant — without a script nothing
 * answers a pointer or a key, and the line would promise what does not
 * happen.
 */
function Legend() {
  return (
    <div
      aria-hidden
      className="mt-5 flex flex-col gap-2.5 text-[0.75rem] leading-snug text-muted"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {SUBGRAPH_ORDER.map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <Dot color={AREAS[s].color} />
            {SUBGRAPHS[s].label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <Dot color="var(--color-text)" />
          複数の領域
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="flex items-center gap-1.5">
          <Stroke />
          公開資料を出典とする関連
        </span>
        <span className="flex items-center gap-1.5">
          <Stroke dashed />
          公開資料の裏付けなし（社内の判断）
        </span>
        <span className="flex items-center gap-1.5">
          <Stroke path />
          例示したつながり
        </span>
      </div>
      <p className="hidden js:block">
        点を指すか、図を選んで矢印キーを押すと、概念の名前が出ます。
      </p>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 10 10" className="size-2.5 shrink-0">
      <circle cx={5} cy={5} r={5} fill={color} />
    </svg>
  );
}

function Stroke({ dashed = false, path = false }: { dashed?: boolean; path?: boolean }) {
  return (
    <svg viewBox="0 0 24 10" className="h-2.5 w-6 shrink-0">
      {path && (
        <line x1={4} y1={5} x2={20} y2={5} stroke="var(--color-primary)" strokeWidth={8} strokeLinecap="round" />
      )}
      <line
        x1={path ? 4 : 0}
        y1={5}
        x2={path ? 20 : 24}
        y2={5}
        stroke={path ? "var(--color-text)" : "var(--color-border-strong)"}
        strokeWidth={path ? 2.25 : dashed ? 1 : 1.25}
        strokeDasharray={dashed ? "3 3" : undefined}
        strokeLinecap={path ? "round" : undefined}
      />
    </svg>
  );
}
