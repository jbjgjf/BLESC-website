"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  buildThread,
  gutterX,
  nodeOpacity,
  threadProgress,
  type Box,
  type Thread,
} from "@/components/flourish/threadPath";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";

/**
 * The three points the thread is strung between, in the order it runs: the
 * flagged row the analysis produces in 仕組み, the same row arriving in the
 * teacher's report in プロダクト, and the graph in テクノロジー that produced
 * it. Each is marked in the markup with data-thread="…", which is all a
 * section has to know.
 */
const ANCHORS = ["analysis", "report", "graph"] as const;

/** Tailwind's lg — the width below which the layer is display: none. */
const WIDE = "(min-width: 64rem)";

/*
 * The line's weight and the beads' size. 1.5px at 55% was tried first and
 * read as a hairline nobody noticed; the thread is the one drawn thing that
 * ties three sections together, so it is set heavier than the page's other
 * rules and at full strength, with a short bright tip in the logo's blue
 * riding the end of the drawn portion and a ring that opens out of each
 * bead as the tip passes through it.
 */
const STROKE = 2.5;
const NODE_R = 5;
const RING = 3;
/** Length of the bright tip, as a fraction of the path. */
const TIP = 0.05;
/** How far past a bead the tip travels while the bead's ring opens and fades. */
const PULSE = 0.06;
const PULSE_R = 18;

type Geometry = Thread & {
  /**
   * The landmarks again as document y, which is what the reader's centre
   * line is compared against per frame.
   */
  stops: { y: number; t: number }[];
  /** The viewport height at measurement, so no frame has to ask the window. */
  vh: number;
  /** All of the above, serialised: a re-measurement that changes nothing does not re-render. */
  key: string;
};

/**
 * One hairline that carries the signal from 仕組み to プロダクト to
 * テクノロジー, drawn by scroll.
 *
 * The anchors sit inside three sections wrapped by two different positioned
 * boxes (ScrollFlower's and ScrollWash's), and this layer has to paint above
 * each section's bg-canvas fill and below its Container — which only a
 * positioned z-0 layer rendered inside the same wrapper as those fills can
 * do. A single layer in an outer wrapper would be painted before both inner
 * wrappers and buried under their fills. So the page renders one instance of
 * this component as the first child of each wrapper; every instance finds
 * all three anchors, draws the entire thread in its own wrapper's coordinate
 * space, and lets the SVG's box clip it to that wrapper. The two drawings
 * meet at the boundary on the same vertical in the gutter, so the line is
 * continuous, and both are driven by the same window scroll, so they always
 * agree on how far it is drawn.
 *
 * Measured with an offsetTop/offsetLeft chain, never getBoundingClientRect:
 * every section's content arrives through a <Reveal> that translates it for
 * 0.7s, and a client rect taken in that window is off by up to 24px. Offsets
 * are layout positions and ignore transforms. The measurement runs once on
 * mount and again when the wrapper or the document changes size, debounced
 * to one per frame; nothing is measured on scroll.
 *
 * Hidden below lg — there is no gutter to run in — and not measured there
 * either: a display: none layer has no offsetParent, which is the check.
 */
