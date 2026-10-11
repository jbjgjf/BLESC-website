import { shareCard } from "../_shell/shareCard";
import { CARD_ALT, CARD_SIZE, CARD_TYPE } from "@/lib/seo";

/**
 * The English share card, served at /en/opengraph-image: the card of /en,
 * /en/contact and /en/safety. Same drawing as the Japanese one
 * (app/opengraph-image.tsx), with the two lines under the headline in
 * English.
 */
export const alt = CARD_ALT.en;
export const size = CARD_SIZE;
export const contentType = CARD_TYPE;

export default function OpengraphImage() {
  return shareCard("en");
}
