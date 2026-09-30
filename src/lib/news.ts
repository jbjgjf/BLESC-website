/**
 * The ニュース register — the entries, and the two small rules (date display
 * and order) the section needs to render them.
 *
 * Real entries only. The placeholder list that used to sit in the section was
 * removed rather than kept alongside, because a press list that mixes
 * placeholders with real entries is worse than one that is short. Every entry
 * below is something the company did, and every date is the organiser's own —
 * the entry's comment says where on the organiser's pages it was checked.
 *
 * Institution names follow docs/claims.md §3. Kyoto University's support is
 * stated in the backing section (Backing.tsx) and nowhere else, so it has no
 * row here.
 *
 * The entries live here rather than in the component so that adding one — or
 * adding the photo to one — is a data edit, not a layout edit.
 */

/**
 * `YYYY-MM-DD`, or `YYYY-MM` when only the month is public. The type catches
 * the obvious slips (a slash, a missing part) at compile time;
 * `formatNewsDate` checks the digits and fails the build on anything else.
 */
export type NewsDate = `${number}-${number}` | `${number}-${number}-${number}`;

/**
 * A photograph of the event itself, supplied by the company.
 *
 * Only the company's own pictures go here. A free stock photo of a stage or a
 * trophy standing in for an event the company actually attended would be the
 * same failure as an invented entry, just harder to spot — an entry without a
 * photo is complete as it is.
 */
export type NewsPhoto = {
  /** A path under public/, e.g. "/news/ivs-2026.jpg". */
  src: string;
  /**
   * The file's own pixel size. The frame is always 3:2 whatever the file is;
   * next/image still needs the real numbers to build its srcset.
   */
  width: number;
  height: number;
  /**
   * What is in the picture — who, and which moment — written from the photo
   * itself. The photo is part of the entry, not decoration, so it is not
   * aria-hidden and this is not optional. (The copy that follows the pointer
   * over a closed row is the one exception: it repeats this photo, so it is
   * hidden and the one in the opened row carries the alt.)
   */
  alt: string;
  /**
   * Which part of the picture survives the 3:2 crop. A portrait phone shot of
   * a group on a stage loses its heads at "center"; "top" keeps them.
   */
  position?: "top" | "center" | "bottom";
};

export type NewsEntry = {
  /**
   * "news" is something that happened to Blesc out in the world — an award,
   * a selection, a talk. "activity" is 活動様子: the team at work, a school
   * visit, progress. Both render as the same row today; the field exists so
   * that activity can be filtered or split into its own list later without
   * re-reading every entry to decide which is which.
   */
  kind: "news" | "activity";
  /**
   * Optional, and never guessed: an event the company attended but cannot
   * date publicly goes in undated rather than with an approximate day.
   */
  date?: NewsDate;
  /**
   * The proper noun, set at display size. Read `name` and `body` together and
   * they are the entry as the company wrote it, minus the 「」 that the large
   * type now does the work of — which is why several bodies open with a
   * particle.
   *
   * Breaks in the name fall only at spaces (the section sets it keep-all), so
   * a long Japanese compound needs a break opportunity written in: `\u200B`,
   * a zero-width space, between two phrases. Without one, a compound such as
   * 「ビジネスプランコンテスト」 at 60px breaks wherever the line runs out.
   * Write it as the escape, never as the character itself: pasted in, it is
   * invisible in the editor, and the next person to retype the name drops it
   * without knowing.
   */
  name: string;
  /** One sentence. */
  body: string;
  photo?: NewsPhoto;
  /**
   * Where the fact and the date were checked. Provenance for whoever edits
   * this next — never rendered. There are no article pages, so an entry
   * links nowhere and carries no arrow: a headline that looks like a link to
   * a page that does not exist is worse than one that plainly isn't one. The
   * one thing a row does is open, in place, to its own sentence and photo.
   */
  source?: string;
};

