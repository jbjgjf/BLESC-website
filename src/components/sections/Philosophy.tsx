import Image from "next/image";
import { FlowerScatter } from "@/components/Flower";
import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Container, Icon, Lines } from "@/components/ui";

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

const PARAGRAPHS = [
  `私たちはテクノロジーに囲まれて生きながら、
人と人とのつながりは、かつてないほど希薄になっています。`,
  `私たち自身、身近な友人が抱えていた苦しみに誰も気づけないまま
手遅れになる状況を、目の当たりにしてきました。
サインは、確かにそこにあったはずでした。`,
  `苦しんでいる人に気づけるのが「何かが起きた後」だけ。
私たちは、その現実を受け入れることができませんでした。`,
  `忙しい学校生活のなかで消えていく、小さく静かなSOS。
Blescは、その声を聴き逃さないための仕組みです。
誰かが孤立する前に、見えないものを可視化する。
それが、私たちがBlescをつくる理由です。`,
];

/**
 * Deliberately slows the page down: more vertical air, a narrower measure,
 * and a longer stagger than anywhere else on the site.
 */
export function Philosophy() {
  return (
    <section className="relative overflow-hidden bg-canvas-alt py-28 md:py-40">
      {/*
        The copy here sits in a 2xl column inside a much wider container, so
        the margins are the emptiest space on the page. Shown from lg up only —
        below that the margins collapse and the flowers would crowd the text.
      */}
      <FlowerScatter
        items={[
          { top: "13%", left: "4%", size: 62, rotate: 12, opacity: 0.5, className: "hidden text-mark-1 lg:block" },
          { top: "36%", left: "2%", size: 44, rotate: -22, opacity: 0.44, className: "hidden text-mark-3 xl:block" },
          { top: "58%", left: "7%", size: 38, rotate: 38, opacity: 0.42, className: "hidden text-mark-2 lg:block" },
          { top: "77%", left: "6%", size: 54, rotate: -8, opacity: 0.48, className: "hidden text-mark-1 xl:block" },
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

            <Stagger className="mt-16 space-y-10" stagger={0.14}>
              {PARAGRAPHS.map((text, i) => (
                <RevealItem key={i}>
                  <Lines className="measure-jp text-muted">{text}</Lines>
                </RevealItem>
              ))}
            </Stagger>
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
