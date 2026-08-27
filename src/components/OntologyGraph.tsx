"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { VIEWPORT } from "@/lib/motion";

/**
 * An illustration of the shape of the model, not a dump of it.
 *
 * The real graph is far larger; this shows a dozen constructs and the way
 * they link, with the one chain the copy names — 睡眠不足 → 認知機能の低下 →
 * 抑うつ傾向 — picked out of the web around it. That is the point the
 * section argues: the chain is not a rule someone wrote, it is a path
 * through a structure.
 *
 * Coordinates are centres. Pills are drawn after the edges so they occlude
 * the lines that pass beneath them.
 */
/**
 * Constructs are grouped by domain and coloured by it. The colour is not
 * decoration — an ontology's whole structure is that constructs belong to
 * classes, so showing the classes is showing more of the model, and it is
 * what stops twelve identical grey pills reading as a diagram of nothing.
 */
const DOMAINS = {
  physical: { label: "生活・身体", color: "var(--mark-3)" },
  cognitive: { label: "認知・学業", color: "var(--mark-1)" },
  affective: { label: "情緒・対人", color: "var(--mark-2)" },
} as const;

type Domain = keyof typeof DOMAINS;

type Node = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  domain: Domain;
  lit?: boolean;
};

const NODES: Node[] = [
  { id: "rhythm", domain: "physical", label: "生活リズムの乱れ", x: 100, y: 60, w: 128 },
  { id: "sleep", domain: "physical", label: "睡眠不足", x: 140, y: 160, w: 76, lit: true },
  { id: "fatigue", domain: "physical", label: "疲労の蓄積", x: 110, y: 270, w: 89 },
  { id: "appetite", domain: "physical", label: "食欲の変化", x: 150, y: 375, w: 89 },
  { id: "cognition", domain: "cognitive", label: "認知機能の低下", x: 350, y: 105, w: 115, lit: true },
  { id: "focus", domain: "cognitive", label: "集中力の低下", x: 330, y: 235, w: 102 },
  { id: "grades", domain: "cognitive", label: "学業不振", x: 330, y: 355, w: 76 },
  { id: "rumination", domain: "cognitive", label: "反すう思考", x: 545, y: 55, w: 89 },
  { id: "efficacy", domain: "affective", label: "自己効力感の低下", x: 540, y: 300, w: 128 },
  { id: "depression", domain: "affective", label: "抑うつ傾向", x: 700, y: 175, w: 89, lit: true },
  { id: "avoidance", domain: "affective", label: "対人回避", x: 610, y: 400, w: 76 },
  { id: "isolation", domain: "affective", label: "孤立", x: 830, y: 320, w: 50 },
];

/** `lit` marks the chain the section's copy walks through. */
const EDGES: [string, string, boolean?][] = [
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

const BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n]));
const H = 34;

/** The named chain, in the order it is walked. */
const TRACE = [
  { x: 140, y: 160 },
  { x: 350, y: 105 },
  { x: 700, y: 175 },
];

