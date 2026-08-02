import { FlowerScatter } from "@/components/Flower";
import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Container, Lines } from "@/components/ui";

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
    <section className="relative overflow-hidden bg-canvas py-36 md:py-56">
      {/*
        The copy here sits in a 2xl column inside a much wider container, so
        the margins are the emptiest space on the page. Shown from lg up only —
        below that the margins collapse and the flowers would crowd the text.
      */}
      <FlowerScatter
        items={[
          { top: "14%", left: "5%", size: 34, rotate: 12, opacity: 0.16, className: "hidden text-mark-1 lg:block" },
          { top: "33%", right: "7%", size: 22, rotate: -22, opacity: 0.14, className: "hidden text-mark-3 lg:block" },
          { top: "58%", left: "8%", size: 19, rotate: 38, opacity: 0.13, className: "hidden text-mark-2 lg:block" },
          { top: "78%", right: "5%", size: 28, rotate: -8, opacity: 0.15, className: "hidden text-mark-1 lg:block" },
        ]}
      />

      <Container>
        <div className="mx-auto max-w-2xl">
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
      </Container>
    </section>
  );
}
