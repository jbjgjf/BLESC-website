/**
 * The Markdown the news articles are written in (content/news/*.md), parsed
 * to a small typed tree that components/news/Markdown renders in the site's
 * own type.
 *
 * Hand-written rather than a library, and on purpose a small dialect. The
 * articles need paragraphs, headings, the two kinds of list, a table, a rule,
 * bold and links, and that is all this reads. Everything else Markdown can
 * say — a quote, code, an image, italics, raw HTML, a list inside a list —
 * stops the build with the file and line named, rather than coming out as
 * something the writer did not mean: a stray > on the page, an asterisk where
 * italics were wanted, a whole list folded into one item. The message says
 * what to write instead.
 *
 * What it reads:
 *
 *   ## 見出し  /  ### 見出し      a heading (both the same level: an <h2>)
 *   #### 小見出し                 a smaller heading (an <h3>)
 *   1. 項目                       a numbered list; the numbers count up by one
 *   - 項目   or   * 項目          a bulleted list
 *   | 列 | 列 |                   a table, under a | --- | --- | row
 *   ---                           a horizontal rule, between two blocks
 *   **太字**  [文字](URL)          bold and a link, anywhere text goes
 *   uryu@blesc.jp  https://…      written bare, an address becomes a link
 *   \*                            a backslash before punctuation keeps it
 *                                 literal
 *
 * A single # is refused: the page's title is the header's `title:`, and the
 * body's headings sit under it. ## and ### are both read as the first level
 * below the title because the articles were written with ###, as the
 * company's source has them, and a writer reaching for ## should get the
 * same heading. A #### has to come under one of them, so the levels never
 * skip.
 *
 * Whitespace is the ordinary space. A line that starts with a full-width
 * space (a 字下げ) or a non-breaking one is refused, as is a tab or a
 * full-width space after a list marker: JavaScript's trim would drop the
 * first quietly, and Markdown reads the second differently from how it
 * looks.
 *
 * Lines that wrap inside a paragraph or a list item are joined, with no
 * space where both sides are Japanese — a line break in Japanese copy is not
 * a word gap — and one space otherwise (Latin text, or 「Blesc」 meeting a
 * kana).
 *
 * Pure and dependency-free, with no "@/" imports, so a plain Node script
 * can import it (node --experimental-strip-types) to test it.
 */

/** Where a link goes, which decides how it opens. */
export type LinkKind = "internal" | "external" | "mailto";

export type Inline =
  | { type: "text"; value: string }
  | { type: "strong"; children: Inline[] }
  | { type: "link"; href: string; kind: LinkKind; children: Inline[] };

/** A table column's alignment, from the separator row's colons. */
export type Align = "left" | "center" | "right" | null;

export type Block =
  | { type: "paragraph"; children: Inline[] }
  /** 2 is ## and ###; 3 is ####. */
  | { type: "heading"; level: 2 | 3; children: Inline[] }
  | { type: "list"; ordered: false; items: Inline[][] }
  /** `start` is the first item's number as written; the rest count up. */
  | { type: "list"; ordered: true; start: number; items: Inline[][] }
  | { type: "table"; align: Align[]; head: Inline[][]; rows: Inline[][][] }
  | { type: "rule" };

/**
 * Parses an article body.
 *
 * `file` is the path the error messages name, as the writer would look for
 * it (content/news/foo.md).
 *
 * `lineOffset` is how many lines of the file come before `source`'s first
 * line, so that a message points at the line in the file and not the line
 * in the body. lib/newsArticles hands over the body without its header and
 * trimmed; for a file whose header is six lines and a blank line, that is
 * 7. Left at 0, the messages count from the body's first line — still the
 * right file and the right text, quoted, just not the file's line number.
 * lib/newsArticles works it out as it reads a file and keeps it on the
 * article (NewsArticle.lineOffset), and passes it whenever it parses.
 *
 * Throws an Error whose message starts "<file>:<line>: ".
 */