export function OntologyGraph() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  /*
   * Tied to scroll position rather than fired once on entry: the chain is
   * drawn as you move down the page, so how far along it you are is a
   * function of where you are. The window runs from the graph reaching the
   * lower part of the viewport to it leaving the upper part, which is
   * exactly the span it is on screen and readable.
   */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });

  // Two segments, drawn one after the other across that window.
  const firstLeg = useTransform(scrollYProgress, [0, 0.5], [0, 1], {
    clamp: true,
  });
  const secondLeg = useTransform(scrollYProgress, [0.5, 1], [0, 1], {
    clamp: true,
  });
  const legs = [firstLeg, secondLeg];

  // The head of the trace rides along the same two segments.
  const headX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    TRACE.map((p) => p.x),
  );
  const headY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    TRACE.map((p) => p.y),
  );
  const headOpacity = useTransform(
    scrollYProgress,
    [0, 0.04, 0.96, 1],
    [0, 1, 1, 0],
  );

  return (
    <figure ref={ref}>
      {/*
        Scrolls in its own container below ~640px rather than shrinking the
        labels past legibility.
      */}
      <div className="-mx-6 overflow-x-auto px-6 md:mx-0 md:px-0">
        <motion.svg
          viewBox="0 0 900 440"
          role="img"
          aria-label="心理的な構成概念どうしのつながりを示す知識グラフ。睡眠不足から認知機能の低下を経て抑うつ傾向にいたる経路が強調されています。"
          className="h-auto w-full min-w-[40rem] font-sans"
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.03 } } }}
        >
          <defs>
            <filter id="og-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g>
            {EDGES.map(([from, to, lit], edgeIndex) => {
              const a = BY_ID[from];
              const b = BY_ID[to];
              const legIndex = lit ? EDGES.filter((e) => e[2]).indexOf(EDGES[edgeIndex]) : -1;
              return (
                <motion.line
                  key={`${from}-${to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={lit ? "var(--mark-1)" : "var(--color-border-strong)"}
                  strokeWidth={lit ? 2.5 : 1}
                  strokeLinecap="round"
                  opacity={lit ? 1 : 0.4}
                  filter={lit ? "url(#og-glow)" : undefined}
                  style={
                    lit && !reduce
                      ? { pathLength: legs[legIndex] ?? firstLeg }
                      : undefined
                  }
                  variants={
                    lit
                      ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
                      : {
                          hidden: { pathLength: reduce ? 1 : 0, opacity: 0 },
                          show: {
                            pathLength: 1,
                            opacity: 0.4,
                            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                          },
                        }
                  }
                />
              );
            })}
          </g>

          {/*
            The head of the trace. It is the same scroll value that draws
            the line, so the dot is always exactly where the line stops.

            Painted before the nodes, so a pill it passes behind occludes it
            rather than the other way round — the dot travels through the
            graph, not across the top of it.
          */}
          {!reduce && (
            <motion.circle
              r={5}
              fill="var(--mark-1)"
              filter="url(#og-glow)"
              style={{ cx: headX, cy: headY, opacity: headOpacity }}
            />
          )}

          <g>
            {NODES.map((n) => (
              <motion.g
                key={n.id}
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              >
                {/* Opaque first so the edges beneath are occluded, then the
                    domain wash on top. */}
                <rect
                  x={n.x - n.w / 2}
                  y={n.y - H / 2}
                  width={n.w}
                  height={H}
                  rx={H / 2}
                  fill="var(--surface-raised)"
                />
                <rect
                  x={n.x - n.w / 2}
                  y={n.y - H / 2}
                  width={n.w}
                  height={H}
                  rx={H / 2}
                  fill={DOMAINS[n.domain].color}
                  fillOpacity={n.lit ? 0.1 : 0.035}
                  stroke={DOMAINS[n.domain].color}
                  strokeWidth={n.lit ? 2 : 1}
                  strokeOpacity={n.lit ? 1 : 0.45}
                  filter={n.lit ? "url(#og-glow)" : undefined}
                />
                <text
                  x={n.x}
                  y={n.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight={n.lit ? 600 : 400}
                  fill={DOMAINS[n.domain].color}
                >
                  {n.label}
                </text>
              </motion.g>
            ))}
          </g>

        </motion.svg>
      </div>

      <figcaption className="measure-jp mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8rem] text-muted">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-6 rounded-full bg-mark-1" />
          本文で例に挙げた経路
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-px w-6 rounded-full bg-line-strong" />
          その他の因果リンク
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-2.5 rounded-full bg-mark-3" />
          生活・身体
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-2.5 rounded-full bg-mark-1" />
          認知・学業
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-2.5 rounded-full bg-mark-2" />
          情緒・対人
        </span>
        <span>実際のグラフはこれよりはるかに大規模です。</span>
      </figcaption>
    </figure>
  );
}
