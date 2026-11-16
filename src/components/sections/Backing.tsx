import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  BackingBand,
  type Backer,
  type BackerLogo,
} from "@/components/sections/BackingBand";
import type { Locale } from "@/lib/i18n";

/**
 * An entry as it is written here: the band's entry without its logo, and
 * the name of the file the logo is looked for under (see findLogo).
 */
type BackerSource = Omit<Backer, "logo"> & {
  /**
   * The logo's file name in public/backers/, without its extension. Fixed,
   * so that whoever has the file only has to save it there under this name
   * (public/backers/README.md says the same).
   */
  logoFile: string;
};

/**
 * Who stands behind Blesc, in the words the company confirmed: the Blesc
 * team on 2026-09-30, and the CEO on 2026-11-16.
 *
 * Each scope line is exactly what was confirmed, and it is kept to that on
 * purpose. docs/claims.md §3 does not allow an unscoped relationship word:
 * 共同研究, 監修, 協働, 提携 and 連携 each say something specific about what
 * an institution did. A word that is true in spirit is still a claim about
 * someone else's name, in copy read by schools and boards of education —
 * the kind of line that is most expensive to take back.
 *
 * 京都大学 — the written permission to name it is on file (2026-09-30,
 * recorded in scripts/check-claims.mjs PERMITTED_ORGS), with 支援 as its
 * first scope. On 2026-11-16 the CEO confirmed what the relationship is:
 * joint research with one research centre of the university, named in
 * full — 「京都大学大学院 教育学研究科 附属臨床教育実践研究センターとの共同研究」.
 * The line is that statement, word for word. The joint research is with
 * the centre, so the line names the centre and not the university alone;
 * the claims check passes 共同研究 beside 京都大学 only in this wording
 * (PERMITTED_RELATIONSHIPS) and still fails 監修 and the rest, with or
 * without the centre (unscoped-relationship). The wordmark above it stays
 * the university's name, which is who the centre belongs to.
 *
 * The English is the same statement with the centre under its own English
 * name, "Praxis and Research Center for Clinical Psychology and Education"
 * — the name Kyoto University's Graduate School of Education gives it in
 * its English overview: "1997 Praxis and Research Center for Clinical
 * Psychology and Education established", in
 * https://www.educ.kyoto-u.ac.jp/en/wp/wp-content/uploads/2026/06/overview_2026.pdf
 * — followed by the school and the university, as the Japanese names them.
 * It is written as one string so that the claims check can read it whole.
 *
 * The `\n` in the Japanese line is not part of the wording. It marks the
 * one place, besides the line's own two spaces, where the line may break —
 * before との — and is drawn as a <wbr>, with no space (see ScopeLine in
 * BackingBand). Without it the line's longest unbroken run would be
 * 附属臨床教育実践研究センターとの共同研究, twenty ems, wider than a 320px
 * phone leaves. `measure` holds each language's line to a width that sets
 * it as the band's layout expects (the numbers are in the note on
 * BackingBand).
 *
 * ANOBAKA — the relationship is selection into a named programme, so the
 * line is the programme and the result: 「U-25 AI Accelerator 第2期 採択」.
 * It is an accelerator and not an investment. ANOBAKA is itself a venture
 * capital firm — the reviewer's own shorthand was "ANOBAKA VC" — which is
 * exactly why VC / 出資 / 投資 must never appear beside it: a reader would
 * take them as a statement that it holds equity in Blesc. The check
 * enforces that too (accelerator-as-investment). The English is the same
 * claim: 第2期 採択 is "Cohort 2 — selected".
 *
 * Logos — both may be shown (the CEO, 2026-11-16). An entry shows its
 * wordmark until a file is saved under public/backers/ with the name in
 * `logoFile`, and its logo from the next build; nothing else has to
 * change. A logo replaces the name only. The scope line stays, because it
 * is the claim.
 *
 * No amount is printed here. An amount is an event, not a relationship, so
 * it goes in ニュース (src/lib/news.ts), with the selection it came with.
 *
 * No 監修者 is listed because none has been named. An expert added here
 * before one is agreed would be the same failure as the 京都大学
 * collaboration line テクノロジー once carried, and had to drop, before any
 * permission existed.
 *
 * The claims check only knows a handful of English stems, so the English
 * rule is kept by hand here as well: no word beside either name that says
 * more than these lines do.
 */
const BACKERS: BackerSource[] = [
  {
    name: { ja: "京都大学", en: "Kyoto University" },
    scope: {
      ja: "京都大学大学院 教育学研究科 附属臨床教育実践研究センター\nとの共同研究",
      en: "Joint research with the Praxis and Research Center for Clinical Psychology and Education, Graduate School of Education, Kyoto University",
    },
    measure: { ja: "w-min", en: "max-w-[18rem]" },
    logoFile: "kyoto-university",
  },
  {
    name: { ja: "ANOBAKA", en: "ANOBAKA" },
    scope: {
      ja: "U-25 AI Accelerator 第2期 採択",
      en: "U-25 AI Accelerator,\nCohort 2 — selected",
    },
    logoFile: "anobaka",
  },
];

