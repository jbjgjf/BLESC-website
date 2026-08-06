import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/ContactForm";
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
    */
    <main className="bg-canvas pb-24 pt-36 md:pb-32 md:pt-44">
      <Container>
        <div className="max-w-2xl">
          <span aria-hidden className="block h-1 w-14 rounded-full bg-mark-1" />
          <h1 className="mt-6 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-ink">
            お問い合わせ
          </h1>
          <p className="measure-jp mt-6 text-muted">
            資料のご請求、導入のご相談を承っております。
            <br className="br-wide" />
            内容を確認のうえ、担当者より数営業日以内にご返信いたします。
          </p>

          <Suspense fallback={<div className="mt-12 h-[32rem]" />}>
            <ContactForm />
          </Suspense>

          <div className="mt-16 border-t border-line pt-8">
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
      </Container>
    </main>
  );
}
