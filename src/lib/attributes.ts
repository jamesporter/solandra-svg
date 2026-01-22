import { Transform } from "./transforms"
import { hslToRgb } from "./util/colorCalcs"
import { Point2D } from "./util/types"

/**
 * Manages SVG element attributes and styling with a fluent API.
 *
 * Supports all common SVG attributes including:
 * - Fill and stroke colors (HSL and OkLCH color spaces)
 * - Opacity (fill, stroke, and overall)
 * - Stroke properties (width, line cap, line join, miter limit, dash patterns)
 * - Transformations
 * - Class and ID attributes
 *
 * Provides static factory methods for common attribute combinations.
 *
 * @example
 * ```typescript
 * const attrs = new Attributes()
 *   .fill(180, 50, 50)
 *   .strokeWidth(0.01)
 *   .opacity(0.8);
 * ```
 */
export class Attributes {
  private attributes: { [key: string]: string | number } = {}
  private styleAttributes: { [key: string]: string | number } = {}

  /**
   * Sets the overall opacity of the element
   * @param opacity - Opacity value from 0 (transparent) to 1 (opaque)
   * @returns This Attributes instance for method chaining
   */
  opacity(opacity: number): Attributes {
    this.styleAttributes["opacity"] = opacity
    return this
  }

  /**
   * Sets the fill color using HSL color space
   * @param hue - Hue angle from 0 to 360 degrees
   * @param saturation - Saturation from 0 to 100
   * @param lightness - Lightness from 0 to 100
   * @param opacity - Optional fill opacity from 0 to 1
   * @returns This Attributes instance for method chaining
   * @note Rendered as hex color for Inkscape compatibility
   */
  fill(
    hue: number,
    saturation: number,
    lightness: number,
    opacity?: number
  ): Attributes {
    this.styleAttributes["fill"] = hslToRgb(
      hue / 360,
      saturation / 100,
      lightness / 100
    )
    if (opacity !== undefined) this.styleAttributes["fill-opacity"] = opacity
    return this
  }

  /**
   * Removes the fill (sets fill to none)
   * @returns This Attributes instance for method chaining
   */
  noFill(): Attributes {
    this.styleAttributes["fill"] = "none"
    return this
  }

  /**
   * Sets the fill opacity independently of the fill color
   * @param opacity - Fill opacity from 0 (transparent) to 1 (opaque)
   * @returns This Attributes instance for method chaining
   */
  fillOpacity(opacity: number): Attributes {
    this.styleAttributes["fill-opacity"] = opacity
    return this
  }

  /**
   * Use OkLCH colour space
   *
   * NB this is not as widely supported as other approaches but for modern browser use should be fine
   *
   * @param lightness
   * @param chroma
   * @param hue
   * @param opacity
   * @returns
   */
  fillOklch(
    lightness: number,
    chroma: number,
    hue: number,
    alpha: number
  ): Attributes {
    this.styleAttributes["fill"] = `oklch(${lightness} ${chroma} ${hue}${
      typeof alpha === "number" ? ` / ${alpha * 100}%` : ""
    })`
    return this
  }

  /**
   * Sets the stroke (outline) color using HSL color space
   * @param hue - Hue angle from 0 to 360 degrees
   * @param saturation - Saturation from 0 to 100
   * @param lightness - Lightness from 0 to 100
   * @param alpha - Optional stroke opacity from 0 to 1
   * @returns This Attributes instance for method chaining
   * @note Rendered as hex color for Inkscape compatibility
   */
  stroke(
    hue: number,
    saturation: number,
    lightness: number,
    alpha?: number
  ): Attributes {
    this.styleAttributes["stroke"] = hslToRgb(
      hue / 360,
      saturation / 100,
      lightness / 100
    )
    if (alpha !== undefined) this.styleAttributes["stroke-opacity"] = alpha
    return this
  }

  /**
   * Sets the stroke color using OkLCH color space
   * @param lightness - Lightness value
   * @param chroma - Chroma (colorfulness) value
   * @param hue - Hue angle
   * @param alpha - Opacity from 0 to 1
   * @returns This Attributes instance for method chaining
   * @note OkLCH is not as widely supported but works in modern browsers
   */
  strokeOklch(
    lightness: number,
    chroma: number,
    hue: number,
    alpha: number
  ): Attributes {
    this.styleAttributes["stroke"] = `oklch(${lightness} ${chroma} ${hue})`

    if (typeof alpha === "number")
      this.styleAttributes["stroke-opacity"] = alpha

    return this
  }

