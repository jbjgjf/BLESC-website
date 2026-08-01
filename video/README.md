# blesc video

Remotion compositions for blesc, kept in their own workspace with their own
`package.json`, `tsconfig.json` and `node_modules`.

**Nothing here reaches the website bundle.** Next only compiles what `src/`
imports, the root `tsconfig.json` excludes `video`, and rendered output is
gitignored. Installing Remotion does not change the size of a single page.

## Why a video at all

The site's hero is scroll-driven and stays that way — a video cannot answer to
the reader's scroll position the way `FloralScrolly` does, so replacing it
would be a downgrade. These compositions are for the places the site cannot
reach: social posts, the OG card, a looping backdrop for a talk or a booth.

## Design fidelity

`src/Flower.tsx` is a **verbatim copy** of `src/components/ui/Flower.tsx` from
the site. It is pure SVG with no browser dependencies, so the petals in a video
are the same petals as on the page. `src/brand.ts` mirrors the palette and
easing curves from `globals.css`, and `src/fonts.ts` loads the same Inter and
Noto Sans JP that `next/font` serves.

**If the site's `Flower.tsx`, palette, or easings change, update these too** —
they are copies, not imports, because this workspace is deliberately isolated.

## Compositions

| id | size | what it is |
| --- | --- | --- |
| `HeroLoop` | 1920x1080, 10s | The page's signature moment: scattered flowers gather into a ring, the closing line blooms inside it. Fades to its own first frame so it loops cleanly. |
| `OgCard` | 1200x630, 3s | The hero's paper card at Open Graph dimensions. Render as a still for `og:image`, or as a loop where a platform accepts video. |

## Commands

```bash
npm install

npm run studio        # interactive editor at localhost:3000
npm run render        # HeroLoop  -> out/blesc-hero.mp4
npm run render:og     # OgCard    -> out/blesc-og.mp4
npm run still:og      # OgCard    -> out/blesc-og.png  (final frame)
```

Rendering needs a headless Chrome, which Remotion downloads on first run.

## Using the output

The current `og:image` in `src/app/layout.tsx` is a static logo PNG. To use the
card instead, render the still, copy it into the site's `public/`, and point
`openGraph.images` and `twitter.images` at it.

## Licence

Remotion is free for individuals, for companies with **3 or fewer employees**,
and for non-profits. A for-profit company with **4 or more employees needs a
paid Company License** — this is a real licence condition, not a trial limit.
See https://www.remotion.dev/docs/license/faq and https://www.remotion.pro/license.

Confirm which side of that line blesc falls on before this ships anywhere
public.
