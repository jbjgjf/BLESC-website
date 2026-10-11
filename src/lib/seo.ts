/**
 * Single source of truth for everything a search engine or a social card
 * reads. Metadata objects, canonical URLs, the sitemap, robots.txt and the
 * JSON-LD blocks all derive from the constants here, so the brand line is
 * written once and cannot drift between the <title>, the OG card and the
 * structured data.
 */

import type { Metadata } from "next";
import { FAQ_EN } from "@/lib/faqEn";
import {
  HTML_LANG,
  LOCALES,
  OG_LOCALE,
  localePath,
  otherLocale,
  type Locale,
} from "@/lib/i18n";
import { CONTACT_EMAIL, CONTACT_PATH } from "@/lib/site";

/**
 * Absolute origin, no trailing slash.
 *
 * Canonical tags, OG images and the sitemap all have to be absolute URLs, so
 * this cannot be a relative path or a runtime guess. Vercel preview builds
 * set NEXT_PUBLIC_SITE_URL to their own origin; production falls through to
 * the real domain, which is what every canonical should point at.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://blesc.jp"
).replace(/\/$/, "");

/** Latin brand form. Used in titles, the wordmark and structured data. */
export const SITE_NAME = "Blesc";

export const LEGAL_NAME = "Blesc";

/**
 * The one line that has to do the most work. It is the <title> suffix, the
 * OG title and the h1's companion text, so it carries the primary query the
 * site should rank for — 生徒 / SOS / 可視化 — rather than a slogan.
 */
export const TAGLINE = "生徒のSOSを可視化する";

/** English display headline, kept in step with the hero. */
export const TAGLINE_EN = "Hearing the unspoken. Preventing the unseen.";

/**
 * TAGLINE in each language, for titles and cards. The English is the
 * Japanese line translated, not the display headline above: TAGLINE_EN is a
 * second line of its own that the hero sets in English on both sites, and a
 * title has to say what the Japanese title says.
 *
 * No full stop, as TAGLINE has none: these sit inside titles.
 */
export const TAGLINES: Record<Locale, string> = {
  ja: TAGLINE,
  en: "Making students’ unspoken SOS visible",
};

/**
 * The home page's <title>, and the template every other page's title is
 * set in.
 *
 * Japanese: ~26 full-width characters. An earlier title ran to 35 against a
 * desktop limit near 30, so Google cut it at 「…メンタルヘルス …」 and lost
 * プラットフォーム entirely. Shortened by dropping the em dash and the longer
 * category noun rather than メンタルヘルス, which is the term worth ranking
 * for.
 *
 * English: the same title translated, category first. It runs to 78
 * characters where a desktop result shows about 60, so what is cut is the
 * end of the tagline and what survives is the name and "Mental health AI
 * for schools" — the same order of sacrifice as the Japanese.
 *
 * Sub-pages set only their own name and take the brand from the template,
 * so no page can ship a title that omits it and none has to repeat it. The
 * separator is each language's own: a full-width bar in Japanese, a spaced
 * ASCII one in English.
 */
export const SITE_TITLE: Record<Locale, string> = {
  ja: `${SITE_NAME}｜${TAGLINE}学校向けメンタルヘルスAI`,
  en: `${SITE_NAME} | Mental health AI for schools that makes students’ unspoken SOS visible`,
};

const TITLE_SEPARATOR: Record<Locale, string> = { ja: "｜", en: " | " };

/** A sub-page's full title: its name, the separator, the brand. */
export const pageTitle = (locale: Locale, name: string) =>
  `${name}${TITLE_SEPARATOR[locale]}${SITE_NAME}`;

