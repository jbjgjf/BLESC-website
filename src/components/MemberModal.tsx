"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "@/components/LocaleProvider";
import { getLenis } from "@/components/SmoothScroll";
import { Icon } from "@/components/ui";

export type ModalMember = {
  /** In its own script in both languages; see Member in sections/Team. */
  name: string;
  role?: string;
  photo?: string;
  /** Already in the page's language — Team picks it before handing it in. */
  description?: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The dialog's own words: the close button's name and the small label over
 * the introduction. Everything else it shows is the member's, handed in.
 *
 * 紹介 is "Introduction" rather than "About" or "Bio", to match the button
 * that opened the dialog, which says it opens an introduction.
 */
const COPY = {
  ja: { close: "閉じる", label: "紹介" },
  en: { close: "Close", label: "Introduction" },
} as const;

/**
 * Type that has to differ by language, as whole class strings (Tailwind
 * only generates what it can read).
 *
 * `label`: the Japanese label is two kanji, and 0.12em of tracking is what
 * a short Japanese label wants. On a lower-case English word the same
 * tracking pulls the letters apart, so English keeps a hair of it.
 *
 * `copy`: measure-jp is the site's Japanese paragraph setting — 1.9 leading
 * and a little tracking. An English introduction runs to about two and a
 * half times the characters of its Japanese one, each under half as wide,
 * so in the same box it takes a line or two more. English takes the Latin
 * leading the 安全とプライバシー pages use, 1.65, and at that the two come
 * out much the same height: the longest introduction is 226–251px in
 * English beside 260px in Japanese in the 496px box a laptop gives it, and
 * about 600px in both in the 200px box of a 320px phone, where the panel
 * scrolls in either language. Its longest word is 128px, so nothing has to
 * break inside a word. text-pretty keeps the paragraph from ending on a
 * single word.
 */
const TYPE = {
  ja: {
    label: "text-[0.75rem] font-semibold tracking-[0.12em] text-mark-1",
    copy: "measure-jp text-[0.95rem] text-ink",
  },
  en: {
    label: "text-[0.75rem] font-semibold tracking-[0.02em] text-mark-1",
    copy: "text-pretty text-[0.95rem] leading-[1.65] text-ink",
  },
} as const;

/**
 * On the English page a member's name is still Japanese text; marking it
 * lets a screen reader read the dialog's title — which is that name — as
 * Japanese. Nothing is added on the Japanese page.
 */
const NAME_LANG = { ja: undefined, en: "ja" } as const;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * False on the server and during hydration, true after. The portal target
 * only exists in the browser, and this finds that out without a mount effect
 * that sets state.
 */
const subscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

/**
 * The full introduction, as a dialog rather than a panel under the name.
 *
 * The disclosure this replaces had to stay narrow enough not to shove the
 * roster controls around, which meant several sentences in a strip. A
 * dialog owns the screen for as long as it is open, so the photograph can
 * be large and the copy can breathe.
 *
 * It is a real dialog, not a styled div:
 *
 * - Portalled to <body>, so the overlay does not depend on the section's
 *   ancestors. Nothing above it creates a stacking context today, but a
 *   z-index, transform, filter or overflow clip added to any of them later
 *   would trap it under the fixed nav, or turn `fixed` into "fixed to that
 *   ancestor".
 * - Escape and the backdrop close it. The backdrop only counts when the
 *   press started there too, so selecting text in the copy and releasing
 *   outside the panel does not throw the dialog away.
 * - Focus moves to the close button on open, Tab stays inside, and focus
 *   returns to whatever opened it on close — if that is still in the
 *   document.
 * - The page behind holds still. Lenis is stopped outright, which also
 *   cancels a smooth scroll still easing toward a nav target when the dialog
 *   opens; hiding overflow on the root covers reduced motion, where there is
 *   no Lenis. `data-lenis-prevent` keeps wheel and touch inside the overlay
 *   native, so a panel taller than a short screen can still be scrolled.
 *
 * It speaks the page's language, which it asks useLocale() for. A portal
 * moves the DOM to <body> but not the React tree, so the layout's provider
 * still reaches it.
 */
export function MemberModal({
  member,
  onClose,
}: {
  member: ModalMember | null;
  onClose: () => void;
}) {
  const isClient = useIsClient();
  const reduce = useReducedMotion();
  const locale = useLocale();
  const copy = COPY[locale];
  const type = TYPE[locale];
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pressedBackdrop = useRef(false);
  const open = member !== null;

  useEffect(() => {
    if (!open) return;

    const returnTo =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeRef.current?.focus({ preventScroll: true });

    const lenis = getLenis();
    lenis?.stop();

    // The gutter is held so that removing the scrollbar does not slide the
    // whole page sideways on systems that draw a classic one.
    const root = document.documentElement;
    const { overflow, scrollbarGutter } = root.style;
    root.style.overflow = "hidden";
    root.style.scrollbarGutter = "stable";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      const dialog = dialogRef.current;
      if (e.key !== "Tab" || !dialog) return;

      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      const outside = !dialog.contains(current);

      if (e.shiftKey && (outside || current === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (outside || current === last)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = overflow;
      root.style.scrollbarGutter = scrollbarGutter;
      lenis?.start();
      if (returnTo?.isConnected) returnTo.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {member && (
        <motion.div
          key="member-modal"
          data-lenis-prevent
          className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-[color-mix(in_srgb,var(--color-bg)_72%,transparent)] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/*
            min-h-full with my-auto on the panel, not items-center: centring
            with flex alignment pushes the top of a panel taller than the
            viewport out of reach, auto margins do not.
          */}
          <div
            className="flex min-h-full items-start justify-center p-4 sm:p-8"
            onPointerDown={(e) => {
              pressedBackdrop.current = e.target === e.currentTarget;
            }}
            onClick={(e) => {
              if (pressedBackdrop.current && e.target === e.currentTarget) {
                onClose();
              }
              pressedBackdrop.current = false;
            }}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative my-auto w-full max-w-4xl rounded-3xl border border-line bg-surface shadow-[var(--shadow-card),0_32px_80px_-24px_rgba(8,24,48,0.28)]"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full text-muted transition-colors duration-300 hover:bg-ink/[0.06] hover:text-ink sm:right-4 sm:top-4"
              >
                <Icon name="close" size={22} />
                <span className="sr-only">{copy.close}</span>
              </button>

              <div
                className={`grid gap-6 p-6 pt-14 sm:gap-8 sm:p-10 ${
                  member.photo
                    ? "md:grid-cols-[14rem_minmax(0,1fr)] md:gap-12"
                    : ""
                }`}
              >
                {member.photo && (
                  <div className="relative mx-auto aspect-square w-32 overflow-hidden rounded-full border border-line sm:w-40 md:mx-0 md:w-full md:self-start">
                    <Image
                      src={member.photo}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 14rem, 10rem"
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="min-w-0">
                  <h2
                    id={titleId}
                    lang={NAME_LANG[locale]}
                    className="text-center text-[clamp(1.5rem,3.5vw,2rem)] font-semibold tracking-[-0.02em] text-ink md:pr-8 md:text-left"
                  >
                    {member.name}
                  </h2>
                  {member.role && (
                    <p className="mt-2 text-center text-[0.95rem] font-medium text-mark-1 md:text-left">
                      {member.role}
                    </p>
                  )}

                  {member.description && (
                    <div className="mt-7">
                      {/*
                        紹介 — "Introduction" in English — matching the
                        trigger that opened this, in the page's language
                        like every other small label on it.
                      */}
                      <p className={type.label}>{copy.label}</p>
                      {/*
                        Left-aligned: several sentences centred are hard
                        work, in Japanese or in English.
                      */}
                      <div className="mt-3 rounded-2xl bg-mark-1/[0.07] p-5 md:p-6">
                        <p className={type.copy}>{member.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
