"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CircularGallery,
  type GalleryApi,
  type GalleryItem,
} from "@/components/CircularGallery";
import { useLocale } from "@/components/LocaleProvider";
import { MemberModal } from "@/components/MemberModal";
import { Reveal } from "@/components/Reveal";
import { Icon, Section, SectionTitle } from "@/components/ui";
import type { Locale } from "@/lib/i18n";
import { initialsCard } from "@/lib/initialsCard";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";

type Member = {
  /**
   * As the member writes it, in its own script, in both languages. The
   * official Latin spellings have not been supplied, and a romanisation
   * worked out here would be a guess printed under someone's photograph.
   */
  name: string;
  initials: string;
  /**
   * Real job titles only. The placeholder roster carried invented ones; those
   * were removed rather than transferred onto real people, because a
   * fabricated title on a named colleague is a claim about them, not filler.
   *
   * Already English, so one string serves both languages.
   */
  role?: string;
  /**
   * The member's own introduction, and its English translation. The English
   * follows the Japanese sentence by sentence and says nothing it does not:
   * a title the Japanese names is the title the English names, including
   * the three noted on MEMBERS that differ from `role`.
   *
   * It is written in the first person. The Japanese is a self-introduction
   * with no subject, and the first person is the reading that needs no
   * pronoun chosen for anyone.
   */
  description?: Record<Locale, string>;
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
 * The English translations name the same three titles for the same reason
 * (Chief Research Officer, CTO, "co-founder and project lead"): a
 * translation that quietly corrected them would be us changing the line.
 *
 * In English the company is written Blesc throughout, as on the rest of
 * the English site, where the Japanese biographies write BLESC or Blesc as
 * each author did. Two schools are named, and an English reader cannot be
 * left with 広尾学園, so they are romanised plainly (Hiroo Gakuen, Shibuya
 * Kyoiku Gakuen Shibuya High School) — to be checked against the name each
 * school uses for itself in English. The members' own names are not
 * romanised at all (see Member.name).
 */
const MEMBERS: Member[] = [
  {
    name: "田 雨竜",
    initials: "UD",
    role: "CEO",
    photo: "/team/longlong.png",
    description: {
      ja: "中国と日本にルーツを持つ高校生です。人と話すことが好きで、コミュニケーション力には自信があります。一方で、なぜか言う冗談はいつも滑りがちです。マーケティングや行動経済学に強い関心を持ち、人々の意思決定や行動変容を促す仕組みづくりについて学んでいます。BLESCではCEOとして、事業戦略の立案や外部機関との連携を担当し、若者のメンタルヘルスという社会課題の解決に挑戦しています。",
      en: "I am a high school student with roots in China and Japan. I like talking with people and am confident in my communication skills. My jokes, on the other hand, somehow always tend to fall flat. I have a strong interest in marketing and behavioral economics, and I am learning about building mechanisms that prompt people’s decision-making and behavior change. As CEO of Blesc, I am in charge of planning business strategy and working with outside organizations, and I am taking on the social issue of young people’s mental health.",
    },
  },
  {
    name: "松本 龍",
    initials: "RY",
    role: "Head of Finance",
    photo: "/team/ryu.png",
    description: {
      ja: "データサイエンスを用いた社会課題解決に関心を持ち、現在は主に計量経済学やファイナンス、市場流動性に関する研究に従事しています。Blescでは共同創業者兼プロジェクトリードとして、臨床オントロジーや非言語的な行動バイアスの分析技術を用いたプロダクトの開発、および事業戦略・ファイナンス面の立案を牽引しています。",
      en: "I am interested in using data science to solve social issues, and at present I am mainly engaged in research on econometrics, finance, and market liquidity. At Blesc, as co-founder and project lead, I lead the development of a product that uses clinical ontology and techniques for analyzing nonverbal behavioral biases, as well as the planning of business strategy and finance.",
    },
  },
  {
    name: "マクガン ジャスパー",
    initials: "JM",
    role: "Web Designer & Marketing Director",
    photo: "/team/jasper.png",
    description: {
      ja: "オーストラリアと日本にルーツを持つ高校生です。AIを活用した課題解決や地域貢献に関心があり、デジタルマーケティング、動画編集、クリエイティブ制作にも取り組んでいます。BLESCではマーケティングとプロダクトを担当していて、ブランドアイデンティティの構築、プロダクト・ウェブサイトのデザイン、SNS運用やマーケティング戦略を担当しています。技術とデザインの両面から、より多くの人に価値を届けることを目指しています。",
      en: "I am a high school student with roots in Australia and Japan. I am interested in solving problems with AI and in contributing to local communities, and I also work on digital marketing, video editing, and creative production. At Blesc, I am in charge of marketing and product: building the brand identity, designing the product and the website, and handling social media and marketing strategy. I aim to bring value to more people through both technology and design.",
    },
  },
  {
    name: "モンガ 蓮緒奈",
    initials: "RM",
    role: "Experience Designer",
    photo: "/team/reona.png",
    description: {
      ja: "インドと日本にルーツを持つ高校生です。斬新なインターフェースの研究・開発や、テクノロジーを活用した課題解決、地域貢献に関心があります。また、デジタルマーケティング、動画編集、クリエイティブ制作にも取り組んでいます。BLESCではExperience Designerとして、ユーザー体験（UX）の設計やプロダクトデザインを担当し、誰もが直感的に使えるサービスづくりを目指しています。技術とデザインを融合させながら、より良い体験価値の創出に挑戦しています。",
      en: "I am a high school student with roots in India and Japan. I am interested in researching and developing novel interfaces, in solving problems with technology, and in contributing to local communities. I also work on digital marketing, video editing, and creative production. As Experience Designer at Blesc, I am in charge of user experience (UX) design and product design, and I aim to build a service anyone can use intuitively. I am working to create better experiences by bringing technology and design together.",
    },
  },
  {
    name: "内藤 悠人",
    initials: "YN",
    role: "Psychology Researcher",
    photo: "/team/yujin.png",
    description: {
      ja: "人間の心理メカニズムと社会課題解決に関心を持ち、現在は心理学の知見を用いたメンタルヘルスプラットフォームの開発に従事しています。BlescではChief Research Officerとして、システムの基盤構築や心理学的データの標準化など、プロダクトのコアとなる部分の設計・研究を統括しています。複雑な学術的知見を、誰もが直感的に使えるシステムへと形にすることに情熱を注いでいます。卓越した専門性と柔軟な視野を持ち、チームのメンバーとともに、多くの人が不可能だと思うようなイノベーションを社会に実装していくことを目指しています。",
      en: "I am interested in the mechanisms of the human mind and in solving social issues, and at present I am engaged in developing a mental health platform that draws on findings from psychology. As Chief Research Officer at Blesc, I oversee the design and research of the product’s core, including building the system’s foundations and standardizing psychological data. I am passionate about turning complex academic findings into a system anyone can use intuitively. With outstanding expertise and a flexible outlook, I aim, together with the team, to bring to society the kind of innovation many people think is impossible.",
    },
  },
  {
    name: "王 謙蘊",
    initials: "KO",
    role: "Engineering Lead",
    photo: "/team/ou.png",
    description: {
      ja: "AI・バイオテクノロジー・起業に関心を持つ高校生です。BLESCではCTOとして、科学的根拠と透明性を重視しながら、社会課題の解決につながるテクノロジーの開発に取り組んでいます。アイデアを実際のプロダクトへと形にすることや、優秀な仲間とチームを組んで難しい課題に挑戦することが好きです。現在は主にAI活用やプロダクト開発、技術チームのマネジメントに力を入れています。",
      en: "I am a high school student interested in AI, biotechnology, and entrepreneurship. As CTO of Blesc, I work on developing technology that helps solve social issues, with an emphasis on scientific evidence and transparency. I like turning ideas into real products, and teaming up with talented peers to take on hard problems. At present I am focusing mainly on applying AI, product development, and managing the technical team.",
    },
  },
  {
    name: "山村 初香",
    initials: "UY",
    role: "Legal & Compliance",
    photo: "/team/uika.jpeg",
    description: {
      ja: "広尾学園2年です。政府の政策や法制度が「誰のために下され、どのような人々の生活にどう影響するのか」に関心を持ち、さまざまな活動に取り組んでいます。現在Blescでは、利用規約やプライバシーポリシーをはじめとする法務・コンプライアンス領域を担当しています。誰もが安心して利用できるサービス基盤の構築を目指しています。",
      en: "I am a second-year student at Hiroo Gakuen. I am interested in government policy and legal systems — who they are made for, and whose lives they affect and how — and I take part in a range of activities. At Blesc, I am currently in charge of legal and compliance matters, including the terms of service and the privacy policy. I aim to build a service foundation anyone can use with peace of mind.",
    },
  },
  {
    /* No Blesc role stated in the brief supplied, so none is shown. */
    name: "梅澤 透真",
    initials: "TU",
    photo: "/team/tohma.jpg",
    description: {
      ja: "渋谷教育学園渋谷高校二年生。趣味はヴィオラと読書と化学の勉強。最近は広義の「学び」を意識して、多様なプロジェクトに参画しています。",
      en: "I am a second-year student at Shibuya Kyoiku Gakuen Shibuya High School. My hobbies are the viola, reading, and studying chemistry. Lately I have been joining a variety of projects with “learning” in its broad sense in mind.",
    },
  },
];

/**
 * The company's own description of the team, condensed to one sentence.
 *
 * Every claim in the original survives — the backgrounds and the countries
 * named, that the members are 帰国子女, that all of them are bilingual, and
 * that the work is social-issue work seen from inside and outside Japan.
 * What went was the two-clause construction carrying them.
 *
 * The English is that sentence and carries the same claims. 帰国子女 is
 * "returnee students", the usual English for it: students who lived abroad
 * and came back to school in Japan.
 */
const TEAM_INTRO = {
  ja: "BLESCは、中国、日本、オーストラリア、インドなど多様なバックグラウンドを持つバイリンガルの帰国子女が、国内外の視点から社会課題の解決に取り組むチームです。",
  en: "Blesc is a team of bilingual returnee students with diverse backgrounds, including China, Japan, Australia, and India, working to solve social issues from perspectives inside and outside Japan.",
} as const;

/**
 * The section's own words, in each language: its title, and the labels of
 * controls that have no visible text — the roster's keyboard hint, the two
 * arrows, and the button that opens an introduction.
 */
const COPY = {
  ja: {
    title: "チーム",
    roster: "メンバー一覧。左右の矢印キーで移動できます。",
    previous: "前のメンバーを表示",
    next: "次のメンバーを表示",
    openIntro: (name: string) => `${name}の紹介を見る`,
  },
  en: {
    title: "Team",
    roster:
      "Team members. Use the left and right arrow keys to move between them.",
    previous: "Show previous member",
    next: "Show next member",
    openIntro: (name: string) => `Read ${name}’s introduction`,
  },
} as const;

/**
 * The intro paragraph's setting, per language. measure-jp is the site's
 * Japanese paragraph setting — 1.9 leading and a hair of tracking — and an
 * English paragraph at that leading reads as double-spaced, so English takes
 * the Latin leading the 安全とプライバシー pages use, and text-pretty to keep
 * its last line from being one word. Whole class strings, because Tailwind
 * only generates what it can read.
 */
const INTRO_TYPE = {
  ja: "measure-jp text-[1.0625rem] text-muted",
  en: "text-pretty text-[1.0625rem] leading-[1.65] text-muted",
} as const;

/**
 * The language of a member's name, as an attribute for the element that
 * shows it. On the English page the names are still Japanese text, and
 * saying so is what lets a screen reader pronounce them as Japanese and a
 * browser choose Japanese glyphs for the kanji. On the Japanese page the
 * document already says it, and nothing is added.
 */
const NAME_LANG = { ja: undefined, en: "ja" } as const;

/**
 * How far back the ring sits while the roster is still below the fold, in
 * cards. It turns forward by this much as the roster's top climbs from the
 * bottom of the viewport to the middle, and is at rest from then on, so the
 * reader arrives to a roster settling into place rather than one that is
 * simply there.
 *
 * Under half a card on purpose: the gallery reports whichever card is
 * nearest the centre, and a turn of less than half a slot never changes
 * that, so the name under the roster stays put while the ring arrives.
 */
const ENTRANCE_PAN = 0.45;

/** The pan, in cards, the ring should carry at a point in the entrance. */
function entrancePan(progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  return -ENTRANCE_PAN * (1 - p);
}

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
  locale,
  onOpen,
}: {
  person: Member;
  locale: Locale;
  onOpen: () => void;
}) {
  return (
    <div aria-live="polite" aria-atomic="true" className="min-h-[3.5rem]">
      <div className="flex items-center justify-center gap-2.5">
        <p
          lang={NAME_LANG[locale]}
          className="text-xl font-medium tracking-[-0.01em] text-ink"
        >
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
            <span className="sr-only">
              {COPY[locale].openIntro(person.name)}
            </span>
          </button>
        )}
      </div>

      {person.role && (
        <p className="mt-2 text-[0.9rem] text-mark-1">{person.role}</p>
      )}
    </div>
  );
}

