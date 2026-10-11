import { Suspense } from "react";
import { ContactForm } from "@/components/ContactForm";
import { Flower } from "@/components/Flower";
import { Container, Icon } from "@/components/ui";
import { localePath, type Locale } from "@/lib/i18n";
import { CONTACT_EMAIL } from "@/lib/site";
import { TRUST_PATH, TRUST_TITLE } from "@/lib/trust";

/**
 * The page's own words, per language. The form's are in ContactForm.
 *
 * `trust` is the quiet line under the form: the words on either side of the
 * link to 安全とプライバシー. The link's own text is not here — it is the
 * page's title, TRUST_TITLE in lib/trust, so the link always names the page
 * by the name the page gives itself. The English halves carry their own
 * spaces; the Japanese ones are the brackets the title sits in.
 *
 * `lead` and `trustLine` are whole class strings picked by language, never
 * fragments joined up: Tailwind only generates what it can read. English
 * differs in two ways:
 *
 * - It leaves out measure-jp, the Japanese paragraph setting in globals.css
 *   (1.9 leading and a hair of tracking), which is too open for Latin and,
 *   being unlayered, would outrank any leading set beside it. It names its
 *   own leading and takes text-pretty, so a paragraph does not end on one
 *   word.
 * - The lead is capped at 36rem. Below the two-column breakpoint the copy
 *   column is the whole container — up to 944px — which Japanese fills at
 *   about 55 characters a line and English would at over a hundred. At two
 *   columns the column is narrower than the cap and it does nothing.
 */
const COPY = {
  ja: {
    heading: "お問い合わせ",
    lead: "資料のご請求、導入のご相談を承っております。内容を確認のうえ、担当者より数営業日以内にご返信いたします。",
    mailNote: "フォームをお使いになれない場合は、こちらまで直接ご連絡ください。",
    trust: { before: "日記やデータの扱いについては『", after: "』をご覧ください。" },
    leadClass: "measure-jp mt-6 text-[1.0625rem] text-muted",
    trustLineClass: "measure-jp mt-5 px-6 text-[0.8rem] text-muted md:px-8",
  },
  en: {
    heading: "Contact",
    lead: "We welcome requests for information and consultations about adopting Blesc. We will review your message, and a member of our team will reply within a few business days.",
    mailNote:
      "If you cannot use the form, please write to us directly at this address.",
    trust: { before: "See ", after: " for how diaries and data are handled." },
    leadClass:
      "mt-6 max-w-[36rem] text-pretty text-[1.0625rem] leading-[1.65] text-muted",
    trustLineClass:
      "mt-5 px-6 text-pretty text-[0.8rem] leading-[1.6] text-muted md:px-8",
  },
} as const;

/**
 * The contact page, in either language: /contact and /en/contact.
 *
 * The routes are thin — each keeps its own metadata and breadcrumb markup
 * and renders this with its language — so the page is laid out once.
 *
 * A server component: it takes `locale` from the route. The form inside is
 * a client component and asks useLocale() for the same thing.
 */
export function ContactPage({ locale }: { locale: Locale }) {
  const t = COPY[locale];

  return (
    /*
      pt clears the fixed 5rem nav with room to spare — this is the top of a
      page rather than a section mid-scroll, so it gets more air than the
      shared Section spacing would give it.

      overflow-x-clip so the brand mark below can hang off the left edge
      without putting a horizontal scrollbar on a narrow window.

      A div, not a <main>: the root layout already wraps every page in one,
      and a document gets a single main landmark. (This was a <main> while
      it lived in the route file, nested inside the layout's.)

      lang on the English page only, as TrustPage marks its own. It costs
      nothing where the document already says en, and where it does not it
      is what keeps a screen reader from reading an English form out in a
      Japanese voice.
    */
    <div
      lang={locale === "en" ? "en" : undefined}
      className="relative overflow-x-clip bg-canvas pb-24 pt-36 md:pb-32 md:pt-44"
    >
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
        measures 4.64:1 against this wash, where 14% would drop it to 4.50
        and 18% to 4.24. Muted copy holds 5.33:1 and ink
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
            <h1 className="type-head text-ink">{t.heading}</h1>

            {/*
              Left to rewrap. The authored break here was set for a full-width
              measure and would have broken the sentence a third of the way in
              at this column width.
            */}
            <p className={t.leadClass}>{t.lead}</p>

            <div className="mt-10 border-t border-line pt-8">
              <p className="text-[0.85rem] text-muted">{t.mailNote}</p>
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
            The right-hand column: the form, and one line under it.

            A wrapper so the two are one grid item. The form used to be the
            grid item itself; it is a block inside this now and fills the
            same width, so nothing about the form's own box has moved.
          */}
          <div>
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

            {/*
              The way to 安全とプライバシー, for the visitor whose question
              before writing in is what happens to a student's diary.

              Here rather than inside the form, for two reasons. It is not
              part of what is being submitted, so it does not belong among
              the fields; and the form renders on the client only, where
              this is in the server's HTML — there for a crawler, for a
              reader without JavaScript, and still there once the form has
              been replaced by its confirmation.

              Quiet: the smallest type on the page, in muted, indented to the
              panel's own padding so it lines up with the fields above it
              rather than with the panel's rounded corner. The link is the
              form's own link style — mark-1 with a faint underline that
              firms up on hover. On the page ground muted holds 6.25:1 and
              mark-1 5.44:1; the flower wash lies under the left column, not
              this one.

              A plain anchor, like every link between pages on this site: a
              full load, which is what Lenis has always started from.
            */}
            <p className={t.trustLineClass}>
              {t.trust.before}
              <a
                href={localePath(locale, TRUST_PATH)}
                className="text-mark-1 underline decoration-mark-1/40 underline-offset-4 transition-colors duration-300 hover:decoration-mark-1"
              >
                {TRUST_TITLE[locale]}
              </a>
              {t.trust.after}
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
