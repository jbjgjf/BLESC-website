/**
 * The figures behind 課題, with their source.
 *
 * UNICEF Innocenti, Report Card 16 「子どもたちに影響する世界」 (2020). Its
 * mental well-being (精神的幸福度) league table ranks Japan 37th of the 38
 * OECD/EU countries with data, and the table is built from two indicators:
 * the share of 15-year-olds with high life satisfaction (PISA 2018, 6 or
 * more on a 0–10 scale) and the adolescent suicide rate. The percentages
 * below are the first of those, read off Figure 4 (p.12) of the report and
 * checked against the English edition and the underlying OECD table — every
 * number is as printed, not estimated. The figure covers 33 countries: no
 * life-satisfaction data exists for Australia, Belgium, Canada, Cyprus,
 * Denmark, Israel, New Zealand or Norway, so those cannot be charted, and
 * Mexico and Turkey have a figure but are outside the 38-country ranking.
 *
 * Japan's 62% is the second-lowest of the 33; only Turkey (53%) is below it.
 */
export const RC16 = {
  title: "レポートカード16「子どもたちに影響する世界」",
  publisher: "ユニセフ・イノチェンティ研究所",
  year: 2020,
  /** The Japanese edition, published by 日本ユニセフ協会. */
  url: "https://www.unicef.or.jp/library/pdf/labo_rc16j.pdf",
  /** Japan's place in the mental well-being league table (Figure 3). */
  japanMentalRank: 37,
  countriesRanked: 38,
  /** Figure 4: percentage of 15-year-olds with high life satisfaction, 2018. */
  indicator: "生活満足度が高い15歳の割合",
  dataYear: 2018,
} as const;

/**
 * Every value Figure 4 prints, highest first. The chart draws a subset; the
 * full figure is kept so the subset can be checked against it and changed
 * without going back to the PDF.
 */
export const LIFE_SATISFACTION = [
  { name: "オランダ", value: 90 },
  { name: "メキシコ", value: 86 },
  { name: "ルーマニア", value: 85 },
  { name: "フィンランド", value: 84 },
  { name: "クロアチア", value: 82 },
  { name: "スイス", value: 82 },
  { name: "スペイン", value: 82 },
  { name: "リトアニア", value: 82 },
  { name: "アイスランド", value: 81 },
  { name: "フランス", value: 80 },
  { name: "エストニア", value: 78 },
  { name: "ポルトガル", value: 78 },
  { name: "ラトビア", value: 78 },
  { name: "オーストリア", value: 77 },
  { name: "スロバキア", value: 77 },
  { name: "ハンガリー", value: 77 },
  { name: "イタリア", value: 76 },
  { name: "スウェーデン", value: 76 },
  { name: "ギリシャ", value: 76 },
  { name: "ルクセンブルク", value: 76 },
  { name: "ドイツ", value: 75 },
  { name: "チェコ", value: 73 },
  { name: "ブルガリア", value: 73 },
  { name: "スロベニア", value: 72 },
  { name: "アイルランド", value: 72 },
  { name: "チリ", value: 72 },
  { name: "ポーランド", value: 72 },
  { name: "アメリカ", value: 71 },
  { name: "マルタ", value: 70 },
  { name: "韓国", value: 67 },
  { name: "イギリス", value: 64 },
  { name: "日本", value: 62 },
  { name: "トルコ", value: 53 },
] as const;

/**
 * The countries the chart shows: the top of the figure, a few the reader
 * will know, and Japan. Every one of them sits above Japan, so Japan's bar
 * is the shortest in the picture — which is the fact, not a framing: of the
 * 33 countries with data, only Turkey is lower.
 */
export const CHARTED = [
  "オランダ",
  "フィンランド",
  "スペイン",
  "ドイツ",
  "アメリカ",
  "韓国",
  "イギリス",
  "日本",
] as const;

export const CHART_ROWS = CHARTED.map((name) => {
  const row = LIFE_SATISFACTION.find((c) => c.name === name);
  if (!row) throw new Error(`No RC16 figure for ${name}`);
  return row;
});
