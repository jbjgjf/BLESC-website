"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Fragment, useRef } from "react";
import { Reveal } from "@/components/Reveal";
import { Section, SectionTitle } from "@/components/ui";

/**
 * The two photographs, at their own proportions.
 *
 * `width`/`height` are the files' intrinsic pixel sizes, which is what makes
 * the rendered box the source aspect ratio rather than a crop of it: the
 * images used to sit in fixed 2:3 and 1:1 frames with object-cover, so both
 * were losing an edge. Nothing is upscaled either — the main photograph is
 * 1505px wide and renders at about 350.
 */
const PHOTO = {
  src: "/photos/philosophy.png",
  alt: "",
  width: 1505,
  height: 2001,
} as const;

/** The square-ish inset that overhangs the main photograph's top-right. */
const PHOTO_INSET = {
  src: "/photos/philosophy-2.png",
  alt: "",
  width: 882,
  height: 946,
} as const;

/**
 * Two lines, lit as you reach them.
 *
 * This was the most text-heavy block on the site — six paragraphs of founding
 * story in a single column. What is left is the turning point and the closing
 * statement, because those are the two the rest was leading to; the passage
 * in between made the same case that 課題 and the hero already make in fewer
 * words — 気づけるのが「何かが起きた後」だけ and 孤立する前に可視化する are both
 * stated in 課題, so nothing the company claims is lost with them.
 *
 * `[[…]]` marks the phrase inside a line that carries the accent and the
 * underline — the eye should land on the phrase, not on a container.
 */
type Block = { text: string; kind: "pull" | "close" };

const PULL: Block = {
  kind: "pull",
  text: `[[サイン]]は、確かにそこにあったはずでした。`,
};

const CLOSE: Block = {
  kind: "close",
  text: `誰かが孤立する前に、[[見えないものを可視化する]]。
それが、私たちがBlescをつくる理由です。`,
};

const SPLIT = /(\[\[.*?\]\])/g;

function Rich({ text, className }: { text: string; className?: string }) {
  return (
    <p className={className}>
      {text
        .trim()
        .split("\n")
        .map((line, i, lines) => (
          <Fragment key={i}>
            {line.split(SPLIT).map((part, j) =>
              part.startsWith("[[") ? (
                <em
                  key={j}
                  className="font-medium not-italic text-mark-1 underline decoration-mark-1/35 decoration-2 underline-offset-[0.4em]"
                >
                  {part.slice(2, -2)}
                </em>
              ) : (
                <Fragment key={j}>{part}</Fragment>
              ),
            )}
            {i < lines.length - 1 && <br className="br-wide" />}
          </Fragment>
        ))}
    </p>
  );
}

const STYLE = {
  pull: "text-[clamp(1.3rem,2.6vw,1.75rem)] font-medium leading-[1.6] tracking-[-0.02em] text-ink",
  /*
   * Sized for the column it now sits in rather than for the full container —
   * it shares the row with the photographs, so roughly 590px at desktop. At
   * the old 2.75rem cap this wrapped into five lines in that measure.
   */
  close:
    "text-[clamp(1.35rem,2.8vw,2.125rem)] font-medium leading-[1.45] tracking-[-0.03em] text-ink",
} as const;

/**
 * Comes up from dim to full as it reaches the upper part of the viewport,
 * and stays there — dimming again on the way past would fight the reading
 * rather than support it. Reduced motion skips the dim entirely and renders
 * the line at full strength from the start.
 */
function LitBlock({ block }: { block: Block }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const lit = useInView(ref, { margin: "0px 0px -35% 0px", once: true });

  return (
    <motion.div
      ref={ref}
      animate={{ opacity: reduce || lit ? 1 : 0.32 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <Rich text={block.text} className={STYLE[block.kind]} />
    </motion.div>
  );
}

/**
 * The closing argument: two lines and the photographs, side by side.
 *
 * `overflow-x-clip` is what lets the inset break the right edge at lg
 * without adding a horizontal scrollbar on narrow windows.
 */
export function Philosophy() {
  return (
    <Section className="relative overflow-x-clip">
      {/*
        The mobile gap is wider than it looks it needs to be: the inset
        photograph hangs 32px above the main one, so a 48px gap would leave it
        almost touching the closing line above.
      */}
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center lg:gap-16">
        <div>
          <Reveal>
            <SectionTitle>
              声にならないSOSに、
              <br className="br-wide" />
              気づける社会へ。
            </SectionTitle>
          </Reveal>

          <LitBlock block={PULL} />

          <div className="mt-8">
            <LitBlock block={CLOSE} />
          </div>
        </div>

        {/*
          `relative` is what the inset anchors to. The column used to be
          sticky, which it needed when the copy beside it ran five paragraphs
          past the image; with two lines there is nothing left to track.
        */}
        <Reveal className="relative">
          <Image
            src={PHOTO.src}
            alt={PHOTO.alt}
            width={PHOTO.width}
            height={PHOTO.height}
            sizes="(min-width: 1024px) 22rem, 100vw"
            className="h-auto w-full rounded-2xl border border-line"
          />

          {/*
            Overhangs the corner rather than sitting inside it. It stays within
            the column on small screens, where there is no page margin to spill
            into, and only breaks the right edge from lg. The ring in the page
            ground colour is what keeps the two reading as two photographs
            rather than one collaged edge.
          */}
          <div className="absolute -top-8 right-2 w-[46%] overflow-hidden rounded-2xl border border-line ring-4 ring-canvas lg:-right-10 lg:-top-12 lg:w-[58%]">
            <Image
              src={PHOTO_INSET.src}
              alt={PHOTO_INSET.alt}
              width={PHOTO_INSET.width}
              height={PHOTO_INSET.height}
              sizes="(min-width: 1024px) 13rem, 45vw"
              className="h-auto w-full"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
