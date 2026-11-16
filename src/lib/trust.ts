/**
 * What Blesc is, how it handles a crisis, and what it does with a diary — in
 * Japanese and English, in one place.
 *
 * Two surfaces read this, each in both languages: the paragraph on the home
 * page's opening screen (/ and /en) and the 安全とプライバシー page (/safety
 * and /en/safety). They are the same statements in two languages, so they
 * live together: a promise changed in one language and not the other is the
 * failure this file exists to prevent.
 *
 * The wording is the company's (supplied 2026-10-11), corrected on
 * 2026-11-16 from the CEO's answers and from what the product's own code
 * (jbjgjf/BLESC at 85a25dc) was found to do. On the safety and privacy
 * statements, what the code contradicted was corrected and what it could
 * not confirm went. Not every sentence left is borne out by the code,
 * though. ABOUT's AIが問いをひとつ返します / "one follow-up question" (the
 * product asks up to three, from a fixed script) and its 先生に届くのは…
 * その時刻だけ / "They only see…" (teachers are also shown topic labels, as
 * PRIVACY says) stand as supplied, since no answer touched them. And
 * 日記を販売することも、広告に使うこともありません is company policy, which
 * nothing found contradicts but no code can show.
 *
 * - Students write 毎日、ホームルームの数分で / "each day during a few
 *   minutes of homeroom" (the CEO, 2026-11-16), no longer 好きなときに /
 *   "in their own time". The FAQ, 仕組み and the search description say the
 *   same; change them together.
 * - Crisis notice. The product sends one automatically (a fixed keyword
 *   list on the journal, chat and voice routes), to the teachers the school
 *   puts on the student's roster whom the student has consented to — there
 *   is no 担任 role, so 担任 is an example, not the rule — with no diary
 *   text in it. Nothing in it reads the clock, so it goes out of hours too,
 *   and nothing promises when it arrives; hence no timing here.
 * - The app shows no hotline. The old line saying the student's screen
 *   shows one was false and is gone; the dial is given here instead, with
 *   「Blescは緊急対応のためのサービスではありません」, which the product's own
 *   notice to teachers says too, in its words: 「blesc は緊急対応を行いません」.
 * - Teachers see more than the old line said, and no class or roll number
 *   (neither exists in the product): observations with their basis, and
 *   topic labels drawn from the entries — with the student's consent. No
 *   school account, teacher or 管理職, can reach diary text.
 * - "Not used to train AI models" is not written: it could not be confirmed
 *   from the code and config (the provider's training opt-out is recorded
 *   there as unverified, and the product has a consented fine-tuning path).
 *   Nothing is said about data retention either.
 * - 個人情報保護法に準拠 / APPI is not written until the privacy policy (being
 *   written by 山村) is published, and the policy's link waits on
 *   PRIVACY_POLICY_URL below.
 * - The clinical review of the safety procedures is planned; the reviewer
 *   is not named until the company names them.
 * - Nothing is added beyond that. No retention periods, vendors,
 *   certifications or storage locations: those belong in the privacy
 *   policy proper.
 *
 * Japanese follows docs/claims.md: negated forms only for 診断 and 予測, and
 * what teachers see is the kind of expression, the time and the basis (and
 * the topic labels the product also shows them) — never the text.
 */

import type { Locale } from "@/lib/i18n";

export type { Locale };

/** 文部科学省「24時間子供SOSダイヤル」— free, nationwide, round the clock. */
export const SOS_DIAL = {
  number: "0120-0-78310",
  tel: "tel:0120078310",
  name: {
    ja: "24時間子供SOSダイヤル",
    en: "24-hour Children’s SOS Dial",
  },
} as const;

/** One paragraph: what Blesc is. */
export const ABOUT: Record<Locale, string> = {
  ja: "Blescは、学校で使う日記アプリです。生徒は毎日、ホームルームの数分で短い日記を書き、AIが問いをひとつ返します。先生が日記そのものを読むことはありません。先生に届くのは、つらさの表現など、書かれた内容に目立った変化があったことと、その時刻だけ。だから、誰に声をかければよいかが分かります。Blescは診断もリスクの予測も行いません。判断するのは、いつも先生です。",
  en: "Blesc is a journaling app for schools in Japan. Students write a short diary each day during a few minutes of homeroom, and our AI replies with one follow-up question. Teachers never see the diary itself. They only see when a student’s writing shows a notable change, such as expressions of distress, along with when it happened, so they know who to check in with. Blesc does not diagnose or predict risk. Every judgment is made by teachers.",
};

/**
 * 安全: the condition, what follows from it, and a closing note.
 *
 * The items run from what reaches the school to what a student should do:
 * who is notified; that the school responds and Blesc does not contact the
 * student; that a notice may not be seen at once; and so, last, that Blesc
 * is not an emergency service, with the dial and a person to talk to. The
 * dial's number is made a link where it stands (components/trust).
 *
 * `note` is the planned clinical review, after the list rather than in it:
 * it is about the procedures, not something that happens when a student
 * writes.
 */
