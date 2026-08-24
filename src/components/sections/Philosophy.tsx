"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Fragment, useRef } from "react";
import { FlowerScatter } from "@/components/Flower";
import { Reveal } from "@/components/Reveal";
import { Container, Icon } from "@/components/ui";

/**
 * Set this to show a real photograph in the right-hand slot; the dashed
 * well renders until then. Kept null rather than pointed at stock imagery.
 */
const PHOTO: { src: string; alt: string } | null = {
  src: "/photos/philosophy.png",
  alt: "",
};

/**
 * Square inset that overhangs the main photograph's top-right corner.
 *
 * Set it to show; null leaves the main image alone rather than reserving a
 * hole. It carries a ring in the page ground colour so the two read as two
 * photographs rather than one collaged edge.
 */
const PHOTO_ACCENT: { src: string; alt: string } | null = {
  src: "/photos/philosophy-2.png",
  alt: "",
};

/**
 * Same words, lit as you read them.
 *
 * The boxes this replaces were the wrong instrument — they fenced the two
 * key lines off rather than drawing the eye to them, and two bordered
 * panels inside a passage of prose just read as clutter. Instead the copy
 * starts dim and comes up to full strength line by line as it reaches the
 * upper part of the viewport, and inside the two lines that matter a single
 * phrase carries the accent and an underline. The eye lands on the phrase,
 * not on a container.
 *
 * `[[…]]` marks that phrase. Nothing here was rewritten.
 */
type Block = { text: string; kind: "body" | "pull" | "close" };

const BLOCKS: Block[] = [
  {
    kind: "body",
    text: `私たちはテクノロジーに囲まれて生きながら、
人と人とのつながりは、かつてないほど希薄になっています。`,
  },
  {
    kind: "body",
    text: `私たち自身、身近な友人が抱えていた苦しみに誰も気づけないまま
手遅れになる状況を、目の当たりにしてきました。`,
  },
  { kind: "pull", text: `[[サイン]]は、確かにそこにあったはずでした。` },
  {
    kind: "body",
    text: `苦しんでいる人に気づけるのが「何かが起きた後」だけ。
私たちは、その現実を受け入れることができませんでした。`,
  },
  {
    kind: "body",
    text: `忙しい学校生活のなかで消えていく、小さく静かなSOS。
Blescは、その声を聴き逃さないための仕組みです。`,
  },
  {
    kind: "close",
    text: `誰かが孤立する前に、[[見えないものを可視化する]]。
それが、私たちがBlescをつくる理由です。`,
  },
];

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
  body: "measure-jp text-muted",
  pull: "text-[clamp(1.35rem,3vw,1.95rem)] font-medium leading-[1.6] tracking-[-0.02em] text-ink",
  close:
    "text-[clamp(1.5rem,3.6vw,2.4rem)] font-medium leading-[1.55] tracking-[-0.025em] text-ink",
} as const;

/**
 * Comes up from dim to full as it reaches the upper part of the viewport,
 * and stays there — dimming again on the way past would fight the reading
 * rather than support it.
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
 * Deliberately slows the page down: more vertical air, a narrower measure,
 * and a longer stagger than anywhere else on the site.
 */
export function Philosophy() {
  return (
    <section className="relative overflow-hidden bg-canvas-alt py-20 md:py-28">
      {/*
        The copy here sits in a 2xl column inside a much wider container, so
        the margins are the emptiest space on the page. Shown from lg up only —
        below that the margins collapse and the flowers would crowd the text.
      */}
      <FlowerScatter
        items={[
          /*
            xl only, and inside 4% of the edge. The copy column sits at the
            container's padding — roughly 136px in at 1280 — so the wider
            placements these had were landing on top of the text once this
            section moved and its measure changed.
          */
          { top: "13%", left: "2%", size: 58, rotate: 12, opacity: 0.5, className: "hidden text-mark-1 xl:block" },
          { top: "38%", left: "4%", size: 40, rotate: -22, opacity: 0.44, className: "hidden text-mark-3 xl:block" },
          { top: "62%", left: "1.5%", size: 36, rotate: 38, opacity: 0.42, className: "hidden text-mark-2 xl:block" },
          { top: "82%", left: "3.5%", size: 50, rotate: -8, opacity: 0.48, className: "hidden text-mark-1 xl:block" },
        ]}
      />

      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-20">
          <div className="max-w-2xl">
            <Reveal>
              <h2 className="text-[clamp(1.625rem,4vw,2.5rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink">
                声にならないSOSに、
                <br className="br-wide" />
                気づける社会へ。
              </h2>
            </Reveal>

            <div className="mt-12 space-y-11 md:space-y-12">
              {BLOCKS.map((block, i) => (
                <LitBlock key={i} block={block} />
              ))}
            </div>
          </div>

          {/*
            Image slot. Sticky so it tracks the copy rather than sitting at
            the top of a very tall column with nothing beneath it. Drop a file
            in /public and set PHOTO below; the well shows until then.
          */}
          {/*
            `relative` is what the inset anchors to. It has to survive the
            sticky switch at lg, and it does — a sticky box is still a
            containing block for absolutely positioned descendants.

            Extra top margin from lg only: the inset hangs 48px above the main
            frame, and without it the overhang would collide with the heading
            in the column alongside.
          */}
          <Reveal className="relative lg:sticky lg:top-28 lg:mt-12 lg:self-start">
            {PHOTO ? (
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-line">
                <Image
                  src={PHOTO.src}
                  alt={PHOTO.alt}
                  fill
                  sizes="(min-width: 1024px) 22rem, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-canvas-alt px-6 text-center">
                <Icon
                  name="add_photo_alternate"
                  size={30}
                  className="text-mark-1"
                />
                <p className="text-[0.8rem] text-muted">写真 — 3:4</p>
              </div>
            )}

            {/*
              Overhangs the corner rather than sitting inside it. It stays
              within the column on small screens, where there is no page
              margin to spill into, and only breaks the right edge from lg.
            */}
            <div className="absolute -top-8 right-2 aspect-square w-[46%] overflow-hidden rounded-2xl border border-line ring-4 ring-canvas lg:-right-10 lg:-top-12 lg:w-[58%]">
              {PHOTO_ACCENT ? (
                <Image
                  src={PHOTO_ACCENT.src}
                  alt={PHOTO_ACCENT.alt}
                  fill
                  sizes="(min-width: 1024px) 13rem, 45vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-line bg-canvas-alt px-4 text-center">
                  <Icon
                    name="add_photo_alternate"
                    size={24}
                    className="text-mark-3"
                  />
                  <p className="text-[0.7rem] leading-tight text-muted">
                    写真 — 1:1
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