export function parseMarkdown(
  source: string,
  file: string,
  lineOffset = 0,
): Block[] {
  const lines: Line[] = source
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((raw, i) => ({ text: expandTabs(raw), no: lineOffset + i + 1 }));

  const fail = (no: number, why: string): never => {
    throw new Error(`${file}:${no}: ${why}`);
  };

  // A full-width space (a 字下げ) or a non-breaking space at the start of
  // a line. JavaScript's trim counts both as whitespace, so the parser
  // below would quietly drop the character — and four of them would read
  // as an indented code block. Checked over every line before the parse,
  // so it can be reported ahead of another error higher up the file; either
  // way the build stops on a line that needs fixing.
  for (const line of lines) {
    if (!isBlank(line.text) && /^[ \t]*[^\S \t]/.test(line.text)) {
      fail(
        line.no,
        "this line starts with a full-width or non-breaking space — paragraphs here are not indented, so remove it",
      );
    }
  }

  const blocks: Block[] = [];
  /** The line each block starts on, for the checks made after parsing. */
  const starts: number[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line.text)) {
      i++;
      continue;
    }

    if (indentOf(line.text) >= 4) {
      fail(
        line.no,
        "an indented line is a code block in Markdown, and code is not supported — remove the indent",
      );
    }
    const t = line.text.trim();
    refuseBlockStart(t, line.no, fail);

    starts.push(line.no);

    const heading = HEADING.exec(t);
    if (heading) {
      const level = heading[1].length === 4 ? 3 : 2;
      // Optional closing #s, as in "## 見出し ##" — and "## ##" is a
      // heading with no text, not a heading that reads "##".
      const text = heading[2].replace(/(?:^|\s+)#+$/, "").trim();
      if (text === "") fail(line.no, "this heading is empty");
      blocks.push({
        type: "heading",
        level,
        children: parseInline(text, () => line.no, fail),
      });
      i++;
      continue;
    }

    if (RULE.test(t)) {
      blocks.push({ type: "rule" });
      i++;
      continue;
    }

    if (LIST_ITEM.test(t)) {
      i = readList(lines, i, blocks, fail);
      continue;
    }

    if (t.startsWith("|")) {
      i = readTable(lines, i, blocks, fail);
      continue;
    }

    i = readParagraph(lines, i, blocks, fail);
  }

  // A rule separates two things; at either end of the body it separates
  // the text from nothing, and two in a row say nothing more than one.
  //
  // And a #### (an <h3>) has to come under a ## or ### (an <h2>): the
  // page's title is the <h1>, and a screen reader's heading list would
  // otherwise jump from it straight to the third level.
  let headed = false;
  blocks.forEach((block, k) => {
    if (block.type === "heading") {
      if (block.level === 2) headed = true;
      else if (!headed) {
        fail(
          starts[k],
          "a #### heading has to come under a ## or ### heading — use ### here",
        );
      }
    }
    if (block.type !== "rule") return;
    if (k === 0 || k === blocks.length - 1 || blocks[k - 1].type === "rule") {
      fail(starts[k], "a --- rule has to sit between two blocks of text");
    }
  });

  return blocks;
}

/** The text of a run of inline nodes, with the markup taken out. */
export function inlineText(nodes: readonly Inline[]): string {
  return nodes
    .map((node) => (node.type === "text" ? node.value : inlineText(node.children)))
    .join("");
}

/* -------------------------------------------------------------------------- */
/* Blocks                                                                     */
/* -------------------------------------------------------------------------- */

type Line = { text: string; no: number };
type Fail = (no: number, why: string) => never;

