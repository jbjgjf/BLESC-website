/**
 * The geometry of the signal thread, kept apart from the component so it can
 * be checked without a browser: hand it the anchor boxes and a width and it
 * returns the path, where each anchor sits along it, and the landmarks the
 * scroll map needs. Nothing in this file measures anything.
 *
 * Every coordinate is in the space of the positioned box the SVG fills. The
 * component converts to and from the document; this file never sees it.
 */

/** An anchor's box: its offset within the SVG's box, and its size. */
export type Box = { x: number; y: number; w: number; h: number };

export type Thread = {
  /** The whole thread, as one path. */
  d: string;
  /**
   * Where each anchor sits, and how far along the path (0–1) the thread has
   * to be drawn to reach it.
   */
  nodes: { x: number; y: number; t: number }[];
  /**
   * The landmarks the scroll map interpolates between: a y in the same
   * space, and the fraction of the path that should be drawn when the
   * reader's centre line is level with it. Anchors' tops and feet, in order.
   */
  marks: { y: number; t: number }[];
};

/** The Containers' measure — max-w-[68rem] at the 16px root. */
const MEASURE = 68 * 16;
/** How far outside that measure the gutter run sits, and its floor once the measure fills the screen. */
const GUTTER_GAP = 40;
const GUTTER_MIN = 24;
/**
 * Elbow radius. Every turn is a quadratic curve from one leg to the next
 * with the corner as its control point; a quarter-turn of that shape at
 * radius r is 1.62332r long (the integral of its speed, checked
 * numerically), which is what lets the path's length be known without
 * asking the browser for it.
 */
const RADIUS = 28;
const ELBOW = 1.62332;
/**
 * Where the horizontal crossings fall, as fractions of the drop between one
 * anchor's foot and the next one's top. Leaving at 35% puts the first
 * crossing below the 仕組み captions and inside the air between that section
 * and プロダクト at the common desktop widths; arriving at 25% puts the
 * second one in the gap above the product figure rather than across the
 * lead sentence. Both are clamped so a very tall or very short drop cannot
 * push a crossing into the anchor itself.
 */
const LEAD_OUT = 0.35;
const LEAD_IN = 0.25;
const LEAD_MIN = 40;
const LEAD_OUT_MAX = 320;
const LEAD_IN_MAX = 240;
/** Fraction of the path over which a node fades in once the drawn tip reaches it. */
const NODE_FADE = 0.03;

/** The x of the gutter run for a given wrapper width. */
export function gutterX(width: number): number {
  return Math.max(GUTTER_MIN, (width - MEASURE) / 2 - GUTTER_GAP);
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** Two decimals is well under a device pixel and keeps the attribute short. */
const f = (n: number) => (Math.round(n * 100) / 100).toString();

/**
 * One path through the anchors, in the order given.
 *
 * Each anchor is left from its centre-bottom and the next is entered at its
 * centre-top from directly above: a vertical lead, a rounded turn towards
 * the gutter, a horizontal run, a turn down, the long run in the gutter, a
 * turn back in, a horizontal run, and a turn down into the anchor. Between
 * arriving at an anchor and leaving it the path runs straight through the
 * box — that stretch is behind whatever the anchor is drawn on, and it is
 * what keeps this one path rather than three.
 *
 * A drop too short for two leads and four turns is joined with a straight
 * line instead, so a stray layout can never produce a path that doubles
 * back on itself. Fewer than two anchors is no thread at all.
 */
export function buildThread(boxes: Box[], gx: number): Thread | null {
  if (boxes.length < 2) return null;

  const parts: string[] = [];
  const nodes: { x: number; y: number; len: number }[] = [];
  const marks: { y: number; len: number }[] = [];
  let length = 0;
  let cx = boxes[0].x + boxes[0].w / 2;
  let cy = boxes[0].y + boxes[0].h;

  parts.push(`M ${f(cx)} ${f(cy)}`);
  nodes.push({ x: cx, y: cy, len: 0 });
  marks.push({ y: cy, len: 0 });

  const line = (x: number, y: number) => {
    length += Math.hypot(x - cx, y - cy);
    cx = x;
    cy = y;
    parts.push(`L ${f(x)} ${f(y)}`);
  };
  const turn = (qx: number, qy: number, x: number, y: number, r: number) => {
    length += ELBOW * r;
    cx = x;
    cy = y;
    parts.push(`Q ${f(qx)} ${f(qy)} ${f(x)} ${f(y)}`);
  };

  for (let i = 1; i < boxes.length; i++) {
    const box = boxes[i];
    const tx = box.x + box.w / 2;
    const ty = box.y;
    const dy = ty - cy;

    if (dy >= 2 * LEAD_MIN + 4 * RADIUS) {
      const outY = cy + clamp(dy * LEAD_OUT, LEAD_MIN, LEAD_OUT_MAX);
      const inY = ty - clamp(dy * LEAD_IN, LEAD_MIN, LEAD_IN_MAX);
      /*
       * The radius gives way to whichever leg is shortest, so an anchor
       * that happens to sit almost over the gutter still gets a turn that
       * fits rather than one that overshoots.
       */
      const r = Math.max(
        0,
        Math.min(
          RADIUS,
          (inY - outY) / 2,
          Math.abs(gx - cx) / 2,
          Math.abs(tx - gx) / 2,
        ),
      );
      const out = Math.sign(gx - cx) || 1;
      const back = Math.sign(tx - gx) || 1;

      line(cx, outY - r);
      turn(cx, outY, cx + out * r, outY, r);
      line(gx - out * r, outY);
      turn(gx, outY, gx, outY + r, r);
      line(gx, inY - r);
      turn(gx, inY, gx + back * r, inY, r);
      line(tx - back * r, inY);
      turn(tx, inY, tx, inY + r, r);
      line(tx, ty);
    } else {
      line(tx, ty);
    }

    nodes.push({ x: tx, y: ty, len: length });
    marks.push({ y: ty, len: length });

    // Through the anchor to its foot, where the next segment leaves from.
    if (i < boxes.length - 1) {
      line(tx, box.y + box.h);
      marks.push({ y: box.y + box.h, len: length });
    }
  }

  const total = length || 1;
  return {
    d: parts.join(" "),
    nodes: nodes.map(({ x, y, len }) => ({ x, y, t: len / total })),
    marks: marks.map(({ y, len }) => ({ y, t: len / total })),
  };
}

/**
 * How much of the path is drawn when the reader's centre line is at y —
 * linear between landmarks and held at the ends, so the drawn tip is level
 * with the reader at every anchor and simply moves faster along the
 * horizontal runs in between.
 */
export function threadProgress(marks: { y: number; t: number }[], y: number): number {
  if (marks.length === 0) return 0;
  if (y <= marks[0].y) return marks[0].t;
  for (let i = 1; i < marks.length; i++) {
    const a = marks[i - 1];
    const b = marks[i];
    if (y <= b.y) {
      return b.y === a.y ? b.t : a.t + ((y - a.y) / (b.y - a.y)) * (b.t - a.t);
    }
  }
  return marks[marks.length - 1].t;
}

/**
 * A node's opacity for a given drawn fraction: off until the tip reaches
 * it, then in over a short window. The last node's window is pulled back
 * inside the path so it can still complete when the tip stops at 1.
 */
export function nodeOpacity(drawn: number, t: number | undefined): number {
  if (t === undefined) return 0;
  const start = Math.min(t, 1 - NODE_FADE);
  return clamp((drawn - start) / NODE_FADE, 0, 1);
}