export function Team({ locale: fromPage }: { locale?: Locale }) {
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState<number | null>(null);
  const galleryRef = useRef<GalleryApi | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  /*
   * The page hands every section its language as a prop, and the layout's
   * provider holds the same one for client components — which is where the
   * dialog below reads it. They cannot differ on a page; the prop is read
   * first only so that the section can be rendered outside a provider and
   * still be told what to say.
   */
  const fromLayout = useLocale();
  const locale = fromPage ?? fromLayout;
  const copy = COPY[locale];

  /*
   * Stable identity: a new array each render would tear down the WebGL
   * scene. The titles under the photographs are the names, which are the
   * same in both languages, so the language is not a dependency.
   */
  const items = useMemo<GalleryItem[]>(
    () =>
      MEMBERS.map((m, i) => ({
        image: m.photo ?? initialsCard(m.initials, i),
        text: m.name,
      })),
    [],
  );

  /*
   * The entrance turn, as a function of where the roster is on the page:
   * 0 with its top at the bottom edge of the viewport, 1 with its top at
   * the middle. Under reduced motion the pan is 0 at every point, so the
   * ring is simply at rest and nothing below ever sends it a nudge.
   *
   * The flag reads "not reduced" through hydration and the real setting on
   * the render after, the same as every other reduced-motion branch on the
   * page. The gallery's scene is built in the hydration pass's effects, so a
   * reduced-motion visitor's ring can take the pan before the flag turns;
   * the effect further down takes it straight back off.
   */
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start end", "start center"],
  });
  const panAt = useCallback(
    (progress: number) => (reduce ? 0 : entrancePan(progress)),
    [reduce],
  );

  /*
   * The pan the ring currently carries, in cards. Every change is sent as a
   * difference from this rather than as a position, because drag, the wheel
   * and the arrow keys move the same target and a turn written as an
   * absolute would throw theirs away. No easing of our own: the gallery's
   * lerp already smooths each nudge.
   */
  const appliedPan = useRef(0);

  const onReady = useCallback(
    (api: GalleryApi) => {
      galleryRef.current = api;
      /*
       * A fresh scene starts at rest, so the pan has to be read from where
       * the page actually is and put on the ring before it is seen: on a
       * deep link into the section that is 0 and nothing happens, and from
       * the top of the page it is the full pan, landed outright while the
       * roster is still off screen. Measured from the element rather than
       * from scrollYProgress, which only takes its first reading on the
       * frame after this runs and would say 0 wherever the page was — the
       * arithmetic is the same window the offset above describes.
       */
      const pan = panAt(progressNow(wrapperRef.current));
      appliedPan.current = pan;
      if (pan !== 0) api.nudge(pan, true);
    },
    [panAt],
  );

  /*
   * When the setting changes — including the flag turning to the real value
   * just after hydration — the ring is landed outright on the pan the new
   * setting wants for where the page is: at rest when motion is reduced,
   * back on its entrance turn when it is not. Outright, because easing the
   * ring back would be the very movement the setting asks to be spared. On
   * first mount the gallery's own effect has already run (a child's effects
   * run before its parent's), so the difference here is zero.
   */
  useEffect(() => {
    const api = galleryRef.current;
    if (!api) return;
    const next = panAt(progressNow(wrapperRef.current));
    const delta = next - appliedPan.current;
    if (delta === 0) return;
    appliedPan.current = next;
    api.nudge(delta, true);
  }, [panAt]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const api = galleryRef.current;
    if (!api) return;
    const next = panAt(progress);
    const delta = next - appliedPan.current;
    if (delta === 0) return;
    appliedPan.current = next;
    api.nudge(delta);
  });

  // Stable too: the dialog's open effect depends on it, and a fresh function
  // each render would re-run that effect and steal focus back to the close
  // button every time anything on this section re-rendered.
  const close = useCallback(() => setShown(null), []);

  const person = MEMBERS[active];
  const shownMember = shown === null ? null : MEMBERS[shown];

  return (
    <Section id="team" className="overflow-x-clip">
      <Reveal>
        <SectionTitle>{copy.title}</SectionTitle>
      </Reveal>

      <Reveal className="max-w-2xl">
        <p className={INTRO_TYPE[locale]}>{TEAM_INTRO[locale]}</p>
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
        a horizontal scroll. The break-out sits on this wrapper rather than on
        the focusable group, which keeps the group's label on the roster
        alone and gives the entrance turn a box to measure: its top is what
        the scroll window above is read from.
      */}
      <div
        ref={wrapperRef}
        className="relative left-1/2 mt-14 w-screen -translate-x-1/2"
      >

        {/*
          Focusable, with the arrows bound: dragging a canvas is not something
          a keyboard can do, and the buttons underneath are a long way from
          the thing they move. Tab to the roster and the left and right keys
          walk it.
        */}
        <div
          tabIndex={0}
          role="group"
          aria-label={copy.roster}
          onKeyDown={(e) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            galleryRef.current?.step(e.key === "ArrowRight" ? 1 : -1);
          }}
          className="relative h-[420px] w-full md:h-[560px]"
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
      </div>

      {/*
        The gallery is pixels, so this panel is where the centred person
        actually exists as text.
      */}
      <div className="mx-auto mt-8 max-w-2xl text-center">
        <MemberCard
          person={person}
          locale={locale}
          onOpen={() => setShown(active)}
        />

        {/*
          Dragging a canvas is not a keyboard-operable control, so these are
          the actual way through the roster without a mouse.
        */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => galleryRef.current?.step(-1)}
            aria-label={copy.previous}
            className="flex size-11 items-center justify-center rounded-full border-2 border-line-strong text-muted transition-[color,border-color,scale] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] hover:border-ink/40 hover:text-ink"
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <p className="text-[0.8rem] tabular-nums text-muted">
            {active + 1} / {MEMBERS.length}
          </p>
          <button
            type="button"
            onClick={() => galleryRef.current?.step(1)}
            aria-label={copy.next}
            className="flex size-11 items-center justify-center rounded-full border-2 border-line-strong text-muted transition-[color,border-color,scale] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] hover:border-ink/40 hover:text-ink"
          >
            <Icon name="arrow_forward" size={20} />
          </button>
        </div>
      </div>

      {/*
        The dialog is handed the introduction in the page's language; its own
        chrome (the close button, the label over the copy) it words itself,
        from the same provider.
      */}
      <MemberModal
        member={
          shownMember
            ? {
                name: shownMember.name,
                role: shownMember.role,
                photo: shownMember.photo,
                description: shownMember.description?.[locale],
              }
            : null
        }
        onClose={close}
      />

      {/*
        Only the centred person is in the visible DOM, and the others sit
        inside a canvas a screen reader cannot reach or drag. The full roster
        stays in the markup here so every member is readable and indexable —
        in the page's language, so /en carries the English introductions and
        not a second copy of the Japanese ones.
      */}
      <ul className="sr-only">
        {MEMBERS.map((m) => (
          <li key={m.name}>
            <h3 lang={NAME_LANG[locale]}>{m.name}</h3>
            {m.role && <p>{m.role}</p>}
            {m.description && <p>{m.description[locale]}</p>}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/**
 * Where the roster is in its entrance window right now: 0 with its top at the
 * bottom edge of the viewport, 1 with its top at the middle — the window the
 * useScroll offset in Team describes, read from the element because
 * scrollYProgress only takes its first reading on the frame after mount.
 */
function progressNow(wrapper: HTMLElement | null) {
  if (!wrapper) return 1;
  const vh = window.innerHeight;
  return (vh - wrapper.getBoundingClientRect().top) / (vh / 2);
}
