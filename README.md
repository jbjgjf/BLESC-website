This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## SEO

Everything a crawler or a social scraper reads is derived from
[`src/lib/seo.ts`](src/lib/seo.ts) — the title, the description, the keyword
list, the FAQ, and the JSON-LD graph. Change the wording there and it updates
in the `<title>`, the OG card, the structured data and the visible FAQ
section at once. Nothing is hardcoded in a component.

| Thing | Where |
| --- | --- |
| Title, description, robots, OG, Twitter | `src/app/layout.tsx` |
| Per-page canonical + title | each `page.tsx` |
| Organization / WebSite / SoftwareApplication | `siteJsonLd()` |
| FAQPage + the visible FAQ | `FAQ` array → `<Faq>` and `faqJsonLd()` |
| `/sitemap.xml` | `src/app/sitemap.ts` |
| `/robots.txt` | `src/app/robots.ts` |
| `/opengraph-image` (1200×630, generated) | `src/app/opengraph-image.tsx` |

Set `NEXT_PUBLIC_SITE_URL` in the Production environment only — see
`.env.example`. Preview deploys must not set it, or every preview will emit
canonical tags pointing at its own throwaway hostname.

### After deploying

Indexing does not start on its own. Once the domain is live:

1. Add the property in [Search Console](https://search.google.com/search-console),
   verify it, and submit `https://blesc.jp/sitemap.xml`.
2. Do the same in [Bing Webmaster Tools](https://www.bing.com/webmasters) —
   it is also what ChatGPT's browsing uses.
3. Request indexing for `/` and `/contact`.
4. Check the rendered markup with the
   [Rich Results Test](https://search.google.com/test/rich-results) and the
   [Schema validator](https://validator.schema.org/).
5. Claim the Google Business Profile / Knowledge Panel for the company, and
   fill `SOCIAL_PROFILES` in `src/lib/seo.ts` with the real accounts — that
   array is what tells Google the site and the social profiles are one
   entity.