/**
 * Budgeted to what Google actually renders, not to what the field allows.
 *
 * Japanese desktop snippets cut around 92 full-width characters. The previous
 * copy ran to 114, so its tail — the line saying the diary itself is never
 * shown to a teacher — was dropped before anyone read it, and that line is
 * what a school cares about most. It moves inside the budget; the descriptive
 * half is what gets tightened instead. Search Console has 84% of impressions
 * on desktop, so desktop is the budget to hit and mobile still truncates.
 *
 * "Blesc" stays in the text deliberately: every impression the site currently
 * gets is the query "blesc", and Google bolds a matched term in the snippet.
 *
 * 毎日5分 became 自分のタイミングで when the page copy was corrected, which
 * cost 5.5 and put this back over budget — it was clipping mid-word at
 * 「…判定も行いま…」, which reads worse than the clause being absent. 捉えて
 * was dropped to pay for it: 可視化する carries the same meaning and is the
 * verb docs/claims.md §1 approves, so nothing about the claim changed.
 *
 * If this copy changes again, re-measure. The budget is ~92 full-width, not
 * a character count — ASCII runs like "Blesc" and "AI" count half.
 *
 * This string is not only page copy. `siteJsonLd()` puts it on the
 * Organization, WebSite *and* SoftwareApplication nodes, so whatever it says
 * ships to search engines and LLMs as machine-readable structured data. It
 * previously said Blesc 検知s 抑うつ — a medical condition named as the object
 * of a detection verb, which `sentra/docs/product_policy.md` forbids outright.
 * The verbs here are 捉える / 可視化する, which are what the implementation
 * does, and the two negated clauses are wording docs/claims.md asks for.
 */
export const DESCRIPTION =
  "Blescは、生徒が自分のタイミングで綴る日記から書きぶりの変化を可視化する学校向けメンタルヘルスプラットフォーム。日記の本文が教員に公開されることはなく、心理的リスクの判定も行いません。";

/**
 * DESCRIPTION in English, for /en's meta description.
 *
 * Every claim of the Japanese and nothing more: what Blesc is, what it
 * makes visible, that the diary is written in the student's own time, that
 * teachers do not see the diary text, and that it does not assess
 * psychological risk. The two negations are the glossary's own wording and
 * stay negations.
 *
 * Budgeted the way the Japanese is. An English desktop snippet shows about
 * 155–160 characters; this is 206, and the first sentence is kept to 125 so
 * that "Teachers never see the diary text" ends at 159 — at the edge of the
 * cut, not past it — for the reason given above: it is the line a school
 * cares about most.
 *
 * 自分のタイミングで ("in their own time") stays in. An earlier draft left
 * it out to end the privacy line at 143, but when the diary is written is a
 * fact the Japanese states — and one the team corrected (see the note above
 * FAQ) — so the English says it too. It is folded into the one clause, "how
 * students write diaries in their own time", because spelled out separately
 * ("…in the diaries they keep in their own time") the first sentence runs
 * to 138 and the cut lands in the middle of the privacy line. If this is
 * reworded, re-count: the privacy sentence has one character to spare.
 *
 * Like DESCRIPTION, it is not only a snippet: siteJsonLd("en") puts it on
 * the three nodes of the English pages' structured data.
 */
export const DESCRIPTION_EN =
  "Blesc is a mental health platform for schools that makes visible the changes in how students write diaries in their own time. Teachers never see the diary text, and Blesc does not assess psychological risk.";

/** Shorter variant for social cards, where the card itself truncates hard. */
export const DESCRIPTION_SHORT =
  "声にならないSOSに、気づける社会へ。生徒の早期のサインをAIが捉え、孤立する前に可視化します。";

/**
 * DESCRIPTION_SHORT in English. 捉え is "captures", the verb the English
 * FAQ uses for it (lib/faqEn.ts) — never "detects", which docs/claims.md
 * rules out in either language.
 *
 * 生徒 is said once, as the subject of 孤立する: "before a student becomes
 * isolated". Written as "students’ early signs … makes them visible before
 * they become isolated", "them" is the signs and "they" the students, and
 * the sentence reads as though the signs were what became isolated.
 *
 * This is also the last line on the English share card
 * (app/_shell/shareCard), where it sets on two lines of about 73
 * characters. A longer second sentence drops one word onto a third.
 */
export const DESCRIPTION_SHORT_EN =
  "Toward a society that notices the SOS no one says aloud. AI captures early signs and makes them visible before a student becomes isolated.";

export const DESCRIPTIONS: Record<Locale, string> = {
  ja: DESCRIPTION,
  en: DESCRIPTION_EN,
};

export const DESCRIPTIONS_SHORT: Record<Locale, string> = {
  ja: DESCRIPTION_SHORT,
  en: DESCRIPTION_SHORT_EN,
};

