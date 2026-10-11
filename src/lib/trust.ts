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
 * The wording is the company's (supplied 2026-10-11), with three kinds of
 * gap left as gaps rather than filled in:
 *
 * - The safety protocol's open details — who exactly is notified, within how
 *   many minutes, whether outside school hours — and the name of the
 *   clinical reviewer were placeholders in the supplied text. They are not
 *   stated here until the company supplies them; the notification line says
 *   only that the school's designated staff member is notified.
 * - "Daily" / "each day" in the supplied paragraph is written as
 *   好きなときに / "in their own time", which is what every other part of
 *   the site says (FAQ, 仕組み, the search description) after an earlier
 *   correction from the company. If the product is now daily, change it
 *   here and there together.
 * - Nothing is added. No retention periods, vendors, certifications or
 *   storage locations: those belong in the privacy policy proper.
 *
 * Japanese follows docs/claims.md: negated forms only for 診断 and 予測, and
 * what teachers see is the class, the roll number, the kind of expression
 * and the time — never the text.
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
  ja: "Blescは、学校で使う日記アプリです。生徒は好きなときに短い日記を書き、AIが問いをひとつ返します。先生が日記そのものを読むことはありません。先生に届くのは、つらさの表現など、書かれた内容に目立った変化があったことと、その時刻だけ。だから、誰に声をかければよいかが分かります。Blescは診断もリスクの予測も行いません。判断するのは、いつも先生です。",
  en: "Blesc is a journaling app for schools in Japan. Students write a short diary in their own time, and our AI replies with one follow-up question. Teachers never see the diary itself. They only see when a student’s writing shows a notable change, such as expressions of distress, along with when it happened, so they know who to check in with. Blesc does not diagnose or predict risk. Every judgment is made by teachers.",
};

export const SAFETY: Record<
  Locale,
  { title: string; lead: string; items: readonly string[] }
> = {
  ja: {
    title: "安全",
    lead: "生徒が、自傷や差し迫った危険をうかがわせる内容を書いたとき。",
    items: [
      `生徒の画面に、相談窓口がすぐに表示されます（例：文部科学省「${SOS_DIAL.name.ja}」${SOS_DIAL.number}）。`,
      "学校が指定した担当者に通知が届きます。",
      "対応は、学校の既存の手順に沿って行われます。Blescが生徒に直接連絡することはありません。",
    ],
  },
  en: {
    title: "Safety",
    lead: "If a student writes something suggesting self-harm or immediate danger:",
    items: [
      `The student immediately sees crisis support on screen (e.g., Japan’s ${SOS_DIAL.name.en}, ${SOS_DIAL.number}).`,
      "The school’s designated staff member is notified.",
      "The school responds through its existing procedures. Blesc never contacts students directly.",
    ],
  },
};

export const PRIVACY: Record<
  Locale,
  { title: string; items: readonly string[] }
> = {
  ja: {
    title: "プライバシー",
    items: [
      "日記の本文が、先生・保護者・ほかの生徒に表示されることはありません。",
      "先生に表示されるのは、クラス、出席番号、観測された表現の種類、時刻だけです。",
      "日記を販売することも、広告に使うことも、AIモデルの学習に使うこともありません。",
      "日本の個人情報保護法に準拠しています。",
    ],
  },
  en: {
    title: "Privacy",
    items: [
      "Diary text is never shown to teachers, parents, or other students.",
      "Teachers see only the class, student number, type of expression observed, and time.",
      "Diaries are never sold, used for ads, or used to train AI models.",
      "Compliant with Japan’s Act on the Protection of Personal Information (APPI).",
    ],
  },
};

/**
 * The 安全とプライバシー page: its title in each language. Its path is
 * /safety, and /en/safety in English (lib/i18n's localePath).
 */
export const TRUST_PATH = "/safety";
export const TRUST_TITLE: Record<Locale, string> = {
  ja: "安全とプライバシー",
  en: "Safety & Privacy",
};
