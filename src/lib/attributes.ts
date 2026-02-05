import { Transform } from "./transforms"
import { hslToRgb } from "./util/colorCalcs"
import { Point2D } from "./util/types"

/**
 * Fluent builder for SVG presentation attributes and inline styles.
 *
 * Supports fill, stroke, opacity, dash patterns, transforms, CSS classes, and IDs.
 * Methods return `this` for chaining. Use the {@link string} getter to serialise
 * the attributes for embedding in SVG markup.
 *
 * Also provides static factory methods ({@link stroked}, {@link filled}, {@link empty})
 * for common presets.
 *
 * @example
 * ```ts
 * new Attributes()
 *   .fill(200, 80, 50)
 *   .strokeWidth(0.01)
 *   .stroke(0, 0, 0)
 * ```
 */
export class Attributes {
  private attributes: { [key: string]: string | number } = {}
  private styleAttributes: { [key: string]: string | number } = {}

  /**
   * Sets the overall opacity of the element.
   *
   * @param opacity - Opacity value from `0` (transparent) to `1` (opaque)
   * @returns `this` for chaining
   */
  opacity(opacity: number): Attributes {
    this.styleAttributes["opacity"] = opacity
    return this
  }

  /**
   * Sets the fill colour using HSL values, rendered as a hex RGB string
   * for compatibility with Inkscape.
   *
   * @param hue - Hue from `0` to `360`
   * @param saturation - Saturation from `0` to `100`
   * @param lightness - Lightness from `0` to `100`
   * @param opacity - Optional fill opacity from `0` to `1`
   * @returns `this` for chaining
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
   * Removes the fill (sets it to `"none"`).
   *
   * @returns `this` for chaining
   */
  noFill(): Attributes {
    this.styleAttributes["fill"] = "none"
    return this
  }

  /**
   * Sets the fill opacity independently of the fill colour.
   *
   * @param opacity - Opacity value from `0` to `1`
   * @returns `this` for chaining
   */
  fillOpacity(opacity: number): Attributes {
    this.styleAttributes["fill-opacity"] = opacity
    return this
  }

  /**
   * Sets the fill colour using the OkLCH colour space.
   *
   * OkLCH provides perceptually uniform colour manipulation. Note that this may not
   * be supported in all SVG renderers (e.g. older Inkscape versions), but works in modern browsers.
   *
   * @param lightness - Perceptual lightness (typically `0` to `1`)
   * @param chroma - Colour intensity (typically `0` to `0.4`)
   * @param hue - Hue angle in degrees (`0` to `360`)
   * @param alpha - Opacity from `0` to `1`
   * @returns `this` for chaining
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
   * Sets the stroke colour using HSL values, rendered as a hex RGB string
   * for compatibility with Inkscape.
   *
   * @param hue - Hue from `0` to `360`
   * @param saturation - Saturation from `0` to `100`
   * @param lightness - Lightness from `0` to `100`
   * @param alpha - Optional stroke opacity from `0` to `1`
   * @returns `this` for chaining
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
   * Sets the stroke colour using the OkLCH colour space.
   *
   * @param lightness - Perceptual lightness (typically `0` to `1`)
   * @param chroma - Colour intensity (typically `0` to `0.4`)
   * @param hue - Hue angle in degrees (`0` to `360`)
   * @param alpha - Stroke opacity from `0` to `1`
   * @returns `this` for chaining
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
   * Sets the stroke opacity independently of the stroke colour.
   *
   * @param opacity - Opacity value from `0` to `1`
   * @returns `this` for chaining
   */
  strokeOpacity(opacity: number): Attributes {
    this.styleAttributes["stroke-opacity"] = opacity
    return this
  }

  /**
   * Sets the stroke width.
   *
   * Note: When using the default `0`-to-`1` viewBox, values like `0.005` are typical.
   *
   * @param width - The stroke width in viewBox units
   * @returns `this` for chaining
   */
  strokeWidth(width: number): Attributes {
    this.styleAttributes["stroke-width"] = width
    return this
  }

  /**
   * Sets the stroke line cap style.
   *
   * @param cap - The line cap: `"butt"`, `"round"`, or `"square"`
   * @returns `this` for chaining
   */
  lineCap(cap: "butt" | "round" | "square"): Attributes {
    this.styleAttributes["stroke-linecap"] = cap
    return this
  }

