/**
 * The FAQ in English: lib/seo.ts's FAQ array, entry for entry.
 *
 * Same order, same count, and each answer says what its Japanese says and
 * no more. The home page renders FAQ on / and this on /en (see
 * components/sections/Faq), and the FAQPage structured data for the English
 * page quotes this array, so the visible answer and the markup are one
 * string in English exactly as they are in Japanese.
 *
 * It lives in its own file rather than beside the Japanese because a
 * translation is the part most likely to be edited on its own, and because
 * whatever builds the English page's structured data imports FAQ_EN by that
 * name. When an entry is added, removed or reworded in lib/seo.ts, change it
 * here in the same commit: nothing checks the two against each other, and a
 * question answered in one language only is a promise made to half the
 * readers.
 *
 * These answers are the most policy-sensitive English on the site, and
 * docs/claims.md binds them as it binds the Japanese — scripts/check-claims
 * scans Japanese patterns, so the English is held to the policy by hand:
 *
 * - Every negation in the Japanese is a negation here. Blesc "does not
 *   assess psychological risk" and "does not diagnose"; it does not
 *   determine whether there is bullying, and it does not predict
 *   non-attendance. None of those may be softened into something Blesc
 *   helps with.
 * - The verbs for what Blesc does are "captures" and "makes visible"
 *   (捉えて可視化する). Never detects, screens, scores or flags.
 * - 手がかり is "a clue", and the judgment is the teacher's, in every
 *   answer that mentions one.
 * - 早期発見 is "early identification" / "identify … early", and it is never
 *   something an answer says Blesc does. It appears in MEXT's own
 *   description of its initiative (早期発見・早期支援), where the same
 *   answer goes on to say MEXT does not recommend or endorse Blesc, and in
 *   the bullying question (いじめの早期発見はできますか), which is worded as
 *   the school asking whether Blesc can be used for it and is answered
 *   first of all with what Blesc does not do.
 * - No "chat", "chatbot" or "conversation", even in a denial. The Japanese
 *   question is about 汎用のAIチャット and its answer opens
 *   会話を続けるチャットではなく; here the other thing is "a general-purpose
 *   AI assistant" and the denial is "does not keep a back-and-forth going",
 *   which is how 仕組み 03 says it (components/sections/HowItWorks). It is
 *   still a negation. Blesc's AI is only ever said to reply with one
 *   follow-up question.
 * - The ontology answers use the words テクノロジー shows for the same
 *   things, as the Japanese ones do: "links", "academic pressure" (the
 *   area's label in lib/ontologySeed.ts), "our own judgment", "which one is
 *   the cause", and "Student Guidance Guidelines" for 生徒指導提要 (that
 *   file's title_en). 公開資料に照らして is the section's "checking them
 *   against published sources" — not "drawn from" or "based on", since most
 *   links have no published source behind them. 出典のあるつながりも is
 *   "Even the links that have a source": the も says a source does not
 *   make a link more than an association, which "also" would lose. If the
 *   section's English changes, change it here.
 *
 * The counts in the ontology answer (42 links, 15 with a published source,
 * 27 without) are typed here as they are typed in lib/seo.ts, and both have
 * to match COUNTS in lib/ontologySeed.ts.
 *
 * The two enquiry names in the last answer are read from lib/site.ts, so
 * the answer names the options by the words the form's own buttons use.
 */

import { ENQUIRY_LABELS } from "@/lib/site";

export const FAQ_EN: readonly { q: string; a: string }[] = [
  {
    q: "What is Blesc?",
    a: "Blesc is a mental health platform for schools. Its own AI follows up on the diary each student writes in their own time, and Blesc captures changes in wording and in how a student writes and makes them visible. Blesc does not assess psychological risk, and it does not diagnose a student’s mental or physical condition.",
  },
  {
    q: "Do teachers read what students write in their diaries?",
    a: "The diary text itself is never shown to teachers. What teachers receive is what was observed in the writing, the time it was observed, and the basis for it. An observation with no basis to show is not displayed at all.",
  },
  {
    q: "How much does it ask of students?",
    a: "Students write the diary in their own time, and what they write and how much are up to them. It is for all students, not only those who choose to take part, and it needs no new routine and no special preparation.",
  },
  {
    q: "How is Blesc different from a general-purpose AI assistant?",
    a: "Blesc does not keep a back-and-forth going. It replies to a diary entry with just one short follow-up question. In addition, for three areas (sleep, social withdrawal, and academic pressure), we have organized the links between concepts such as mood, behavior, and events at school into a knowledge graph (an ontology), checking them against published sources such as those from WHO and NICE. For each link, we record whether a published source supports it.",
  },
  {
    q: "What is “mental health observation,” and how is Blesc different?",
    a: "“Mental health observation” (kokoro no kenkō kansatsu) is an initiative that MEXT (Japan’s Ministry of Education) is introducing with the aim of having it carried out in schools nationwide. It uses tools such as the devices issued one per student to keep track of changes in students’ state of mind and physical condition, so that this leads to early identification and early support. The examples given in MEXT’s materials, such as web-based stress checks, forms, and apps, collect answers to questions. Blesc does not use a format where students select answers. From the diary each student writes in their own time, it captures changes in wording and in how a student writes and makes them visible. Note that this is a description of MEXT’s initiative. It does not mean that MEXT recommends or endorses Blesc.",
  },
  {
    q: "Can one low day be told apart from a change that continues?",
    a: "Blesc captures small signals as they build up: nuances of wording, pauses where a student hesitated to write, and day-to-day changes in how a student writes. Because the entries build on one another, they become a clue for telling whether it is one low day or a change that continues. The judgment itself is made by the teacher who receives the record.",
  },
  {
    q: "Can Blesc be used to identify bullying early?",
    a: "Blesc does not determine whether bullying is taking place, and it does not find bullying. From the diary each student writes in their own time, it captures changes in wording and in how a student writes and makes them visible, and it delivers what was observed in the writing to teachers, together with its time and its basis. That is a clue to help teachers notice. It is the school and its teachers who judge whether bullying is taking place and decide how to respond.",
  },
  {
    q: "Can Blesc be used to prevent school non-attendance?",
    a: "Blesc does not predict whether a student will stop attending school, and it does not guarantee prevention. It captures changes in wording and in how a student writes and makes them visible, giving teachers a clue for noticing a change in a student. How to support the student after noticing is for the school and its teachers to decide.",
  },
  {
    q: "Is there technical backing for Blesc?",
    a: "The knowledge graph is compiled in-house with reference to the WHO fact sheet “Mental health of adolescents,” NICE guideline NG134, the WHO mhGAP Intervention Guide, and Seito Shidō Teiyō, the Student Guidance Guidelines of MEXT (Japan’s Ministry of Education). Of its 42 links, 15 are recorded as associations with a published source cited. The remaining 27 have no published source behind them, and are clearly marked as our own judgment. Even the links that have a source are recorded as associations. They do not show which one is the cause. The organizations listed do not recommend or endorse Blesc. We are preparing a review by clinical experts.",
  },
  {
    q: "How do we get in touch about adopting Blesc?",
    a: `Please contact us through the contact form, choosing “${ENQUIRY_LABELS.en.document}” or “${ENQUIRY_LABELS.en.consult}.” We will review your message, and a member of our team will reply within a few business days.`,
  },
];
