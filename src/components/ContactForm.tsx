"use client";

import { motion, useReducedMotion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { SPOTLIGHT } from "@/components/SpotlightCard";
import type { Locale } from "@/lib/i18n";
import { EXPO_OUT } from "@/lib/motion";
import { HoverSwap, Icon } from "@/components/ui";
import {
  CONTACT_EMAIL,
  ENQUIRY_LABELS,
  ENQUIRY_TYPES,
  type EnquiryType,
  isEnquiryType,
  WEB3FORMS_ACCESS_KEY,
} from "@/lib/site";

/**
 * The form is a panel now — the same `rounded-[1.25rem]` hairline-and-shadow
 * plane every other visual on the site sits in — which is what gives the
 * fields an edge to be sunk into.
 */
const PANEL =
  "rounded-[1.25rem] border border-line bg-surface p-6 shadow-[var(--shadow-card)] md:p-8";

/**
 * bg-inset, not bg-canvas-alt. The two are the same blue-grey today, but
 * --surface-inset is the token for a well sunk into a raised plane, so the
 * field keeps its edge if the page's second surface ever moves. It measures
 * 1.07:1 against the white panel, with ink at 18.11:1 and the placeholder at
 * 5.83:1.
 *
 * `focus:outline-none` stays: the unlayered `:focus-visible` rule in
 * globals.css outranks it, so the real focus ring is the site's 2px mark-1
 * outline rather than the browser's default.
 */
const FIELD_CLASS =
  "w-full rounded-xl border border-line bg-inset px-4 py-3 text-[0.95rem] text-ink transition-colors duration-300 placeholder:text-muted focus:border-accent focus:outline-none";

const LABEL_CLASS = "block text-[0.85rem] font-medium text-ink";

const ENDPOINT = "https://api.web3forms.com/submit";

/**
 * Long enough for a slow school network, short enough that nobody is left
 * watching a spinner that is never going to resolve.
 */
const TIMEOUT_MS = 15_000;

/**
 * `required` alone accepts a value of nothing but spaces — including the
 * full-width space a Japanese IME inserts — which would then trim to an
 * empty field and arrive as an enquiry from no one.
 */
const NOT_BLANK = ".*\\S.*";

/** A sentence with the contact address set inside it as a link. */
type AroundAddress = { before: string; after: string };

type Copy = {
  /** Set after the label of a field that may be left empty. */
  optional: string;
  /** The legend over the two enquiry options. */
  enquiry: string;
  org: { label: string; placeholder: string };
  name: { label: string; placeholder: string };
  email: { label: string; placeholder: string };
  phone: { label: string; placeholder: string };
  message: { label: string; placeholder: string };
  submit: string;
  sending: string;
  /** Shown beside the button while the form still opens a mail client. */
  mailNote: readonly string[];
  sent: { title: string; body: string };
  unconfirmed: AroundAddress;
  error: AroundAddress;
  /** The sender name on the notification Web3Forms delivers. */
  fromName: string;
  subject: (enquiry: string, org: string) => string;
};

/**
 * Every word the form says, in both languages.
 *
 * The two enquiry options are not here: their names are ENQUIRY_LABELS in
 * lib/site, the same strings the call-to-action buttons carry, so the button
 * a visitor pressed and the option it pre-selects cannot come to differ.
 *
 * The labels do double duty. They head the fields on screen, and they are
 * also the line labels of the composed mail and the field names Web3Forms
 * lists in its notification — so an enquiry written on the English form
 * arrives labelled in English, and one from the Japanese form in Japanese,
 * with no second set of strings to keep in step.
 *
 * `mailNote` is a list of lines. Japanese has two, with an authored break
 * between them on wide screens (br-wide); English is one sentence pair left
 * to wrap at its spaces, so it is a single entry and gets no break.
 *
 * Validation messages are not here either, because the form has none of its
 * own: `required`, `type="email"` and the not-blank pattern are checked by
 * the browser, which words its bubble in its own interface language — the
 * visitor's, whichever page they are on.
 *
 * English is American in spelling ("inquiry"); the identifiers in this file
 * keep the British "enquiry" lib/site already uses.
 */
const COPY: Record<Locale, Copy> = {
  ja: {
    optional: "（任意）",
    enquiry: "ご用件",
    org: { label: "学校名・団体名", placeholder: "〇〇高等学校" },
    name: { label: "お名前", placeholder: "山田 太郎" },
    email: { label: "メールアドレス", placeholder: "name@school.ac.jp" },
    phone: { label: "電話番号", placeholder: "03-0000-0000" },
    message: {
      label: "ご相談内容",
      placeholder: "ご検討中の背景や、お聞きになりたい点をご記入ください。",
    },
    submit: "送信する",
    sending: "送信中…",
    mailNote: [
      "送信を押すとメールソフトが開きます。",
      "内容をご確認のうえ送信してください。",
    ],
    sent: {
      title: "お問い合わせを受け付けました。",
      body: "内容を確認のうえ、担当者より数営業日以内にご返信いたします。",
    },
    unconfirmed: {
      before:
        "送信を確認できませんでした。お問い合わせが届いている可能性があるため、再度送信する前に",
      after: "までご連絡ください。入力内容はそのまま残っています。",
    },
    error: {
      before:
        "送信できませんでした。入力内容はそのまま残っています。時間をおいて再度お試しいただくか、",
      after: "まで直接ご連絡ください。",
    },
    fromName: "Blesc ウェブサイト",
    subject: (enquiry, org) =>
      org ? `Blesc ${enquiry}｜${org}` : `Blesc ${enquiry}`,
  },
  en: {
    optional: "(optional)",
    enquiry: "Inquiry type",
    org: { label: "School or organization", placeholder: "Example High School" },
    name: { label: "Name", placeholder: "Taro Yamada" },
    email: { label: "Email address", placeholder: "name@school.ac.jp" },
    phone: { label: "Phone number", placeholder: "03-0000-0000" },
    message: {
      label: "Message",
      placeholder:
        "Tell us the background to your interest and anything you would like to ask.",
    },
    submit: "Send",
    sending: "Sending…",
    mailNote: [
      "Pressing Send opens your email app. Please check the message there, then send it.",
    ],
    sent: {
      title: "We have received your inquiry.",
      body: "We will review it, and a member of our team will reply within a few business days.",
    },
    unconfirmed: {
      before:
        "We could not confirm that your message was sent. It may have reached us, so before sending it again, please contact us at ",
      after: ". What you entered is still here.",
    },
    error: {
      before:
        "Your message could not be sent. What you entered is still here. Please try again later, or contact us directly at ",
      after: ".",
    },
    fromName: "Blesc website",
    subject: (enquiry, org) =>
      org ? `Blesc: ${enquiry} (${org})` : `Blesc: ${enquiry}`,
  },
};

/**
 * Running text, per language. Whole class strings, because Tailwind only
 * generates what it can read.
 *
 * measure-jp (globals.css) is the Japanese paragraph setting — 1.9 leading
 * and a hair of tracking — and far too open for Latin, so English names its
 * own leading instead. It is an unlayered class and would outrank a leading
 * utility set beside it, which is why the English strings leave it out
 * rather than adding to it. text-pretty keeps a short English paragraph from
 * ending on a single word.
 */
const PROSE = {
  ja: {
    sentBody: "measure-jp mt-3 text-[0.95rem] text-muted",
    mailNote: "measure-jp text-[0.8rem] text-muted",
    alert: "measure-jp text-[0.9rem] text-ink",
  },
  en: {
    sentBody: "mt-3 text-pretty text-[0.95rem] leading-[1.65] text-muted",
    mailNote: "text-pretty text-[0.8rem] leading-[1.6] text-muted",
    alert: "text-[0.9rem] leading-[1.65] text-ink",
  },
} as const;

/**
 * "unconfirmed" is its own outcome, not a kind of "error". A timeout only
 * means no answer came back in time: the enquiry may well have been
 * delivered, and telling the visitor it failed invites a duplicate.
 */
type Status = "idle" | "sending" | "sent" | "error" | "unconfirmed";

/**
 * The receipt.
 *
 * Drawn rather than set as an icon, and drawn on arrival rather than already
 * finished: this is the one moment the page confirms that a person will read
 * what was just sent, and a static glyph says it in the same breath as a
 * disabled button. The ring goes round, then the check lands inside it.
 *
 * Decorative, so aria-hidden — the heading beneath it is what a screen reader
 * hears, and it takes focus. Stroke lengths are the circle's circumference
 * (2πr at r=21 ≈ 132) and a little over the check's own path length; both are
 * rounded up, which is why the dash offset starts clear of the shape.
 *
 * Reduced motion gets `initial={false}`, so motion writes the finished state
 * on the first frame instead of animating to it.
 */
function SentMark() {
  const reduce = useReducedMotion();

  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      className="size-12 text-mark-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.circle
        cx="24"
        cy="24"
        r="21"
        strokeOpacity={0.45}
        strokeDasharray="132"
        initial={reduce ? false : { strokeDashoffset: 132 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.9, ease: EXPO_OUT }}
      />
      <motion.path
        d="M15 24.5 L21.5 31 L33 19"
        strokeDasharray="32"
        initial={reduce ? false : { strokeDashoffset: 32 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.45, ease: EXPO_OUT, delay: 0.3 }}
      />
    </svg>
  );
}

