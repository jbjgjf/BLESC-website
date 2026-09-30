#!/usr/bin/env node
/**
 * Checks the LP's user-visible copy against docs/claims.md.
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
 * Comments are skipped: they do not reach a reader. They are blanked rather
 * than deleted so reported line and column numbers stay true to the file.
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
  // 2026-09-30). Scope: 支援, shown in the backing section
  // (src/components/sections/Backing.tsx) only.
  "京都大学",
];

/** 京都大学 under each name it is written as. See unscoped-relationship. */
const KYOTO_NAMES = "京都大学|(?<![東北南])京大|Kyoto University";

/**
 * Words that say what an institution did — each narrower than 支援, and none
 * confirmed for 京都大学. English stems, so "collaboration", "partnership",
 * "jointly" and "supervised" are all caught.
 */
const SCOPE_WORDS =
  "共同研究|共同開発|監修|協働|提携|連携|[Cc]ollaborat|[Pp]artner|[Jj]oint|[Ss]upervis|[Cc]o-?develop";

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
    // Permission to name 京都大学 is permission to say 支援 and nothing
    // narrower. Each of these words says what the university did, and none
    // of them has been confirmed; the skip above clears the name, this keeps
    // the scope.
    //
    // The university is matched under every name it goes by, and the words
    // in English as well as Japanese: the permission covers the institution,
    // not one spelling of it, so 「京大と共同研究」 or "in collaboration with
    // Kyoto University" would otherwise walk straight past a rule that only
    // knew 京都大学. The lookbehind keeps 東京大学, 北京大学 and 南京大学 —
    // each of which contains 京大 — out of it.
    pattern: new RegExp(
      `(${KYOTO_NAMES})(?:[^。\\n]{0,24}?)(${SCOPE_WORDS})|(${SCOPE_WORDS})(?:[^。\\n]{0,12}?)(${KYOTO_NAMES})`,
      "g",
    ),
    why: "京都大学について確認されている範囲は「支援」のみです。共同研究・監修・協働・提携・連携は、範囲が書面で確認できるまで書けません。",
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
  const scannable = blankComments(src);
  const lines = src.split("\n");
  const findings = [];

  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;
    let m;
    while ((m = rule.pattern.exec(scannable)) !== null) {
      const hit = m[0];
      if (rule.skip?.(hit)) continue;

      if (rule.negatable) {
        const after = scannable.slice(
          m.index + hit.length,
          m.index + hit.length + NEGATION_WINDOW,
        );
        if (NEGATORS.test(after)) continue;
      }

      const line = lineOf(scannable, m.index);
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

const files = [];
for await (const entry of glob("src/**/*.{ts,tsx}", { cwd: ROOT })) {
  files.push(join(ROOT, entry));
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

process.exit(1);
