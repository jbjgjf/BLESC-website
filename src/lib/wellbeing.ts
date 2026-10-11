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
 *
 * The words come in the site's two languages (lib/i18n); the numbers are one
 * set, shared, so the two pages cannot print different figures.
 */
export const RC16 = {
  /*
   * The report's own title in each edition. The English one is the main
   * title as UNICEF prints it, "Worlds of Influence". Its subtitle
   * ("Understanding what shapes child well-being in rich countries") is left
   * off: the Japanese citation gives the main title only, and the caption
   * that prints this sits in a narrow cell.
   */
  title: {
    ja: "レポートカード16「子どもたちに影響する世界」",
    en: "Report Card 16, “Worlds of Influence”",
  },
  publisher: {
    ja: "ユニセフ・イノチェンティ研究所",
    en: "UNICEF Innocenti",
  },
  year: 2020,
  /*
   * Each language links the edition its reader can check: the Japanese
   * edition, published by 日本ユニセフ協会, and the report's own page on
   * unicef.org for the English one.
   */
  url: {
    ja: "https://www.unicef.or.jp/library/pdf/labo_rc16j.pdf",
    en: "https://www.unicef.org/innocenti/reports/worlds-of-influence",
  },
  /** Japan's place in the mental well-being league table (Figure 3). */
  japanMentalRank: 37,
  countriesRanked: 38,
  /** Figure 4: percentage of 15-year-olds with high life satisfaction, 2018. */
  indicator: {
    ja: "生活満足度が高い15歳の割合",
    en: "Share of 15-year-olds with high life satisfaction",
  },
  dataYear: 2018,
} as const;

/**
 * Every value Figure 4 prints, highest first. The chart draws a subset; the
 * full figure is kept so the subset can be checked against it and changed
 * without going back to the PDF.
 *
 * Each country carries its name in both languages. The English names are the
 * short forms UNICEF uses — Republic of Korea, United States, United Kingdom
 * — rather than the everyday ones. They were written from that convention,
 * not read back off the English edition's figure, and for two countries the
 * convention itself has moved: チェコ (Czech Republic or Czechia) and トルコ
 * (Turkey or Türkiye). Neither is charted; check both against Figure 4
 * before either is drawn.
 */
export const LIFE_SATISFACTION = [
  { ja: "オランダ", en: "Netherlands", value: 90 },
  { ja: "メキシコ", en: "Mexico", value: 86 },
  { ja: "ルーマニア", en: "Romania", value: 85 },
  { ja: "フィンランド", en: "Finland", value: 84 },
  { ja: "クロアチア", en: "Croatia", value: 82 },
  { ja: "スイス", en: "Switzerland", value: 82 },
  { ja: "スペイン", en: "Spain", value: 82 },
  { ja: "リトアニア", en: "Lithuania", value: 82 },
  { ja: "アイスランド", en: "Iceland", value: 81 },
  { ja: "フランス", en: "France", value: 80 },
  { ja: "エストニア", en: "Estonia", value: 78 },
  { ja: "ポルトガル", en: "Portugal", value: 78 },
  { ja: "ラトビア", en: "Latvia", value: 78 },
  { ja: "オーストリア", en: "Austria", value: 77 },
  { ja: "スロバキア", en: "Slovakia", value: 77 },
  { ja: "ハンガリー", en: "Hungary", value: 77 },
  { ja: "イタリア", en: "Italy", value: 76 },
  { ja: "スウェーデン", en: "Sweden", value: 76 },
  { ja: "ギリシャ", en: "Greece", value: 76 },
  { ja: "ルクセンブルク", en: "Luxembourg", value: 76 },
  { ja: "ドイツ", en: "Germany", value: 75 },
  { ja: "チェコ", en: "Czech Republic", value: 73 },
  { ja: "ブルガリア", en: "Bulgaria", value: 73 },
  { ja: "スロベニア", en: "Slovenia", value: 72 },
  { ja: "アイルランド", en: "Ireland", value: 72 },
  { ja: "チリ", en: "Chile", value: 72 },
  { ja: "ポーランド", en: "Poland", value: 72 },
  { ja: "アメリカ", en: "United States", value: 71 },
  { ja: "マルタ", en: "Malta", value: 70 },
  { ja: "韓国", en: "Republic of Korea", value: 67 },
  { ja: "イギリス", en: "United Kingdom", value: 64 },
  { ja: "日本", en: "Japan", value: 62 },
  { ja: "トルコ", en: "Turkey", value: 53 },
] as const;

/**
 * The countries the chart shows: the top of the figure, a few the reader
 * will know, and Japan. Every one of them sits above Japan, so Japan's bar
 * is the shortest in the picture — which is the fact, not a framing: of the
 * 33 countries with data, only Turkey is lower.
 *
 * Listed by their Japanese names, which are the rows' keys; what a page
 * prints is the row's name in its own language.
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

/** The one row the chart sets apart. */
export const JAPAN = "日本";

export const CHART_ROWS = CHARTED.map((name) => {
  const row = LIFE_SATISFACTION.find((c) => c.ja === name);
  if (!row) throw new Error(`No RC16 figure for ${name}`);
  return row;
});
