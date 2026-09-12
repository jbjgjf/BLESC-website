"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import {
  BY_ID,
  DOMAINS,
  EDGES,
  NODES,
  TRACE,
} from "@/components/product/ontology";
import { VIEWPORT } from "@/lib/motion";

/**
 * An illustration of the shape of the model, not a dump of it.
 *
 * The real graph is far larger; this shows a dozen constructs and the way
 * they link, with one chain — 睡眠不足 → 認知機能の低下 → 抑うつ傾向 — picked
 * out of the web around it. That is the point the section argues: the chain
 * is not a rule someone wrote, it is a path through a structure.
 *
 * Nodes, edges, domains and that chain all live in ./product/ontology now,
 * because the section's copy sets the same chain as text beside this figure
 * and the two have to come from one place.
 *
 * Coordinates are centres. Pills are drawn after the edges so they occlude
 * the lines that pass beneath them.
 */
const H = 34;

const edgeKey = (from: string, to: string) => `${from}-${to}`;

/**
 * The lit edges in the order they are walked, so each one can pick up the
 * scroll value for its own leg. Derived from EDGES rather than listed again:
 * the drawing order and the `lit` flags then cannot drift apart.
 */
const LIT_EDGES = EDGES.filter(([, , lit]) => lit).map(([from, to]) =>
  edgeKey(from, to),
);

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
        Scrolls in its own container rather than shrinking the labels past
        legibility. The 30rem floor is the width at which 13-unit labels in a
        560-unit frame still render at 11px; below that the panel scrolls
        instead, which it does on phones and inside the narrowest desktop
        measure of the two-column block.
      */}
      <div className="overflow-x-auto">
        <motion.svg
          viewBox="0 0 560 440"
          role="img"
          aria-label="心理的な構成概念どうしのつながりを示す知識グラフ。睡眠不足から認知機能の低下を経て抑うつ傾向にいたる経路が強調されています。"
          className="h-auto w-full min-w-[30rem] font-sans"
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
            {EDGES.map(([from, to, lit]) => {
              const a = BY_ID[from];
              const b = BY_ID[to];
              const legIndex = lit ? LIT_EDGES.indexOf(edgeKey(from, to)) : -1;
              return (
                <motion.line
                  key={edgeKey(from, to)}
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

      <figcaption className="mt-5 text-[0.8rem] leading-relaxed text-muted">
        {/*
          The legend wraps to as many rows as the narrower column needs, and
          the scale caveat sits on its own line below it — in the flex row it
          used to share, it read as a sixth swatch label.
        */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/*
            The chain itself is set as text in the section's copy, beside
            this figure, so the legend only has to say which stroke is the
            one being talked about — spelling it out in both places put the
            same three constructs on screen twice.
          */}
          <span className="flex items-center gap-2">
            <span aria-hidden className="h-0.5 w-6 rounded-full bg-mark-1" />
            強調された経路
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
        </div>
        <p className="mt-2">実際のグラフはこれよりはるかに大規模です。</p>
      </figcaption>
    </figure>
  );
}
