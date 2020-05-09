import { Transform } from "./transforms"
import { hslToRgb } from "./util/colorCalcs"

/**
Supports (via fluent api)
  - [x] "fill"
  - [x] "fill-opacity" 
  - [x] "opacity"
  - [x] "stroke"
  - [x] "stroke-dasharray" a lot of these in viewBox dimensions
  - [x] "stroke-dashoffset"
  - [x] "stroke-linecap"
  - [x] "stroke-linejoin"
  - [x] "stroke-miterlimit"
  - [x] "stroke-opacity"
  - [x] "stroke-width" NB this has to be really low if going to work with 1 h dimensions?
  - [x] "transform"
  - [x] "class"
  - [x] "id"

  has a handful of static functions that provide reasonable defaults for common use
*/
export class Attributes {
  private attributes: { [key: string]: string | number } = {}
  private styleAttributes: { [key: string]: string | number } = {}

  opacity(opacity: number): Attributes {
    this.styleAttributes["opacity"] = opacity
    return this
  }

  /**  Colour is hue from 0 to 360, sat 0 to 100, lightnesss 0 to 100, opacity 0 to 1.0
       in render use hex for compatability with Inkscape(!)
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

  noFill(): Attributes {
    this.styleAttributes["fill"] = "none"
    return this
  }

  fillOpacity(opacity: number): Attributes {
    this.styleAttributes["fill-opacity"] = opacity
    return this
  }

  /**  Colour is hue from 0 to 360, sat 0 to 100, lightnesss 0 to 100, opacity 0 to 1.0
       in render use hex for compatability with Inkscape(!)
  */
  stroke(
    hue: number,
    saturation: number,
    lightness: number,
    opacity?: number
  ): Attributes {
    this.styleAttributes["stroke"] = hslToRgb(
      hue / 360,
      saturation / 100,
      lightness / 100
    )
    if (opacity !== undefined) this.styleAttributes["stroke-opacity"] = opacity
    return this
  }

  strokeOpacity(opacity: number): Attributes {
    this.styleAttributes["stroke-opacity"] = opacity
    return this
  }

  strokeWidth(width: number): Attributes {
    this.styleAttributes["stroke-width"] = width
    return this
  }

  lineCap(cap: "butt" | "round" | "square"): Attributes {
    this.styleAttributes["stroke-linecap"] = cap
    return this
  }

  lineJoin(
    join: "arcs" | "bevel" | "miter" | "miter-clip" | "round"
  ): Attributes {
    this.styleAttributes["stroke-linejoin"] = join
    return this
  }

  miterLimit(limit: number): Attributes {
    this.styleAttributes["stroke-miterlimit"] = limit
    return this
  }

  dashArray(...dashes: number[]): Attributes {
    this.styleAttributes["stroke-dasharray"] = dashes.join(" ")
    return this
  }

  dashOffset(offset: number) {
    this.styleAttributes["stroke-dashoffset"] = offset
    return this
  }

  class(name: string): Attributes {
    this.attributes["class"] = name
    return this
  }

  id(name: string): Attributes {
    this.attributes["id"] = name
    return this
  }

  transform(transformations: Transform): Attributes {
    this.attributes["transform"] = transformations.string
    return this
  }

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

  static get stroked(): Attributes {
    return new Attributes().noFill().strokeWidth(0.005).stroke(0, 0, 0)
  }

  // in browser will have fill by default, but not in e.g. Inkscape hence this might be useful
  static get filled(): Attributes {
    return new Attributes().fill(0, 0, 0)
  }

  static transform(transformations: Transform): Attributes {
    return new Attributes().transform(transformations)
  }

  /**
   * For when your attributes are only transformations (or you want to start there)
   * @param transformSpec
   */
  static transformOf(
    ...transformSpec: Parameters<typeof Transform.of>
  ): Attributes {
    return new Attributes().transform(Transform.of(...transformSpec))
  }

  /**
   * Offer a object based API too. Don't get the fluent API but in many cases easier, plus more like Solandra
   * @param an object of attributribues
   */
  static of({
    fill,
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
    class: className,
    id,
  }: {
    fill?: { h: number; s: number; l: number; a?: number }
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
  }): Attributes {
    const attr = new Attributes()

    if (fill !== undefined) {
      const { h, s, l, a } = fill
      attr.fill(h, s, l, a)
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

    if (className !== undefined) {
      attr.class(className)
    }

    if (id !== undefined) {
      attr.id(id)
    }

    return attr
  }

  static get empty() {
    return new Attributes()
  }
}