/**
 * Terms are a weak direct signal at best, but they cost nothing and some
 * non-Google crawlers still read them. Kept to the phrases the page actually
 * earns — every one of these is substantiated by copy on the site.
 *
 * 「心理的リスク 検知」 was dropped: the page no longer claims it, so the term
 * was no longer earned. The search intent is carried almost entirely by
 * 「いじめ 早期発見」「不登校 予防」「児童生徒 見守り」, which stay.
 */
export const KEYWORDS = [
  "Blesc",
  "ブレスク",
  "生徒 メンタルヘルス",
  "学校 メンタルヘルス",
  "SOS 可視化",
  "AI 日記",
  "学校向け AI",
  "教育DX",
  "スクールカウンセラー 支援",
  "生徒指導 支援",
  "児童生徒 見守り",
];

/**
 * KEYWORDS in English, term for term, less ブレスク — the name's reading in
 * katakana, which has no English counterpart. 教育DX is spelled out, since
 * "DX" for digital transformation is Japanese usage.
 */
export const KEYWORDS_EN = [
  "Blesc",
  "student mental health",
  "school mental health",
  "making SOS visible",
  "AI diary",
  "AI for schools",
  "digital transformation in education",
  "support for school counselors",
  "support for student guidance",
  "watching over students",
];

/**
 * Every profile Blesc actually controls. Google reads `sameAs` to resolve the
 * site and the accounts as one entity rather than several — which is what
 * lets an Instagram result and the site reinforce each other instead of
 * competing.
 *
 * Only add an account the company owns. A `sameAs` pointing at a dead or
 * misspelled handle is an assertion that the profile *is* Blesc, so a wrong
 * one is worse than a short list. An empty array is dropped rather than
 * emitted blank.
 */
export const SOCIAL_PROFILES: string[] = [
  "https://www.instagram.com/blesc.jp/",
  "https://www.instagram.com/blesc.inc/",
  "https://x.com/blescinc",
];

/** Handle, with the @. Drives card attribution on X, which reads it from the
 *  page rather than from any account connection. */
export const X_HANDLE = "@blescinc";

export const absoluteUrl = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * A page's absolute URL in a language. `path` is the Japanese (bare) path,
 * as everywhere in lib/i18n.
 *
 * The Japanese home page is the origin itself, with no trailing slash —
 * the form its canonical and og:url have always been written in — so it is
 * not put through absoluteUrl, which would add one.
 */
const pageUrl = (locale: Locale, path: string) => {
  const localized = localePath(locale, path);
  return localized === "/" ? SITE_URL : absoluteUrl(localized);
};

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The share card: app/opengraph-image.tsx in Japanese and
 * app/en/opengraph-image.tsx in English, each re-exported as the X card
 * beside it. Both files take their size and alt text from here, so the
 * tags a page emits and the image the route serves cannot disagree.
 */
export const CARD_SIZE = { width: 1200, height: 630 } as const;
export const CARD_TYPE = "image/png";
export const CARD_ALT: Record<Locale, string> = {
  ja: `${SITE_NAME} — ${TAGLINES.ja}`,
  en: `${SITE_NAME} — ${TAGLINES.en}`,
};

/**
 * The card, named outright in every page's metadata.
 *
 * Next would inject the image by file convention, but only into the segment
 * the file sits in, and a page that sets `openGraph` of its own replaces the
 * whole object — image included. /contact shipped without an og:image for
 * exactly that reason. So nothing here leans on the injection: each page
 * names its card, and the URL resolves against metadataBase.
 */
const cardImage = (locale: Locale, route: "opengraph-image" | "twitter-image") => ({
  url: localePath(locale, `/${route}`),
  ...CARD_SIZE,
  alt: CARD_ALT[locale],
  type: CARD_TYPE,
});

/**
 * hreflang for a page: itself in each language, and x-default.
 *
 * Every page exists in both languages at the same path under /en, so the
 * pair is derived, not listed. x-default is the Japanese page — the site's
 * default language and the one a reader of neither is best sent to. Google
 * honours the annotation only when both ends carry it; both ends are built
 * by this one function, so they always do.
 */
export const languageAlternates = (path: string) => ({
  ja: localePath("ja", path),
  en: localePath("en", path),
  "x-default": localePath("ja", path),
});

