/**
 * The mockup kit: one tinted panel, one application window, and the few small
 * parts a window is built from.
 *
 * The shape a figure on the site takes:
 *
 *   <Frame                                  // tinted plane, aria-hidden
 *     className="h-[20rem]"
 *     label={<ViewLabel>生徒の画面</ViewLabel>}  // whose screen, when it matters
 *   >
 *     <Screen title="3年2組" trailing={<Chip>全40名</Chip>}>
 *       …one idea, a handful of elements…
 *     </Screen>
 *   </Frame>
 *   …the claim, as real text, beside or beneath it (<Caption> is one way)…
 *
 * Two rules hold the kit together. Everything is sized in rem and stretches
 * to its container, so a panel can be dropped into any column width. And
 * nothing in here invents content: the only strings these components contain
 * are the ones passed in, and the one component that would need a student's
 * name (<Row>) has no prop for one.
 *
 * That second rule is also why the kit is the same in Japanese and English:
 * it has no words to translate. The caller picks its strings by locale
 * (lib/sample holds each in both languages) and passes them in. <Caption>
 * alone takes a `locale`, because how a caption's two halves are joined and
 * set is a matter of language even though its words are the caller's.
 */
export { Frame } from "./Frame";
export { Screen } from "./Screen";
export { Caption } from "./Caption";
export { Chip, Composer, Row, TextLine, ViewLabel } from "./parts";
