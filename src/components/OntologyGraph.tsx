"use client";

import { motion, useScroll, useTransform } from "motion/react";
import {
  Camera,
  Geometry,
  Mesh,
  Program,
  Renderer,
  Transform,
  Vec3,
  type OGLRenderingContext,
} from "ogl";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  BY_ID,
  DOMAINS,
  EDGES,
  NODES,
  TRACE,
  type Domain,
} from "@/components/product/ontology";
import { useTheme } from "@/components/ThemeProvider";
import { WebGLErrorBoundary } from "@/components/webgl/WebGLErrorBoundary";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";

/**
 * An illustration of the shape of the model, not a dump of it.
 *
 * The real graph is far larger; this shows a dozen constructs and the way
 * they link, with one chain — 睡眠不足 → 認知機能の低下 → 抑うつ傾向 — picked
 * out of the web around it. That is the point the section argues: the chain
 * is not a rule someone wrote, it is a path through a structure.
 *
 * Two renderings of the same data live here. <Graph3D> is the one that
 * ships: the constructs sit on a shell in three dimensions, the reader can
 * turn it, and the chain lights up as the section scrolls into view.
 * <StaticGraph> is the flat SVG it replaced, kept whole as the fallback for
 * a browser with no WebGL, a reader who has asked for reduced data, and a
 * context that dies mid-session — and as what the server sends, so a
 * reader without JavaScript still gets a picture. Both draw from ./product/ontology, so the
 * chain lit in either picture and the chain set as text beside it cannot
 * drift apart.
 */

const edgeKey = (from: string, to: string) => `${from}-${to}`;

/**
 * The lit edges in the order they are walked, so each one can pick up the
 * scroll value for its own leg. Derived from EDGES rather than listed again:
 * the drawing order and the `lit` flags then cannot drift apart.
 */
const LIT_EDGES = EDGES.filter(([, , lit]) => lit).map(([from, to]) =>
  edgeKey(from, to),
);

/**
 * What the picture says, for a reader who cannot see it. The same sentence
 * the flat figure carries as its image label; the 3D figure has no single
 * image element to hang it on, so it is set as visually-hidden text instead.
 *
 * The chain is read off TRACE rather than typed out, for the same reason
 * the lit edges are: the sentence a screen reader hears and the path the
 * picture lights must be the same path.
 */
const CHAIN_TEXT =
  `${TRACE[0].label}から` +
  TRACE.slice(1, -1)
    .map((n) => `${n.label}を経て`)
    .join("") +
  `${TRACE[TRACE.length - 1].label}にいたる経路`;
const DESCRIPTION = `心理的な構成概念どうしのつながりを示す知識グラフ。${CHAIN_TEXT}が強調されています。`;

/**
 * The 3D labels' colour, by domain, as class names. It was an inline style
 * once; the layout's noscript rule forces every element with a style
 * attribute visible, which would have matched these too. Literal strings so
 * Tailwind can see them, keyed on the same domains DOMAINS colours by.
 */
const LABEL_COLOR: Record<Domain, string> = {
  physical: "text-mark-3",
  cognitive: "text-mark-1",
  affective: "text-mark-2",
};

/* -------------------------------------------------------------------------- */
/* Caption                                                                    */
/* -------------------------------------------------------------------------- */

