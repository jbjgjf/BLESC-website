#!/usr/bin/env node
/**
 * Checks the LP's user-visible copy against docs/claims.md: the source
 * under src/ (.ts, .tsx) and the news articles under content/ (.md).
 *
 * #12 #13 #14 were all the same failure: a decision recorded in
 * jbjgjf/BLESC's docs, applied to the old LP, and then lost when the LP was
 * rebuilt in this repository. Nothing compared the two, so every rewrite of
 * the copy could reintroduce them — and one of them was still marked "done"
 * in the decision record while live on the page.
 *
 * This is deliberately a text scan and not a parser. It is meant to be
 * obvious enough that someone changing copy can predict what it will say.
 * False positives are accepted; `claims-allow` in a comment on the offending
 * line or the one above suppresses a finding.
 *
 * Comments in source are skipped: they do not reach a reader. They are
 * blanked rather than deleted so reported line and column numbers stay true
 * to the file. Markdown is read whole, as plain text — it has no // or /*
 * comments, and treating them as such would blank the rest of any line with
 * a URL on it (https://…). Everything in an article file is scanned, its
 * header included: the title and summary are shown on the site too.
 *
 * An article's body has nowhere to put `claims-allow`. Markdown's comment
 * is an HTML one, and lib/markdown refuses raw HTML — `<!-- … -->` there
 * stops the build — so a hit in a body is taken back to whoever supplied the
 * text, not suppressed. (In the header, a `# claims-allow: …` note line,
 * which lib/newsArticles ignores, works over the title: or summary: line
 * under it.) The failure message says so when an article is among the hits.
 */

import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { glob } from "node:fs/promises";

const ROOT = new URL("..", import.meta.url).pathname;
const DOC = "docs/claims.md";

/* -------------------------------------------------------------------------- */
/* Vocabulary                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Medical and mental-health conditions. Naming one is fine — the ontology's
 * 睡眠不足 → 認知機能の低下 → 抑うつ傾向 chain is a chain of construct names.
 * What product_policy.md forbids is claiming to detect one, so a hit only
 * counts when a judgement verb follows in the same breath.
 */
const CONDITIONS =
  "抑うつ|うつ病|うつ傾向|不安障害|パニック障害|PTSD|心的外傷|ADHD|注意欠陥|自閉症|発達障害|摂食障害|依存症|双極性障害|統合失調症|精神疾患|希死念慮|自殺念慮";

/** The verbs that turn naming a condition into claiming to find one. */
const JUDGEMENT_VERBS = "検知|検出|判定|診断|解析|スクリーニング|見抜く|特定";

/**
 * Negated forms are the wording the policy actually wants — 「心理的リスクの
 * 判定は行いません」 is a sentence the page should contain. A finding is
 * dropped when one of these follows close behind.
 */
const NEGATORS =
  /(行いません|行わない|行わず|行っていません|しません|せず|ありません|されません|含みません|できません|ではない)/;

/** How far past a match to look for a negator, in characters. */
const NEGATION_WINDOW = 30;

/**
 * Institution names under permission management. A name is listed here
 * because it has appeared on the page, not because it is forbidden — the
 * check is that it also appears in PERMITTED_ORGS.
 */
const MANAGED_ORGS = ["京都大学", "Hatapro", "ハタプロ"];

/**
 * Names cleared for use, with the written permission on file.
 *
 * Adding a name here asserts that its permission exists. Add the scope of
 * the collaboration to the copy at the same time — see docs/claims.md §3.
 *
 * The skip below is a substring test on the matched text, and a match is
 * always exactly one MANAGED_ORGS name, so a name listed here clears that
 * name and nothing else: 京都大学 passing does not let Hatapro or ハタプロ
 * through.
 */
const PERMITTED_ORGS = [
  // Written permission confirmed by the Blesc team (Jasper McGann,
  // 2026-09-30), scope 支援; widened by the CEO on 2026-11-16 to joint
  // research with one named centre (see PERMITTED_RELATIONSHIPS). Shown in
  // the backing band (src/components/sections/Backing.tsx) only.
  "京都大学",
];

/**
 * The research centre of 京都大学 that Blesc's joint research is with, as
 * the CEO confirmed it (2026-11-16), in each language.
 *
 * The English is the centre's own name in Kyoto University's English
 * material — "1997 Praxis and Research Center for Clinical Psychology and
 * Education established" in the Graduate School of Education's overview
 * (https://www.educ.kyoto-u.ac.jp/en/wp/wp-content/uploads/2026/06/overview_2026.pdf),
 * the same name its bulletin carries beside 京都大学大学院教育学研究科附属
 * 臨床教育実践研究センター紀要.
 */
