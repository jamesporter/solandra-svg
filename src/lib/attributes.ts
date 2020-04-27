import { Transform } from "./transforms"

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

  opacity(opacity: number): Attributes {
    this.attributes["opacity"] = opacity
    return this
  }

  fill(
    hue: number,
    saturation: number,
    lightness: number,
    opacity: number = 1.0
  ): Attributes {
    this.attributes[
      "fill"
    ] = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`
    return this
  }

  noFill(): Attributes {
    this.attributes["fill"] = "none"
    return this
  }

  fillOpacity(opacity: number): Attributes {
    this.attributes["fill-opacity"] = opacity
    return this
  }

  stroke(
    hue: number,
    saturation: number,
    lightness: number,
    opacity: number = 1.0
  ): Attributes {
    this.attributes[
      "stroke"
    ] = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`
    return this
  }

  strokeOpacity(opacity: number): Attributes {
    this.attributes["stroke-opacity"] = opacity
    return this
  }

  strokeWidth(width: number): Attributes {
    this.attributes["stroke-width"] = width
    return this
  }

  lineCap(cap: "butt" | "round" | "square"): Attributes {
    this.attributes["stroke-linecap"] = cap
    return this
  }

  lineJoin(
    join: "arcs" | "bevel" | "miter" | "miter-clip" | "round"
  ): Attributes {
    this.attributes["stroke-linejoin"] = join
    return this
  }

  miterLimit(limit: number): Attributes {
    this.attributes["stroke-miterlimit"] = limit
    return this
  }

  dashArray(...dashes: number[]): Attributes {
    this.attributes["stroke-dasharray"] = dashes.join(" ")
    return this
  }

  dashOffset(offset: number) {
    this.attributes["stroke-dashoffset"] = offset
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

  get string(): string {
    return Object.entries(this.attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ")
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
