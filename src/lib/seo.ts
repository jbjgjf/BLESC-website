/**
 * Single source of truth for everything a search engine or a social card
 * reads. Metadata objects, canonical URLs, the sitemap, robots.txt and the
 * JSON-LD blocks all derive from the constants here, so the brand line is
 * written once and cannot drift between the <title>, the OG card and the
 * structured data.
 */

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
 * ~120 JP characters. Long enough to carry the product category, the
 * mechanism and the privacy guarantee; short enough that Google is unlikely
 * to truncate it in a Japanese SERP.
 *
 * This string is not only page copy. `siteJsonLd()` puts it on the
 * Organization, WebSite *and* SoftwareApplication nodes, so whatever it says
 * ships to search engines and LLMs as machine-readable structured data. It
 * previously said Blesc 検知s 抑うつ — a medical condition named as the object
 * of a detection verb, which `sentra/docs/product_policy.md` forbids outright.
 * The verbs here are 捉える / 可視化する, which are what the implementation does.
 */
export const DESCRIPTION =
  "Blescは、生徒が毎日5分で綴る日記を独自のAIが深掘りし、言葉づかいや書きぶりの変化を捉えて可視化する学校向けメンタルヘルスプラットフォームです。心理的リスクの判定は行いません。日記の本文そのものが教員に公開されることもありません。";

/** Shorter variant for social cards, where the card itself truncates hard. */
export const DESCRIPTION_SHORT =
  "声にならないSOSに、気づける社会へ。生徒の早期のサインをAIが捉え、孤立する前に可視化します。";

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
  "いじめ 早期発見",
  "不登校 予防",
  "AI 日記",
  "学校向け AI",
  "教育DX",
  "スクールカウンセラー 支援",
  "生徒指導 支援",
  "児童生徒 見守り",
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

/* -------------------------------------------------------------------------- */
/* JSON-LD                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * One @graph rather than several loose blocks. Nodes cross-reference by @id,
 * so Google resolves "the organisation that publishes this website that
 * offers this software" as a single entity instead of three unrelated ones.
 */
export function siteJsonLd() {
  const orgId = `${SITE_URL}/#organization`;
  const siteId = `${SITE_URL}/#website`;

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
        description: DESCRIPTION,
        email: CONTACT_EMAIL,
        areaServed: { "@type": "Country", name: "Japan" },
        ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : null),
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: CONTACT_EMAIL,
            url: absoluteUrl(CONTACT_PATH),
            availableLanguage: ["ja"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: SITE_URL,
        name: `${SITE_NAME} — ${TAGLINE}`,
        description: DESCRIPTION,
        inLanguage: "ja",
        publisher: { "@id": orgId },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#product`,
        name: SITE_NAME,
        applicationCategory: "EducationalApplication",
        applicationSubCategory: "学校向けメンタルヘルスプラットフォーム",
        operatingSystem: "Web, iOS, Android",
        description: DESCRIPTION,
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
         */
        featureList: [
          "毎日5分の日記による全生徒のセルフレポート",
          "独自AIによる一問一答の深掘り",
          "入力のためらいや書き直しといった書きぶりの計測",
          "公開されている医学的ガイドラインをもとに構造化したオントロジー知識グラフによる記述の整理",
          "日記本文を教員に開示しないプライバシー設計",
          "教員向けダッシュボードでの観測・時刻・根拠の提示",
        ],
        offers: {
          "@type": "Offer",
          category: "SaaS",
          availability: "https://schema.org/InStock",
          priceSpecification: {
            "@type": "PriceSpecification",
            description: "導入のご相談・お見積りはお問い合わせください。",
          },
        },
      },
    ],
  };
}

/** Breadcrumbs for any page below the root. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      ...trail.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
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
export const FAQ: { q: string; a: string }[] = [
  {
    q: "Blescとは何ですか？",
    a: "Blescは、生徒が毎日5分で綴る日記を独自のAIが深掘りし、言葉づかいや書きぶりの変化を捉えて可視化する学校向けのメンタルヘルスプラットフォームです。心理的リスクの判定や、心身の状態の診断は行いません。",
  },
  {
    q: "生徒が書いた日記の内容は、先生に読まれますか？",
    a: "日記の本文そのものが教員に公開されることはありません。教員が受け取るのは、観測された記述と、その時刻、そしてその根拠です。根拠を示せない観測は、そもそも表示されません。",
  },
  {
    q: "生徒の負担はどのくらいですか？",
    a: "毎日5分、ホームルームの時間に実施します。対象は希望者ではなく全生徒で、新しい習慣も専用の準備も必要ありません。",
  },
  {
    q: "汎用のAIチャットとは何が違うのですか？",
    a: "「睡眠不足 → 認知機能の低下 → 抑うつ傾向」といった心理のつながりを、WHOやNICEなど公開されている医学的ガイドラインをもとに構造化したオントロジー知識グラフをAIに実装しています。言葉を予測するだけの汎用AIではありません。現在は睡眠・社会的ひきこもり・学業上の負荷の3領域を整備しており、出典を示せない関係はその旨を明示しています。",
  },
  {
    q: "一日の落ち込みと、続いている変化は見分けられますか？",
    a: "言葉のニュアンス、書くことをためらった間、日々の書きぶりの変化といった微細なシグナルを積み重ねて捉えます。毎日書かれるからこそ、一日の落ち込みなのか、続いている変化なのかを見分ける手がかりになります。判断そのものは、記録を受け取った教員が行います。",
  },
  {
    q: "技術的な裏づけはありますか？",
    a: "オントロジー知識グラフは、WHOの思春期メンタルヘルス指針、NICEガイドライン、文部科学省の生徒指導提要といった公開文献をもとに、社内でキュレーションしています。各ノードと関係には出典を紐づけ、出典を示せないものは専門家の判断であることを明記しています。臨床の専門家によるレビューは準備中で、完了しだいこの欄を更新します。",
  },
  {
    q: "導入について相談するにはどうすればよいですか？",
    a: "お問い合わせフォームより、資料請求または導入のご相談としてご連絡ください。内容を確認のうえ、担当者より数営業日以内にご返信いたします。",
  },
];

/** FAQPage for the home page, derived from the array the page renders. */
export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    inLanguage: "ja",
    mainEntity: FAQ.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
