"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CircularGallery, type GalleryItem } from "@/components/CircularGallery";
import { MemberModal } from "@/components/MemberModal";
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
 * 王 謙蘊's is the one title chosen rather than quoted — Engineering Lead,
 * from a brief about AI, product development and running the technical
 * team. 松本 龍's Head of Finance is the company's own answer.
 *
 * NOTE: three biographies still name other titles internally — 内藤 悠人's
 * says Chief Research Officer, 王 謙蘊's says CTO, and 松本 龍's says
 * プロジェクトリード. Those are the company's own words so they are left
 * exactly as given; they need a line changed by their authors, not by us.
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
    role: "Head of Finance",
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

/**
 * The company's own description of the team, condensed to one sentence.
 *
 * Every claim in the original survives — the backgrounds and the countries
 * named, that the members are 帰国子女, that all of them are bilingual, and
 * that the work is social-issue work seen from inside and outside Japan.
 * What went was the two-clause construction carrying them.
 */
const TEAM_INTRO =
  "BLESCは、中国、日本、オーストラリア、インドなど多様なバックグラウンドを持つバイリンガルの帰国子女が、国内外の視点から社会課題の解決に取り組むチームです。";

/**
 * Name, role, and the button that opens that person's introduction.
 *
 * The introduction used to open as a panel over the gallery on hover. It is
 * a dialog now, and that changes the trigger: something that takes over the
 * screen cannot open because a pointer crossed a 28px button on its way
 * somewhere else. So this is click, or Enter and Space, only.
 *
 * The dialog itself is owned by Team rather than here, and this card is
 * deliberately not keyed by the active index. Keyed, it remounted every time
 * the carousel moved — and the carousel keeps easing for a moment after an
 * arrow press, so the button a dialog was opened from could be replaced
 * underneath it, leaving focus nowhere to return to on close.
 */
function MemberCard({
  person,
  onOpen,
}: {
  person: Member;
  onOpen: () => void;
}) {
  return (
    <div aria-live="polite" aria-atomic="true" className="min-h-[3.5rem]">
      <div className="flex items-center justify-center gap-2.5">
        <p className="text-xl font-medium tracking-[-0.01em] text-ink">
          {person.name}
        </p>

        {person.description && (
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={onOpen}
            className="group flex size-7 shrink-0 items-center justify-center rounded-full border border-line text-mark-1 transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-mark-1 hover:bg-mark-1/10"
          >
            {/* Out-and-up rather than down: it opens something, not a fold. */}
            <Icon
              name="arrow_outward"
              size={16}
              className="transition-[translate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-px group-hover:translate-x-px"
            />
            <span className="sr-only">{`${person.name}の紹介を見る`}</span>
          </button>
        )}
      </div>

      {person.role && (
        <p className="mt-2 text-[0.9rem] text-mark-1">{person.role}</p>
      )}
    </div>
  );
}

export function Team() {
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState<number | null>(null);
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

  // Stable too: the dialog's open effect depends on it, and a fresh function
  // each render would re-run that effect and steal focus back to the close
  // button every time anything on this section re-rendered.
  const close = useCallback(() => setShown(null), []);

  const person = MEMBERS[active];

  return (
    <Section id="team" className="overflow-x-clip">
      <Reveal>
        <SectionTitle>チーム</SectionTitle>
      </Reveal>

      <Reveal className="max-w-2xl">
        <p className="measure-jp text-[1.0625rem] text-muted">{TEAM_INTRO}</p>
      </Reveal>

      {/*
        Full-bleed on purpose. The roster is a carousel of faces and the
        container's 68rem measure was cropping the two either side of centre
        in half — at the page edge you saw a sliver of someone rather than a
        person. Item size is set by the canvas HEIGHT alone (the plane scales
        by screen.height/1500), so widening the canvas costs nothing and
        simply brings more of the roster into frame.

        left-1/2 + w-screen + -translate-x-1/2 is the standard break-out; the
        section clips the x axis so the scrollbar's width cannot turn it into
        a horizontal scroll.
      */}
      {/*
        Focusable, with the arrows bound: dragging a canvas is not something a
        keyboard can do, and the buttons underneath are a long way from the
        thing they move. Tab to the roster and the left and right keys walk it.
      */}
      <div
        tabIndex={0}
        role="group"
        aria-label="メンバー一覧。左右の矢印キーで移動できます。"
        onKeyDown={(e) => {
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          e.preventDefault();
          stepRef.current?.(e.key === "ArrowRight" ? 1 : -1);
        }}
        className="relative left-1/2 mt-14 h-[420px] w-screen -translate-x-1/2 md:h-[560px]"
      >
        <CircularGallery
          items={items}
          bend={1.8}
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
        <MemberCard person={person} onOpen={() => setShown(active)} />

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

      <MemberModal
        member={shown === null ? null : MEMBERS[shown]}
        onClose={close}
      />

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
