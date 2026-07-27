import { RevealItem, Stagger } from "@/components/Reveal";
import { ButtonLink, Section } from "@/components/ui";
import { CTA } from "@/lib/site";

/** Repeats the hero CTAs so a reader at the bottom never has to scroll back. */
export function FinalCta() {
  return (
    <Section>
      <Stagger className="max-w-2xl" stagger={0.1}>
        <RevealItem>
          <h2 className="text-[clamp(1.625rem,4vw,2.5rem)] font-medium leading-[1.4] tracking-[-0.02em] text-ink">
            導入について、お話ししませんか。
          </h2>
        </RevealItem>
        <RevealItem>
          <p className="measure-jp mt-6 text-muted">
            資料のご請求、導入のご相談を承っております。
          </p>
        </RevealItem>
        <RevealItem>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <ButtonLink variant="secondary" href={CTA.document.href}>
              {CTA.document.label}
            </ButtonLink>
            <ButtonLink variant="primary" href={CTA.consult.href}>
              {CTA.consult.label}
            </ButtonLink>
          </div>
        </RevealItem>
      </Stagger>
    </Section>
  );
}
