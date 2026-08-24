"use client";

import { motion, useReducedMotion } from "motion/react";
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
type Node = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  lit?: boolean;
};

const NODES: Node[] = [
  { id: "rhythm", label: "生活リズムの乱れ", x: 100, y: 60, w: 128 },
  { id: "sleep", label: "睡眠不足", x: 140, y: 160, w: 76, lit: true },
  { id: "fatigue", label: "疲労の蓄積", x: 110, y: 270, w: 89 },
  { id: "appetite", label: "食欲の変化", x: 150, y: 375, w: 89 },
  { id: "cognition", label: "認知機能の低下", x: 350, y: 105, w: 115, lit: true },
  { id: "focus", label: "集中力の低下", x: 330, y: 235, w: 102 },
  { id: "grades", label: "学業不振", x: 330, y: 355, w: 76 },
  { id: "rumination", label: "反すう思考", x: 545, y: 55, w: 89 },
  { id: "efficacy", label: "自己効力感の低下", x: 540, y: 300, w: 128 },
  { id: "depression", label: "抑うつ傾向", x: 700, y: 175, w: 89, lit: true },
  { id: "avoidance", label: "対人回避", x: 610, y: 400, w: 76 },
  { id: "isolation", label: "孤立", x: 830, y: 320, w: 50 },
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

export function OntologyGraph() {
  const reduce = useReducedMotion();

  return (
    <figure>
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
          <g>
            {EDGES.map(([from, to, lit]) => {
              const a = BY_ID[from];
              const b = BY_ID[to];
              return (
                <motion.line
                  key={`${from}-${to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={lit ? "var(--mark-1)" : "var(--color-border-strong)"}
                  strokeWidth={lit ? 2 : 1}
                  strokeLinecap="round"
                  opacity={lit ? 1 : 0.45}
                  variants={{
                    hidden: { pathLength: reduce ? 1 : 0, opacity: 0 },
                    show: {
                      pathLength: 1,
                      opacity: lit ? 1 : 0.45,
                      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                />
              );
            })}
          </g>

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
                <rect
                  x={n.x - n.w / 2}
                  y={n.y - H / 2}
                  width={n.w}
                  height={H}
                  rx={H / 2}
                  fill="var(--surface-raised)"
                  stroke={n.lit ? "var(--mark-1)" : "var(--color-border)"}
                  strokeWidth={n.lit ? 2 : 1}
                />
                <text
                  x={n.x}
                  y={n.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight={n.lit ? 600 : 400}
                  fill={n.lit ? "var(--mark-1)" : "var(--color-text-muted)"}
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
        <span>実際のグラフはこれよりはるかに大規模です。</span>
      </figcaption>
    </figure>
  );
}
