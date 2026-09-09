import { Attributes } from "./attributes.js"
import { Point2D } from "./util/types.js"
import { escapeText, indent } from "./util/internalUtil.js"

/**
 * An SVG `<text>` element: a run of text anchored at a point.
 *
 * Created via {@link SolandraSvg.text}. Typography is set through the same
 * {@link Attributes} builder as everything else, via {@link Attributes.fontSize},
 * {@link Attributes.fontFamily}, {@link Attributes.textAnchor} and friends.
 *
 * @example
 * ```ts
 * s.text("solandra", s.meta.center, s.A.fontSize(0.1).textAnchor("middle"))
 * ```
 */
export class Text {
  /**
   * @param content - The text to render (escaped when serialised)
   * @param at - The anchor position of the text
   * @param attributes - The {@link Attributes} applied to this `<text>` element
   */
  constructor(
    public content: string,
    readonly at: Point2D,
    readonly attributes: Attributes,
  ) {}

  /**
   * Serialises this text run to an SVG `<text>` element string.
   *
   * @param depth - The indentation depth for pretty-printing
   * @returns The SVG text element string
   */
  string(depth: number): string {
    const [x, y] = this.at
    return indent(
      `<text x="${x}" y="${y}"${this.attributes.string}>${escapeText(
        this.content,
      )}</text>`,
      depth,
    )
  }

  /**
   * Provides mutable access to this element's attributes via a callback.
   *
   * @param configureAttributes - A function that receives the {@link Attributes} instance to modify
   */
  configureAttributes(configureAttributes: (attributes: Attributes) => void) {
    configureAttributes(this.attributes)
  }

  /**
   * Creates a copy of this text element.
   *
   * Note: The clone is not automatically included in the drawing.
   *
   * @param attributes - Optional replacement attributes for the clone
   * @returns A new {@link Text} with the same content and position
   */
  clone(attributes?: Attributes): Text {
    return new Text(
      this.content,
      [...this.at],
      attributes || this.attributes.clone(),
    )
  }
}