/**
 * Everything about one page that a crawler or a card reads, in one
 * language: title, description, canonical, hreflang, Open Graph and X.
 *
 * `path` is the Japanese (bare) path — "/", "/contact", "/safety" — and
 * the page's own URL is that path in `locale`.
 *
 * `title` is the page's name; the layout's template adds the brand. The
 * home page passes none and takes the layout's default title, and its card
 * is titled with the brand and the tagline.
 *
 * `socialDescription` is for a page whose meta description is too long for
 * a card, which truncates hard. Without it the card says what the snippet
 * says.
 *
 * openGraph and twitter are written out whole every time. Metadata merges
 * shallowly — a page's `openGraph` replaces the layout's, it does not add
 * to it — and X reads its own tags before it falls back to Open Graph, so
 * a page that left either to inherit would be carded as the home page.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  socialDescription = description,
}: {
  locale: Locale;
  path: string;
  title?: string;
  description: string;
  socialDescription?: string;
}): Metadata {
  const cardTitle = title ? pageTitle(locale, title) : CARD_ALT[locale];

  return {
    ...(title ? { title } : null),
    description,
    alternates: {
      canonical: localePath(locale, path),
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[otherLocale(locale)]],
      url: pageUrl(locale, path),
      siteName: SITE_NAME,
      title: cardTitle,
      description: socialDescription,
      images: [cardImage(locale, "opengraph-image")],
    },
    twitter: {
      card: "summary_large_image",
      /*
       * Puts "@blescinc" on every card of this site anyone posts, wherever
       * it is posted from. X reads it off the page, so it needs no account
       * link.
       */
      site: X_HANDLE,
      creator: X_HANDLE,
      title: cardTitle,
      description: socialDescription,
      images: [cardImage(locale, "twitter-image")],
    },
  };
}

/** The home page's metadata in a language: "/" and "/en". */
export const homeMetadata = (locale: Locale): Metadata =>
  pageMetadata({
    locale,
    path: "/",
    description: DESCRIPTIONS[locale],
    socialDescription: DESCRIPTIONS_SHORT[locale],
  });

/**
 * The root layout's metadata for a language: what is true of every page,
 * and under it the home page's own, so a route that sets nothing still has
 * a title, a description and a card.
 *
 * Each language has its own root layout (app/(ja) and app/en), and each
 * calls this with its language.
 */
export function siteMetadata(locale: Locale): Metadata {
  return {
    /*
     * Every relative URL in the metadata — canonicals, hreflang, the card
     * images — is resolved against this. Without it Next emits relative
     * og:image paths, which most crawlers and every social scraper drop.
     */
    metadataBase: new URL(SITE_URL),
    ...homeMetadata(locale),
    title: {
      default: SITE_TITLE[locale],
      template: `%s${TITLE_SEPARATOR[locale]}${SITE_NAME}`,
    },
    keywords: locale === "ja" ? KEYWORDS : KEYWORDS_EN,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "education",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        /*
         * The defaults truncate: Google clips the snippet and shows only a
         * thumbnail. Opening all three lets a snippet run to full length
         * and the OG card render large in Discover.
         */
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    /*
     * iOS Safari otherwise linkifies anything that looks like a phone
     * number or a date, which mangles the copy and injects unwanted <a>s
     * into the crawled markup. (The one number meant to be dialled, on
     * /safety, is a tel: link of its own — see TrustSections.)
     */
    formatDetection: { telephone: false, date: false, address: false },
    /*
     * No `icons` block: app/favicon.ico, app/icon.png and app/apple-icon.png
     * are picked up by file convention for every route, and naming any of
     * them here as well emits the link twice.
     */
    /*
     * Paste the token from Search Console → 設定 → 所有権の確認 → HTML タグ.
     * Left unset rather than blank: an empty string emits an empty meta tag.
     */
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
  };
}