/** ## to ####, a space, and the text. Deeper or shallower is refused first. */
const HEADING = /^(#{2,4})\s+(.*)$/;
/** Three or more hyphens and nothing else. */
const RULE = /^-{3,}$/;
/** "- ", "* " or "1. " and the item's text. */
const LIST_ITEM = /^(?:([-*])|(\d{1,9})\.)[ ]+(\S.*)$/;
/** A list marker with nothing after it. */
const EMPTY_ITEM = /^(?:[-*]|\d{1,9}\.)$/;
/** A table's separator row: | --- | :---: | ---: | */
const TABLE_SEPARATOR = /^\|(?:\s*:?-+:?\s*\|)+\s*:?-*:?\s*$/;

/**
 * What cannot start a block, whatever comes before it. Each is something
 * Markdown would render, but not as anything this site sets.
 */
function refuseBlockStart(t: string, no: number, fail: Fail): void {
  if (t.startsWith(">")) {
    fail(no, "blockquotes (lines starting with >) are not supported");
  }
  if (t.startsWith("```") || t.startsWith("~~~")) {
    fail(no, "code blocks are not supported");
  }
  if (/^#(?:\s|$)/.test(t)) {
    fail(
      no,
      "a single # heading is not allowed — the page's title comes from the header's title:, so headings in the body start at ## (or ###)",
    );
  }
  if (/^#{5,}(?:\s|$)/.test(t)) {
    fail(no, "headings deeper than #### are not supported");
  }
  if (/^#+[^#\s]/.test(t)) {
    fail(no, "a heading needs a space after its #s");
  }
  if (/^#{2,4}\s*$/.test(t)) {
    fail(no, "this heading is empty");
  }
  if (/^(?:\*[ ]*){3,}$|^(?:_[ ]*){3,}$|^(?:-[ ]+){2,}-[ ]*$/.test(t)) {
    fail(no, "write a horizontal rule as --- on a line of its own");
  }
  if (/^=+$/.test(t)) {
    fail(
      no,
      "a line of = makes the text above it a heading in Markdown, which is not supported — use ## for a heading",
    );
  }
  if (/^(?:[-*]|\d{1,9}\.)[ ]*[^\S ]/.test(t)) {
    // A tab, a full-width space or a non-breaking space after the marker.
    // Markdown makes "-<tab>項目" and "- 　項目" list items, which this
    // parser would otherwise set as a paragraph with the "-" showing; and
    // "-　項目" is no list item anywhere, though it was surely meant as one.
    fail(
      no,
      "put one ordinary space after a list marker (- 項目, 1. 項目) — not a tab or a full-width space",
    );
  }
  if (/^\+\s/.test(t)) {
    fail(no, "+ is not a list marker here — start each item with - ");
  }
  if (/^\d{1,9}\)\s/.test(t)) {
    fail(no, "write a numbered item as 1. — not 1)");
  }
  if (/^\d{1,3}\.(?=[^\s\d.])/.test(t)) {
    fail(no, "a numbered item needs a space after the number's dot (1. 項目)");
  }
  if (EMPTY_ITEM.test(t)) {
    fail(no, "this list item is empty");
  }
  if (/^\[[^\]]+\]:/.test(t)) {
    fail(
      no,
      "reference-style link definitions ([name]: url) are not supported — write [text](url) where the link goes",
    );
  }
  if (/^<[A-Za-z!?/]/.test(t)) {
    fail(no, "raw HTML is not supported");
  }
}

/**
 * Lines that would be joined onto the one above as part of the same
 * paragraph, but whose writer almost certainly meant a list: Japanese
 * copy often bullets with ・ or ※, and Markdown reads neither as a marker.
 */
const LOOKS_LIKE_A_BULLET = /^(?:[・•●○◦▪■□◆◇※＊]|-(?=\S)|[０-９]+[．.])/;