/**
 * The band's label: what the entries under it are to Blesc, and nothing
 * more.
 *
 * 共同研究・採択 is exactly the two relationships below it — the joint
 * research and the programme selection — the way 支援・採択 was before the
 * joint research was confirmed. It says nothing they do not, and it does
 * not repeat either line word for word.
 *
 * "Research and programs" is the same pair in English: 京都大学's entry is
 * research, ANOBAKA's a programme. It replaces "Backed by", which named
 * one relationship that no longer describes both — and which, beside the
 * name of a firm that runs a venture fund, could be read as an
 * investment, the one thing that must not be implied about ANOBAKA.
 * Nothing is to be added to either label: no partner, investor, sponsor or
 * affiliate. Each says what kind of relationship the band lists; the line
 * under each name says exactly which.
 */
const LABEL: Record<Locale, string> = {
  ja: "共同研究・採択",
  en: "Research and programs",
};

/** Where logos are looked for, and the types looked for, best first. */
const LOGO_DIR = path.join(process.cwd(), "public", "backers");
const LOGO_TYPES = ["svg", "png"] as const;

/**
 * An entry's logo, if a file for it has been saved: public/backers/
 * <logoFile>.svg, or .png when there is no SVG.
 *
 * This is why Backing is a server component. It runs when the page is
 * built (and on every request on the dev server), so a file dropped into
 * public/backers/ is picked up by the next deploy with no code changed,
 * and a missing one costs nothing — the entry keeps its wordmark.
 *
 * A file that is there but whose size cannot be read stops the build
 * rather than being skipped: a logo saved and silently not shown would be
 * a harder fault to find than a build that names the file.
 */
function findLogo(file: string): BackerLogo | undefined {
  for (const type of LOGO_TYPES) {
    const full = path.join(LOGO_DIR, `${file}.${type}`);
    if (!existsSync(full)) continue;
    const size =
      type === "svg"
        ? svgSize(readFileSync(full, "utf8"))
        : pngSize(readFileSync(full));
    if (!size) {
      throw new Error(
        `public/backers/${file}.${type}: cannot read the logo's size. ${
          type === "svg"
            ? "Give the <svg> a viewBox, or a width and height in px."
            : "Save it as a PNG file."
        }`,
      );
    }
    return { src: `/backers/${file}.${type}`, ...size };
  }
  return undefined;
}

/**
 * An SVG's own size, from the root element: its viewBox, which every
 * design tool writes, or failing that a width and height in px or with no
 * unit. Only the ratio is used, to hold the logo's box before it loads.
 */
function svgSize(svg: string) {
  const root = svg.match(/<svg\b[^>]*>/i)?.[0];
  if (!root) return null;
  const viewBox = root.match(/\sviewBox\s*=\s*["']([^"']+)["']/i)?.[1];
  if (viewBox) {
    const [, , width, height] = viewBox.trim().split(/[\s,]+/).map(Number);
    if (width > 0 && height > 0) return { width, height };
  }
  const width = pixels(root.match(/\swidth\s*=\s*["']([^"']+)["']/i)?.[1]);
  const height = pixels(root.match(/\sheight\s*=\s*["']([^"']+)["']/i)?.[1]);
  return width && height ? { width, height } : null;
}

/** A length in px or with no unit; anything else (%, mm, em) is unknown. */
function pixels(value: string | undefined) {
  const n = value?.trim().match(/^(\d+(?:\.\d+)?)(?:px)?$/)?.[1];
  return n && Number(n) > 0 ? Number(n) : null;
}

/** A PNG's size in pixels, from its IHDR chunk, which always comes first. */
function pngSize(file: Buffer) {
  const signature = "89504e470d0a1a0a";
  if (file.length < 24 || file.subarray(0, 8).toString("hex") !== signature) {
    return null;
  }
  if (file.subarray(12, 16).toString("latin1") !== "IHDR") return null;
  const width = file.readUInt32BE(16);
  const height = file.readUInt32BE(20);
  return width > 0 && height > 0 ? { width, height } : null;
}

/**
 * 共同研究・採択 — a band, not a section, between チーム and ニュース.
 *
 * A server component: it reads the entries' logos from public/backers/
 * (findLogo) and hands the band its words in both languages. How the band
 * is laid out and moves is in BackingBand, the client component that draws
 * it — it has to be one, to read the scroll that turns its flower. So is
 * the type: why a Latin name is set a size above a Japanese one, which
 * other pages cite as the reason Backing gives, is WORDMARK_SIZE there.
 */
export function Backing({ locale }: { locale?: Locale }) {
  const backers: Backer[] = BACKERS.map(({ logoFile, ...backer }) => {
    const logo = findLogo(logoFile);
    return logo ? { ...backer, logo } : backer;
  });
  return <BackingBand locale={locale} label={LABEL} backers={backers} />;
}