export const SAFETY: Record<
  Locale,
  { title: string; lead: string; items: readonly string[]; note: string }
> = {
  ja: {
    title: "安全",
    lead: "生徒が、自傷や差し迫った危険をうかがわせる内容を書いたとき。",
    items: [
      "担任の先生など、学校が指定した先生のうち、生徒本人が見守りに同意している先生にお知らせが届きます。お知らせに日記の本文は含まれません。",
      "対応は、学校の既存の手順に沿って行われます。Blescが生徒に直接連絡することはありません。",
      "お知らせは授業時間外にも送られますが、受け取った先生がすぐに確認できるとは限りません。",
      `Blescは緊急対応のためのサービスではありません。いますぐ助けが必要なときは、文部科学省「${SOS_DIAL.name.ja}」（${SOS_DIAL.number}）に電話するか、身近な先生や大人に直接話してください。`,
    ],
    note: "この安全の手順について、臨床の専門家によるレビューを予定しています。",
  },
  en: {
    title: "Safety",
    lead: "If a student writes something suggesting self-harm or immediate danger:",
    items: [
      "A notice goes to the teachers the school designates, such as the homeroom teacher, if the student has agreed to their oversight. It does not include the diary text.",
      "The school responds through its existing procedures. Blesc never contacts students directly.",
      "Notices are sent outside school hours too, but the teacher who receives one may not see it right away.",
      `Blesc is not an emergency service. If you need help right now, call Japan’s ${SOS_DIAL.name.en} (${SOS_DIAL.number}), or talk directly to a teacher or another adult you trust.`,
    ],
    note: "A review of these safety procedures by clinical experts is planned.",
  },
};

/**
 * プライバシー. `policyLabel` is the privacy policy link's text, shown only
 * once PRIVACY_POLICY_URL is set.
 *
 * The /safety and /en/safety descriptions are items[0] and items[2] (see
 * those pages), so a change to either is a change to the search snippet.
 */
export const PRIVACY: Record<
  Locale,
  { title: string; items: readonly string[]; policyLabel: string }
> = {
  ja: {
    title: "プライバシー",
    items: [
      "日記の本文が、先生・保護者・ほかの生徒に表示されることはありません。",
      "先生に表示されるのは、生徒本人が見守りに同意した場合に、観測された表現の種類と時刻、その根拠、記録から抽出した話題などです。",
      "日記を販売することも、広告に使うこともありません。",
    ],
    policyLabel: "プライバシーポリシー",
  },
  en: {
    title: "Privacy",
    items: [
      "Diary text is never shown to teachers, parents, or other students.",
      "With the student’s consent, teachers see things like the type of expression observed and when, its basis, and topics drawn from the student’s entries.",
      "Diaries are never sold or used for ads.",
    ],
    policyLabel: "Privacy policy",
  },
};

/**
 * The privacy policy's address. TODO: null until the policy (being written
 * by 山村) is published.
 *
 * While it is null the Privacy section shows no link at all, not a dead one
 * and not a "coming soon", and each build says so in its log
 * (warnPrivacyPolicyPending). Replace null with the URL as a string — a full
 * https:// address, or a path on this site — and the link appears under
 * プライバシー on both pages, labelled PRIVACY[locale].policyLabel, on the
 * next deploy. The draft at blesc.online/legal is not it: it is unapproved
 * and lists a Gmail contact address.
 *
 * Typed `string | null` so that a pasted URL still type-checks; left to
 * inference this would be the type `null` alone.
 */
export const PRIVACY_POLICY_URL: string | null = null;

let warnedPolicy = false;

/**
 * Prints, once per server process, that the privacy policy link is held
 * back — the way lib/newsArticles' warnDrafts prints the news articles
 * still waiting for a date. Called from the /safety page as it renders,
 * which in a production build is once.
 */
export function warnPrivacyPolicyPending(): void {
  if (PRIVACY_POLICY_URL !== null || warnedPolicy) return;
  warnedPolicy = true;
  console.warn(
    "\n⚠ 安全とプライバシー: プライバシーポリシーの URL が未設定のため、リンクを表示していません。\n" +
      "   公開されたら src/lib/trust.ts の PRIVACY_POLICY_URL に URL を入れてください。\n",
  );
}

/**
 * The 安全とプライバシー page: its title in each language. Its path is
 * /safety, and /en/safety in English (lib/i18n's localePath).
 */
export const TRUST_PATH = "/safety";
export const TRUST_TITLE: Record<Locale, string> = {
  ja: "安全とプライバシー",
  en: "Safety & Privacy",
};
