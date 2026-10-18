#!/usr/bin/env node
/**
 * Checks that the support line the site promises is the one the product shows.
 *
 * The 安全とプライバシー page says a student in crisis sees 文部科学省
 * 「24時間子供SOSダイヤル」 0120-0-78310 on screen (`SOS_DIAL` in
 * src/lib/trust.ts). For a while the product showed no line and no number at
 * all (jbjgjf/BLESC#465), and nothing compared the two — the same shape as the
 * regressions docs/claims.md exists for: a promise here, the behaviour there.
 *
 * The product keeps its lines in `sentra/shared/crisis_contacts.json`, which
 * its own tests pin to the code that renders them. This fetches that file and
 * compares the dial's name, number and tel: link with SOS_DIAL. A mismatch, or
 * a file that cannot be fetched, fails the run: a check that passes when it
 * could not look is the failure it was written to catch.
 *
 * BLESC_REF selects the product's branch or commit (default main), so a pair
 * of PRs changing the number can be checked against each other before either
 * merges. BLESC_CONTACTS_FILE reads a local copy instead, for offline runs.
 */

import { readFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const REF = process.env.BLESC_REF || "main";
const URL_ = `https://raw.githubusercontent.com/jbjgjf/BLESC/${REF}/sentra/shared/crisis_contacts.json`;

/** SOS_DIAL's fields, read out of trust.ts as text so this runs without a build. */
function siteDial() {
  const source = readFileSync(`${ROOT}src/lib/trust.ts`, "utf8");
  const block = source.match(/export const SOS_DIAL = \{([\s\S]*?)\n\} as const;/);
  if (!block) throw new Error("SOS_DIAL was not found in src/lib/trust.ts");
  const field = (pattern, name) => {
    const found = block[1].match(pattern);
    if (!found) throw new Error(`SOS_DIAL.${name} was not found in src/lib/trust.ts`);
    return found[1];
  };
  return {
    number: field(/number:\s*"([^"]+)"/, "number"),
    tel: field(/tel:\s*"([^"]+)"/, "tel"),
    name: field(/ja:\s*"([^"]+)"/, "name.ja"),
  };
}

async function productContacts() {
  if (process.env.BLESC_CONTACTS_FILE) {
    return JSON.parse(readFileSync(process.env.BLESC_CONTACTS_FILE, "utf8"));
  }
  const response = await fetch(URL_);
  if (!response.ok) throw new Error(`${URL_} answered ${response.status}`);
  return response.json();
}

const site = siteDial();
let product;
try {
  product = await productContacts();
} catch (error) {
  console.error(`check-crisis-contacts: could not read the product's contacts — ${error.message}`);
  process.exit(1);
}

const problems = [];
for (const key of ["name", "number", "tel"]) {
  if (site[key] !== product.sos_dial?.[key]) {
    problems.push(`SOS_DIAL ${key}: site has ${JSON.stringify(site[key])}, product has ${JSON.stringify(product.sos_dial?.[key])}`);
  }
}

if (problems.length) {
  console.error("check-crisis-contacts: the site and the product name different support lines.");
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(`  product file: ${process.env.BLESC_CONTACTS_FILE || URL_}`);
  process.exit(1);
}

const verified = product.verification?.status === "verified"
  ? `verified ${product.verification.verified_on}`
  : "not yet verified against the official page (see verification in the product file)";
console.log(`check-crisis-contacts: ${site.name} ${site.number} matches the product (${verified}).`);
