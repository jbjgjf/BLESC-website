import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/ContactForm";
import { Flower } from "@/components/Flower";
import { Container, Icon } from "@/components/ui";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "お問い合わせ | Blesc",
  description:
    "Blescの資料請求・導入のご相談を承っております。お問い合わせフォームよりご連絡ください。",
};

export default function ContactPage() {
  return (
    /*
      pt clears the fixed 5rem nav with room to spare — this is the top of a
      page rather than a section mid-scroll, so it gets more air than the
      shared Section spacing would give it.

      overflow-x-clip so the brand mark below can hang off the left edge
      without putting a horizontal scrollbar on a narrow window.
    */
    <main className="relative overflow-x-clip bg-canvas pb-24 pt-36 md:pb-32 md:pt-44">
      {/*
        The mark, quietly, filling the hole.

        The form is tall and the column of copy beside it is short, so at
        desktop the lower left of this page is a large empty rectangle — the
        reason it read as a form dropped onto white. The company's own flower
        is what belongs in it: the same ornament that drifts behind the home
        page, parked rather than travelling, because a page with one screen of
        content and a form to fill in is not the place for scroll
        choreography.

        12% of --mark-1 is the ceiling, not a preference: the sticky column
        above passes over it, and the accented mail link inside that column
        measures 4.64:1 against this wash in the light build where 14% would
        drop it to 4.50 and 18% to 4.24. Muted copy holds 5.33:1 and ink
        16.57:1. The blur is small on purpose — enough to soften the edges,
        not enough to stop the petals reading as the mark rather than a haze.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[14%] bottom-[4%] hidden aspect-square w-[clamp(20rem,36vw,34rem)] text-accent opacity-[0.12] blur-[6px] lg:block"
      >
        {/*
          The size prop writes width/height attributes, which h-full/w-full
          then override; they only matter as the ratio the viewBox draws
          against, and preserveAspectRatio keeps the mark undistorted inside
          the square box.
        */}
        <Flower size={100} rotate={-14} className="h-full w-full" />
      </div>

      <Container className="relative">
        {/*
          Two columns at desktop: the ask on the left, the form on the right.
          Stacked, it was a heading and then 700px of fields, which is the
          shape of a page nobody designed. items-start is what lets the left
          column stick.
        */}
        <div className="grid gap-14 lg:grid-cols-[5fr_7fr] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-32">
            {/*
              type-head, the same utility every section head on the site uses.
              This was a one-off clamp at font-semibold over a coloured accent
              bar — the two pieces of chrome the rest of the page has already
              dropped.
            */}
            <h1 className="type-head text-ink">お問い合わせ</h1>

            {/*
              Left to rewrap. The authored break here was set for a full-width
              measure and would have broken the sentence a third of the way in
              at this column width.
            */}
            <p className="measure-jp mt-6 text-[1.0625rem] text-muted">
              資料のご請求、導入のご相談を承っております。内容を確認のうえ、担当者より数営業日以内にご返信いたします。
            </p>

            <div className="mt-10 border-t border-line pt-8">
              <p className="text-[0.85rem] text-muted">
                フォームをお使いになれない場合は、こちらまで直接ご連絡ください。
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-3 inline-flex items-center gap-2 text-[0.9rem] text-mark-1 transition-opacity duration-300 hover:opacity-80"
              >
                <Icon name="mail" size={18} className="shrink-0" />
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          {/*
            The fallback is the panel the form arrives in rather than a bare
            gap: the form reads the ?type= parameter, so it renders on the
            client and this is what the first paint shows.
          */}
          <Suspense
            fallback={
              <div className="h-[40rem] rounded-[1.25rem] border border-line bg-surface shadow-[var(--shadow-card)]" />
            }
          >
            <ContactForm />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}
