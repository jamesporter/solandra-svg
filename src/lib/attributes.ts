import { Transform } from "./transforms"
import { hslToRgb } from "./util/colorCalcs"

/**
Will support something like: 

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

  get string(): string {
    return (
      Object.entries(this.attributes)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ") +
      " " +
      `style="${Object.entries(this.styleAttributes)
        .map(([k, v]) => `${k}:${v};`)
        .join(" ")}"`
    )
  }

  static stroked(configure?: (attributes: Attributes) => void): Attributes {
    const attr = new Attributes().noFill().strokeWidth(0.005).stroke(0, 0, 0)
    configure?.(attr)
    return attr
  }

  // at the moment a bit pointless, maybe remove?
  static filled(configure?: (attributes: Attributes) => void): Attributes {
    const attr = new Attributes()
    configure?.(attr)
    return attr
  }
}