/* -------------------------------------------------------------------------- */
/* JSON-LD                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The words of the graph below that are not already a constant above, in
 * each language.
 *
 * The Japanese is as it was. The English is that Japanese translated, item
 * for item, and it is bound by docs/claims.md as the Japanese is — by hand,
 * since scripts/check-claims.mjs looks for Japanese wording. Where a choice
 * was made:
 *
 * - `features`: implemented features only (see the note in siteJsonLd), in
 *   the words the English pages already use — "in their own time", "one
 *   follow-up question", "how a student writes", "observations", "basis".
 *   The fourth says the graph is structured "with reference to" published
 *   guidelines, the FAQ's phrase for the same sources (lib/faqEn.ts), and
 *   not "based on" them: most of its links have no published source behind
 *   them, and テクノロジー says so.
 * - Nothing is a detection, a score or an assessment of a student, and the
 *   privacy item stays a negation.
 */
const GRAPH_COPY: Record<
  Locale,
  { subCategory: string; features: readonly string[]; pricing: string }
> = {
  ja: {
    subCategory: "学校向けメンタルヘルスプラットフォーム",
    features: [
      "自分のタイミングで綴る日記による全生徒のセルフレポート",
      "独自AIによる一問一答の深掘り",
      "入力のためらいや書き直しといった書きぶりの計測",
      "公開されている医学的ガイドラインをもとに構造化したオントロジー知識グラフによる記述の整理",
      "日記本文を教員に開示しないプライバシー設計",
      "教員向けダッシュボードでの観測・時刻・根拠の提示",
    ],
    pricing: "導入のご相談・お見積りはお問い合わせください。",
  },
  en: {
    subCategory: "Mental health platform for schools",
    features: [
      "Self-reports from all students, through a diary each writes in their own time",
      "One follow-up question from Blesc’s own AI in reply to a diary entry",
      "Measurement of how a student writes, such as hesitation and rewriting while typing",
      "Organizing what is written with an ontology knowledge graph structured with reference to published medical guidelines",
      "A privacy design that does not disclose the diary text to teachers",
      "A teacher dashboard that shows observations with their time and basis",
    ],
    pricing: "Please contact us to discuss adoption or to request a quote.",
  },
};

/**
 * One @graph rather than several loose blocks. Nodes cross-reference by @id,
 * so Google resolves "the organisation that publishes this website that
 * offers this software" as a single entity instead of three unrelated ones.
 *
 * The graph is emitted on every page, and it describes the same three
 * things on all of them — the @ids and URLs are the site's, not the page's
 * — in the language of the page it is on: the descriptions, the site's
 * name and the feature list are English under /en, so an English page does
 * not hand a crawler a Japanese account of itself. The contact point's URL
 * is that language's form. What stays as it is in both: the names, the
 * katakana reading in alternateName, and the two statements of fact about
 * language (the product's inLanguage and the contact point's
 * availableLanguage), which describe the product and the inbox, not the
 * page.
 */
export function siteJsonLd(locale: Locale) {
  const orgId = `${SITE_URL}/#organization`;
  const siteId = `${SITE_URL}/#website`;
  const copy = GRAPH_COPY[locale];
  const description = DESCRIPTIONS[locale];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        legalName: LEGAL_NAME,
        alternateName: ["BLESC", "ブレスク"],
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/logo/logo-on-light.png"),
        },
        description,
        email: CONTACT_EMAIL,
        areaServed: { "@type": "Country", name: "Japan" },
        ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : null),
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: CONTACT_EMAIL,
            url: pageUrl(locale, CONTACT_PATH),
            availableLanguage: ["ja"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: SITE_URL,
        name: `${SITE_NAME} — ${TAGLINES[locale]}`,
        description,
        /*
         * The site, not this page: every page exists in both languages
         * (lib/i18n), and this one node is emitted on all of them.
         */
        inLanguage: LOCALES.map((each) => HTML_LANG[each]),
        publisher: { "@id": orgId },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#product`,
        name: SITE_NAME,
        applicationCategory: "EducationalApplication",
        applicationSubCategory: copy.subCategory,
        operatingSystem: "Web, iOS, Android",
        description,
        url: SITE_URL,
        inLanguage: "ja",
        publisher: { "@id": orgId },
        audience: {
          "@type": "EducationalAudience",
          educationalRole: ["teacher", "administrator"],
        },
        /*
         * Implemented features only. This array is emitted as structured
         * data, so an aspiration listed here is an aspiration published as
         * fact. 「心理的リスク解析」 and 「リスクの可視化」 were both removed:
         * the product computes `state_band` / `latest_score` but renders
         * neither, and no analysis produces a risk judgement — see
         * `sentra/docs/educator_display_policy.md`. Writing dynamics is
         * listed because `writing_dynamics.py` genuinely implements it.
         * The list itself is GRAPH_COPY's, above, in the page's language.
         */
        featureList: copy.features,
        offers: {
          "@type": "Offer",
          category: "SaaS",
          availability: "https://schema.org/InStock",
          priceSpecification: {
            "@type": "PriceSpecification",
            description: copy.pricing,
          },
        },
      },
    ],
  };
}