function Field({
  id,
  label,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const locale = useLocale();

  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
        {optional && (
          <span className="ml-2 font-normal text-muted">
            {COPY[locale].optional}
          </span>
        )}
      </label>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

/**
 * The enquiry form.
 *
 * Posts to Web3Forms, which forwards the enquiry to the Blesc inbox — no
 * backend of our own. The visitor's address goes in the `email` field,
 * which Web3Forms sets as Reply-To, so answering the notification answers
 * the school directly.
 *
 * Every outcome is visible. Success replaces the form with a confirmation;
 * a failure keeps everything typed and says where to write instead. A form
 * on a page about student mental health that appeared to submit and quietly
 * dropped the contents would be worse than no form at all.
 *
 * Until WEB3FORMS_ACCESS_KEY is set in lib/site, it falls back to what it
 * did before: composing the message and opening the visitor's own mail
 * client, with nothing leaving the browser until they press send.
 *
 * It speaks the page's language, which it asks useLocale() for: the same
 * form is /contact's and /en/contact's. ?type= is read the same way on
 * both, so a button on the English page arrives with its enquiry selected
 * exactly as one on the Japanese page does.
 */
export function ContactForm() {
  const locale = useLocale();
  const t = COPY[locale];
  const prose = PROSE[locale];
  const enquiries = ENQUIRY_LABELS[locale];

  const params = useSearchParams();
  const typeParam = params.get("type");

  const [type, setType] = useState<EnquiryType>(
    isEnquiryType(typeParam) ? typeParam : "consult",
  );
  const [org, setOrg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const trapRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const viaApi = WEB3FORMS_ACCESS_KEY !== "";
  const sending = status === "sending";

  // The form is replaced wholesale on success, so focus has to be put
  // somewhere deliberately or it falls back to <body> and a screen reader
  // hears nothing at all.
  useEffect(() => {
    if (status === "sent") doneRef.current?.focus();
  }, [status]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;

    const orgName = org.trim();
    const subject = t.subject(enquiries[type], orgName);

    if (!viaApi) {
      // Each line is headed by the field's own label, in the language the
      // form was filled in.
      const body = [
        `${t.enquiry}: ${enquiries[type]}`,
        `${t.org.label}: ${orgName}`,
        `${t.name.label}: ${name.trim()}`,
        `${t.email.label}: ${email.trim()}`,
        `${t.phone.label}: ${phone.trim() || "—"}`,
        "",
        `${t.message.label}:`,
        message.trim() || "—",
        "",
      ].join("\n");

      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;
      return;
    }

    // Honeypot. A person never sees this box, so if it is ticked the
    // submission is a bot's: acknowledge it and send nothing, rather than
    // spend the monthly quota on it.
    if (trapRef.current?.checked) {
      setStatus("sent");
      return;
    }

    setStatus("sending");

    // Appended in the order the notification should read. Web3Forms lists
    // fields as they arrive, and the labels are the form's own so the
    // email needs no translating back — Japanese from the Japanese form,
    // English from the English one. `email` is Web3Forms' own field name
    // (it becomes Reply-To), so it is the same in both.
    const data = new FormData();
    data.append("access_key", WEB3FORMS_ACCESS_KEY);
    data.append("subject", subject);
    data.append("from_name", t.fromName);
    data.append(t.enquiry, enquiries[type]);
    data.append(t.org.label, orgName);
    data.append(t.name.label, name.trim());
    data.append("email", email.trim());
    data.append(t.phone.label, phone.trim() || "—");
    data.append(t.message.label, message.trim() || "—");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
        signal: controller.signal,
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
      };
      if (!res.ok || json.success !== true) {
        throw new Error(`Web3Forms responded ${res.status}`);
      }
      setStatus("sent");
    } catch {
      // An abort can land after the upload, or even while the success body
      // is still arriving, so it says nothing about whether mail went out.
      setStatus(controller.signal.aborted ? "unconfirmed" : "error");
    } finally {
      clearTimeout(timer);
    }
  };

  // Which of the two failure messages applies; read only when one does.
  const failure = status === "unconfirmed" ? t.unconfirmed : t.error;

  if (status === "sent") {
    return (
      /*
        The same panel the form was, so the confirmation lands in the shape
        the form left behind rather than as a differently-coloured box.
      */
      <div className={PANEL}>
        <SentMark />
        <h2
          ref={doneRef}
          tabIndex={-1}
          className="mt-6 text-[clamp(1.25rem,2.4vw,1.5rem)] font-medium tracking-[-0.015em] text-ink focus:outline-none"
        >
          {t.sent.title}
        </h2>
        <p className={prose.sentBody}>{t.sent.body}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      aria-busy={sending}
      className={`${PANEL} flex flex-col gap-8`}
    >
      <fieldset>
        <legend className={LABEL_CLASS}>{t.enquiry}</legend>
        {/*
          Radios rather than a select: there are only two, and which one the
          visitor arrived with is worth showing rather than hiding in a
          collapsed control.

          The English names are longer — "Book a consultation" against
          導入のご相談 — and still sit on one line each wherever the pair is
          side by side. The tightest case is the two-column page at 1024px,
          where a label has about 150px for some 135px of text in Helvetica
          Neue (nearer 145px in Inter). Worked out from the faces' advance
          widths, not measured in a browser. Should a fallback face run
          wider, the name wraps inside its box and items-center keeps the
          radio centred against both lines; nothing here is fixed in height.
        */}
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          {(Object.keys(ENQUIRY_TYPES) as EnquiryType[]).map((key) => {
            const active = type === key;
            return (
              <label
                key={key}
                className={`${SPOTLIGHT} flex flex-1 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-[0.95rem] transition-colors duration-300 ${
                  active
                    ? "border-accent bg-accent/10 text-ink"
                    : "border-line bg-inset text-muted hover:text-ink"
                }`}
              >
                <input
                  type="radio"
                  name="enquiry-type"
                  value={key}
                  checked={active}
                  onChange={() => setType(key)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? "border-accent" : "border-line-strong"
                  }`}
                >
                  {active && (
                    <span className="size-2.5 rounded-full bg-accent" />
                  )}
                </span>
                {enquiries[key]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="org" label={t.org.label}>
          <input
            id="org"
            required
            pattern={NOT_BLANK}
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder={t.org.placeholder}
            autoComplete="organization"
            className={FIELD_CLASS}
          />
        </Field>

        <Field id="name" label={t.name.label}>
          <input
            id="name"
            required
            pattern={NOT_BLANK}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.name.placeholder}
            autoComplete="name"
            className={FIELD_CLASS}
          />
        </Field>

        <Field id="email" label={t.email.label}>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.email.placeholder}
            autoComplete="email"
            className={FIELD_CLASS}
          />
        </Field>

        <Field id="phone" label={t.phone.label} optional>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.phone.placeholder}
            autoComplete="tel"
            className={FIELD_CLASS}
          />
        </Field>
      </div>

      <Field id="message" label={t.message.label} optional>
        <textarea
          id="message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.message.placeholder}
          className={`${FIELD_CLASS} resize-y`}
        />
      </Field>

      {/*
        Honeypot: display:none, out of the tab order and hidden from
        assistive tech, so only a script filling every input finds it.
      */}
      <input
        ref={trapRef}
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={sending}
          /*
            rounded-xl, not rounded-full: 12px is the radius every other
            control on the site uses, and a pill here was the only one of its
            kind. --on-accent on --color-primary holds 9.96:1.
          */
          className="group inline-flex items-center justify-center rounded-xl bg-accent px-8 py-3.5 text-[0.95rem] font-medium text-on-accent transition-[scale,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] disabled:scale-100 disabled:cursor-progress disabled:opacity-70"
        >
          {sending ? (
            <span className="flex items-center gap-2">
              <Icon
                name="progress_activity"
                size={18}
                className="animate-spin motion-reduce:animate-none"
              />
              {t.sending}
            </span>
          ) : (
            /* send, not an arrow: it is the semantically right icon here. */
            <HoverSwap icon="send">{t.submit}</HoverSwap>
          )}
        </button>

        {!viaApi && (
          <p className={prose.mailNote}>
            {t.mailNote.map((line, i) => (
              <Fragment key={line}>
                {i > 0 && <br className="br-wide" />}
                {line}
              </Fragment>
            ))}
          </p>
        )}
      </div>

      {(status === "error" || status === "unconfirmed") && (
        <div role="alert" className="flex items-start gap-3">
          <Icon
            name="error"
            size={20}
            className="mt-0.5 shrink-0 text-error"
          />
          {/*
            The same shape for either failure: words, the address as a link,
            words. Both halves come from COPY, where the English ones carry
            their own spaces — Japanese runs straight into the link and out
            of it, English does not.
          */}
          <p className={prose.alert}>
            {failure.before}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-mark-1 underline decoration-mark-1/40 underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>
            {failure.after}
          </p>
        </div>
      )}
    </form>
  );
}
