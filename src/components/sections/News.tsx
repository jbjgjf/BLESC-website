import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Flower } from "@/components/Flower";
import { SectionTitle, Icon, Section } from "@/components/ui";

/**
 * PLACEHOLDER — every entry here is invented, including the dates and the
 * partner mentions. Nothing on this list has happened. Replace the array
 * before the page is public; a press list that looks factual is the kind of
 * placeholder that survives launch by accident.
 *
 * `href` is intentionally absent: there are no article pages yet, and a
 * headline that looks clickable but goes nowhere is worse than one that
 * plainly doesn't. Add the field and the entry becomes a link.
 */
type NewsItem = {
  date: string;
  category: string;
  title: string;
  href?: string;
};

const ITEMS: NewsItem[] = [
  {
    date: "2026.07.15",
    category: "プレスリリース",
    title: "京都大学 臨床心理学研究室との共同研究を開始しました。",
  },
  {
    date: "2026.06.02",
    category: "お知らせ",
    title: "株式会社Hataproと、プラットフォーム基盤の開発で連携します。",
  },
  {
    date: "2026.04.22",
    category: "導入事例",
    title: "公立中学校3校でのパイロット導入が完了しました。",
  },
  {
    date: "2026.03.08",
    category: "メディア",
    title: "教育分野のカンファレンスでBlescの取り組みを発表しました。",
  },
];

/** Category tints, cycled so the list carries colour rather than grey rows. */
const MARKS = ["text-mark-1", "text-mark-2", "text-mark-3"] as const;

export function News() {
  return (
    <Section id="news" alt>
      <Reveal>
        <SectionTitle accent="bg-mark-3">ニュース</SectionTitle>
      </Reveal>

      <Reveal className="max-w-3xl">
        <p className="flex items-center gap-3 text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.4] tracking-[-0.02em] text-ink">
          Blescの最新の動き。
          <Flower size={34} rotate={14} opacity={0.9} className="shrink-0 text-mark-3" />
        </p>
      </Reveal>

      <Stagger className="mt-14" stagger={0.09}>
        {ITEMS.map((item, i) => {
          const mark = MARKS[i % MARKS.length];

          const body = (
            <div className="flex flex-col gap-2 border-t border-line py-7 md:flex-row md:items-baseline md:gap-8 md:py-8">
              <div className="flex shrink-0 items-center gap-4">
                <time className="text-[0.85rem] tabular-nums text-muted">
                  {item.date}
                </time>
                <span
                  className={`text-[0.75rem] font-medium tracking-[0.08em] ${mark}`}
                >
                  {item.category}
                </span>
              </div>

              <p className="text-[1rem] leading-relaxed text-ink md:text-[1.05rem]">
                {item.title}
              </p>

              {item.href && (
                <Icon
                  name="arrow_outward"
                  size={18}
                  className="ml-auto hidden shrink-0 text-muted md:block"
                />
              )}
            </div>
          );

          return (
            <RevealItem key={item.title}>
              {item.href ? (
                <a
                  href={item.href}
                  className="group block transition-opacity duration-300 hover:opacity-80"
                >
                  {body}
                </a>
              ) : (
                body
              )}
            </RevealItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
