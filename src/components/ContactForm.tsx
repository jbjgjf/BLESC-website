"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SPOTLIGHT } from "@/components/SpotlightCard";
import { HoverSwap, Icon } from "@/components/ui";
import {
  CONTACT_EMAIL,
  ENQUIRY_TYPES,
  type EnquiryType,
  isEnquiryType,
  WEB3FORMS_ACCESS_KEY,
} from "@/lib/site";

const FIELD_CLASS =
  "w-full rounded-xl border border-line bg-canvas-alt px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none";

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

/**
 * "unconfirmed" is its own outcome, not a kind of "error". A timeout only
 * means no answer came back in time: the enquiry may well have been
 * delivered, and telling the visitor it failed invites a duplicate.
 */
type Status = "idle" | "sending" | "sent" | "error" | "unconfirmed";

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
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
        {optional && (
          <span className="ml-2 font-normal text-muted">（任意）</span>
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
 */
export function ContactForm() {
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
    const subject = orgName
      ? `Blesc ${ENQUIRY_TYPES[type]}｜${orgName}`
      : `Blesc ${ENQUIRY_TYPES[type]}`;

    if (!viaApi) {
      const body = [
        `ご用件: ${ENQUIRY_TYPES[type]}`,
        `学校名・団体名: ${orgName}`,
        `お名前: ${name.trim()}`,
        `メールアドレス: ${email.trim()}`,
        `電話番号: ${phone.trim() || "—"}`,
        "",
        "ご相談内容:",
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
    // email needs no translating back.
    const data = new FormData();
    data.append("access_key", WEB3FORMS_ACCESS_KEY);
    data.append("subject", subject);
    data.append("from_name", "Blesc ウェブサイト");
    data.append("ご用件", ENQUIRY_TYPES[type]);
    data.append("学校名・団体名", orgName);
    data.append("お名前", name.trim());
    data.append("email", email.trim());
    data.append("電話番号", phone.trim() || "—");
    data.append("ご相談内容", message.trim() || "—");

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

  if (status === "sent") {
    return (
      <div className="mt-12 rounded-2xl border border-line bg-canvas-alt p-8 md:p-10">
        <Icon name="check_circle" size={32} className="text-mark-1" />
        <h2
          ref={doneRef}
          tabIndex={-1}
          className="mt-4 text-[clamp(1.2rem,2.4vw,1.45rem)] font-medium tracking-[-0.01em] text-ink focus:outline-none"
        >
          お問い合わせを受け付けました。
        </h2>
        <p className="measure-jp mt-3 text-[0.95rem] text-muted">
          内容を確認のうえ、担当者より数営業日以内にご返信いたします。
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      aria-busy={sending}
      className="mt-12 flex flex-col gap-8"
    >
      <fieldset>
        <legend className={LABEL_CLASS}>ご用件</legend>
        {/*
          Radios rather than a select: there are only two, and which one the
          visitor arrived with is worth showing rather than hiding in a
          collapsed control.
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
                    : "border-line bg-canvas-alt text-muted hover:text-ink"
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
                {ENQUIRY_TYPES[key]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="org" label="学校名・団体名">
          <input
            id="org"
            required
            pattern={NOT_BLANK}
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="〇〇高等学校"
            autoComplete="organization"
            className={FIELD_CLASS}
          />
        </Field>

        <Field id="name" label="お名前">
          <input
            id="name"
            required
            pattern={NOT_BLANK}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田 太郎"
            autoComplete="name"
            className={FIELD_CLASS}
          />
        </Field>

        <Field id="email" label="メールアドレス">
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@school.ac.jp"
            autoComplete="email"
            className={FIELD_CLASS}
          />
        </Field>

        <Field id="phone" label="電話番号" optional>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03-0000-0000"
            autoComplete="tel"
            className={FIELD_CLASS}
          />
        </Field>
      </div>

      <Field id="message" label="ご相談内容" optional>
        <textarea
          id="message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="ご検討中の背景や、お聞きになりたい点をご記入ください。"
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
          className="group inline-flex items-center justify-center rounded-full bg-accent px-8 py-3.5 text-[0.95rem] font-medium text-on-accent transition-[scale,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] disabled:scale-100 disabled:cursor-progress disabled:opacity-70"
        >
          {sending ? (
            <span className="flex items-center gap-2">
              <Icon
                name="progress_activity"
                size={18}
                className="animate-spin motion-reduce:animate-none"
              />
              送信中…
            </span>
          ) : (
            /* send, not an arrow: it is the semantically right icon here. */
            <HoverSwap icon="send">送信する</HoverSwap>
          )}
        </button>

        {!viaApi && (
          <p className="measure-jp text-[0.8rem] text-muted">
            送信を押すとメールソフトが開きます。
            <br className="br-wide" />
            内容をご確認のうえ送信してください。
          </p>
        )}
      </div>

      {(status === "error" || status === "unconfirmed") && (
        <div role="alert" className="flex items-start gap-3">
          <Icon
            name="error"
            size={20}
            className="mt-0.5 shrink-0 text-[var(--risk-high)]"
          />
          <p className="measure-jp text-[0.9rem] text-ink">
            {status === "unconfirmed" ? (
              <>
                送信を確認できませんでした。お問い合わせが届いている可能性があるため、再度送信する前に
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-mark-1 underline decoration-mark-1/40 underline-offset-4"
                >
                  {CONTACT_EMAIL}
                </a>
                までご連絡ください。入力内容はそのまま残っています。
              </>
            ) : (
              <>
                送信できませんでした。入力内容はそのまま残っています。時間をおいて再度お試しいただくか、
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-mark-1 underline decoration-mark-1/40 underline-offset-4"
                >
                  {CONTACT_EMAIL}
                </a>
                まで直接ご連絡ください。
              </>
            )}
          </p>
        </div>
      )}
    </form>
  );
}