const KYOTO_CENTRE_JA =
  "京都大学大学院\\s*教育学研究科\\s*附属臨床教育実践研究センター";
const KYOTO_CENTRE_EN =
  "Praxis and Research Center for Clinical Psychology and Education,\\s*Graduate School of Education,\\s*Kyoto University";

/**
 * 京都大学 under each name it is written as — the centre among them, whole
 * or without the university in front, so that a relationship word is
 * measured from the end of the centre's long name and not from the 京都大学
 * at its start. See unscoped-relationship.
 */
const KYOTO_NAMES = [
  KYOTO_CENTRE_JA,
  "(?:附属)?臨床教育実践研究センター",
  "Praxis and Research Center for Clinical Psychology and Education(?:,\\s*Graduate School of Education)?(?:,\\s*Kyoto University)?",
  "京都大学",
  "(?<![東北南])京大",
  "Kyoto University",
].join("|");

/**
 * Words that say what an institution did — each narrower than 支援, and none
 * confirmed for 京都大学 except in the one statement below. English stems,
 * so "collaboration", "partnership", "jointly" and "supervised" are all
 * caught.
 */
const SCOPE_WORDS =
  "共同研究|共同開発|監修|協働|提携|連携|[Cc]ollaborat|[Pp]artner|[Jj]oint|[Ss]upervis|[Cc]o-?develop";

/**
 * Relationship statements confirmed word for word. Each pattern matches the
 * relationship words alone; the centre's name is a lookaround, so it is
 * required but not part of the match.
 *
 * 京都大学 — the CEO, 2026-11-16: joint research with the centre named in
 * full, 「京都大学大学院 教育学研究科 附属臨床教育実践研究センターとの共同研究」,
 * and the same statement in English. Joint research with 京都大学 as a
 * whole, with the graduate school, or with the centre under a shorter name
 * was not what was confirmed, and still fails. So does 共同研究開発 (joint
 * research and development), which says 共同開発 as well: the Japanese
 * 共同研究 is only cleared when 開発 does not follow it.
 *
 * Inside one of these, only the relationship words are removed before
 * unscoped-relationship runs (see blankPermitted). The names stay, so a
 * second relationship word put beside the confirmed one —
 * 「…センターとの共同研究・監修」, "Supervision and joint research with the
 * Praxis …" — is still measured against the centre's name, and still
 * fails. In English the whole "Joint research with the " goes, so that it
 * does not use up the window between a word put in front of it and the
 * name.
 *
 * The Japanese may carry a `\n` before との, as the two characters a
 * source string writes it with: in Backing it marks where the line may
 * break and is drawn as a <wbr>, adding nothing to the words.
 */
const PERMITTED_RELATIONSHIPS = [
  new RegExp(
    `(?<=${KYOTO_CENTRE_JA}(?:\\\\n)?との)共同研究(?!(?:[・、と]|及び|および)?開発)`,
    "g",
  ),
  new RegExp(`[Jj]oint research with the (?=${KYOTO_CENTRE_EN})`, "g"),
];

/**
 * The text with each confirmed relationship phrase taken out. What is
 * removed never holds a line break, so every reported line is unchanged:
 * a finding's line is counted from the line breaks before it.
 */
function blankPermitted(text) {
  let out = text;
  for (const pattern of PERMITTED_RELATIONSHIPS) {
    out = out.replace(pattern, "");
  }
  return out;
}

/** Words that make an accelerator selection read as an investment. */
const INVESTMENT_WORDS =
  "出資|投資|資金調達|ベンチャーキャピタル|VC|[Ii]nvest";

