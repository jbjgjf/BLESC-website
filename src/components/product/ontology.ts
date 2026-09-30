/**
 * Where the テクノロジー figure puts each concept of the real seed.
 *
 * The data — concepts, relations, sources, counts — lives in
 * src/lib/ontologySeed.ts and nowhere else. This file is only the drawing's
 * geometry, keyed by the seed's own ids, so moving a dot can never change
 * what the page claims, and a concept that leaves the seed leaves a position
 * here that nothing reads.
 *
 * WHY A VENN. Membership is the one structural fact about the seed a reader
 * can take in at a glance: every concept belongs to one, two or all three of
 * the curated areas, and all three concepts the example path runs through
 * are among the ones shared between them. So the three areas are three
 * overlapping discs, and every dot sits in the region that matches its
 * `subgraphs` — nine of the twenty-eight sit in an overlap, and the three in
 * the middle (抑うつ傾向, 不安, 信頼できる大人とのつながり) are in all three
 * files. The overlap of 学業上の負荷 and 社会的ひきこもり outside 睡眠 is
 * empty because no concept is shared by exactly those two; it is left empty
 * rather than filled for balance.
 *
 * HOW THE POSITIONS WERE MADE. Not by hand alone: a constrained annealing
 * pass (region membership as a hard constraint, then edge crossings, edge
 * length, node spacing and node-to-line clearance) placed all twenty-eight,
 * and the best of eight runs was kept. It has four crossings among forty-one
 * drawn lines, every pair of dots at least 60 units apart, and no line
 * passing within 22 units of a dot that is not its own end. Every position
 * was then checked back against its region. If the seed changes, re-run
 * that pass rather than nudging dots: a dot moved by eye into the wrong
 * lens would be a false statement about which file a concept is in.
 *
 * Coordinates are in a 720 × 660 frame: the Venn's own bounding box, with
 * 45 units over the 睡眠 disc and 40 under the other two, which is what the
 * area names set in the frame's top centre and bottom corners need to clear
 * the discs at the narrowest width.
 */

import type { SubgraphId } from "@/lib/ontologySeed";

export const FRAME = { width: 720, height: 660 } as const;

/**
 * The three areas. Each disc's colour is its area's meaning mark, which the
 * dots of concepts found only in that area repeat; the concepts shared
 * between areas are drawn in ink instead, since no one area's colour would
 * be true of them.
 */
export const AREAS: Record<
  SubgraphId,
  { cx: number; cy: number; r: number; color: string }
> = {
  sleep: { cx: 360, cy: 240, r: 195, color: "var(--mark-1)" },
  academic_pressure: { cx: 235, cy: 415, r: 205, color: "var(--mark-3)" },
  social_withdrawal: { cx: 485, cy: 415, r: 205, color: "var(--mark-2)" },
};

export const POSITIONS: Record<string, readonly [number, number]> = {
  // 睡眠 only
  late_night_screen_use: [252, 106],
  fatigue: [346, 69],
  irritability: [470, 120],
  // 睡眠 × 学業上の負荷
  regular_sleep_schedule: [189, 240],
  sleep_deprivation: [260, 235],
  cognitive_impairment: [280, 300],
  academic_difficulty: [215, 331],
  // 睡眠 × 社会的ひきこもり
  school_absence: [463, 236],
  social_withdrawal: [505, 332],
  // all three
  depressed_mood: [353, 353],
  anxiety: [321, 408],
  trusted_adult_contact: [411, 369],
  // 学業上の負荷 only
  all_nighter_studying: [85, 313],
  sleep_onset_difficulty: [104, 378],
  anhedonia: [211, 399],
  avoiding_schoolwork: [152, 430],
  exam_pressure: [76, 474],
  assignment_deadline: [190, 537],
  study_plan_support: [111, 547],
  performance_expectation: [222, 596],
  // 社会的ひきこもり only
  futoko: [578, 260],
  shame_about_returning: [638, 318],
  school_counselor_access: [666, 401],
  help_seeking: [655, 478],
  loneliness: [523, 483],
  family_support: [437, 523],
  peer_friendship: [584, 566],
  peer_conflict: [453, 592],
};

/**
 * Which way a standing label sits from its dot.
 *
 * Chosen by a check rather than by eye: for each label and each direction,
 * the label's box — its real size in px, converted to frame units at the
 * frame's width — was tested against every other dot (with a 1.5px margin,
 * and the path's blue ring counted as part of its dot), against the frame's
 * sides, and against the other standing labels, at 400, 430 and 479px wide
 * for the 11px size and at 480, 520 and 576px for the 12px size. These are
 * the directions that cleared all of them. Lines may pass under a label —
 * its pill is what keeps it legible over them — but no dot is ever covered.
 */
export type Placement = "left" | "aboveLeft" | "aboveRight" | "belowRight";

/**
 * The names that stand without a pointer: the example path's three, which
 * the copy beside the figure also sets as text, and the two busiest concepts
 * outside it, one on each side, so each side of the picture has a name to
 * read it by. Every other concept is named on hover or tap, and every one of
 * them is in the text list under the section.
 *
 * `minWidth` is the frame width, not the viewport's, below which the label is
 * not drawn. Under 400px (a phone held upright) the path's three dots sit
 * closer together than their names are long, so no direction clears the
 * neighbouring dots; there the ordered list directly above the figure names
 * them, with the same ink-and-blue marker. The two hub names need the 12px
 * size's room and appear from 480px.
 */
export const STANDING_LABELS: readonly {
  id: string;
  placement: Placement;
  minWidth: "path" | "hub";
}[] = [
  { id: "sleep_deprivation", placement: "aboveLeft", minWidth: "path" },
  { id: "cognitive_impairment", placement: "left", minWidth: "path" },
  { id: "depressed_mood", placement: "aboveRight", minWidth: "path" },
  { id: "exam_pressure", placement: "belowRight", minWidth: "hub" },
  { id: "social_withdrawal", placement: "belowRight", minWidth: "hub" },
];