const ENTRIES: NewsEntry[] = [
  {
    kind: "news",
    date: "2026-07-10",
    name: "Teenage Business Contest Japan 2026",
    body: "で、優秀賞を受賞しました。",
    photo: {
      src: "/news/tbcj-2026.jpg",
      width: 828,
      height: 1104,
      alt: "Teenage Business Contest Japanの優秀賞の賞状とポスターを手にしたBlescのメンバー2人",
    },
    // The page below is the '26 finalist list. The final's date is on
    // https://www.tbcj.net/timeline ("Final Contest: July 10th"). The prize
    // is on the team's own photo: the certificate reads EXCELLENCE PRIZE,
    // awarded to Ryu Matsumoto & Uryu Den.
    source: "https://www.tbcj.net/about-3",
  },
  {
    kind: "news",
    date: "2026-07-17",
    name: "Startup World Cup 2026 Tokyo予選",
    body: "のユースピッチにファイナリストとして登壇しました。",
    photo: {
      src: "/news/startup-world-cup-2026.jpg",
      width: 1206,
      height: 1608,
      alt: "Startup World Cupのパネルの前で、トロフィーを持つBlescのメンバー2人",
    },
    // Every youth finalist was handed a trophy, so the photo shows the
    // finalist's trophy, not a placing. The release gives the Tokyo qualifier as 2026年7月17日. Its photo
    // caption spells the team 「Blessed」, so search for that when checking.
    source: "https://prtimes.jp/main/html/rd/p/000000217.000044738.html",
  },
  {
    kind: "news",
    date: "2026-09",
    name: "ANOBAKA",
    body: "U-25 AI Accelerator 第2期に採択され、支援金10万円を受けました。",
    photo: {
      src: "/news/anobaka-u25-2026.jpg",
      width: 1206,
      height: 904,
      alt: "ANOBAKA U-25 AI Acceleratorのボードを持つBlescのメンバー",
    },
    // The release is the call for 第2期 applications, published before
    // selection, so it names no teams. 2026-09 is the programme's start
    // (実施期間 2026年9月1日〜). 10万円 is the amount the team received,
    // confirmed by the team on 2026-09-30.
    source: "https://prtimes.jp/main/html/rd/p/000000065.000056016.html",
  },
  {
    kind: "news",
    name: "SusHi Tech Tokyo",
    body: "に登壇し、Blescの取り組みについて発表しました。",
  },
  {
    kind: "news",
    date: "2026-07-03",
    name: "IVS",
    body: "YOUTH部門において、優秀賞を受賞しました。",
    photo: {
      src: "/news/ivs-2026.jpg",
      width: 1206,
      height: 904,
      alt: "IVS2026の会場前で、花束を手にしたBlescのメンバー2人",
    },
    // The team's photo is a front-camera selfie, stored un-mirrored so the
    // banner and the lanyards read IVS2026. IVS2026 ran 2026年7月1日〜3日,
    // and IVS Youth was held on 7月3日 (the release below).
    source: "https://prtimes.jp/main/html/rd/p/000000231.000059319.html",
  },
];

const ISO_DATE = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/;

/**
 * 2026-06-20 → 2026年6月20日, 2026-09 → 2026年9月.
 *
 * Done on the string rather than through Date: a date-only ISO string is
 * parsed as UTC midnight, and read back in any timezone west of Greenwich it
 * is the day before. The page is prerendered, so a malformed date throws at
 * build time instead of reaching the page as "NaN年".
 *
 * The shape alone would pass 2026-17-06, the day and month swapped, and print
 * 2026年17月6日; so the month and day are range-checked too. Date.UTC is only
 * the calendar here — it rolls 2026-02-30 over into March, and a day that
 * comes back different is one the month does not have.
 */
export function formatNewsDate(date: NewsDate): string {
  const match = ISO_DATE.exec(date);
  if (!match) {
    throw new Error(`News date "${date}" is not YYYY-MM or YYYY-MM-DD.`);
  }
  const [, year, month, day] = match;
  const m = Number(month);
  const d = day ? Number(day) : 1;
  if (
    m < 1 ||
    m > 12 ||
    new Date(Date.UTC(Number(year), m - 1, d)).getUTCDate() !== d
  ) {
    throw new Error(`News date "${date}" is not a real date.`);
  }
  return `${year}年${m}月${day ? `${d}日` : ""}`;
}

/**
 * Newest first, undated after dated.
 *
 * ISO dates sort as plain strings, which is why they are stored that way. A
 * month-only date is a prefix of every day in its month, so it lands after
 * that month's dated entries — "sometime in September" reads naturally below
 * the 15th. The sort is stable, so undated entries, and entries sharing a
 * date, keep the order they are written in above.
 */
function byDateDesc(a: NewsEntry, b: NewsEntry): number {
  if (a.date && b.date) return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  if (a.date) return -1;
  if (b.date) return 1;
  return 0;
}

export const NEWS: readonly NewsEntry[] = [...ENTRIES].sort(byDateDesc);
