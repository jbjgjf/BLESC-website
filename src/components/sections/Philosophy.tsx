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
    <section className="bg-canvas py-36 md:py-56">
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