  /**
   * Sets the stroke line join style.
   *
   * @param join - The line join: `"arcs"`, `"bevel"`, `"miter"`, `"miter-clip"`, or `"round"`
   * @returns `this` for chaining
   */
  lineJoin(
    join: "arcs" | "bevel" | "miter" | "miter-clip" | "round"
  ): Attributes {
    this.styleAttributes["stroke-linejoin"] = join
    return this
  }

  /**
   * Sets the miter limit for stroke line joins.
   *
   * @param limit - The miter limit ratio
   * @returns `this` for chaining
   */
  miterLimit(limit: number): Attributes {
    this.styleAttributes["stroke-miterlimit"] = limit
    return this
  }

  /**
   * Sets the stroke dash pattern.
   *
   * @param dashes - Alternating dash and gap lengths in viewBox units
   * @returns `this` for chaining
   */
  dashArray(...dashes: number[]): Attributes {
    this.styleAttributes["stroke-dasharray"] = dashes.join(" ")
    return this
  }

  /**
   * Sets the stroke dash offset.
   *
   * @param offset - The offset into the dash pattern
   * @returns `this` for chaining
   */
  dashOffset(offset: number) {
    this.styleAttributes["stroke-dashoffset"] = offset
    return this
  }

  /**
   * Sets a CSS class name on the element.
   *
   * @param name - The class name
   * @returns `this` for chaining
   */
  class(name: string): Attributes {
    this.attributes["class"] = name
    return this
  }

  /**
   * Sets the element ID.
   *
   * @param name - The ID string
   * @returns `this` for chaining
   */
  id(name: string): Attributes {
    this.attributes["id"] = name
    return this
  }

  /**
   * Applies SVG transformations to the element.
   *
   * @param transformations - A {@link Transform} instance describing the transformations
   * @returns `this` for chaining
   */
  transform(transformations: Transform): Attributes {
    this.attributes["transform"] = transformations.string
    return this
  }

  /**
   * Sets the transform origin for the element.
   *
   * @param location - A {@link Point2D} or the string `"center"`
   * @returns `this` for chaining
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
   * Creates a deep copy of this Attributes instance.
   *
   * @returns A new {@link Attributes} with the same values
   */
  clone(): Attributes {
    const newAttr = new Attributes()
    newAttr.attributes = { ...this.attributes }
    newAttr.styleAttributes = { ...this.styleAttributes }
    return newAttr
  }

  /**
   * Serialises all attributes and inline styles into an SVG attribute string.
   *
   * Returns a leading space followed by the attributes if any are set,
   * or an empty string if no attributes have been configured.
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
   * Creates an {@link Attributes} preset for stroked paths with no fill.
   *
   * Defaults: no fill, stroke width `0.005`, black stroke.
   */
  static get stroked(): Attributes {
    return new Attributes().noFill().strokeWidth(0.005).stroke(0, 0, 0)
  }

  /**
   * Creates an {@link Attributes} preset with a black fill.
   *
   * Useful when the rendering context (e.g. Inkscape) does not apply a default fill.
   */
  static get filled(): Attributes {
    return new Attributes().fill(0, 0, 0)
  }

  /**
   * Creates an {@link Attributes} instance with only a transform applied.
   *
   * @param transformations - The {@link Transform} to apply
   * @returns A new {@link Attributes} with the given transform
   */
  static transform(transformations: Transform): Attributes {
    return new Attributes().transform(transformations)
  }

  /**
   * Creates an {@link Attributes} instance from a {@link Transform.of} specification.
   *
   * @param transformSpec - Arguments forwarded to {@link Transform.of}
   * @returns A new {@link Attributes} with the resulting transform
   *
   * @deprecated Use `new Attributes().transform(new Transform().translate(...))` instead
   */
  static transformOf(
    ...transformSpec: Parameters<typeof Transform.of>
  ): Attributes {
    return new Attributes().transform(Transform.of(...transformSpec))
  }

  /**
   * Creates an {@link Attributes} instance from a plain configuration object.
   *
   * Provides an alternative to the fluent API for cases where an object literal is more convenient.
   *
   * @param config - An object of attribute values
   *
   * @deprecated Use the fluent API via `new Attributes()` (accessible as `s.A`) instead
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
   * Creates an empty {@link Attributes} instance with no attributes set.
   */
  static get empty() {
    return new Attributes()
  }
}
