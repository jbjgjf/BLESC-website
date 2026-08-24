/**
 * The bottom of the ranking, so 37位 reads as a position among named
 * countries rather than a bare number.
 *
 * VERIFY BEFORE LAUNCH. Japan at 37th is the site's own existing claim and
 * matches the source the other figures come from (38 countries, physical
 * health 1st). New Zealand at 38th is from the same table and I am fairly
 * confident of it, but it is a published statistic about a real country and
 * deserves a check. Ranks 35 and 36 are left null rather than guessed —
 * they render as a dash, so nothing unverified ships. Fill in `country` and
 * `flag` and the rows complete themselves.
 */
export type RankRow = {
  rank: number;
  country: string | null;
  /** Regional-indicator emoji. Windows Chrome shows letters, not a flag. */
  flag: string | null;
};

export const BOTTOM_RANKS: RankRow[] = [
  { rank: 35, country: null, flag: null },
  { rank: 36, country: null, flag: null },
  { rank: 37, country: "日本", flag: "🇯🇵" },
  { rank: 38, country: "ニュージーランド", flag: "🇳🇿" },
];

export function RankTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          子どもの精神的幸福度ランキング、先進38カ国中の下位4カ国
        </caption>
        <thead>
          <tr className="border-b border-line">
            <th
              scope="col"
              className="px-5 py-3 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted"
            >
              順位
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted"
            >
              国
            </th>
          </tr>
        </thead>
        <tbody>
          {BOTTOM_RANKS.map((row) => {
            const isJapan = row.country === "日本";
            return (
              <tr
                key={row.rank}
                className={`border-b border-line last:border-0 ${
                  isJapan ? "bg-mark-1/[0.1]" : ""
                }`}
              >
                <td
                  className={`whitespace-nowrap px-5 py-3.5 tabular-nums ${
                    isJapan
                      ? "text-[1.05rem] font-semibold text-mark-1"
                      : "text-[0.95rem] text-muted"
                  }`}
                >
                  {row.rank}位
                </td>
                <td
                  className={`px-5 py-3.5 ${
                    isJapan
                      ? "text-[1.05rem] font-semibold text-ink"
                      : "text-[0.95rem] text-muted"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {row.flag && (
                      <span aria-hidden className="text-[1.15rem] leading-none">
                        {row.flag}
                      </span>
                    )}
                    {row.country ?? <span aria-hidden>—</span>}
                    {!row.country && <span className="sr-only">未確認</span>}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** One figure per 10,000 students. */
const PICTOGRAM_COUNT = 35;

export function StudentPictogram() {
  return (
    <div>
      <div
        aria-hidden
        className="grid max-w-[26rem] grid-cols-7 gap-x-3 gap-y-2.5 sm:gap-x-4 sm:gap-y-3"
      >
        {Array.from({ length: PICTOGRAM_COUNT }, (_, i) => (
          <svg
            key={i}
            viewBox="0 0 12 17"
            className="h-auto w-full text-mark-1"
            fill="currentColor"
          >
            <circle cx="6" cy="3.4" r="3.4" />
            <path d="M6 8.2c-3.1 0-5.4 2.1-5.4 5.1V17h10.8v-3.7c0-3-2.3-5.1-5.4-5.1Z" />
          </svg>
        ))}
      </div>
      <p className="mt-5 text-[0.75rem] tabular-nums text-muted">
        1体 = 1万人
      </p>
    </div>
  );
}
