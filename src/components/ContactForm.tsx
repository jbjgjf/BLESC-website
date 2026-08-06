"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui";
import {
  CONTACT_EMAIL,
  ENQUIRY_TYPES,
  type EnquiryType,
  isEnquiryType,
} from "@/lib/site";

const FIELD_CLASS =
  "w-full rounded-xl border border-line bg-canvas-alt px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none";

const LABEL_CLASS = "block text-[0.85rem] font-medium text-ink";

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
 * There is no backend, so this composes the message and hands it to the
 * visitor's own mail client rather than posting anywhere. That is a
 * deliberate choice, not a stub: a form on a page about student mental
 * health that appears to submit and silently drops the contents would be
 * worse than one that visibly opens an email. Nothing leaves the browser
 * until the visitor presses send themselves.
 *
 * TODO: when a real endpoint exists, replace `submit` with a fetch to it —
 * every field is already collected and validated here.
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = `Blesc ${ENQUIRY_TYPES[type]}`;
    const body = [
      `ご用件: ${ENQUIRY_TYPES[type]}`,
      `学校名・団体名: ${org.trim()}`,
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
  };

  return (
    <form onSubmit={submit} className="mt-12 flex flex-col gap-8">
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
                className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-[0.95rem] transition-colors duration-300 ${
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 text-[0.95rem] font-medium text-on-accent transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02]"
        >
          <Icon name="send" size={18} />
          送信する
        </button>

        <p className="measure-jp text-[0.8rem] text-muted">
          送信を押すとメールソフトが開きます。
          <br className="br-wide" />
          内容をご確認のうえ送信してください。
        </p>
      </div>
    </form>
  );
}
