import { Fragment, type ReactNode } from "react";
import { Flower } from "@/components/Flower";
import { TRUST_TYPE } from "@/components/trust/TrustSections";
import { Icon } from "@/components/ui";
import {
  parseMarkdown,
  type Align,
  type Block,
  type Inline,
  type LinkKind,
} from "@/lib/markdown";
import { SITE_URL } from "@/lib/seo";

/**
 * A news article's body, from its Markdown (lib/markdown) to the page.
 *
 * Nothing here is a new look. Every block is set in a style the site
 * already has, and each is named where it is used: the paragraphs and the
 * lists are the 安全とプライバシー page's (TrustSections), the headings are
 * the home page's step titles (HowItWorks), the bold is the captions'
 * (mock/Caption), the links are the contact page's. Only the table had no
 * precedent, and it is built from the same hairline and the same muted
 * label type.
 *
 * A server component, and still: no reveal, no drift. This is the text the
 * page is for, so it is in the HTML at full strength, as TrustPage's
 * opening paragraph is. The parse runs where the page renders — at build
 * time for a published article — so a body the parser refuses stops the
 * build with the file and line named. (lib/newsArticles has already parsed
 * every body once as it read the files, drafts included, so in practice
 * the build stops there, before any page is rendered.)
 *
 * Japanese only, as the articles are (lib/newsArticles): the type is
 * TRUST_TYPE's Japanese cut, and the one string this file owns, the
 * new-tab note, is Japanese.
 *
 * The measure is the caller's (NewsArticlePage sets 40rem). min-w-0 so
 * that, in a grid or flex column, a wide table scrolls inside its own box
 * instead of pushing the column wider than the phone.
 */
