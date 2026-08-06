"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CircularGallery, type GalleryItem } from "@/components/CircularGallery";
import { Reveal } from "@/components/Reveal";
import { SectionTitle, Icon, Section } from "@/components/ui";
import { initialsCard } from "@/lib/initialsCard";

type Member = {
  name: string;
  initials: string;
  /**
   * Real job titles only. The placeholder roster carried invented ones; those
   * were removed rather than transferred onto real people, because a
   * fabricated title on a named colleague is a claim about them, not filler.
   */
  role?: string;
  description?: string;
  /**
   * Headshot path, relative to /public.
   *
   * These do NOT pass through next/image — the carousel uploads them as GPU
   * textures, so the file you save is the file that ships.
   */
  photo?: string;
};

/**
 * The team. Names, roles and photographs are real.
 *
 * CEO leads; the rest hold the order the photographs arrived in. Descriptions
 * are still absent rather than invented — see the note on the type above.
 */
const MEMBERS: Member[] = [
  { name: "田 雨竜", initials: "UD", role: "CEO", photo: "/team/longlong.png" },
  {
    name: "マクガン ジャスパー",
    initials: "JM",
    role: "CMO",
    photo: "/team/jasper.png",
  },
  {
    name: "モンガ 蓮緒奈",
    initials: "RM",
    role: "CXO",
    photo: "/team/reona.png",
  },
  { name: "内藤 悠人", initials: "YN", role: "CRO", photo: "/team/yujin.png" },
  { name: "王 謙蘊", initials: "KO", role: "CTO", photo: "/team/ou.png" },
  { name: "松本 龍", initials: "RY", role: "CFO", photo: "/team/ryu.png" },
];

export function Team() {
  const [active, setActive] = useState(0);
  const stepRef = useRef<((delta: number) => void) | null>(null);

  // Stable identity: a new array each render would tear down the WebGL scene.
  const items = useMemo<GalleryItem[]>(
    () =>
      MEMBERS.map((m, i) => ({
        image: m.photo ?? initialsCard(m.initials, i),
        text: m.name,
      })),
    [],
  );

  const onReady = useCallback(
    (api: { step: (delta: number) => void }) => {
      stepRef.current = api.step;
    },
    [],
  );

  const person = MEMBERS[active];

  return (
    <Section id="team">
      <Reveal>
        <SectionTitle accent="bg-mark-2">チーム</SectionTitle>
      </Reveal>

      <div className="relative h-[420px] w-full md:h-[540px]">
        <CircularGallery
          items={items}
          bend={3}
          borderRadius={0.06}
          scrollEase={0.04}
          onActiveChange={setActive}
          onReady={onReady}
        />
      </div>

      {/*
        The gallery is pixels, so this panel is where the centred person
        actually exists as text. aria-live announces the change as the
        carousel moves.
      */}
      <div className="mx-auto mt-8 max-w-xl text-center">
        {/* Shrinks to the name alone until roles arrive, rather than
            reserving space for copy that does not exist yet. */}
        <div aria-live="polite" aria-atomic="true" className="min-h-[3.5rem]">
          <p className="text-xl font-medium tracking-[-0.01em] text-ink">
            {person.name}
          </p>
          {person.role && (
            <p className="mt-2 text-[0.9rem] text-mark-1">{person.role}</p>
          )}
          {person.description && (
            <p className="measure-jp mt-4 text-[0.95rem] text-muted">
              {person.description}
            </p>
          )}
        </div>

        {/*
          Dragging a canvas is not a keyboard-operable control, so these are
          the actual way through the roster without a mouse.
        */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => stepRef.current?.(-1)}
            aria-label="前のメンバーを表示"
            className="flex size-11 items-center justify-center rounded-full border-2 border-line-strong text-muted transition-[color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] hover:border-ink/40 hover:text-ink"
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <p className="text-[0.8rem] tabular-nums text-muted">
            {active + 1} / {MEMBERS.length}
          </p>
          <button
            type="button"
            onClick={() => stepRef.current?.(1)}
            aria-label="次のメンバーを表示"
            className="flex size-11 items-center justify-center rounded-full border-2 border-line-strong text-muted transition-[color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] hover:border-ink/40 hover:text-ink"
          >
            <Icon name="arrow_forward" size={20} />
          </button>
        </div>
      </div>

      {/*
        Only the centred person is in the visible DOM, and the other nine sit
        inside a canvas a screen reader cannot reach or drag. The full roster
        stays in the markup here so every member is readable and indexable.
      */}
      <ul className="sr-only">
        {MEMBERS.map((m) => (
          <li key={m.name}>
            <h3>{m.name}</h3>
            {m.role && <p>{m.role}</p>}
            {m.description && <p>{m.description}</p>}
          </li>
        ))}
      </ul>
    </Section>
  );
}