function readParagraph(
  lines: Line[],
  start: number,
  blocks: Block[],
  fail: Fail,
): number {
  const parts: Line[] = [lines[start]];
  let i = start + 1;

  for (; i < lines.length; i++) {
    const line = lines[i];
    if (isBlank(line.text)) break;
    const t = line.text.trim();

    // Markdown turns the paragraph above into a heading when a line of
    // only - or = sits directly under it (a "setext" heading).
    if (/^(?:-+|=+)$/.test(t)) {
      fail(
        line.no,
        "a line of only - or = directly under text makes that text a heading in Markdown — leave a blank line above a --- rule, and use ## for a heading",
      );
    }
    if (t.startsWith("|") || /^:?-+:?\s*\|/.test(t)) {
      fail(line.no, "leave a blank line above a table");
    }
    // A heading or a bulleted list may start straight under a paragraph,
    // as in Markdown. So may a numbered list from 1; from any other number
    // Markdown keeps the line inside the paragraph, so it is refused.
    if (/^#/.test(t) || /^[-*][ ]+\S/.test(t)) break;
    const numbered = /^(\d{1,9})\.[ ]+\S/.exec(t);
    if (numbered) {
      if (Number(numbered[1]) === 1) break;
      fail(
        line.no,
        "a numbered list that does not start at 1 needs a blank line above it, or it is read as part of the paragraph",
      );
    }
    refuseBlockStart(t, line.no, fail);
    if (LOOKS_LIKE_A_BULLET.test(t)) {
      fail(
        line.no,
        "this line would be joined onto the line above it — for a list, start each item with - (or 1. ); for a new paragraph, leave a blank line",
      );
    }
    parts.push(line);
  }

  refuseLineBreaks(parts, fail);
  blocks.push({ type: "paragraph", children: parseJoined(parts, fail) });
  return i;
}

function readList(
  lines: Line[],
  start: number,
  blocks: Block[],
  fail: Fail,
): number {
  const first = LIST_ITEM.exec(lines[start].text.trimStart())!;
  const ordered = first[2] !== undefined;
  const bullet = first[1];
  const startNo = ordered ? Number(first[2]) : 1;

  const items: Inline[][] = [];
  let i = start;
  let expected = startNo;

  for (;;) {
    // One item: its marker line, then any indented lines that continue it.
    // trimStart, not trim: the end of the line is kept for refuseLineBreaks.
    const line = lines[i];
    const indent = indentOf(line.text);
    const m = LIST_ITEM.exec(line.text.trimStart())!;
    if (ordered) {
      const n = Number(m[2]);
      if (n !== expected) {
        fail(
          line.no,
          `numbered items count up by one: expected ${expected}. here, found ${n}.`,
        );
      }
      expected++;
    }
    /** Where the item's text starts; a line indented this far is inside it. */
    const contentColumn = indent + line.text.trimStart().indexOf(m[3]);
    const parts: Line[] = [{ text: m[3], no: line.no }];
    i++;

    let next: number | null = null;
    while (i < lines.length) {
      const l = lines[i];
      if (isBlank(l.text)) {
        // A blank line ends the list unless the next item follows it.
        let j = i;
        while (j < lines.length && isBlank(lines[j].text)) j++;
        if (j === lines.length) {
          i = j;
          break;
        }
        const after = lines[j];
        const afterIndent = indentOf(after.text);
        const afterItem = LIST_ITEM.exec(after.text.trim());
        if (afterItem && afterIndent < contentColumn) {
          if (sameKind(afterItem, ordered, bullet)) next = j;
          else i = j; // a different kind of list starts here
          break;
        }
        if (afterItem) fail(after.no, "lists inside lists are not supported");
        if (afterIndent >= 2) {
          fail(
            after.no,
            "a list item can only be one paragraph — a line indented under a blank line would make a second one",
          );
        }
        i = j;
        break;
      }

      const lIndent = indentOf(l.text);
      const t = l.text.trim();
      const item = LIST_ITEM.exec(t);
      if (item) {
        if (lIndent >= contentColumn) {
          fail(l.no, "lists inside lists are not supported");
        }
        if (sameKind(item, ordered, bullet)) {
          next = i;
        } else if (!ordered && item[1] !== undefined) {
          fail(
            l.no,
            "switching between - and * starts a new list in Markdown — use one marker for the whole list",
          );
        }
        break;
      }

      if (lIndent >= 2) {
        // The item's text, wrapped onto an indented line.
        refuseBlockStart(t, l.no, fail);
        if (t.startsWith("|")) fail(l.no, "a table cannot sit inside a list item");
        parts.push(l);
        i++;
        continue;
      }

      // Unindented, straight under an item. A heading or a rule ends the
      // list; anything else Markdown would fold into the last item. What
      // cannot start a block is named first, so "-<tab>項目" under an item
      // is told about its tab rather than about being folded in.
      refuseBlockStart(t, l.no, fail);
      if (HEADING.test(t) || RULE.test(t) || /^#/.test(t)) break;
      fail(
        l.no,
        "text straight under a list item becomes part of that item in Markdown — leave a blank line above a new paragraph, or indent the line to continue the item",
      );
    }

    refuseLineBreaks(parts, fail);
    items.push(parseJoined(parts, fail));

    if (next === null) break;
    i = next;
  }

  blocks.push(
    ordered
      ? { type: "list", ordered: true, start: startNo, items }
      : { type: "list", ordered: false, items },
  );
  return i;
}

function sameKind(
  m: RegExpExecArray,
  ordered: boolean,
  bullet: string | undefined,
): boolean {
  return ordered ? m[2] !== undefined : m[1] === bullet;
}

function readTable(
  lines: Line[],
  start: number,
  blocks: Block[],
  fail: Fail,
): number {
  const headLine = lines[start];
  const sepLine = lines[start + 1];
  const sep = sepLine?.text.trim() ?? "";
  if (!sepLine || !TABLE_SEPARATOR.test(sep)) {
    fail(
      headLine.no,
      "a table needs a separator row like | --- | --- | straight under its header row",
    );
  }

  const head = splitRow(headLine, fail);
  const align: Align[] = splitRow(sepLine, fail).map((cell) => {
    if (!/^:?-+:?$/.test(cell)) {
      fail(sepLine.no, `"${cell}" is not a separator cell — write ---, :---, ---: or :---:`);
    }
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    return left && right ? "center" : right ? "right" : left ? "left" : null;
  });
  if (align.length !== head.length) {
    fail(
      sepLine.no,
      `the separator row has ${align.length} cells, the header ${head.length}`,
    );
  }

  const parseRow = (cells: string[], line: Line) =>
    cells.map((cell) => parseInline(cell, () => line.no, fail));

  const rows: Inline[][][] = [];
  let i = start + 2;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (isBlank(line.text)) break;
    if (!line.text.trim().startsWith("|")) {
      fail(
        line.no,
        "leave a blank line under a table — Markdown reads a line straight under one as another row",
      );
    }
    const cells = splitRow(line, fail);
    if (cells.length !== head.length) {
      fail(
        line.no,
        `this row has ${cells.length} cells, the header ${head.length}`,
      );
    }
    rows.push(parseRow(cells, line));
  }

  blocks.push({ type: "table", align, head: parseRow(head, headLine), rows });
  return i;
}

/**
 * A row's cells, trimmed. The row starts with | and may end with one; a
 * | inside a cell is written \|.
 */
function splitRow(line: Line, fail: Fail): string[] {
  const t = line.text.trim();
  if (!t.startsWith("|")) fail(line.no, "start each table row with |");
  const cells: string[] = [];
  let cell = "";
  let closed = false;
  for (let k = 1; k < t.length; k++) {
    if (t[k] === "\\" && t[k + 1] === "|") {
      cell += "|";
      k++;
    } else if (t[k] === "|") {
      cells.push(cell.trim());
      cell = "";
      closed = k === t.length - 1;
    } else {
      cell += t[k];
    }
  }
  if (!closed) cells.push(cell.trim());
  return cells;
}

/**
 * Two spaces or a backslash at the end of a line is Markdown's line break.
 * There is no line break here, so they are refused rather than ignored —
 * except on a block's last line, where Markdown ignores them too.
 */
function refuseLineBreaks(parts: Line[], fail: Fail): void {
  parts.slice(0, -1).forEach((part) => {
    if (/(?: {2,}|\\)$/.test(part.text)) {
      fail(
        part.no,
        "a line ending in two spaces or a \\ is a line break in Markdown, and line breaks are not supported — remove them, or leave a blank line for a new paragraph",
      );
    }
  });
}

/* -------------------------------------------------------------------------- */
/* Joining wrapped lines                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Kana, kanji and the full-width punctuation and forms: the characters
 * between which a wrapped line is joined with no space. With them the two
 * leaders, ‥ and …, which sit in General Punctuation but in Japanese copy
 * are set like 。: "そして…" wrapped before "だから" is one phrase.
 */
const JAPANESE =
  /[‥…　-〿぀-ゟ゠-ヿㇰ-ㇿ㐀-䶿一-鿿豈-﫿＀-￯]/;

function isJapaneseAt(s: string, at: "start" | "end"): boolean {
  if (s === "") return false;
  if (at === "start") {
    const code = s.charCodeAt(0);
    // Kanji outside the basic plane (𠮷) arrive as a surrogate pair.
    if (code >= 0xd840 && code <= 0xd87f) return true;
    return JAPANESE.test(s[0]);
  }
  const last = s.charCodeAt(s.length - 1);
  if (last >= 0xdc00 && last <= 0xdfff && s.length > 1) {
    const high = s.charCodeAt(s.length - 2);
    return high >= 0xd840 && high <= 0xd87f;
  }
  return JAPANESE.test(s[s.length - 1]);
}

/** The line as read, without the ** and link brackets around its ends. */
function visibleStart(s: string): string {
  return s.replace(/^(?:\*\*|\[)+/, "");
}
function visibleEnd(s: string): string {
  let t = s.replace(/\*\*$/, "");
  const link = /\]\([^()\s]*\)$/.exec(t);
  if (link) t = t.slice(0, link.index);
  return t.replace(/\*\*$/, "");
}

/** Joins a block's lines and parses the result as one run of text. */
function parseJoined(parts: Line[], fail: Fail): Inline[] {
  let text = "";
  const offsets: { at: number; no: number }[] = [];
  for (const part of parts) {
    const t = part.text.trim();
    if (text !== "") {
      const tight =
        isJapaneseAt(visibleEnd(text), "end") &&
        isJapaneseAt(visibleStart(t), "start");
      if (!tight) text += " ";
    }
    offsets.push({ at: text.length, no: part.no });
    text += t;
  }
  const lineAt = (offset: number) => {
    let no = offsets[0].no;
    for (const o of offsets) if (o.at <= offset) no = o.no;
    return no;
  };
  return parseInline(text, lineAt, fail);
}

/* -------------------------------------------------------------------------- */
/* Inline                                                                     */
/* -------------------------------------------------------------------------- */

type Token =
  | { kind: "text"; value: string }
  | { kind: "star"; at: number }
  | { kind: "node"; node: Inline };

const ASCII_PUNCTUATION = /[!-/:-@[-`{-~]/;
const ENTITY = /^&(?:#\d{1,7}|#[xX][0-9a-fA-F]{1,6}|[A-Za-z][A-Za-z0-9]{1,31});/;
/** The characters a bare http(s) address is made of. */
const URL_CHARS = /^https?:\/\/[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]*/;
const EMAIL =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+/;
const EMAIL_LOCAL = /[A-Za-z0-9._%+-]/;
const WORD = /[A-Za-z0-9]/;

/**
 * Parses bold, links and bare addresses in one run of text.
 *
 * `lineAt` maps a position in `s` to the file's line number, for messages.
 * Inside a link's text (`inLink`) there are no further links, bare or not.
 */
function parseInline(
  s: string,
  lineAt: (offset: number) => number,
  fail: Fail,
  inLink = false,
): Inline[] {
  const at = (offset: number, why: string): never => fail(lineAt(offset), why);
  const tokens: Token[] = [];
  let buffer = "";
  const flush = () => {
    if (buffer !== "") tokens.push({ kind: "text", value: buffer });
    buffer = "";
  };

  let i = 0;
  while (i < s.length) {
    const c = s[i];
    const rest = s.slice(i);

    if (c === "\\") {
      const next = s[i + 1];
      if (next !== undefined && ASCII_PUNCTUATION.test(next)) {
        buffer += next;
        i += 2;
      } else {
        buffer += c;
        i++;
      }
      continue;
    }

    if (c === "`") at(i, "code (`…`) is not supported");
    if (c === "<" && /^<[A-Za-z!?/]/.test(rest)) {
      at(
        i,
        "raw HTML and <…> links are not supported — write [text](url), or the address on its own",
      );
    }
    if (c === "&" && ENTITY.test(rest)) {
      at(i, "HTML entities (&amp; and the like) are not supported — type the character itself");
    }
    if (c === "!" && s[i + 1] === "[") at(i, "images are not supported");
    if (c === "~" && s[i + 1] === "~") at(i, "strikethrough (~~) is not supported");

    if (c === "*") {
      let run = 0;
      while (s[i + run] === "*") run++;
      if (run === 2) {
        flush();
        tokens.push({ kind: "star", at: i });
        i += 2;
        continue;
      }
      if (run === 1) {
        at(
          i,
          "single * emphasis (italics) is not supported — use **bold**, or write \\* for an asterisk",
        );
      }
      at(i, `${"*".repeat(run)} is not supported — bold is **text**`);
    }

    if (c === "_") {
      // An underscore inside a word (snake_case) is just a character; one
      // at the edge of a word is Markdown's emphasis.
      const before = s[i - 1] ?? " ";
      const after = s[i + 1] ?? " ";
      if (!WORD.test(before) || !WORD.test(after)) {
        at(
          i,
          "_ emphasis is not supported — use **bold**, or write \\_ for an underscore",
        );
      }
    }

    if (c === "[") {
      if (inLink) at(i, "brackets inside a link's text are not supported");
      if (s[i + 1] === "^") at(i, "footnotes are not supported");
      const close = s.indexOf("]", i + 1);
      if (close !== -1) {
        const label = s.slice(i + 1, close);
        const after = s[close + 1];
        if (after === "(") {
          if (label.includes("[")) at(i, "brackets inside a link's text are not supported");
          const end = closingParen(s, close + 1);
          if (end === -1) at(i, "this link is not closed — it needs a )");
          const href = s.slice(close + 2, end);
          if (label.trim() === "") at(i, "this link has no text");
          flush();
          tokens.push({
            kind: "node",
            node: {
              type: "link",
              href,
              kind: linkKind(href, (why) => at(i, why)),
              children: parseInline(
                label,
                (k) => lineAt(i + 1 + k),
                fail,
                true,
              ),
            },
          });
          i = end + 1;
          continue;
        }
        if (after === "[") {
          at(
            i,
            "reference-style links ([text][name]) are not supported — write [text](url)",
          );
        }
      }
      buffer += c;
      i++;
      continue;
    }

    if (!inLink && (rest.startsWith("http://") || rest.startsWith("https://"))) {
      const before = s[i - 1];
      const m = URL_CHARS.exec(rest);
      if (m && (before === undefined || !WORD.test(before))) {
        const href = trimUrl(m[0]);
        flush();
        tokens.push({
          kind: "node",
          node: {
            type: "link",
            href,
            kind: "external",
            children: [{ type: "text", value: href }],
          },
        });
        i += href.length;
        continue;
      }
    }

    if (!inLink && EMAIL_LOCAL.test(c) && !EMAIL_LOCAL.test(s[i - 1] ?? " ")) {
      const m = EMAIL.exec(rest);
      if (m) {
        flush();
        tokens.push({
          kind: "node",
          node: {
            type: "link",
            href: `mailto:${m[0]}`,
            kind: "mailto",
            children: [{ type: "text", value: m[0] }],
          },
        });
        i += m[0].length;
        continue;
      }
    }

    buffer += c;
    i++;
  }
  flush();

  return pairStars(tokens, s, at);
}

/**
 * Turns the ** marks into bold, first with second, third with fourth.
 * Every mark has to have a partner, and has to sit against the words it
 * makes bold: "** 太字 **" is not bold in Markdown, so it is refused rather
 * than set bold here and shown with asterisks anywhere else.
 */
function pairStars(
  tokens: Token[],
  s: string,
  at: (offset: number, why: string) => never,
): Inline[] {
  const stars = tokens.filter(
    (t): t is Extract<Token, { kind: "star" }> => t.kind === "star",
  );
  if (stars.length % 2 === 1) {
    at(stars[stars.length - 1].at, "this ** is not closed — bold is **text**");
  }
  stars.forEach((star, k) => {
    const opening = k % 2 === 0;
    if (opening) {
      if (s[star.at + 2] === undefined || /\s/.test(s[star.at + 2])) {
        at(star.at, "the opening ** has to touch the first word it makes bold");
      }
      if (stars[k + 1].at === star.at + 2) at(star.at, "**** is empty bold");
    } else if (/\s/.test(s[star.at - 1])) {
      at(star.at, "the closing ** has to touch the last word it makes bold");
    }
  });

  const root: Inline[] = [];
  let bold: Inline[] | null = null;
  for (const token of tokens) {
    const into: Inline[] = bold ?? root;
    if (token.kind === "text") into.push({ type: "text", value: token.value });
    else if (token.kind === "node") into.push(token.node);
    else if (bold === null) bold = [];
    else {
      root.push({ type: "strong", children: bold });
      bold = null;
    }
  }
  return root;
}

/** Where the ( at `open` closes, counting nested parentheses; -1 if never. */
function closingParen(s: string, open: number): number {
  let depth = 0;
  for (let k = open; k < s.length; k++) {
    if (s[k] === "(") depth++;
    else if (s[k] === ")" && --depth === 0) return k;
  }
  return -1;
}

/**
 * What a link may point at: a page of this site (/…, #…), another site
 * (https://…), or an address (mailto:…). Anything else — a relative path, a
 * javascript: URL, a link title — is refused.
 */
function linkKind(href: string, fail: (why: string) => never): LinkKind {
  if (href === "") fail("this link has no address");
  if (/\s/.test(href)) {
    fail(
      /\s["'(]/.test(href)
        ? 'link titles ([text](url "title")) are not supported'
        : "a link's address cannot contain spaces",
    );
  }
  if (href.startsWith("/") && !href.startsWith("//")) return "internal";
  if (href.startsWith("#")) return "internal";
  if (/^https?:\/\/[A-Za-z0-9-]/.test(href)) return "external";
  if (/^mailto:/.test(href) && EMAIL.test(href.slice("mailto:".length))) {
    return "mailto";
  }
  return fail(
    `a link has to start with /, #, https:// or mailto: — not "${href}"`,
  );
}

/**
 * A bare address ends before the punctuation that follows it in a
 * sentence, and before a ) it did not open — GitHub's rule for the same
 * thing.
 */
function trimUrl(url: string): string {
  let u = url;
  for (;;) {
    const last = u[u.length - 1];
    if (/[?!.,:*_~'";]/.test(last)) {
      u = u.slice(0, -1);
      continue;
    }
    if (last === ")") {
      const opens = u.split("(").length - 1;
      const closes = u.split(")").length - 1;
      if (closes > opens) {
        u = u.slice(0, -1);
        continue;
      }
    }
    return u;
  }
}

/* -------------------------------------------------------------------------- */
/* Lines                                                                      */
/* -------------------------------------------------------------------------- */

function isBlank(text: string): boolean {
  return text.trim() === "";
}

function indentOf(text: string): number {
  return text.length - text.trimStart().length;
}

/** Leading tabs as four spaces each, which is how Markdown counts them. */
function expandTabs(text: string): string {
  return text.replace(/^[ \t]+/, (ws) => ws.replace(/\t/g, "    "));
}
