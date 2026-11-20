#!/usr/bin/env node
/**
 * Checks that the crisis line the site promises is the one the product shows.
 *
 * 「安全とプライバシー」 (`src/lib/trust.ts`) says a student who writes about
 * self-harm sees 「24時間子供SOSダイヤル」 0120-0-78310 on screen. Until
 * jbjgjf/BLESC#465 the product named no number at all, and nothing compared
 * the two. This reads `SOS_DIAL` here and `CHILD_SOS_DIAL` in the product
 * (`sentra/frontend/src/lib/crisisContacts.ts`, fetched from jbjgjf/BLESC,
 * which is public) and fails when the name, the number or the tel: link
 * differ.
 *
 * Fails closed: a product file that cannot be fetched or no longer has the
 * three fields is a failure, not a pass. A check that passes when it cannot
 * look is not a check.
 *
 * BLESC_REF picks the product branch to compare against (default: main).
 */

import { readFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const REF = process.env.BLESC_REF || "main";
const PRODUCT_URL =
  process.env.BLESC_CRISIS_CONTACTS_URL ||
  `https://raw.githubusercontent.com/jbjgjf/BLESC/${REF}/sentra/frontend/src/lib/crisisContacts.ts`;

/** The first `key: "value"` inside the block that starts at `marker`. */
function field(source, marker, key) {
  const start = source.indexOf(marker);
  if (start < 0) return null;
  const block = source.slice(start, source.indexOf("}", start));
  return block.match(new RegExp(`\\b${key}:\\s*"([^"]*)"`))?.[1] ?? null;
}

const site = readFileSync(`${ROOT}src/lib/trust.ts`, "utf8");
const siteDial = {
  name: field(site, "export const SOS_DIAL", "ja"),
  number: field(site, "export const SOS_DIAL", "number"),
  tel: field(site, "export const SOS_DIAL", "tel"),
};

let product;
try {
  const response = await fetch(PRODUCT_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  product = await response.text();
} catch (error) {
  console.error(`check-sos-dial: could not read the product's crisis contacts from ${PRODUCT_URL}: ${error.message}`);
  process.exit(1);
}

const productDial = {
  name: field(product, "export const CHILD_SOS_DIAL", "name"),
  number: field(product, "export const CHILD_SOS_DIAL", "number"),
  tel: field(product, "export const CHILD_SOS_DIAL", "tel"),
};

const problems = [];
for (const key of ["name", "number", "tel"]) {
  if (!siteDial[key]) problems.push(`SOS_DIAL.${key === "name" ? "name.ja" : key} not found in src/lib/trust.ts`);
  if (!productDial[key]) problems.push(`CHILD_SOS_DIAL.${key} not found in the product's crisisContacts.ts`);
  if (siteDial[key] && productDial[key] && siteDial[key] !== productDial[key]) {
    problems.push(`${key}: the site says ${JSON.stringify(siteDial[key])}, the product shows ${JSON.stringify(productDial[key])}`);
  }
}

if (problems.length) {
  console.error("check-sos-dial: the crisis line on the site and in the product disagree.");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(`  product: ${PRODUCT_URL}`);
  process.exit(1);
}

console.log(`check-sos-dial: the site and the product (${REF}) both give ${siteDial.name} ${siteDial.number}.`);