function Caption() {
  return (
    <figcaption className="mt-5 text-[0.8rem] leading-relaxed text-muted">
      {/*
        The legend wraps to as many rows as the narrower column needs. There
        is no line about the real graph's size under it any more: "far
        larger" overstated a seed of three subgraphs and forty nodes against
        the twelve drawn here (docs/claims.md §4), and the section's copy
        already says what the graph covers.
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
    </figcaption>
  );
}

/* -------------------------------------------------------------------------- */
/* Static figure (fallback)                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Coordinates are centres. Pills are drawn after the edges so they occlude
 * the lines that pass beneath them.
 */
const H = 34;

export function StaticGraph() {
  // Server-rendered and hydrated now, so the reduced branch has to agree
  // with the server's until hydration is done — it decides whether the
  // trace head exists at all.
  const reduce = usePrefersReducedMotion();
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
      {/*
        Without JavaScript this is the figure a reader gets, and motion has
        already written its "hidden" frame into it as SVG attributes —
        opacity 0 and a zero-length dash — which the layout's noscript rule
        cannot reach, because it only matches style attributes. The
        html:not([data-js]) classes below put the resting frame back with
        CSS, which outranks a presentation attribute; the pre-paint script
        sets data-js whenever a script runs, so they never apply on a page
        that will animate.
      */}
      {/*
        The same box as the 3D panel — 4:3 with a 20rem floor, 26rem from lg
        — so when hydration swaps this figure for that one, nothing below it
        moves. The SVG fits inside at its own aspect.
      */}
      <div className="aspect-[4/3] min-h-[20rem] w-full overflow-x-auto lg:min-h-[26rem]">
        <motion.svg
          viewBox="0 0 560 440"
          role="img"
          aria-label={DESCRIPTION}
          className="h-full w-full min-w-[30rem] font-sans"
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
                  className={
                    lit
                      ? "[html:not([data-js])_&]:[stroke-dasharray:none]"
                      : "[html:not([data-js])_&]:[stroke-dasharray:none] [html:not([data-js])_&]:opacity-40"
                  }
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
              className="[html:not([data-js])_&]:hidden"
              fill="var(--mark-1)"
              filter="url(#og-glow)"
              style={{ cx: headX, cy: headY, opacity: headOpacity }}
            />
          )}

          <g>
            {NODES.map((n) => (
              <motion.g
                key={n.id}
                className="[html:not([data-js])_&]:opacity-100"
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

      <Caption />
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* 3D layout                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The same integer hash StudentCrowd seeds its crowd with. A hash rather
 * than Math.random because the layout has to be identical on every run and
 * on both server and client, or a node would be somewhere else each time
 * the page loaded.
 */
function noise(index: number, channel: number) {
  let h = (index * 0x9e3779b1 + channel * 0x85ebca77) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const DEG = Math.PI / 180;

/**
 * The flat layout was drawn by hand so that no two pills touch and no edge
 * passes under a pill that is not its own endpoint; that care is worth
 * keeping. So the sphere is parameterised by it: the 560-unit width becomes
 * 170° of longitude and the 440-unit height 96° of latitude, which puts
 * every construct on the front of the shell with the three domains left,
 * centre and right, and the lit chain running across the front where the
 * scroll can be seen to draw it. Each domain sits on its own shell radius,
 * with a little hashed jitter on top, so the clusters read as three depths
 * rather than one skin.
 *
 * Measured (a dry run of this projection at 560×420) rather than guessed:
 * the nodes span 77–481 of the width and 46–356 of the height, and no two
 * labels collide within ±0.15 rad of rest.
 */
const AZIMUTH_SPAN = 170 * DEG;
const ELEVATION_SPAN = 96 * DEG;
const SHELL_RADIUS: Record<Domain, number> = {
  physical: 0.96,
  cognitive: 1.06,
  affective: 1.0,
};
/** The outermost shell, which the depth cues are normalised by. */
const SHELL = 1.06;

const DEGREE: Record<string, number> = Object.fromEntries(
  NODES.map((n) => [n.id, 0]),
);
for (const [from, to] of EDGES) {
  DEGREE[from] += 1;
  DEGREE[to] += 1;
}

type LaidOutNode = {
  id: string;
  domain: Domain;
  lit: boolean;
  position: [number, number, number];
  /** Disc radius in world units. Sized by degree: a hub is a bigger dot. */
  size: number;
};

const LAYOUT: LaidOutNode[] = NODES.map((n, i) => {
  const azimuth = (n.x / 560 - 0.5) * AZIMUTH_SPAN;
  const elevation = (0.5 - n.y / 440) * ELEVATION_SPAN;
  const r = SHELL_RADIUS[n.domain] + (noise(i, 0) - 0.5) * 0.12;
  return {
    id: n.id,
    domain: n.domain,
    lit: !!n.lit,
    position: [
      r * Math.cos(elevation) * Math.sin(azimuth),
      r * Math.sin(elevation),
      r * Math.cos(elevation) * Math.cos(azimuth),
    ],
    size: 0.028 + 0.007 * DEGREE[n.id],
  };
});

const INDEX_OF: Record<string, number> = Object.fromEntries(
  LAYOUT.map((n, i) => [n.id, i]),
);

/** Edges as node indices, with which leg of the trace each lit one is. */
const LINKS = EDGES.map(([from, to, lit]) => ({
  a: INDEX_OF[from],
  b: INDEX_OF[to],
  leg: lit ? LIT_EDGES.indexOf(edgeKey(from, to)) : -1,
}));

/** Who is joined to whom, for the hover: a node lights its neighbours. */
const LINKED: Set<number>[] = LAYOUT.map(() => new Set<number>());
for (const { a, b } of LINKS) {
  LINKED[a].add(b);
  LINKED[b].add(a);
}

const TRACE_INDEX = TRACE.map((n) => INDEX_OF[n.id]);

/* -------------------------------------------------------------------------- */
/* Colour                                                                     */
/* -------------------------------------------------------------------------- */

type RGB = [number, number, number];

type Palette = {
  domain: Record<Domain, RGB>;
  line: RGB;
  trace: RGB;
  ground: RGB;
};

/** The dark tokens, used only if a computed style comes back unreadable. */
const DARK_FALLBACK: Palette = {
  domain: {
    physical: [0.498, 0.839, 0.753],
    cognitive: [0.522, 0.753, 0.929],
    affective: [0.663, 0.608, 0.941],
  },
  line: [0.345, 0.38, 0.439],
  trace: [0.522, 0.753, 0.929],
  ground: [0.137, 0.157, 0.188],
};

function parseColor(value: string): RGB | null {
  const v = value.trim();
  const hex = /^#([0-9a-f]{3,8})$/i.exec(v);
  if (hex) {
    let digits = hex[1];
    if (digits.length < 6) {
      digits = digits
        .split("")
        .map((c) => c + c)
        .join("");
    }
    return [0, 2, 4].map(
      (i) => parseInt(digits.slice(i, i + 2), 16) / 255,
    ) as RGB;
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(v);
  if (rgb) {
    const parts = rgb[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .slice(0, 3)
      .map(Number);
    if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
      return parts.map((n) => n / 255) as RGB;
    }
  }
  return null;
}

/** "var(--mark-3)" → "--mark-3", so the domain→token mapping stays in one place. */
const tokenOf = (css: string) => /var\((--[\w-]+)\)/.exec(css)?.[1] ?? null;

/**
 * Read at mount and again on every theme change, the same way the gallery
 * does it: WebGL cannot see a CSS variable, so the tokens are resolved
 * through getComputedStyle and handed to the shaders as plain numbers.
 */
function readPalette(el: HTMLElement): Palette {
  const style = getComputedStyle(el);
  const token = (name: string | null, fallback: RGB): RGB =>
    name ? (parseColor(style.getPropertyValue(name)) ?? fallback) : fallback;
  const domain = {} as Record<Domain, RGB>;
  for (const key of Object.keys(DOMAINS) as Domain[]) {
    domain[key] = token(tokenOf(DOMAINS[key].color), DARK_FALLBACK.domain[key]);
  }
  return {
    domain,
    line: token("--color-border-strong", DARK_FALLBACK.line),
    trace: token("--mark-1", DARK_FALLBACK.trace),
    ground: token("--surface-inset", DARK_FALLBACK.ground),
  };
}

/* -------------------------------------------------------------------------- */
/* Shaders                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Nodes are one instanced quad. Each instance is turned to face the camera
 * in view space and cut into a disc in the fragment shader, with a soft
 * halo around the lit and hovered ones. Perspective makes the near discs
 * larger on its own; the shader adds the other half of the depth cue by
 * fading the far ones toward the panel ground, so they recede rather than
 * turn grey.
 *
 * The quad is drawn twice, in two passes either side of the edges. The core
 * pass draws the solid disc and writes depth; the halo pass draws only the
 * glow, testing depth but not writing it. That is what lets a near edge
 * cross in front of a far disc — with depth off, whichever mesh was drawn
 * second covered the other everywhere, so a far disc always sat on top of
 * a near line. The depth a disc writes is the front of a ball of its own
 * radius rather than its centre, so the edges that end at it still tuck
 * under it instead of piercing it.
 */
const NODE_VERTEX = /* glsl */ `
  attribute vec2 position;
  attribute vec3 iPos;
  attribute vec3 iColor;
  attribute float iSize;
  attribute float iAlpha;
  attribute float iHalo;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform vec2 uViewport;
  uniform float uCamDist;
  uniform float uShell;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vHalo;
  varying float vRadiusPx;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(iPos, 1.0);
    // The halo needs room outside the disc, so a lit quad is wider; the
    // 1.15 leaves room past the disc edge for the anti-aliasing band.
    float extent = iSize * (1.0 + iHalo * 1.4) * 1.15;
    mv.xy += position * 2.0 * extent;
    gl_Position = projectionMatrix * mv;
    vec4 front = projectionMatrix * vec4(mv.xy, mv.z + iSize, 1.0);
    gl_Position.z = front.z / front.w * gl_Position.w;
    vUv = position;
    vColor = iColor;
    vAlpha = iAlpha;
    vHalo = iHalo;
    // Disc radius in device pixels, for a one-pixel anti-aliasing band.
    vRadiusPx = iSize / max(-mv.z, 0.001) * projectionMatrix[1][1] * uViewport.y * 0.5;
    // 0 at the back of the shell, 1 at the front.
    vDepth = clamp((mv.z + uCamDist) / uShell * 0.5 + 0.5, 0.0, 1.0);
  }
`;

const NODE_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform vec3 uGround;
  // 0 for the core pass, 1 for the halo pass.
  uniform float uHaloPass;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vHalo;
  varying float vRadiusPx;
  varying float vDepth;
  void main() {
    // 1.0 at the disc edge, 2.4 at the outer edge of a halo.
    float d = length(vUv) * 2.0 * (1.0 + vHalo * 1.4) * 1.15;
    float aa = 1.2 / max(vRadiusPx, 1.0);
    float core = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, d);
    float halo = vHalo * (1.0 - smoothstep(1.0, 2.4, d)) * 0.22;
    vec3 base = mix(uGround, vColor, mix(0.45, 1.0, vDepth));
    vec3 color;
    float alpha;
    if (uHaloPass < 0.5) {
      // The core writes depth, so it has to be opaque wherever it is drawn:
      // a 30%-alpha disc that wrote depth would cut a hole in every edge
      // behind it. Dimming is carried in the colour instead — toward the
      // panel, the same way the depth cue fades a far node — and a disc
      // that is fully faded out is not drawn at all.
      if (vAlpha < 0.02) discard;
      color = mix(uGround, base, vAlpha);
      alpha = core;
    } else {
      color = base;
      alpha = halo * (1.0 - core) * vAlpha;
    }
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

/**
 * Edges are screen-space ribbons: each is a quad whose two ends are the
 * projected endpoints, pushed apart sideways by a width in device pixels.
 * WebGL cannot draw a line wider than one pixel, and the trace has to be
 * thicker than the rest, so this is the only way to get a 2.5px stroke with
 * a soft glow around it. The trace legs also carry their draw-on here: a
 * fragment past the leg's progress along the segment is simply not drawn.
 */
const EDGE_VERTEX = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aEnd;
  attribute vec2 aCorner;
  attribute float aKind;
  attribute float aIntensity;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform vec2 uViewport;
  uniform float uCamDist;
  uniform float uShell;
  uniform float uDpr;
  varying float vOffset;
  varying float vHalf;
  varying float vReach;
  varying float vT;
  varying float vKind;
  varying float vIntensity;
  varying float vDepth;
  void main() {
    vec4 mvS = modelViewMatrix * vec4(aStart, 1.0);
    vec4 mvE = modelViewMatrix * vec4(aEnd, 1.0);
    vec4 cS = projectionMatrix * mvS;
    vec4 cE = projectionMatrix * mvE;
    vec2 halfView = uViewport * 0.5;
    vec2 sS = cS.xy / cS.w * halfView;
    vec2 sE = cE.xy / cE.w * halfView;
    vec2 dir = sE - sS;
    float len = length(dir);
    dir = len > 0.0001 ? dir / len : vec2(1.0, 0.0);
    vec2 normal = vec2(-dir.y, dir.x);
    float lit = step(-0.5, aKind);
    // Half-widths in device pixels: a 1px line, or a 2.5px trace.
    float core = mix(0.5, 1.25, lit) * uDpr;
    float reach = mix(core + 1.0, core + 6.0 * uDpr, lit);
    vec4 c = mix(cS, cE, aCorner.x);
    vec4 mv = mix(mvS, mvE, aCorner.x);
    c.xy += normal * aCorner.y * reach / halfView * c.w;
    gl_Position = c;
    vOffset = aCorner.y * reach;
    vHalf = core;
    vReach = reach;
    vT = aCorner.x;
    vKind = aKind;
    vIntensity = aIntensity;
    vDepth = clamp((mv.z + uCamDist) / uShell * 0.5 + 0.5, 0.0, 1.0);
  }
`;

const EDGE_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform vec3 uLine;
  uniform vec3 uTrace;
  uniform vec3 uGround;
  uniform vec2 uLegs;
  varying float vOffset;
  varying float vHalf;
  varying float vReach;
  varying float vT;
  varying float vKind;
  varying float vIntensity;
  varying float vDepth;
  void main() {
    float d = abs(vOffset);
    float lit = step(-0.5, vKind);
    float core = 1.0 - smoothstep(vHalf - 0.6, vHalf + 0.6, d);
    float glow = lit * (1.0 - smoothstep(vHalf, vReach, d)) * 0.28;
    // Which leg this is decides which scroll value draws it.
    float progress = vKind > 0.5 ? uLegs.y : uLegs.x;
    float drawn = mix(1.0, 1.0 - smoothstep(progress - 0.01, progress + 0.01, vT), lit);
    vec3 color = mix(uGround, mix(uLine, uTrace, lit), mix(0.5, 1.0, vDepth));
    float alpha = (core + glow * (1.0 - core)) * mix(0.55, 1.0, lit) * drawn * vIntensity;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

/* -------------------------------------------------------------------------- */
/* Scene                                                                      */
/* -------------------------------------------------------------------------- */

const FOV = 30;
const TAN_HALF_FOV = Math.tan((FOV / 2) * DEG);
/**
 * Camera distance is fitted to what the nodes actually cover, per axis,
 * rather than to the whole sphere — fitting the sphere left half the panel
 * empty, because nothing sits at the poles or on the back. Vertical room is
 * the node spread plus what a tilt of ±0.35 rad can swing it to; horizontal
 * room is the shell itself, with the labels at the rim clamped in.
 */
const FIT_VERTICAL = 1.02;
const FIT_HORIZONTAL = 1.15;

/** A slow sway about the vertical, ±12.6° over an eighteen-second cycle. */
const SWAY_AMPLITUDE = 0.22;
const SWAY_RATE = 0.35;

const BASE_PITCH = 0.08;
const PITCH_MIN = -0.35;
const PITCH_MAX = 0.35;
/** Radians per CSS pixel of drag. */
const DRAG_YAW = 0.006;
const DRAG_PITCH = 0.004;
/** How much of the release velocity carries on, in seconds' worth of it. */
const FLING = 0.28;
const MAX_VELOCITY = 6;

const LABEL_GAP = 4;
const LABEL_PAD = 6;

const N = LAYOUT.length;
/** One extra instance: the head of the trace. */
const HEAD = N;

type SceneOptions = {
  /** The figure's scroll progress, 0 → 1 across the window it is readable. */
  getProgress: () => number;
  /**
   * The scene cannot go on — the context was lost, or a frame threw. The
   * loop has already stopped; the figure swaps to the flat one.
   */
  onUnavailable: () => void;
};

/** How close an eased value has to be to its target to count as there. */
const SETTLED = 1e-3;

type ScreenNode = { x: number; y: number; r: number; front: boolean };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

class GraphScene {
  private renderer: Renderer;
  private gl: OGLRenderingContext;
  private camera: Camera;
  private root = new Transform();
  private pitchNode = new Transform();
  private yawNode = new Transform();
  private nodeProgram: Program;
  private haloProgram: Program;
  private edgeProgram: Program;
  private nodeGeometry: Geometry;
  private edgeGeometry: Geometry;

  // Instance buffers, rewritten every frame in back-to-front order.
  private instPos = new Float32Array((N + 1) * 3);
  private instColor = new Float32Array((N + 1) * 3);
  private instSize = new Float32Array(N + 1);
  private instAlpha = new Float32Array(N + 1);
  private instHalo = new Float32Array(N + 1);
  private edgeIntensity = new Float32Array(LINKS.length * 4);

  // Per-node state that eases toward a target when the hover changes.
  private nodeIntensity = new Float32Array(N).fill(1);
  private nodeIntensityTarget = new Float32Array(N).fill(1);
  private hoverAmount = new Float32Array(N);
  private hoverTarget = new Float32Array(N);
  private linkIntensity = new Float32Array(LINKS.length).fill(1);
  private linkIntensityTarget = new Float32Array(LINKS.length).fill(1);

  private world = new Float32Array((N + 1) * 3);
  private screen: ScreenNode[] = LAYOUT.map(() => ({
    x: 0,
    y: 0,
    r: 0,
    front: false,
  }));
  private order: number[] = Array.from({ length: N + 1 }, (_, i) => i);
  private headLocal = new Float32Array(3);
  private v = new Vec3();

  private labels: HTMLElement[];
  private labelW: number[];
  private labelH: number[];

  private width = 1;
  private height = 1;
  private camDist = 4;
  private palette: Palette = DARK_FALLBACK;

  private yaw = 0;
  private yawTarget = 0;
  private pitch = BASE_PITCH;
  private pitchTarget = BASE_PITCH;
  private clock = 0;
  private last = 0;

  private dragging = false;
  private dragX = 0;
  private dragY = 0;
  private dragTime = 0;
  private velocity = 0;
  private hovered = -1;

  private reduced: boolean;
  private finePointer: boolean;
  private raf = 0;
  /**
   * Something the frame depends on changed outside the eased values: a
   * resize (which also clears the canvas), the palette, the hover, the
   * motion preference. Under reduced motion nothing else moves the picture,
   * so a frame with this unset and every value at its target is skipped.
   */
  private dirty = true;
  private failed = false;
  private dprQuery: MediaQueryList | null = null;
  private resizeObserver: ResizeObserver;
  private intersectionObserver: IntersectionObserver;
  private motionQuery: MediaQueryList;

  constructor(
    private host: HTMLElement,
    labelHost: HTMLElement,
    private opts: SceneOptions,
  ) {
    this.update = this.update.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.onMotionChange = this.onMotionChange.bind(this);
    this.onContextLost = this.onContextLost.bind(this);
    this.onDprChange = this.onDprChange.bind(this);

    /*
     * The context is asked for here, with the attributes ogl will ask for,
     * before ogl is handed the canvas: a second getContext on the same
     * canvas returns the first context, so this both probes for WebGL and
     * decides the attributes. ogl itself would dereference a null context
     * and throw a TypeError, which is a worse signal than a clean refusal.
     */
    const canvas = document.createElement("canvas");
    const attributes = { alpha: true, antialias: true, premultipliedAlpha: true };
    const probe =
      canvas.getContext("webgl2", attributes) ??
      canvas.getContext("webgl", attributes);
    if (!probe) throw new Error("WebGL unavailable");

    /*
     * Premultiplied, because the canvas is transparent over the panel. With
     * straight alpha the buffer holds colour×alpha after blending and the
     * browser then reads that as the colour, which shows as a dark fringe on
     * every anti-aliased edge; the fragment shaders emit premultiplied
     * colour to match.
     */
    this.renderer = new Renderer({
      canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);

    this.camera = new Camera(this.gl, { fov: FOV, near: 0.1, far: 20 });

    // Pitch outside, yaw inside, so a tilt is always about the screen's
    // horizontal no matter how far the graph has been turned.
    this.pitchNode.setParent(this.root);
    this.yawNode.setParent(this.pitchNode);

    const dynamic = this.gl.DYNAMIC_DRAW;

    const nodePass = (halo: boolean) =>
      new Program(this.gl, {
        vertex: NODE_VERTEX,
        fragment: NODE_FRAGMENT,
        uniforms: {
          uViewport: { value: [1, 1] },
          uCamDist: { value: this.camDist },
          uShell: { value: SHELL },
          uGround: { value: [...DARK_FALLBACK.ground] },
          uHaloPass: { value: halo ? 1 : 0 },
        },
        transparent: true,
        depthTest: true,
        depthWrite: !halo,
        cullFace: false,
      });
    this.nodeProgram = nodePass(false);
    this.haloProgram = nodePass(true);
    this.nodeGeometry = new Geometry(this.gl, {
      position: {
        size: 2,
        data: new Float32Array([-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5]),
      },
      index: { data: new Uint16Array([0, 1, 2, 0, 2, 3]) },
      iPos: { instanced: 1, size: 3, data: this.instPos, usage: dynamic },
      iColor: { instanced: 1, size: 3, data: this.instColor, usage: dynamic },
      iSize: { instanced: 1, size: 1, data: this.instSize, usage: dynamic },
      iAlpha: { instanced: 1, size: 1, data: this.instAlpha, usage: dynamic },
      iHalo: { instanced: 1, size: 1, data: this.instHalo, usage: dynamic },
    });
    // Cores, then edges, then halos; see NODE_VERTEX for why it is split.
    // No renderOrder is 0, which ogl would take as "sort me by depth".
    const nodes = new Mesh(this.gl, {
      geometry: this.nodeGeometry,
      program: this.nodeProgram,
      frustumCulled: false,
      renderOrder: 1,
    });
    nodes.setParent(this.yawNode);
    const halos = new Mesh(this.gl, {
      geometry: this.nodeGeometry,
      program: this.haloProgram,
      frustumCulled: false,
      renderOrder: 3,
    });
    halos.setParent(this.yawNode);

    const count = LINKS.length;
    const starts = new Float32Array(count * 12);
    const ends = new Float32Array(count * 12);
    const corners = new Float32Array(count * 8);
    const kinds = new Float32Array(count * 4);
    const indices = new Uint16Array(count * 6);
    LINKS.forEach(({ a, b, leg }, k) => {
      const pa = LAYOUT[a].position;
      const pb = LAYOUT[b].position;
      const cornerSet = [0, -1, 0, 1, 1, 1, 1, -1];
      for (let c = 0; c < 4; c++) {
        const vi = k * 4 + c;
        starts.set(pa, vi * 3);
        ends.set(pb, vi * 3);
        corners[vi * 2] = cornerSet[c * 2];
        corners[vi * 2 + 1] = cornerSet[c * 2 + 1];
        kinds[vi] = leg;
      }
      indices.set(
        [k * 4, k * 4 + 1, k * 4 + 2, k * 4, k * 4 + 2, k * 4 + 3],
        k * 6,
      );
    });
    this.edgeIntensity.fill(1);
    this.edgeProgram = new Program(this.gl, {
      vertex: EDGE_VERTEX,
      fragment: EDGE_FRAGMENT,
      uniforms: {
        uViewport: { value: [1, 1] },
        uCamDist: { value: this.camDist },
        uShell: { value: SHELL },
        uDpr: { value: this.renderer.dpr },
        uLine: { value: [...DARK_FALLBACK.line] },
        uTrace: { value: [...DARK_FALLBACK.trace] },
        uGround: { value: [...DARK_FALLBACK.ground] },
        uLegs: { value: [0, 0] },
      },
      transparent: true,
      depthTest: true,
      depthWrite: false,
      cullFace: false,
    });
    this.edgeGeometry = new Geometry(this.gl, {
      aStart: { size: 3, data: starts },
      aEnd: { size: 3, data: ends },
      aCorner: { size: 2, data: corners },
      aKind: { size: 1, data: kinds },
      aIntensity: { size: 1, data: this.edgeIntensity, usage: dynamic },
      index: { data: indices },
    });
    const edges = new Mesh(this.gl, {
      geometry: this.edgeGeometry,
      program: this.edgeProgram,
      frustumCulled: false,
      renderOrder: 2,
    });
    edges.setParent(this.yawNode);

    const programs = [this.nodeProgram, this.haloProgram, this.edgeProgram];
    // The premultiplied "over" operator, for colour and alpha alike.
    for (const program of programs) {
      program.setBlendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    /*
     * ogl only warns when a shader fails to compile or link, and when
     * WebGL1 has no instancing it finds out at the first draw — both of
     * which would happen inside the render loop, where nothing turns them
     * into the flat figure. Asked here instead, a failure throws out of the
     * constructor, which the caller already treats as "no WebGL". The
     * context is handed back first, since nothing else will.
     */
    const instancing =
      this.renderer.isWebgl2 || !!this.renderer.drawElementsInstanced;
    const linked = programs.every((program) =>
      this.gl.getProgramParameter(program.program, this.gl.LINK_STATUS),
    );
    if (!instancing || !linked) {
      this.gl.getExtension("WEBGL_lose_context")?.loseContext();
      throw new Error(
        instancing ? "WebGL program failed to link" : "WebGL instancing unavailable",
      );
    }

    // No min-width and no intrinsic size of its own: the host decides.
    canvas.className = "absolute inset-0 block";
    canvas.addEventListener("webglcontextlost", this.onContextLost);
    // Under the labels, which are the host's other child.
    host.insertBefore(canvas, host.firstChild);

    this.labels = Array.from(labelHost.children) as HTMLElement[];
    this.labelW = this.labels.map(() => 0);
    this.labelH = this.labels.map(() => 0);

    this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reduced = this.motionQuery.matches;
    this.motionQuery.addEventListener("change", this.onMotionChange);
    this.finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    host.addEventListener("pointerdown", this.onPointerDown);
    host.addEventListener("pointermove", this.onPointerMove);
    host.addEventListener("pointerup", this.onPointerUp);
    host.addEventListener("pointercancel", this.onPointerUp);
    host.addEventListener("pointerleave", this.onPointerLeave);
    // No wheel listener at all: the page scrolls through the canvas.

    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(host);
    this.onResize();
    this.armDprQuery();
    // The label boxes were measured in whatever face was available at
    // construction; once the web fonts have swapped in they need measuring
    // again, or the clamp and the collision test work from stale widths.
    document.fonts?.ready.then(this.onResize, () => undefined);

    // A GPU loop for a figure nobody is looking at is pure battery cost.
    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.raf && !this.failed) {
          this.last = 0;
          this.dirty = true;
          this.raf = requestAnimationFrame(this.update);
        } else if (!entry.isIntersecting && this.raf) {
          cancelAnimationFrame(this.raf);
          this.raf = 0;
        }
      },
      { threshold: 0 },
    );
    this.intersectionObserver.observe(host);
  }

  setPalette(palette: Palette) {
    this.palette = palette;
    for (const program of [this.nodeProgram, this.haloProgram, this.edgeProgram]) {
      program.uniforms.uGround.value = [...palette.ground];
    }
    this.edgeProgram.uniforms.uLine.value = [...palette.line];
    this.edgeProgram.uniforms.uTrace.value = [...palette.trace];
    this.dirty = true;
  }

  private onMotionChange() {
    this.reduced = this.motionQuery.matches;
    this.dirty = true;
  }

  private onContextLost(e: Event) {
    e.preventDefault();
    this.fail();
  }

  /** Stop for good and hand over to the flat figure. */
  private fail() {
    if (this.failed) return;
    this.failed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.opts.onUnavailable();
  }

  /**
   * A (resolution: Ndppx) query matches only the ratio it was built with,
   * so it fires once when the window moves to a screen of another density
   * or the page is zoomed, and then has to be rebuilt for the new ratio.
   * ResizeObserver does not fire for either: the CSS size is unchanged.
   */
  private armDprQuery() {
    this.dprQuery?.removeEventListener("change", this.onDprChange);
    this.dprQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio || 1}dppx)`,
    );
    this.dprQuery.addEventListener("change", this.onDprChange);
  }

  private onDprChange() {
    this.armDprQuery();
    this.onResize();
  }

  private onResize() {
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    if (!width || !height) return;
    this.width = width;
    this.height = height;
    // Read again every time, not once at construction: a window dragged to
    // another screen, or a page zoom, changes it.
    this.renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setSize(width, height);
    // Resizing the canvas clears it, so there is always something to draw.
    this.dirty = true;

    const aspect = width / height;
    this.camDist = Math.max(
      FIT_VERTICAL / TAN_HALF_FOV,
      FIT_HORIZONTAL / (TAN_HALF_FOV * aspect),
    );
    this.camera.position.z = this.camDist;
    this.camera.perspective({ aspect });

    const viewport = [width * this.renderer.dpr, height * this.renderer.dpr];
    for (const program of [this.nodeProgram, this.haloProgram, this.edgeProgram]) {
      program.uniforms.uViewport.value = viewport;
      program.uniforms.uCamDist.value = this.camDist;
    }
    this.edgeProgram.uniforms.uDpr.value = this.renderer.dpr;

    // Label boxes change with the breakpoint's font size, so re-measure.
    this.labels.forEach((el, i) => {
      this.labelW[i] = el.offsetWidth;
      this.labelH[i] = el.offsetHeight;
    });
  }

  /* ---- pointer ---------------------------------------------------------- */

  private onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    this.dragging = true;
    this.dragX = e.clientX;
    this.dragY = e.clientY;
    this.dragTime = performance.now();
    this.velocity = 0;
    this.setHover(-1);
    try {
      this.host.setPointerCapture(e.pointerId);
    } catch {
      // A pointer that has already gone (a cancelled touch) cannot be
      // captured; the drag simply ends at the edge of the panel.
    }
  }

  private onPointerMove(e: PointerEvent) {
    if (this.dragging) {
      const now = performance.now();
      const dx = e.clientX - this.dragX;
      const dy = e.clientY - this.dragY;
      const dt = Math.max((now - this.dragTime) / 1000, 0.004);
      this.dragX = e.clientX;
      this.dragY = e.clientY;
      this.dragTime = now;
      this.yawTarget += dx * DRAG_YAW;
      this.pitchTarget = Math.min(
        PITCH_MAX,
        Math.max(PITCH_MIN, this.pitchTarget + dy * DRAG_PITCH),
      );
      const instant = Math.max(
        -MAX_VELOCITY,
        Math.min(MAX_VELOCITY, (dx * DRAG_YAW) / dt),
      );
      this.velocity = this.velocity * 0.5 + instant * 0.5;
      return;
    }
    if (!this.finePointer) return;
    const rect = this.host.getBoundingClientRect();
    this.setHover(this.hitTest(e.clientX - rect.left, e.clientY - rect.top));
  }

  private onPointerUp(e: PointerEvent) {
    if (!this.dragging) return;
    this.dragging = false;
    // Inertia: the turn carries on a little past the release and eases out.
    if (!this.reduced) this.yawTarget += this.velocity * FLING;
    try {
      this.host.releasePointerCapture(e.pointerId);
    } catch {
      // Already released.
    }
  }

  private onPointerLeave() {
    if (!this.dragging) this.setHover(-1);
  }

  /** Nearest front-facing disc under the pointer, or -1. Screen space. */
  private hitTest(x: number, y: number) {
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < N; i++) {
      const s = this.screen[i];
      if (!s.front) continue;
      const d = Math.hypot(s.x - x, s.y - y);
      if (d < s.r + 8 && d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }

  private setHover(index: number) {
    if (index === this.hovered) return;
    this.hovered = index;
    this.dirty = true;
    // The pointed-at label is marked by an underline rather than by dimming
    // the others: every label on the front of the shell stays at full
    // opacity, because the domain colours only just clear AA as it is.
    this.labels.forEach((el, i) => el.classList.toggle("underline", i === index));
    for (let i = 0; i < N; i++) {
      const on = index < 0 || i === index || LINKED[index].has(i);
      this.nodeIntensityTarget[i] = on ? 1 : 0.3;
      this.hoverTarget[i] = i === index ? 1 : 0;
    }
    LINKS.forEach(({ a, b, leg }, k) => {
      const on = index < 0 || a === index || b === index;
      // The trace dims less than the rest: it is the argument, and it
      // should still be there behind whatever is being pointed at.
      this.linkIntensityTarget[k] = on ? 1 : leg >= 0 ? 0.45 : 0.18;
    });
  }

  /* ---- frame ------------------------------------------------------------ */

  /**
   * One tick of the loop. Anything that throws in here — a driver fault, a
   * draw call the context no longer accepts — would otherwise surface as an
   * uncaught error once per frame over a frozen canvas, since it happens
   * outside React and the error boundary never sees it. Caught, it ends the
   * loop and swaps in the flat figure.
   */
  private update(now: number) {
    try {
      this.frame(now);
    } catch (error) {
      console.error("OntologyGraph: render loop failed, using static figure.", error);
      this.fail();
      return;
    }
    if (!this.failed) this.raf = requestAnimationFrame(this.update);
  }

  /** Whether every eased value has reached its target. */
  private settled() {
    if (
      Math.abs(this.yawTarget - this.yaw) > SETTLED ||
      Math.abs(this.pitchTarget - this.pitch) > SETTLED
    ) {
      return false;
    }
    for (let i = 0; i < N; i++) {
      if (
        Math.abs(this.nodeIntensityTarget[i] - this.nodeIntensity[i]) > SETTLED ||
        Math.abs(this.hoverTarget[i] - this.hoverAmount[i]) > SETTLED
      ) {
        return false;
      }
    }
    for (let i = 0; i < LINKS.length; i++) {
      if (Math.abs(this.linkIntensityTarget[i] - this.linkIntensity[i]) > SETTLED) {
        return false;
      }
    }
    return true;
  }

  private frame(now: number) {
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.05) : 1 / 60;
    this.last = now;

    /*
     * Under reduced motion there is no sway and the trace is lit whole with
     * no head, so the scroll position does not reach the picture either:
     * once everything has landed, the frame would be the last one again.
     * The loop keeps ticking, but a tick is this check and nothing else — no
     * buffer upload, no draw, no label layout — until a drag, a hover, a
     * resize or a theme change gives it something new. With motion on, the
     * sway moves every frame, so there is never a frame to skip.
     */
    if (this.reduced && !this.dirty && this.settled()) return;
    this.dirty = false;
    this.clock += dt;

    // Rotation eases toward its target; under reduced motion it lands
    // outright and there is no sway, so nothing moves that was not dragged.
    const ease = this.reduced ? 1 : 1 - Math.exp(-dt * 10);
    this.yaw += (this.yawTarget - this.yaw) * ease;
    this.pitch += (this.pitchTarget - this.pitch) * ease;
    const sway = this.reduced
      ? 0
      : Math.sin(this.clock * SWAY_RATE) * SWAY_AMPLITUDE;
    this.yawNode.rotation.y = this.yaw + sway;
    this.pitchNode.rotation.x = this.pitch;
    this.root.updateMatrixWorld();
    this.camera.updateMatrixWorld();

    const k = this.reduced ? 1 : 1 - Math.exp(-dt * 12);
    for (let i = 0; i < N; i++) {
      this.nodeIntensity[i] +=
        (this.nodeIntensityTarget[i] - this.nodeIntensity[i]) * k;
      this.hoverAmount[i] += (this.hoverTarget[i] - this.hoverAmount[i]) * k;
    }
    for (let i = 0; i < LINKS.length; i++) {
      this.linkIntensity[i] +=
        (this.linkIntensityTarget[i] - this.linkIntensity[i]) * k;
    }

    // World positions, once, for the sort, the labels and the hit test.
    const { world, v } = this;
    for (let i = 0; i < N; i++) {
      const [x, y, z] = LAYOUT[i].position;
      v.set(x, y, z).applyMatrix4(this.yawNode.worldMatrix);
      world[i * 3] = v.x;
      world[i * 3 + 1] = v.y;
      world[i * 3 + 2] = v.z;
    }

    /*
     * The trace, driven by the same scroll window the flat figure used: the
     * first leg draws across the first half of it and the second across the
     * second, and the head rides the leg being drawn. Under reduced motion
     * both legs are simply lit and there is no head.
     */
    const p = clamp01(this.opts.getProgress() || 0);
    const leg0 = this.reduced ? 1 : clamp01(p / 0.5);
    const leg1 = this.reduced ? 1 : clamp01((p - 0.5) / 0.5);
    this.edgeProgram.uniforms.uLegs.value[0] = leg0;
    this.edgeProgram.uniforms.uLegs.value[1] = leg1;
    const [t0, t1, t2] = TRACE_INDEX;
    const from = p < 0.5 ? t0 : t1;
    const to = p < 0.5 ? t1 : t2;
    const along = p < 0.5 ? leg0 : leg1;
    // Rotation is linear, so the lerp can be taken in the mesh's own space
    // for the instance and in world space for the depth sort, and the two
    // agree without an inverse matrix.
    const { headLocal } = this;
    for (let c = 0; c < 3; c++) {
      const a = LAYOUT[from].position[c];
      const b = LAYOUT[to].position[c];
      headLocal[c] = a + (b - a) * along;
      world[HEAD * 3 + c] =
        world[from * 3 + c] + (world[to * 3 + c] - world[from * 3 + c]) * along;
    }
    const headAlpha = this.reduced
      ? 0
      : Math.min(clamp01(p / 0.04), clamp01((1 - p) / 0.04));

    // Back to front, so a near disc paints over a far one.
    this.order.sort((a, b) => world[a * 3 + 2] - world[b * 3 + 2]);
    const { palette } = this;
    this.order.forEach((i, slot) => {
      if (i === HEAD) {
        this.instPos.set(headLocal, slot * 3);
        this.instColor.set(palette.trace, slot * 3);
        this.instSize[slot] = 0.028;
        this.instAlpha[slot] = headAlpha;
        this.instHalo[slot] = 1;
        return;
      }
      const node = LAYOUT[i];
      this.instPos.set(node.position, slot * 3);
      this.instColor.set(palette.domain[node.domain], slot * 3);
      this.instSize[slot] = node.size * (1 + this.hoverAmount[i] * 0.2);
      this.instAlpha[slot] = this.nodeIntensity[i];
      this.instHalo[slot] = Math.max(node.lit ? 1 : 0, this.hoverAmount[i]);
    });

    for (const name of ["iPos", "iColor", "iSize", "iAlpha", "iHalo"]) {
      this.nodeGeometry.attributes[name].needsUpdate = true;
    }
    for (let e = 0; e < LINKS.length; e++) {
      const value = this.linkIntensity[e];
      this.edgeIntensity[e * 4] = value;
      this.edgeIntensity[e * 4 + 1] = value;
      this.edgeIntensity[e * 4 + 2] = value;
      this.edgeIntensity[e * 4 + 3] = value;
    }
    this.edgeGeometry.attributes.aIntensity.needsUpdate = true;

    this.renderer.render({ scene: this.root, camera: this.camera });
    this.layoutLabels();
  }

  /* ---- labels ----------------------------------------------------------- */

  /**
   * Labels are HTML, positioned from the projected node each frame — text
   * stays crisp at any zoom and takes the theme's colour for free. A label
   * is clamped inside the panel at the rim, and yields to a higher-priority
   * neighbour when the two would collide: the hovered node first, then the
   * trace, then whichever is nearer.
   *
   * A label is either there at full strength or not there. It used to fade
   * with depth and with the hover dim, but the domain colours are text
   * colours with little to spare — --mark-3 on the light panel is 4.55:1 at
   * full opacity — so any fade put a readable label below AA. The depth cue
   * is the discs' and the edges' job; a label only fades across a thin band
   * at the horizon, so it does not blink as its node turns away, and is
   * gone once the node is behind.
   */
  private layoutLabels() {
    const { width, height, world, v, screen } = this;
    const focal = 1 / TAN_HALF_FOV;

    for (let i = 0; i < N; i++) {
      const wx = world[i * 3];
      const wy = world[i * 3 + 1];
      const wz = world[i * 3 + 2];
      v.set(wx, wy, wz);
      this.camera.project(v);
      const s = screen[i];
      s.x = (v.x + 1) * 0.5 * width;
      s.y = (1 - v.y) * 0.5 * height;
      s.r =
        (LAYOUT[i].size * (1 + this.hoverAmount[i] * 0.2) * focal * height) /
        (2 * (this.camDist - wz));
      s.front = wz / SHELL > -0.05;
    }

    const placed: { x0: number; y0: number; x1: number; y1: number }[] = [];
    const priority = (i: number) =>
      i === this.hovered ? 0 : LAYOUT[i].lit ? 1 : 2;
    const byPriority = Array.from({ length: N }, (_, i) => i).sort(
      (a, b) => priority(a) - priority(b) || world[b * 3 + 2] - world[a * 3 + 2],
    );

    for (const i of byPriority) {
      const el = this.labels[i];
      const s = screen[i];
      const w = this.labelW[i];
      const h = this.labelH[i];
      /*
       * On or off, never part-way. mark-3 holds 4.55:1 on the light inset
       * panel at full strength, so any fraction of it is under AA, and a
       * fractional alpha can be left standing indefinitely when a drag stops
       * with a node on the horizon. The span's own 150ms opacity transition
       * does the fading.
       */
      let alpha = s.front ? 1 : 0;

      let x0 = Math.round(s.x - w / 2);
      const y0 = Math.round(s.y + s.r + LABEL_GAP);
      x0 = Math.max(LABEL_PAD, Math.min(width - LABEL_PAD - w, x0));
      const outside =
        s.x < 0 || s.x > width || y0 < LABEL_PAD || y0 + h > height - LABEL_PAD;
      if (outside) alpha = 0;

      if (alpha > 0.02) {
        const rect = { x0: x0 - 2, y0: y0 - 2, x1: x0 + w + 2, y1: y0 + h + 2 };
        const collides = placed.some(
          (r) => rect.x0 < r.x1 && r.x0 < rect.x1 && rect.y0 < r.y1 && r.y0 < rect.y1,
        );
        if (collides) alpha = 0;
        else placed.push(rect);
      }

      el.style.transform = `translate3d(${x0}px, ${y0}px, 0)`;
      el.style.opacity = alpha.toFixed(3);
    }
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.motionQuery.removeEventListener("change", this.onMotionChange);
    this.dprQuery?.removeEventListener("change", this.onDprChange);
    const { host } = this;
    host.removeEventListener("pointerdown", this.onPointerDown);
    host.removeEventListener("pointermove", this.onPointerMove);
    host.removeEventListener("pointerup", this.onPointerUp);
    host.removeEventListener("pointercancel", this.onPointerUp);
    host.removeEventListener("pointerleave", this.onPointerLeave);

    const canvas = this.gl.canvas;
    canvas.removeEventListener("webglcontextlost", this.onContextLost);
    // Hand the context back rather than waiting on GC: the browser keeps a
    // small per-page budget of them.
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.parentNode?.removeChild(canvas);
  }
}

/* -------------------------------------------------------------------------- */
/* React                                                                      */
/* -------------------------------------------------------------------------- */

function Graph3D({ onUnavailable }: { onUnavailable: () => void }) {
  const { theme } = useTheme();
  const figureRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<GraphScene | null>(null);

  /*
   * The same scroll window the flat figure used, read by the render loop
   * each frame rather than bound to an element: the trace is drawn as you
   * move down the page, so how far along it you are is a function of where
   * you are. It runs from the graph reaching the lower part of the viewport
   * to it leaving the upper part, which is exactly the span it is readable.
   */
  const { scrollYProgress } = useScroll({
    target: figureRef,
    offset: ["start 0.85", "end 0.35"],
  });

  useEffect(() => {
    const host = hostRef.current;
    const labels = labelsRef.current;
    if (!host || !labels) return;

    // A reader who has asked for less data gets the flat picture; there is
    // no reason to spin up a GPU for them.
    if (window.matchMedia("(prefers-reduced-data: reduce)").matches) {
      onUnavailable();
      return;
    }

    let scene: GraphScene;
    try {
      scene = new GraphScene(host, labels, {
        getProgress: () => scrollYProgress.get(),
        onUnavailable,
      });
    } catch {
      onUnavailable();
      return;
    }
    scene.setPalette(readPalette(host));
    sceneRef.current = scene;

    return () => {
      scene.destroy();
      sceneRef.current = null;
    };
  }, [scrollYProgress, onUnavailable]);

  // The tokens are baked into uniforms, not read live, so a theme change
  // has to hand the scene the new values. Nothing is rebuilt for it.
  useEffect(() => {
    const host = hostRef.current;
    if (host && sceneRef.current) sceneRef.current.setPalette(readPalette(host));
  }, [theme]);

  return (
    <figure ref={figureRef}>
      {/*
        Everything inside is pixels and pointer handling, never text for a
        reader — the description below and the chain set beside the figure
        are what assistive tech is pointed at. The labels are inside the
        hidden region on purpose: they are positioned by the loop, in an
        order that changes every frame, and would read as noise.

        touch-pan-y: a horizontal drag turns the graph; a vertical one is
        left to the browser, so the page still scrolls through the panel on
        a phone. No wheel listener exists for the same reason.

        The height is an aspect on desktop and a floor on phones — at 4:3
        the panel's seven columns land at about 26rem, and a phone panel
        that followed the aspect would be too short to read. No min-width
        anywhere: the canvas is whatever the panel is.
      */}
      <motion.div
        ref={hostRef}
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.7, ease: EXPO_OUT }}
        className="relative aspect-[4/3] min-h-[20rem] w-full cursor-grab touch-pan-y select-none overflow-hidden rounded-[0.75rem] font-sans active:cursor-grabbing lg:min-h-[26rem]"
      >
        <div ref={labelsRef} className="pointer-events-none absolute inset-0">
          {NODES.map((n) => (
            <span
              key={n.id}
              className={`absolute top-0 left-0 whitespace-nowrap text-[11px] leading-none font-medium tracking-[0.01em] underline-offset-2 opacity-0 transition-opacity duration-150 will-change-transform lg:text-[12px] ${LABEL_COLOR[n.domain]}`}
            >
              {n.label}
            </span>
          ))}
        </div>
      </motion.div>

      <p className="sr-only">{DESCRIPTION}</p>

      <Caption />
    </figure>
  );
}

const noSubscription = () => () => {};

/**
 * False on the server and through hydration, true on every client render
 * after it. useSyncExternalStore uses the server snapshot while hydrating,
 * so the two passes agree, and then re-renders with the client one.
 */
function useHydrated() {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}

/**
 * The 3D figure, with the flat one behind it for every way it can fail:
 * no WebGL or a reduced-data preference at mount, a context lost later,
 * or anything the WebGL layer throws while rendering.
 *
 * The flat one is also what the server sends. The 3D figure is nothing but
 * an empty box until a script draws into it, so a reader without
 * JavaScript would get a blank panel; the SVG is a complete picture on its
 * own. It is swapped for the 3D one once hydration is done.
 */
const REDUCED_DATA = "(prefers-reduced-data: reduce)";

/** Whether the reader has asked for less data; false on the server. */
function useReducedData() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(REDUCED_DATA);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_DATA).matches,
    () => false,
  );
}

export function OntologyGraph() {
  const hydrated = useHydrated();
  const reducedData = useReducedData();
  const [mode, setMode] = useState<"webgl" | "static">("webgl");
  const showStatic = useCallback(() => setMode("static"), []);

  if (!hydrated || reducedData || mode === "static") return <StaticGraph />;
  return (
    <WebGLErrorBoundary name="OntologyGraph" fallback={<StaticGraph />}>
      <Graph3D onUnavailable={showStatic} />
    </WebGLErrorBoundary>
  );
}
