"use client";

import { AnimatePresence, motion } from "motion/react";
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
 * The team. Every name, role, photograph and biography here is supplied by
 * the company — none of it is written or inferred.
 *
 * Roles are deliberately not all "Chief X Officer" any more: only the CEO
 * keeps that form, and everyone else is named for what they actually do.
 * 王 謙蘊 and 松本 龍 are the two that needed a title choosing rather than
 * quoting — Engineering Lead from a brief about AI, product development and
 * running the technical team, and Project Lead from a biography that calls
 * the role 共同創業者兼プロジェクトリード.
 *
 * NOTE: two biographies still name the old titles internally — 内藤 悠人's
 * says Chief Research Officer and 王 謙蘊's says CTO. Those are the
 * company's own words so they are left exactly as given; they need a line
 * changed by their authors, not by us.
 */
const MEMBERS: Member[] = [
  {
    name: "田 雨竜",
    initials: "UD",
    role: "CEO",
    photo: "/team/longlong.png",
    description:
      "中国と日本にルーツを持つ高校生です。人と話すことが好きで、コミュニケーション力には自信があります。一方で、なぜか言う冗談はいつも滑りがちです。マーケティングや行動経済学に強い関心を持ち、人々の意思決定や行動変容を促す仕組みづくりについて学んでいます。BLESCではCEOとして、事業戦略の立案や外部機関との連携を担当し、若者のメンタルヘルスという社会課題の解決に挑戦しています。",
  },
  {
    name: "松本 龍",
    initials: "RY",
    role: "Project Lead",
    photo: "/team/ryu.png",
    description:
      "データサイエンスを用いた社会課題解決に関心を持ち、現在は主に計量経済学やファイナンス、市場流動性に関する研究に従事しています。Blescでは共同創業者兼プロジェクトリードとして、臨床オントロジーや非言語的な行動バイアスの分析技術を用いたプロダクトの開発、および事業戦略・ファイナンス面の立案を牽引しています。",
  },
  {
    name: "マクガン ジャスパー",
    initials: "JM",
    role: "Web Designer & Marketing Director",
    photo: "/team/jasper.png",
    description:
      "オーストラリアと日本にルーツを持つ高校生です。AIを活用した課題解決や地域貢献に関心があり、デジタルマーケティング、動画編集、クリエイティブ制作にも取り組んでいます。BLESCではマーケティングとプロダクトを担当していて、ブランドアイデンティティの構築、プロダクト・ウェブサイトのデザイン、SNS運用やマーケティング戦略を担当しています。技術とデザインの両面から、より多くの人に価値を届けることを目指しています。",
  },
  {
    name: "モンガ 蓮緒奈",
    initials: "RM",
    role: "Experience Designer",
    photo: "/team/reona.png",
    description:
      "インドと日本にルーツを持つ高校生です。斬新なインターフェースの研究・開発や、テクノロジーを活用した課題解決、地域貢献に関心があります。また、デジタルマーケティング、動画編集、クリエイティブ制作にも取り組んでいます。BLESCではExperience Designerとして、ユーザー体験（UX）の設計やプロダクトデザインを担当し、誰もが直感的に使えるサービスづくりを目指しています。技術とデザインを融合させながら、より良い体験価値の創出に挑戦しています。",
  },
  {
    name: "内藤 悠人",
    initials: "YN",
    role: "Psychology Researcher",
    photo: "/team/yujin.png",
    description:
      "人間の心理メカニズムと社会課題解決に関心を持ち、現在は心理学の知見を用いたメンタルヘルスプラットフォームの開発に従事しています。BlescではChief Research Officerとして、システムの基盤構築や心理学的データの標準化など、プロダクトのコアとなる部分の設計・研究を統括しています。複雑な学術的知見を、誰もが直感的に使えるシステムへと形にすることに情熱を注いでいます。卓越した専門性と柔軟な視野を持ち、チームのメンバーとともに、多くの人が不可能だと思うようなイノベーションを社会に実装していくことを目指しています。",
  },
  {
    name: "王 謙蘊",
    initials: "KO",
    role: "Engineering Lead",
    photo: "/team/ou.png",
    description:
      "AI・バイオテクノロジー・起業に関心を持つ高校生です。BLESCではCTOとして、科学的根拠と透明性を重視しながら、社会課題の解決につながるテクノロジーの開発に取り組んでいます。アイデアを実際のプロダクトへと形にすることや、優秀な仲間とチームを組んで難しい課題に挑戦することが好きです。現在は主にAI活用やプロダクト開発、技術チームのマネジメントに力を入れています。",
  },
  {
    name: "山村 初香",
    initials: "UY",
    role: "Legal & Compliance",
    photo: "/team/uika.jpeg",
    description:
      "広尾学園2年です。政府の政策や法制度が「誰のために下され、どのような人々の生活にどう影響するのか」に関心を持ち、さまざまな活動に取り組んでいます。現在Blescでは、利用規約やプライバシーポリシーをはじめとする法務・コンプライアンス領域を担当しています。誰もが安心して利用できるサービス基盤の構築を目指しています。",
  },
  {
    /* No Blesc role stated in the brief supplied, so none is shown. */
    name: "梅澤 透真",
    initials: "TU",
    photo: "/team/tohma.jpg",
    description:
      "渋谷教育学園渋谷高校二年生。趣味はヴィオラと読書と化学の勉強。最近は広義の「学び」を意識して、多様なプロジェクトに参画しています。",
  },
];