  /**
   * Sets the stroke opacity independently of the stroke color
   * @param opacity - Stroke opacity from 0 (transparent) to 1 (opaque)
   * @returns This Attributes instance for method chaining
   */
  strokeOpacity(opacity: number): Attributes {
    this.styleAttributes["stroke-opacity"] = opacity
    return this
  }

  /**
   * Sets the width of the stroke
   * @param width - Stroke width in normalized coordinates (use small values like 0.005 for typical use)
   * @returns This Attributes instance for method chaining
   */
  strokeWidth(width: number): Attributes {
    this.styleAttributes["stroke-width"] = width
    return this
  }

  /**
   * Sets the style of line endings
   * @param cap - Line cap style: "butt" (default), "round", or "square"
   * @returns This Attributes instance for method chaining
   */
  lineCap(cap: "butt" | "round" | "square"): Attributes {
    this.styleAttributes["stroke-linecap"] = cap
    return this
  }

  /**
   * Sets the style of line joins
   * @param join - Line join style: "arcs", "bevel", "miter" (default), "miter-clip", or "round"
   * @returns This Attributes instance for method chaining
   */
  lineJoin(
    join: "arcs" | "bevel" | "miter" | "miter-clip" | "round"
  ): Attributes {
    this.styleAttributes["stroke-linejoin"] = join
    return this
  }

  /**
   * Sets the miter limit ratio for miter line joins
   * @param limit - Miter limit value (default is usually 4)
   * @returns This Attributes instance for method chaining
   */
  miterLimit(limit: number): Attributes {
    this.styleAttributes["stroke-miterlimit"] = limit
    return this
  }

  /**
   * Sets the dash pattern for the stroke
   * @param dashes - Sequence of dash and gap lengths (in viewBox dimensions)
   * @returns This Attributes instance for method chaining
   * @example
   * ```typescript
   * attr.dashArray(0.01, 0.02) // Creates a dashed line
   * ```
   */
  dashArray(...dashes: number[]): Attributes {
    this.styleAttributes["stroke-dasharray"] = dashes.join(" ")
    return this
  }

  /**
   * Sets the offset for the dash pattern
   * @param offset - Dash offset value
   * @returns This Attributes instance for method chaining
   */
  dashOffset(offset: number) {
    this.styleAttributes["stroke-dashoffset"] = offset
    return this
  }

  /**
   * Sets the CSS class attribute
   * @param name - Class name to apply
   * @returns This Attributes instance for method chaining
   */
  class(name: string): Attributes {
    this.attributes["class"] = name
    return this
  }

  /**
   * Sets the element ID attribute
   * @param name - ID to assign to the element
   * @returns This Attributes instance for method chaining
   */
  id(name: string): Attributes {
    this.attributes["id"] = name
    return this
  }

  /**
   * Applies transformations to the element
   * @param transformations - Transform instance with one or more transformations
   * @returns This Attributes instance for method chaining
   */
  transform(transformations: Transform): Attributes {
    this.attributes["transform"] = transformations.string
    return this
  }

  /**
   * Sets the origin point for transformations
   * @param location - Either "center" or a Point2D [x, y] position
   * @returns This Attributes instance for method chaining
   */
  transformOrigin(location: Point2D | "center"): Attributes {
    if (typeof location === "string") {
      this.attributes["transform-origin"] = location
    } else {
      this.attributes["transform-origin"] = `${location[0]} ${location[1]}`
    }
    return this
  }

  /**
   * Creates a deep copy of this Attributes instance
   * @returns A new Attributes instance with the same properties
   */
  clone(): Attributes {
    const newAttr = new Attributes()
    newAttr.attributes = { ...this.attributes }
    newAttr.styleAttributes = { ...this.styleAttributes }
    return newAttr
  }

  /**
   * Adds leading whitespace if non empty as this is tedious elsewhere
   */
  get string(): string {
    const styleAttributeEntries = Object.entries(this.styleAttributes)
    // don't want unnecessary spaces if either or both are missing
    let attrString = [
      Object.entries(this.attributes)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" "),
      styleAttributeEntries.length > 0
        ? `style="${styleAttributeEntries
            .map(([k, v]) => `${k}:${v};`)
            .join(" ")}"`
        : "",
    ]
      .filter((item) => item.length > 0)
      .join(" ")

