"use client";

import Image from "next/image";
import {
  animate,
  motion,
  motionValue,
  useInView,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useHoverCapable } from "@/components/TiltCard";
import { EXPO_OUT } from "@/lib/motion";

/**
 * One photo the follower can show. `src` doubles as the key: it is what the
 * row carries in data-news-photo, so the list and the follower agree on
 * which picture belongs to which row without sharing an index.
 */
export type FollowPhoto = {
  src: string;
  width: number;
  height: number;
  /**
   * A literal object-position class, picked by the caller from the entry's
   * `position`, so the follower crops the picture exactly as the opened row
   * does. Passed in rather than mapped here because Tailwind only sees
   * classes that are written out whole.
   */
  crop: string;
};

/**
 * Slightly over-damped: the photo trails the pointer by a few hundredths of
 * a second and settles without a bounce. It stands in for the system
 * cursor, which is hidden while it shows, so it cannot lag enough to feel
 * like something being dragged.
 */
const FOLLOW = { stiffness: 450, damping: 32, mass: 0.4 } as const;

/**
 * The closed, photographed row under an element — its photo's src — or
 * null. An open row already shows its photo inline, and a row without one
 * (SusHi Tech Tokyo) has nothing to follow with, so both count as no row.
 */
function photoRowAt(target: Element | null, list: HTMLElement): string | null {
  const row = target?.closest<HTMLDetailsElement>("details[data-news-photo]");
  if (!row || row.open || !list.contains(row)) return null;
  return row.dataset.newsPhoto ?? null;
}

/**
 * "The cursor becomes the photo": over a closed row of the ニュース register,
 * that row's picture follows the pointer in place of the cursor.
 *
 * One layer for the whole list, not one per row, so moving from one row to
 * the next is a crossfade inside a single frame rather than one photo
 * leaving and another arriving. The rows are found by event delegation —
 * this wraps the list and reads which row the pointer is over, and the rows
 * stay server-rendered markup that knows nothing about it.
 *
 * Only where it can work as intended: a hover-capable fine pointer, with
 * JavaScript, and no request for reduced motion. Everywhere else — touch,
 * keyboard, reduced motion, no script — the layer never mounts and the
 * handlers return at once, and the photo is seen where it always is, in the
 * opened row. The system cursor is hidden by a rule in the section keyed on
 * data-news-follow, which this sets only while the follower is live, so the
 * cursor can never vanish with nothing in its place.
 *
 * Nothing moves through React state per frame. The position is two springs
 * fed from pointermove, and each photo's opacity and stacking order are its
 * own motion values, set from the same handler. State changes only when the
 * pointer crosses into a different row or out of the rows, so a sweep across
 * the list costs one render per row boundary, not one per event.
 *
 * The layer is portalled to <body> at z-40: under the fixed nav (z-50), so
 * it never covers it, and outside the section's own stacking context
 * (isolate), so a photo near the section's bottom edge is not painted under
 * whatever comes after it. It takes no pointer events, so every click lands
 * on the row beneath. It is aria-hidden, and its images have empty alt: each
 * repeats a photo whose alt text is on the inline copy in the row.
 */