export function Markdown({
  source,
  file,
  lineOffset = 0,
}: {
  source: string;
  /** The path errors name: content/news/<slug>.md. */
  file: string;
  /**
   * Lines of the file above `source`'s first line (the header and the
   * blank after it), so an error names the file's line rather than the
   * body's. See parseMarkdown.
   */
  lineOffset?: number;
}) {
  const blocks = parseMarkdown(source, file, lineOffset);

  return (
    <div className="min-w-0">
      {blocks.map((block, k) => (
        <BlockView key={k} block={block} prev={blocks[k - 1]} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Type                                                                       */
/* -------------------------------------------------------------------------- */

const TYPE = TRUST_TYPE.ja;

/**
 * Body text: the 安全とプライバシー list items' setting — measure-jp's 1.9
 * leading at 17px, weight 400 — in ink, as that page sets every sentence.
 * Ink on the page ground is 19.43:1.
 */
const BODY = `${TYPE.item} text-ink`;

/**
 * ## and ###: the home page's step titles (STEP_TITLE in
 * sections/HowItWorks), which head a 17px measure-jp paragraph exactly as
 * an article's subheadings do. Weight 500 under the page's weight-300
 * title is the home page's own pairing — light display, medium heads —
 * and at 22–28px a subheading stays well under the title (28–60px)
 * however long the title runs.
 *
 * text-balance and auto-phrase, as the title has them (NewsArticlePage):
 * a heading that wraps on a phone breaks between phrases, in even lines.
 */
const H2 =
  "text-balance text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium leading-[1.35] tracking-[-0.025em] text-ink [word-break:auto-phrase]";

/**
 * ####: no article uses one yet. Body size at the captions' bold weight,
 * so it reads as a heading by its weight and the air above it without
 * competing with the ## above it.
 */
const H3 = "text-[1.0625rem] font-medium tracking-[-0.01em] text-ink";

/** **bold**: the captions' bold (mock/Caption) — 500 and ink. */
const STRONG = "font-medium tracking-[-0.01em] text-ink";

/**
 * The contact page's link: mark-1 (5.44:1 on the ground) with an underline
 * at 40% that firms up on hover. The underline is what marks it as a link
 * for a reader who cannot tell the colour from the ink around it.
 *
 * wrap-anywhere, so an address — one long word to the line breaker — can
 * break at any character instead of running off a 390px phone.
 */
const LINK =
  "text-mark-1 underline decoration-mark-1/40 underline-offset-4 transition-colors duration-300 wrap-anywhere hover:decoration-mark-1";

/*
 * A list item's rule and padding — TrustSections' ITEM_RULED and ITEM_OPEN,
 * copied because that file keeps them to itself. Under a paragraph every
 * item is ruled off above, the first included, so the sentence reads as the
 * head of the list; straight under a heading the first item drops its rule
 * and starts level with the text. border-line: separation only, 1.22:1.
 */
const ITEM_RULED = "border-t border-line py-5 last:pb-0";
const ITEM_OPEN =
  "border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0";

/** Literal classes — Tailwind cannot see an interpolated one. */
const ALIGN: Record<NonNullable<Align> | "none", string> = {
  none: "text-left",
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/**
 * The space above a block, from what comes before it.
 *
 * A heading takes a section's worth of air above it and little below, so
 * it belongs to the text it heads. Paragraphs are 24px apart, less than
 * the 32px one line takes at 17px with the 1.9 leading, so the space reads
 * as a pause rather than a break. A list or a table is set off a step
 * further, as the safety page sets its lists under their opening sentence
 * (mt-6, mt-8 from md). A rule takes the most, the same on both sides.
 */
function gap(prev: Block | undefined, block: Block): string {
  if (!prev) return "";
  if (block.type === "rule" || prev.type === "rule") return "mt-10 md:mt-12";
  if (block.type === "heading") {
    return prev.type === "heading" ? "mt-4 md:mt-5" : "mt-14 md:mt-16";
  }
  if (prev.type === "heading") return "mt-4 md:mt-5";
  if (block.type === "paragraph" && prev.type === "paragraph") return "mt-6";
  return "mt-6 md:mt-8";
}

/* -------------------------------------------------------------------------- */
/* Blocks                                                                     */
/* -------------------------------------------------------------------------- */

function BlockView({ block, prev }: { block: Block; prev?: Block }) {
  const space = gap(prev, block);

  switch (block.type) {
    case "paragraph":
      return <p className={`${BODY} ${space}`}>{inlines(block.children)}</p>;

    case "heading":
      return block.level === 2 ? (
        <h2 className={`${H2} ${space}`}>{inlines(block.children)}</h2>
      ) : (
        <h3 className={`${H3} ${space}`}>{inlines(block.children)}</h3>
      );

    case "list":
      return (
        <ListView
          block={block}
          ruled={prev !== undefined && prev.type !== "heading"}
          space={space}
        />
      );

    case "table":
      return <TableView block={block} space={space} />;

    case "rule":
      /*
        The hairline the lists and the table are ruled with. Preflight
        gives <hr> a 1px top border in the text colour; border-line takes
        it down to the separation weight.
      */
      return <hr className={`border-line ${space}`} />;
  }
}

/**
 * Both kinds of list, as the safety page sets its list: each item ruled
 * off, its marker hung in a 2rem gutter so every line of the item starts
 * at one edge, and centred in a box one line tall (TRUST_TYPE's `line`,
 * in em, so it follows the item's size).
 *
 * A bulleted list's marker is that page's: the brand flower in mark-1.
 * A numbered list's is the number as written, two digits, in the home
 * page's step-number setting (01, 02 … in HowItWorks): small, 500, tabular,
 * mark-1. It is aria-hidden there and here, because the <ol> already says
 * which item is which; `start` keeps that count in step with the visible
 * one when a list does not begin at 1 (the parser has already checked the
 * numbers count up by one).
 *
 * role="list" for the reason the site's other lists give: the preflight
 * removes list markers, and WebKit then stops announcing an unmarked list
 * as a list.
 */
function ListView({
  block,
  ruled,
  space,
}: {
  block: Extract<Block, { type: "list" }>;
  ruled: boolean;
  space: string;
}) {
  const items = block.items.map((item, k) => (
    <li key={k} className={ruled ? ITEM_RULED : ITEM_OPEN}>
      <div className={`relative pl-8 ${BODY}`}>
        <span
          aria-hidden
          className={`absolute top-0 left-0 flex items-center ${TYPE.line}`}
        >
          {block.ordered ? (
            <span className="text-[0.85rem] font-medium tabular-nums text-mark-1">
              {String(block.start + k).padStart(2, "0")}
            </span>
          ) : (
            <Flower size={16} className="text-mark-1" />
          )}
        </span>
        <p>{inlines(item)}</p>
      </div>
    </li>
  ));

  return block.ordered ? (
    <ol
      role="list"
      start={block.start === 1 ? undefined : block.start}
      className={space}
    >
      {items}
    </ol>
  ) : (
    <ul role="list" className={space}>
      {items}
    </ul>
  );
}

/**
 * A table in the page's hairlines: a rule under the header and under every
 * row, none down the columns — the same separation the lists draw. The
 * header is a small muted label, the date line's 0.85rem at the weight
 * and tracking of the Technology section's labels over its lists, so it
 * reads as the head of the columns and not as one more row; muted holds
 * 6.25:1 on the ground. Cells take the body's 17px a step down, at 16px,
 * and pad a little tighter than a list item.
 *
 * The table runs the width of the measure, and a cell wraps before the
 * table widens. Should a table still need more than the phone has, the
 * wrapper scrolls it sideways rather than letting it widen the page. No
 * tab stop on the wrapper: a table that fits does not scroll, and Chrome
 * and Firefox already make a scroller that overflows reachable by
 * keyboard.
 */
function TableView({
  block,
  space,
}: {
  block: Extract<Block, { type: "table" }>;
  space: string;
}) {
  const align = (c: number) => ALIGN[block.align[c] ?? "none"];

  return (
    <div className={`overflow-x-auto ${space}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-line">
            {block.head.map((cell, c) => (
              <th
                key={c}
                scope="col"
                className={`pr-6 pb-3 align-bottom text-[0.85rem] font-medium tracking-[0.02em] text-muted last:pr-0 ${align(c)}`}
              >
                {inlines(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, r) => (
            <tr key={r} className="border-b border-line">
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={`py-4 pr-6 align-top text-[1rem] tabular-nums text-ink last:pr-0 ${align(c)}`}
                >
                  {inlines(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Inline                                                                     */
/* -------------------------------------------------------------------------- */

function inlines(nodes: readonly Inline[]): ReactNode {
  return nodes.map((node, k) => {
    switch (node.type) {
      case "text":
        return <Fragment key={k}>{node.value}</Fragment>;
      case "strong":
        return (
          <strong key={k} className={STRONG}>
            {inlines(node.children)}
          </strong>
        );
      case "link":
        return (
          <TextLink key={k} href={node.href} kind={node.kind}>
            {inlines(node.children)}
          </TextLink>
        );
    }
  });
}

/** This site's own origins: the canonical one, and the one this build is for. */
const SAME_SITE = new Set(["blesc.jp", "www.blesc.jp", new URL(SITE_URL).host]);

function isSameSite(href: string): boolean {
  try {
    return SAME_SITE.has(new URL(href).host);
  } catch {
    return false;
  }
}

/**
 * A link, opened the way its address asks.
 *
 * A page of this site — a path, a fragment, or a full blesc.jp address —
 * is a plain anchor in the same tab, as every link between pages on this
 * site is: a full load, which is what Lenis has always started from (see
 * ContactPage and Nav). So is mailto:, which opens the mail app and leaves
 * the page where it was.
 *
 * Another site opens in a new tab, and says so the way the Technology
 * section's sources do: the outward arrow after the text, nudged up and
 * right on hover, and the same words for a screen reader. noopener and
 * noreferrer, so the page it opens cannot reach back into this one or
 * learn which article sent it.
 */
function TextLink({
  href,
  kind,
  children,
}: {
  href: string;
  kind: LinkKind;
  children: ReactNode;
}) {
  if (kind === "external" && !isSameSite(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`group/link ${LINK}`}
      >
        {children}
        <Icon
          name="arrow_outward"
          size={14}
          className="ml-0.5 inline-block align-[-0.1em] transition-[translate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:translate-x-px group-hover/link:-translate-y-px motion-reduce:transition-none"
        />
        <span className="sr-only">（新しいタブで開きます）</span>
      </a>
    );
  }

  return (
    <a href={href} className={LINK}>
      {children}
    </a>
  );
}