const HOME_CRUMB: Record<Locale, string> = { ja: "ホーム", en: "Home" };

/**
 * Breadcrumbs for any page below the root, in the page's language.
 *
 * Each crumb's `path` is the Japanese (bare) path and its `name` is already
 * in `locale`; the trail starts from that language's home page, so the
 * English trail reads "Home > Contact" and stays under /en.
 */
export function breadcrumbJsonLd(
  trail: { name: string; path: string }[],
  locale: Locale = "ja",
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: HOME_CRUMB[locale],
        item: pageUrl(locale, "/"),
      },
      ...trail.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: crumb.name,
        item: pageUrl(locale, crumb.path),
      })),
    ],
  };
}

/**
 * The questions a school actually asks before a call, in the order they ask
 * them. Every answer is drawn from copy that already appears on the page —
 * an FAQ rich result that says something the page does not is a manual-action
 * risk, not a win — and this same array renders the visible <FAQ> section, so
 * the markup and the structured data cannot diverge.
 */
/*
 * The diary is written in the student's own time — not a fixed five minutes,
 * and not in homeroom. The team corrected that description (2026-09), and the
 * page's own copy (仕組み 01–02) now says 自分のタイミングで and 内容も長さも自由,
 * so the answers below say the same: an FAQ answer that the page does not
 * support is the mismatch this comment block above warns against.
 */
