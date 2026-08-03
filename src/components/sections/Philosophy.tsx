import Image from "next/image";
import { FlowerScatter } from "@/components/Flower";
import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Container, Icon, Lines } from "@/components/ui";

/**
 * Set this to show a real photograph in the right-hand slot; the dashed
 * well renders until then. Kept null rather than pointed at stock imagery.
 */
const PHOTO: { src: string; alt: string } | null = null;

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
    <section className="relative overflow-hidden bg-canvas py-28 md:py-40">
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
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
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
                <p className="text-[0.8rem] text-muted">
                  写真 — 3:4
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