/** The company's own description of the team. */
const TEAM_INTRO =
  "BLESCは、中国、日本、オーストラリア、インドなど多様なバックグラウンドを持つ帰国子女で構成されており、全員がバイリンガルとして国内外の視点を活かしながら社会課題の解決に取り組んでいます。";

/**
 * Name, role, and a disclosure holding that person's introduction.
 *
 * Opening on hover but closing on the button's own mouseleave would be
 * unusable here — these biographies run to several sentences, and the panel
 * opens *below* the button, so reaching the text means leaving the trigger.
 * Open is therefore on the button and close is on the whole block, which
 * means moving down into the copy keeps it open.
 *
 * Hover is not the only way in: click works for touch, focus works for the
 * keyboard, and aria-expanded carries the state either way.
 *
 * The panel sits outside the aria-live region deliberately. Inside it, an
 * atomic region would re-read the entire biography every time the carousel
 * moved to another person.
 */
function MemberCard({ person }: { person: Member }) {
  const [open, setOpen] = useState(false);
  const bio = person.description;

  return (
    <div onMouseLeave={() => setOpen(false)}>
      <div aria-live="polite" aria-atomic="true" className="min-h-[3.5rem]">
        <div className="flex items-center justify-center gap-2.5">
          <p className="text-xl font-medium tracking-[-0.01em] text-ink">
            {person.name}
          </p>

          {bio && (
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              onMouseEnter={() => setOpen(true)}
              onFocus={() => setOpen(true)}
              className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line text-mark-1 transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-mark-1 hover:bg-mark-1/10"
            >
              <Icon
                name="expand_more"
                size={16}
                className={`transition-[rotate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  open ? "rotate-180" : ""
                }`}
              />
              <span className="sr-only">
                {`${person.name}の紹介を${open ? "閉じる" : "表示する"}`}
              </span>
            </button>
          )}
        </div>

        {person.role && (
          <p className="mt-2 text-[0.9rem] text-mark-1">{person.role}</p>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && bio && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {/* Left-aligned: several sentences of Japanese centred is hard work. */}
            <p className="measure-jp mx-auto max-w-lg pt-5 text-left text-[0.95rem] text-muted">
              {bio}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

      <Reveal className="max-w-2xl">
        <p className="measure-jp text-muted">{TEAM_INTRO}</p>
      </Reveal>

      <div className="relative mt-14 h-[420px] w-full md:h-[540px]">
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
        actually exists as text.
      */}
      <div className="mx-auto mt-8 max-w-2xl text-center">
        <MemberCard key={active} person={person} />

        {/*
          Dragging a canvas is not a keyboard-operable control, so these are
          the actual way through the roster without a mouse.
        */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => stepRef.current?.(-1)}
            aria-label="前のメンバーを表示"
            className="flex size-11 items-center justify-center rounded-full border-2 border-line-strong text-muted transition-[color,border-color,scale] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] hover:border-ink/40 hover:text-ink"
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
            className="flex size-11 items-center justify-center rounded-full border-2 border-line-strong text-muted transition-[color,border-color,scale] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] hover:border-ink/40 hover:text-ink"
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