export const FAQ: { q: string; a: string }[] = [
  {
    q: "Blescとは何ですか？",
    a: "Blescは、生徒が自分のタイミングで綴る日記を独自のAIが深掘りし、言葉づかいや書きぶりの変化を捉えて可視化する学校向けのメンタルヘルスプラットフォームです。心理的リスクの判定や、心身の状態の診断は行いません。",
  },
  {
    q: "生徒が書いた日記の内容は、先生に読まれますか？",
    a: "日記の本文そのものが教員に公開されることはありません。教員が受け取るのは、観測された記述と、その時刻、そしてその根拠です。根拠を示せない観測は、そもそも表示されません。",
  },
  {
    q: "生徒の負担はどのくらいですか？",
    a: "日記は生徒が自分のタイミングで書くもので、内容も長さも自由です。対象は希望者ではなく全生徒で、新しい習慣も専用の準備も必要ありません。",
  },
  /*
   * The two ontology answers below say what テクノロジー says, in the same
   * words, and no more (docs/claims.md §4; lp_claim_alignment.md ③ converts
   * to "describe it as it is" on 2026-10-01). Not "AIに実装" and not "言葉を
   * 予測するだけの汎用AIではありません": both present the curated graph as
   * what drives the product's analysis, which is the open claim. Association,
   * not cause, because that is the most the seed records for any relation —
   * and worded as what the seed RECORDS (「出典として関連を記録」), never as
   * what WHO or NICE "reports": a spot check found the WHO fact sheet silent
   * on two relations the seed cites it for (header of lib/ontologySeed.ts).
   *
   * The counts are typed here, not imported, and have to match COUNTS in
   * src/lib/ontologySeed.ts: 42 relations, 15 recorded as "association",
   * 27 not. If the seed is regenerated, change them with it.
   */
  {
    q: "汎用のAIチャットとは何が違うのですか？",
    a: "Blescは会話を続けるチャットではなく、日記に短い問いをひとつだけ返します。また、睡眠・社会的ひきこもり・学業上の負荷の3領域について、気分や行動、学校での出来事などの概念どうしのつながりを、WHOやNICEなどの公開資料に照らして知識グラフ（オントロジー）として整理しています。つながりの一本ずつに、裏付けとなる公開資料があるかどうかを記録しています。",
  },
  /*
   * Three entries written to be found by what a school actually types —
   * 心の健康観察, いじめ 早期発見, 不登校 予防 — and each one answers by saying
   * what Blesc is NOT before what it does. That keeps them inside
   * docs/claims.md §1 (no 検知・判定 of a condition) while still matching the
   * query, and it is the honest answer: none of the three is something the
   * product claims to do.
   *
   * 心の健康観察 is described in the ministry's own terms (MEXT, 「１人１台
   * 端末等を活用した「心の健康観察」の導入推進」, Mar 2025: 児童生徒の心や体調
   * の変化を把握し、早期発見、早期支援につなげる), and the contrast drawn is
   * only the one that source supports — its examples are web stress checks,
   * forms and apps, i.e. questions answered. The last sentence disclaims
   * endorsement the same way 技術的な裏づけ does. There is deliberately no
   * claim that Blesc can be used alongside it, replaces it, or is listed by
   * it: nobody on the team has confirmed any of those, so none is written.
   */
  {
    q: "「心の健康観察」とは何ですか？ Blescとの違いは？",
    a: "「心の健康観察」は、文部科学省が全国の学校での実施を目指して導入を進めている取り組みで、1人1台端末などを使って児童生徒の心や体調の変化を把握し、早期発見・早期支援につなげるものです。文部科学省の資料に示された実施例は、ウェブ上のストレスチェックやフォーム、アプリなど、質問への回答を集める形のものです。Blescは回答を選ぶ形式ではなく、生徒が自分のタイミングで綴る日記から、言葉づかいや書きぶりの変化を捉えて可視化します。なお、これは文部科学省の取り組みの説明であり、文部科学省がBlescを推奨・承認するものではありません。",
  },
  {
    q: "一日の落ち込みと、続いている変化は見分けられますか？",
    a: "言葉のニュアンス、書くことをためらった間、日々の書きぶりの変化といった微細なシグナルを積み重ねて捉えます。書き重ねられるからこそ、一日の落ち込みなのか、続いている変化なのかを見分ける手がかりになります。判断そのものは、記録を受け取った教員が行います。",
  },
  {
    q: "Blescでいじめの早期発見はできますか？",
    a: "Blescは、いじめがあるかどうかを判定したり、見つけ出したりするものではありません。生徒が自分のタイミングで綴る日記から、言葉づかいや書きぶりの変化を捉えて可視化し、観測された記述をその時刻と根拠とともに教員にお届けします。それは教員が気づくための手がかりであり、いじめの有無を判断し、対応を決めるのは学校と教員です。",
  },
  {
    q: "不登校の予防にBlescは使えますか？",
    a: "Blescは、不登校になるかどうかを予測したり、予防を保証したりするものではありません。言葉づかいや書きぶりの変化を捉えて可視化し、教員が生徒の変化に気づくための手がかりを届けます。気づいたあとの支援をどう行うかは、学校と教員が判断します。",
  },
  {
    q: "技術的な裏づけはありますか？",
    a: "知識グラフは、WHOのファクトシート「Mental health of adolescents」、NICEガイドライン NG134、WHOの mhGAP Intervention Guide、文部科学省の生徒指導提要を参照して、社内でまとめています。42のつながりのうち、公開資料を出典として関連を記録しているのは15で、残る27は公開資料の裏付けがなく、社内の判断であることを明記しています。出典のあるつながりも関連として記録したもので、どちらが原因かを示すものではありません。掲載の各機関は、Blescを推奨・承認するものではありません。臨床の専門家によるレビューを準備しています。",
  },
  {
    q: "導入について相談するにはどうすればよいですか？",
    a: "お問い合わせフォームより、資料請求または導入のご相談としてご連絡ください。内容を確認のうえ、担当者より数営業日以内にご返信いたします。",
  },
];

/**
 * FAQPage for the home page in a language, derived from the array that
 * page renders: FAQ above on "/", and FAQ_EN (lib/faqEn.ts) on "/en".
 *
 * Two nodes with two ids, one per page, each in its own language — not one
 * node listing both, which would claim on each page questions it does not
 * show.
 */
export function faqJsonLd(locale: Locale = "ja") {
  const entries = locale === "ja" ? FAQ : FAQ_EN;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl(localePath(locale, "/"))}#faq`,
    inLanguage: HTML_LANG[locale],
    mainEntity: entries.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
