/**
 * The mockup kit: one tinted panel, one application window, and the few small
 * parts a window is built from.
 *
 * The shape every figure on the site takes:
 *
 *   <li>
 *     <Frame className="h-[18rem]">      // tinted plane, aria-hidden
 *       <Screen title="3年2組" trailing={<Chip>全40名</Chip>}>
 *         …one idea, a handful of elements…
 *       </Screen>
 *     </Frame>
 *     <Caption n="01" lead="全生徒が対象">…the claim, as real text…</Caption>
 *   </li>
 *
 * Two rules hold the kit together. Everything is sized in rem and stretches
 * to its container, so a card can be dropped into any column width. And
 * nothing in here invents content: the only strings these components contain
 * are the ones passed in, and the one component that would need a student's
 * name (<Row>) has no prop for one.
 */
export { Frame } from "./Frame";
export { Screen } from "./Screen";
export { Caption } from "./Caption";
export { Bar, Chip, Composer, Row, TextLine } from "./parts";
