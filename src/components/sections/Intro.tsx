import { Flower } from "@/components/Flower";
import { Reveal } from "@/components/Reveal";
import { Container } from "@/components/ui";

/**
 * What Blesc is, in three sentences, immediately before 仕組み.
 *
 * The feedback that asked for this was plain about why: 仕組み was hard to
 * follow because nothing before it had said what the product is, and a
 * mechanism is only readable once you know what it is the mechanism of. It
 * also said what not to write — no AI-sounding explanation. So this is the
 * product in the words a teacher, a parent or a 中学生 would use, and only
 * facts the rest of the page already states: students write a diary when
 * they like, the AI sends back one short question, and what reaches the
 * teacher is a class, a roll number and an observation with its time,
 * never the diary itself. The last clause says プロダクト's 「観測と根拠」
 * in everyday words — どんな表現がいつあったか, which kind of expression
 * appeared and when, is exactly what an observation row carries — rather
 * than a looser paraphrase such as 気になる変化: the teacher's screen shows
 * observations, not changes, and 気になる would be the product judging what
 * matters (docs/claims.md §2). 観測 itself was tried here and read as
 * jargon, which is the thing this block exists to avoid.
 * No 独自のAI, 深掘り, 可視化, プラットフォーム or シグナル: each of those
 * needs a second sentence to explain it, and this block has no room for one.
 *
 * Set like the hero rather than like a section: centred, light weight, one
 * large line and two quieter ones, with air on both sides. It is not a
 * section with a title because it is not a topic of its own — it is the
 * sentence the next section is an illustration of — so it has no id and no
 * place in the nav, and its large line is its heading.
 *
 * The heading is broken into two inline-blocks so a narrow screen breaks it
 * after 「Blescは、」 and nowhere else; Japanese has no spaces, and left to
 * itself the line would break wherever the width ran out. That only holds
 * while the second block fits on one line, so the size's floor is set by
 * the narrowest phone: at 320px the Container leaves 272px, and
 * 学校で使う日記アプリです。 at the old 24px floor wanted about 295px and broke
 * again inside itself, before です。. The ramp below is 21px there (about
 * 257px of line) and within a pixel of the old one from 768px up. The
 * paragraph uses the site's br-wide breaks, which only apply from 768px —
 * below that it rewraps on its own.
 *
 * bg-canvas and a positioned Container, like every <Section>: the travelling
 * flower behind this stretch of the page paints above section fills and
 * below their content, and this block has to sit in that same order.
 *
 * Contrast (light tokens, measured): the heading is ink on white, 19.4:1;
 * the paragraph is muted on white, 6.25:1. Neither counts as large text at
 * its smallest — 21px and 17px, both in weight 300, are under the 24px that
 * would earn the 3:1 floor — so both are held to 4.5:1, and both clear it.
 * The small flower is ornament and carries nothing; it is `block` so its
 * mx-auto centres it, rather than it sitting in an inline line box with a
 * text strut under it.
 */
export function Intro() {
  return (
    <section className="bg-canvas py-[clamp(2rem,5vw,4rem)]">
      <Container className="relative">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Flower size={30} className="mx-auto block text-accent" />

          <h2 className="mt-8 text-[clamp(1.25rem,0.75rem+2.8vw,2.625rem)] leading-[1.35] font-light tracking-[-0.02em] text-ink [font-feature-settings:'palt'_1]">
            <span className="inline-block">Blescは、</span>
            <span className="inline-block">学校で使う日記アプリです。</span>
          </h2>

          <p className="mt-6 text-[clamp(1.0625rem,0.92rem+0.6vw,1.375rem)] leading-[1.9] font-light text-muted md:mt-8">
            生徒は好きなときに日記を書き、AIが短い問いをひとつ返します。
            <br className="br-wide" />
            先生に届くのは日記の本文ではなく、
            <br className="br-wide" />
            クラスと出席番号、どんな表現がいつあったかだけです。
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