    if (attrString.length > 0) attrString = " " + attrString
    return attrString
  }

  /**
   * Creates attributes preset for stroked (outlined) shapes with no fill
   * @returns Attributes with black stroke, 0.005 width, and no fill
   */
  static get stroked(): Attributes {
    return new Attributes().noFill().strokeWidth(0.005).stroke(0, 0, 0)
  }

  /**
   * Creates attributes preset for filled shapes
   * @returns Attributes with black fill
   * @note Useful for Inkscape compatibility (browsers fill by default, Inkscape doesn't)
   */
  static get filled(): Attributes {
    return new Attributes().fill(0, 0, 0)
  }

  /**
   * Creates attributes with only transformations applied
   * @param transformations - Transform instance to apply
   * @returns New Attributes instance with the specified transformations
   */
  static transform(transformations: Transform): Attributes {
    return new Attributes().transform(transformations)
  }

  /**
   * For when your attributes are only transformations (or you want to start there)
   * @param transformSpec
   *
   * @deprecated Don't think this is needed
   */
  static transformOf(
    ...transformSpec: Parameters<typeof Transform.of>
  ): Attributes {
    return new Attributes().transform(Transform.of(...transformSpec))
  }

  /**
   * Offer a object based API too. Don't get the fluent API but in many cases easier, plus more like Solandra
   * @param an object of attributribues
   *
   * @deprecated Plan to drop this as new s.A is consistent with other things and about as concise/better completion support
   */
  static of({
    fill,
    fillOKLCH,
    fillOpacity,
    opacity,
    stroke,
    dashArray,
    dashOffset,
    lineCap,
    lineJoin,
    miterLimit,
    strokeOpacity,
    strokeWidth,
    transform,
    transformOrigin,
    class: className,
    id,
  }: {
    fill?: { h: number; s: number; l: number; a?: number }
    fillOKLCH?: {
      l: number
      c: number
      h: number
      a: number
    }
    fillOpacity?: number
    opacity?: number
    stroke?: { h: number; s: number; l: number; a?: number }
    dashArray?: number[]
    dashOffset?: number
    lineCap?: "butt" | "round" | "square"
    lineJoin?: "arcs" | "bevel" | "miter" | "miter-clip" | "round"
    miterLimit?: number
    strokeOpacity?: number
    strokeWidth?: number
    transform?: Transform
    class?: string
    id?: string
    transformOrigin?: Point2D | "center"
  }): Attributes {
    const attr = new Attributes()

    if (fill !== undefined) {
      const { h, s, l, a } = fill
      attr.fill(h, s, l, a)
    }

    if (fillOKLCH !== undefined) {
      const { l, c, h, a } = fillOKLCH
      attr.fillOklch(l, c, h, a)
    }

    if (stroke !== undefined) {
      const { h, s, l, a } = stroke
      attr.stroke(h, s, l, a)
    }

    if (fillOpacity !== undefined) {
      attr.fillOpacity(fillOpacity)
    }

    if (opacity !== undefined) {
      attr.opacity(opacity)
    }

    if (dashArray !== undefined) {
      attr.dashArray(...dashArray)
    }

    if (dashOffset !== undefined) {
      attr.dashOffset(dashOffset)
    }

    if (lineCap !== undefined) {
      attr.lineCap(lineCap)
    }

    if (lineJoin !== undefined) {
      attr.lineJoin(lineJoin)
    }

    if (miterLimit !== undefined) {
      attr.miterLimit(miterLimit)
    }

    if (strokeOpacity !== undefined) {
      attr.strokeOpacity(strokeOpacity)
    }

    if (strokeWidth !== undefined) {
      attr.strokeWidth(strokeWidth)
    }

    if (transform !== undefined) {
      attr.transform(transform)
    }

    if (transformOrigin !== undefined) {
      attr.transformOrigin(transformOrigin)
    }

    if (className !== undefined) {
      attr.class(className)
    }

    if (id !== undefined) {
      attr.id(id)
    }

    return attr
  }

  /**
   * Creates an empty Attributes instance with no properties set
   * @returns A new empty Attributes instance
   */
  static get empty() {
    return new Attributes()
  }
}
