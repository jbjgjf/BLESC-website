import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";

/**
 * PLACEHOLDER DATA — 山田太郎 / 山田花子 are Japan's standard stand-in names,
 * the equivalent of "John Doe". Replace every entry with real people before
 * this page goes live.
 */
const MEMBERS = [
  { name: "山田 太郎", role: "代表取締役 / CEO" },
  { name: "山田 花子", role: "CTO" },
  { name: "山田 一郎", role: "リサーチ" },
  { name: "山田 次郎", role: "プロダクト" },
  { name: "山田 三郎", role: "パートナーシップ" },
] as const;

/** Name + role pairs on a plain grid. No borders, no surfaces, no cards. */
export function Team() {
  return (
    <Section id="team" alt>
      <Reveal>
        <Eyebrow>チーム</Eyebrow>
      </Reveal>

      <Stagger
        className="mt-6 grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 md:grid-cols-3"
        stagger={0.08}
      >
        {MEMBERS.map((member) => (
          <RevealItem key={member.name}>
            <p className="text-lg font-medium tracking-[-0.01em] text-ink">
              {member.name}
            </p>
            <p className="mt-2 text-[0.9rem] text-muted">{member.role}</p>
          </RevealItem>
        ))}
      </Stagger>
    </Section>
  );
}
