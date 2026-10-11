import { shareCard } from "./_shell/shareCard";
import { CARD_ALT, CARD_SIZE, CARD_TYPE } from "@/lib/seo";

/**
 * The Japanese share card, served at /opengraph-image: the card of "/",
 * /contact and /safety. The English pages have their own at
 * /en/opengraph-image; both are drawn by shareCard.
 *
 * This file sits in app/, above both languages' root layouts, because its
 * URL has to stay /opengraph-image: inside the (ja) route group Next would
 * serve it under a hashed name. Being above the layouts also means it is
 * above their metadataBase, so the tag Next injects for it here would be
 * resolved against a fallback origin — which is why every page names its
 * card itself (pageMetadata in lib/seo) and nothing reads the injected one.
 * A local `next build` warns once that metadataBase is unset for this
 * segment; that is this, and it changes no tag on any page.
 */
export const alt = CARD_ALT.ja;
export const size = CARD_SIZE;
export const contentType = CARD_TYPE;

export default function OpengraphImage() {
  return shareCard("ja");
}