const RULES = [
  {
    id: "condition-detection",
    section: "§1 疾患名を目的語に取る「検知」「判定」「診断」「解析」",
    // A condition, then a judgement verb within the same sentence.
    pattern: new RegExp(
      `(${CONDITIONS})(?:[^。\\n]{0,24})?(${JUDGEMENT_VERBS})`,
      "g",
    ),
    why: "疾患名を検知・判定・診断の目的語にできません。「捉える」「可視化する」に置き換えてください。",
    negatable: true,
  },
  {
    id: "risk-judgement",
    section: "§1 疾患名を目的語に取る「検知」「判定」「診断」「解析」",
    pattern: /心理的リスク(?:の)?(?:を)?(検知|検出|判定|診断|解析)/g,
    why: "心理的リスクの判定は実装にも社内ポリシーにも存在しません。",
    negatable: true,
  },
  {
    id: "risk-band",
    section: "§2 リスクバンド（高 / 中 / 低）とスコア",
    pattern:
      /(リスクレベル|リスク判定|リスクスコア|リスクランク|高リスク|リスクが高い|リスクレポート|リスクの可視化|リスク解析)/g,
    why: "educator_display_policy.md がリスク判定の描画を禁じています（理由は算術で、有病率5%・感度80%/特異度90%なら陽性的中率は約30%）。",
    negatable: true,
  },
  {
    id: "risk-band-token",
    section: "§2 リスクバンド（高 / 中 / 低）とスコア",
    // Catches the band even when the surrounding copy is renamed: the mock
    // regressed as `level: "高"` with `bg-risk-high`, and the header text is
    // the part most likely to be reworded on the way back in.
    pattern: /risk-(?:high|mid|low)\b/g,
    why: "リスクバンドの色トークンです。教員画面に判定を描画できません（state_band / latest_score は計算・保存しますが描画しません）。",
    negatable: false,
  },
  {
    id: "unpermitted-org",
    section: "§3 外部機関名",
    pattern: new RegExp(`(${MANAGED_ORGS.join("|")})`, "g"),
    why: "許諾が書面で確認できる機関名だけを記載できます。許諾を得たら scripts/check-claims.mjs の PERMITTED_ORGS に追加してください。",
    negatable: false,
    skip: (hit) => PERMITTED_ORGS.some((org) => hit.includes(org)),
  },
  {
    id: "unscoped-relationship",
    section: "§3 外部機関名",
    // Permission to name 京都大学 is permission to say 支援, and joint
    // research with one centre in the words the CEO confirmed — nothing
    // else. Each of these words says what the university did; the skip
    // above clears the name, this keeps the scope. The one confirmed use of
    // 共同研究 is taken out before the scan (prepare, PERMITTED_RELATIONSHIPS),
    // so it is the only one that passes.
    //
    // The university is matched under every name it goes by, and the words
    // in English as well as Japanese: the permission covers the institution,
    // not one spelling of it, so 「京大と共同研究」 or "in collaboration with
    // Kyoto University" would otherwise walk straight past a rule that only
    // knew 京都大学. The lookbehind keeps 東京大学, 北京大学 and 南京大学 —
    // each of which contains 京大 — out of it.
    //
    // A word may sit up to 24 characters after the name and 40 before it.
    // English puts the relationship first and joins it with more words than
    // Japanese does — "Joint research and development with the …" is 35
    // between the stem and the name — so the window before the name is the
    // wider one.
    pattern: new RegExp(
      `(${KYOTO_NAMES})(?:[^。\\n]{0,24}?)(${SCOPE_WORDS})|(${SCOPE_WORDS})(?:[^。\\n]{0,40}?)(${KYOTO_NAMES})`,
      "g",
    ),
    prepare: blankPermitted,
    why: "京都大学について確認されている範囲は「支援」と「京都大学大学院 教育学研究科 附属臨床教育実践研究センターとの共同研究」（この文言どおり）のみです。それ以外の共同研究・監修・協働・提携・連携は書けません。",
    negatable: true,
  },
  {
    id: "accelerator-as-investment",
    section: "§3 外部機関名",
    // ANOBAKA is a venture capital firm, and Blesc's relationship with it is
    // selection into its accelerator — not an investment. VC, 出資 or 投資
    // in the same sentence as the name would read as ANOBAKA holding equity.
    // Checked on both sides of the name: 「ベンチャーキャピタルのANOBAKA」
    // says what 「ANOBAKA（VC）」 says.
    pattern: new RegExp(
      `ANOBAKA(?:[^。\\n]{0,40}?)(${INVESTMENT_WORDS})|(${INVESTMENT_WORDS})(?:[^。\\n]{0,24}?)ANOBAKA`,
      "g",
    ),
    why: "ANOBAKA との関係は「U-25 AI Accelerator 第2期 採択」です。出資ではないため、VC・出資・投資とは書けません。",
    negatable: true,
  },
  {
    id: "overclaimed-ontology",
    section: "§4 オントロジーの規模に見合った表現",
    pattern: /臨床心理士の思考プロセス|思考プロセスを(?:機械可読な形で)?再現/g,
    why: "3サブグラフ・40ノード・50エッジの seed に対して過大な主張です。",
    negatable: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Comment blanking                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Replaces comment bodies with spaces, leaving every other character — and so
 * every offset — where it was. Walks the source tracking whether it is inside
 * a string, a template literal or a comment, because `//` inside a URL and
 * `/*` inside a string are both common enough to matter.
 *
 * Template literals are treated as string content throughout, including any
 * ${...} interpolation. That is the conservative direction: JSX copy lives in
 * templates, so it stays scanned.
 */
function blankComments(src) {
  const out = Array.from(src);
  let i = 0;
  const n = src.length;

  while (i < n) {
    const c = src[i];
    const next = src[i + 1];

    if (c === "/" && next === "/") {
      while (i < n && src[i] !== "\n") {
        out[i] = " ";
        i += 1;
      }
      continue;
    }

    if (c === "/" && next === "*") {
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) {
        // Newlines stay, so line numbers after the comment are unchanged.
        if (src[i] !== "\n") out[i] = " ";
        i += 1;
      }
      out[i] = " ";
      if (i + 1 < n) out[i + 1] = " ";
      i += 2;
      continue;
    }

    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      i += 1;
      while (i < n) {
        if (src[i] === "\\") {
          i += 2;
          continue;
        }
        if (src[i] === quote) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }

    i += 1;
  }

  return out.join("");
}

/* -------------------------------------------------------------------------- */
/* Scan                                                                       */
/* -------------------------------------------------------------------------- */

function lineOf(src, index) {
  return src.slice(0, index).split("\n").length;
}

/** `claims-allow` on the offending line, or the line before it. */
function suppressed(lines, lineNo) {
  const here = lines[lineNo - 1] ?? "";
  const above = lines[lineNo - 2] ?? "";
  return here.includes("claims-allow") || above.includes("claims-allow");
}

function scanFile(path) {
  const src = readFileSync(path, "utf8");
  const scannable = path.endsWith(".md") ? src : blankComments(src);
  const lines = src.split("\n");
  const findings = [];

  for (const rule of RULES) {
    // A rule's `prepare` rewrites what it alone sees, keeping every line
    // break, so the line a finding is reported on is still the source's.
    const text = rule.prepare ? rule.prepare(scannable) : scannable;
    rule.pattern.lastIndex = 0;
    let m;
    while ((m = rule.pattern.exec(text)) !== null) {
      const hit = m[0];
      if (rule.skip?.(hit)) continue;

      if (rule.negatable) {
        const after = text.slice(
          m.index + hit.length,
          m.index + hit.length + NEGATION_WINDOW,
        );
        if (NEGATORS.test(after)) continue;
      }

      const line = lineOf(text, m.index);
      if (suppressed(lines, line)) continue;

      findings.push({
        file: relative(ROOT, path),
        line,
        hit,
        rule,
        text: (lines[line - 1] ?? "").trim(),
      });
    }
  }

  return findings;
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

/*
 * Source, and the news articles (content/news, read by lib/newsArticles):
 * an article's text is copy on the site like any string in a component.
 */
const SCANNED = ["src/**/*.{ts,tsx}", "content/**/*.md"];

const files = [];
for (const pattern of SCANNED) {
  for await (const entry of glob(pattern, { cwd: ROOT })) {
    files.push(join(ROOT, entry));
  }
}
files.sort();

const findings = files
  .flatMap(scanFile)
  .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

if (findings.length === 0) {
  console.log(
    `check:claims — ${files.length} ファイルを検査し、問題は見つかりませんでした。`,
  );
  process.exit(0);
}

console.error(
  `\ncheck:claims — LP の主張が ${DOC} に反しています（${findings.length}件）\n`,
);

for (const f of findings) {
  console.error(`  ${f.file}:${f.line}  「${f.hit}」`);
  console.error(`    ${f.text}`);
  console.error(`    ${f.rule.why}`);
  console.error(`    → ${DOC} の「${f.rule.section}」\n`);
}

console.error(
  `${DOC} を読んでから直してください。表現が正しく、検査のほうが誤っている場合は、
その行か直前の行に理由つきの \`claims-allow\` コメントを置くと抑止できます。\n`,
);

if (findings.some((f) => f.file.endsWith(".md"))) {
  console.error(
    `ただしニュース記事（content/**/*.md）の本文にはコメントを書けません（HTML は記事のビルドで拒否されます）。
記事の文面は提供元に確認してください。\n`,
  );
}

process.exit(1);