export function NewsPhotoCursor({
  photos,
  className = "",
  children,
}: {
  photos: readonly FollowPhoto[];
  className?: string;
  children: ReactNode;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const enabled = canHover && !reduce;

  /*
   * Preload: the photos mount, eagerly loaded, once the list is within 800px
   * of the viewport, so the first hover shows a picture rather than an empty
   * frame, and a visitor who never scrolls this far never fetches them. The
   * frame is 20rem, the same as the inline copies from md up, so both pick
   * the same file from the srcset and opening a row afterwards reuses it.
   */
  const near = useInView(listRef, { once: true, margin: "800px 0px" });

  const x = useSpring(0, FOLLOW);
  const y = useSpring(0, FOLLOW);

  /*
   * One opacity and one stacking order per photo, made once; the list never
   * changes after render. The stacking order is a motion value too, raised
   * from a running count each time a photo is brought to the front, so the
   * photos keep the order they arrived in without a render.
   */
  const [layers] = useState(() =>
    photos.map((photo) => ({
      photo,
      opacity: motionValue(0),
      z: motionValue(0),
    })),
  );
  const stack = useRef(0);

  const pointer = useRef({ x: 0, y: 0, inside: false });
  const activeRef = useRef<string | null>(null);
  /*
   * The row being hovered, or null; it decides whether the frame shows.
   * Leaving touches no photo, so the frame fades out still showing the
   * picture it had rather than going blank as it goes.
   */
  const [active, setActive] = useState<string | null>(null);

  const show = useCallback(
    (next: string | null) => {
      const current = activeRef.current;
      if (next === current) return;
      activeRef.current = next;
      setActive(next);

      const incoming = layers.find((layer) => layer.photo.src === next);
      if (!incoming) return;
      stack.current += 1;
      incoming.z.set(stack.current);

      if (current) {
        /*
         * Row to row: the new photo comes to the front and fades in over
         * whatever the frame already shows, which holds exactly as it is
         * underneath until it is covered. Two photos each at half strength
         * would let the page show through the middle of the fade — and so
         * would clearing the photo underneath on a sweep across several rows
         * faster than the fade, while the one being left is itself still
         * only part-way in. So nothing under the new photo is cleared until
         * it is fully in.
         *
         * No reset to 0 first. A photo that still has some strength is one
         * the pointer has come back to before the photo that replaced it
         * finished arriving; dropping it to nothing would open the same
         * hole, so it carries on from where it is.
         */
        animate(incoming.opacity, 1, {
          duration: 0.3,
          ease: "easeOut",
          onComplete: () => {
            if (activeRef.current !== next) return;
            for (const layer of layers) {
              if (layer !== incoming) layer.opacity.jump(0);
            }
          },
        });
      } else {
        /*
         * Appearing from nothing: the photo is simply there, and the frame
         * does the arriving. The frame also starts at the pointer, rather
         * than springing in from wherever it was last put away.
         */
        for (const layer of layers) {
          layer.opacity.jump(layer === incoming ? 1 : 0);
        }
        x.jump(pointer.current.x);
        y.jump(pointer.current.y);
      }
    },
    [layers, x, y],
  );

  /*
   * The ways the row under a still pointer can change with no pointer event
   * to say so: a row opening or closing (by click, or by keyboard while the
   * pointer rests on the list), and the page scrolling under it where a
   * browser is slow to send boundary events. Both re-read the element at
   * the pointer, at most once a frame. toggle does not bubble, so it is
   * caught on the way down.
   */
  useEffect(() => {
    const list = listRef.current;
    if (!enabled || !list) return;

    let frame = 0;
    const recheck = () => {
      frame = 0;
      const p = pointer.current;
      if (!p.inside) return;
      show(photoRowAt(document.elementFromPoint(p.x, p.y), list));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(recheck);
    };

    list.addEventListener("toggle", schedule, true);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      list.removeEventListener("toggle", schedule, true);
      window.removeEventListener("scroll", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, show]);

  /*
   * On pointermove, and on pointerover too: when the page scrolls a row
   * under a pointer that has not moved, browsers send the boundary events
   * (over, out, leave) for the new element but no move. Without this the
   * cursor-hiding rule would take effect at once — the cursor is whatever
   * the element under the pointer asks for — while the photo waited for the
   * mouse to twitch.
   */
  const onPointer = (event: PointerEvent<HTMLDivElement>) => {
    // A touch on a hybrid laptop is not a hover.
    if (!enabled || event.pointerType === "touch") return;
    const p = pointer.current;
    p.x = event.clientX;
    p.y = event.clientY;
    p.inside = true;
    x.set(p.x);
    y.set(p.y);
    show(photoRowAt(event.target as Element, event.currentTarget));
  };

  const onPointerLeave = () => {
    pointer.current.inside = false;
    show(null);
  };

  const visible = active !== null;

  return (
    <div
      ref={listRef}
      className={className}
      data-news-follow={enabled ? "" : undefined}
      onPointerMove={onPointer}
      onPointerOver={onPointer}
      onPointerLeave={onPointerLeave}
    >
      {children}

      {enabled &&
        near &&
        createPortal(
          <motion.div
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-40"
            style={{ x, y }}
          >
            {/*
              Centred on the pointer by the translate property, which composes
              with the scale motion writes to transform. The frame matches the
              inline photo — 3:2, rounded-2xl, the same 10% ink edge — plus a
              soft shadow, since unlike the inline one it floats over the
              page. bg-line would only show if a file were still loading.

              The edge is its own element, over the photos, rather than an
              outline on the frame: the photos are stacked by z-index, and a
              positive z-index paints over the outline of the box it sits in.
              The photos' stacking is kept inside their own isolated layer so
              the edge, which comes after it, is always on top of it.
            */}
            <motion.div
              className="relative aspect-[3/2] w-[20rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-line shadow-[0_28px_56px_-20px_color-mix(in_srgb,var(--color-text)_35%,transparent)]"
              initial={false}
              animate={
                visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
              }
              transition={
                visible
                  ? { duration: 0.45, ease: EXPO_OUT }
                  : { duration: 0.2, ease: "easeOut" }
              }
            >
              <div className="absolute inset-0 isolate">
                {layers.map(({ photo, opacity, z }) => (
                  <FollowLayer
                    key={photo.src}
                    photo={photo}
                    opacity={opacity}
                    z={z}
                  />
                ))}
              </div>
              <div className="absolute inset-0 rounded-2xl outline-1 -outline-offset-1 outline-ink/10" />
            </motion.div>
          </motion.div>,
          document.body,
        )}
    </div>
  );
}

function FollowLayer({
  photo,
  opacity,
  z,
}: {
  photo: FollowPhoto;
  opacity: MotionValue<number>;
  z: MotionValue<number>;
}) {
  return (
    <motion.div className="absolute inset-0" style={{ opacity, zIndex: z }}>
      <Image
        src={photo.src}
        width={photo.width}
        height={photo.height}
        alt=""
        sizes="20rem"
        loading="eager"
        className={`size-full object-cover ${photo.crop}`}
      />
    </motion.div>
  );
}
