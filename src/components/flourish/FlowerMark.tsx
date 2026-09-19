import { Flower } from "@/components/Flower";

/**
 * The mark that travels across the page, and the only place that decides what
 * that mark is.
 *
 * It exists as its own file so the drawing can be swapped for the real logo
 * flower — an <Image> or an inlined SVG of the brand asset — without touching
 * the scroll path in ScrollFlower. Everything the path needs is that the mark
 * fills its square box and takes its colour from the surrounding text colour.
 *
 * The size prop on <Flower> writes width and height attributes, which the
 * h-full/w-full utilities then override; the attributes only matter as the
 * aspect ratio the viewBox is drawn against. No transform is set here, because
 * ScrollFlower animates the transform of the box this sits in and two
 * transforms on one element would fight.
 */
export function FlowerMark() {
  return <Flower size={100} className="h-full w-full" />;
}