export function SignalThread() {
  const layerRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const [geom, setGeom] = useState<Geometry | null>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const next = measure(layer);
        setGeom((prev) => (prev?.key === next?.key ? prev : next));
      });
    };

    /*
     * The wrapper for its own width and height; the body for anything above
     * the wrapper that changes height, which moves the anchors in document
     * space without touching the wrapper. Fonts loading do both.
     */
    const observer = new ResizeObserver(schedule);
    if (layer.parentElement) observer.observe(layer.parentElement);
    observer.observe(document.body);
    const wide = window.matchMedia(WIDE);
    wide.addEventListener("change", schedule);
    // A height-only resize changes the centre line and nothing the observer sees.
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      wide.removeEventListener("change", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  /*
   * Window scroll rather than a target: the thread spans two wrappers, and
   * the reader's centre line against the anchors' document positions is the
   * one measure both instances share. Under reduced motion the whole line is
   * drawn and stays drawn — the range collapses, the style prop stays.
   *
   * Nothing is drawn until there is geometry, and that check comes before the
   * reduced-motion one: the server and the hydration pass both render with no
   * geometry, so they write the same dash attributes whatever the visitor's
   * setting. The flag is usePrefersReducedMotion for the same reason — it
   * agrees with the server through hydration — and has its real value long
   * before the first measurement, which waits for a frame after mount.
   */
  const { scrollY } = useScroll();
  const drawn = useTransform(() => {
    const y = scrollY.get();
    if (!geom) return 0;
    if (reduce) return 1;
    return threadProgress(geom.stops, y + geom.vh / 2);
  });
  const fades = [
    useNodeFade(drawn, geom?.nodes[0]?.t),
    useNodeFade(drawn, geom?.nodes[1]?.t),
    useNodeFade(drawn, geom?.nodes[2]?.t),
  ];
  const pulses = [
    useNodePulse(drawn, geom?.nodes[0]?.t),
    useNodePulse(drawn, geom?.nodes[1]?.t),
    useNodePulse(drawn, geom?.nodes[2]?.t),
  ];
  /* The tip sits just behind the drawn end; before anything is drawn it has no length. */
  const tipOffset = useTransform(() => Math.max(0, drawn.get() - TIP));
  const tipLength = useTransform(() => Math.min(TIP, drawn.get()));

  return (
    <div
      ref={layerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
    >
      {/*
        No viewBox: user units are the wrapper's own pixels, which is the
        space the geometry was measured in. The SVG keeps its default
        overflow, so it shows exactly the part of the thread inside this
        wrapper and the other instance shows the rest.
      */}
      <svg className="block h-full w-full" fill="none">
        {/* The whole route, faint, so the eye knows where the line is going. */}
        <path
          d={geom?.d ?? ""}
          stroke="var(--mark-1)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.14}
        />
        {/* The drawn portion, at full strength. */}
        <motion.path
          d={geom?.d ?? ""}
          pathLength={1}
          stroke="var(--mark-1)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: drawn }}
        />
        {/*
          The tip: a short run of the logo's own blue, wider than the line,
          riding the end of what is drawn — the signal itself, travelling.
        */}
        <motion.path
          d={geom?.d ?? ""}
          pathLength={1}
          stroke="var(--color-primary)"
          strokeWidth={STROKE + 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: tipLength, pathOffset: tipOffset }}
        />
        {/*
          A bead at each anchor: the mark, with a ring of the page ground
          under it that knocks the line out around the dot. Each one comes
          up as the drawn tip reaches it, and a second ring opens out of it
          and fades as the tip passes on through.
        */}
        {geom?.nodes.map((node, i) => (
          <motion.g key={i} style={{ opacity: fades[i] }}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              fill="none"
              stroke="var(--mark-1)"
              strokeWidth={1.5}
              style={{ r: pulses[i].r, opacity: pulses[i].opacity }}
            />
            <circle cx={node.x} cy={node.y} r={NODE_R + RING} fill="var(--color-bg)" />
            <circle cx={node.x} cy={node.y} r={NODE_R} fill="var(--mark-1)" />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

function useNodeFade(drawn: MotionValue<number>, t: number | undefined) {
  return useTransform(() => nodeOpacity(drawn.get(), t));
}

/**
 * The ring that opens out of a bead as the tip passes it: from the bead's
 * own radius to PULSE_R while the tip travels PULSE of the path beyond the
 * bead, fading as it grows. A pure function of how far the line is drawn,
 * so it plays forwards when scrolling down and in reverse coming back up.
 */
function useNodePulse(drawn: MotionValue<number>, t: number | undefined) {
  const r = useTransform(() => {
    if (t === undefined) return NODE_R;
    const k = Math.min(1, Math.max(0, (drawn.get() - t) / PULSE));
    return NODE_R + (PULSE_R - NODE_R) * k;
  });
  const opacity = useTransform(() => {
    if (t === undefined) return 0;
    const k = Math.min(1, Math.max(0, (drawn.get() - t) / PULSE));
    return k <= 0 || k >= 1 ? 0 : 0.7 * (1 - k);
  });
  return { r, opacity };
}

/** Layout position in the document: the offset chain summed to the root. */
function docOffset(el: HTMLElement) {
  let top = 0;
  let left = 0;
  let node: Element | null = el;
  while (node instanceof HTMLElement) {
    top += node.offsetTop;
    left += node.offsetLeft;
    node = node.offsetParent;
  }
  return { top, left };
}

/**
 * The thread for this layer, or null when the layer is hidden or fewer than
 * two anchors exist. An anchor that is missing is simply left out, so a
 * section that changes shape costs one segment, not the whole thread.
 */
function measure(layer: HTMLDivElement): Geometry | null {
  const wrapper = layer.offsetParent;
  if (!(wrapper instanceof HTMLElement)) return null;

  const origin = docOffset(wrapper);
  const boxes: Box[] = [];
  for (const name of ANCHORS) {
    const el = document.querySelector(`[data-thread="${name}"]`);
    if (!(el instanceof HTMLElement)) continue;
    const at = docOffset(el);
    boxes.push({
      x: at.left - origin.left,
      y: at.top - origin.top,
      w: el.offsetWidth,
      h: el.offsetHeight,
    });
  }

  const thread = buildThread(boxes, gutterX(wrapper.offsetWidth));
  if (!thread) return null;

  const stops = thread.marks.map((m) => ({ y: m.y + origin.top, t: m.t }));
  const vh = window.innerHeight;
  return {
    ...thread,
    stops,
    vh,
    key: `${thread.d}|${stops.map((s) => `${s.y}:${s.t}`).join(",")}|${vh}`,
  };
}
