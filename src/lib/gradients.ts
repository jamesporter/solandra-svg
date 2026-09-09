import { hslToRgb } from "./util/colorCalcs.js"
import { Point2D } from "./util/types.js"
import { escapeAttribute, indent } from "./util/internalUtil.js"

/**
 * How a gradient's coordinates are interpreted.
 *
 * - `"objectBoundingBox"` (default) - coordinates are fractions of the bounding
 *   box of the shape being painted, so one gradient fits every shape it paints.
 * - `"userSpaceOnUse"` - coordinates are in the drawing's own coordinate system.
 */
export type GradientUnits = "objectBoundingBox" | "userSpaceOnUse"

/** A single colour stop along a gradient. */
export type GradientStop = {
  /** Position along the gradient, from `0` (start) to `1` (end). */
  offset: number
  /** The stop colour, as an RGB hex string. */
  color: string
  /** Optional opacity at this stop, from `0` to `1`. */
  opacity?: number
}

/**
 * Shared behaviour of the SVG gradients that can be defined on a drawing.
 *
 * Gradients are created via {@link SolandraSvg.linearGradient} and
 * {@link SolandraSvg.radialGradient}, given colour stops with {@link stop}, and
 * referenced from an element with {@link Attributes.fillGradient} or
 * {@link Attributes.strokeGradient}.
 */
export abstract class Gradient {
  /** The colour stops, in the order they were added. */
  readonly stops: GradientStop[] = []

  /**
   * @param id - The `id` used to reference this gradient
   */
  constructor(readonly id: string) {}

  /**
   * Adds a colour stop, using the same HSL arguments as
   * {@link Attributes.fill}.
   *
   * @param offset - Position along the gradient, from `0` to `1`
   * @param hue - Hue from `0` to `360`
   * @param saturation - Saturation from `0` to `100`
   * @param lightness - Lightness from `0` to `100`
   * @param opacity - Optional opacity at this stop, from `0` to `1`
   * @returns `this` for chaining
   */
  stop(
    offset: number,
    hue: number,
    saturation: number,
    lightness: number,
    opacity?: number,
  ): this {
    this.stops.push({
      offset,
      color: hslToRgb(hue / 360, saturation / 100, lightness / 100),
      opacity,
    })
    return this
  }

  /** The SVG element name for this kind of gradient. @internal */
  protected abstract get tag(): string

  /** The geometry attributes specific to this kind of gradient. @internal */
  protected abstract get geometry(): Record<string, string | number>

  /**
   * Serialises this gradient to SVG markup lines (for the drawing's `<defs>`).
   *
   * @param depth - The indentation depth for pretty-printing
   * @returns An array of indented SVG markup lines
   * @internal
   */
  strings(depth: number): string[] {
    const attributes = Object.entries({ id: this.id, ...this.geometry })
      .map(([k, value]) => `${k}="${escapeAttribute(value)}"`)
      .join(" ")

    return [
      indent(`<${this.tag} ${attributes}>`, depth),
      ...this.stops.map(({ offset, color, opacity }) =>
        indent(
          `<stop offset="${offset}" style="stop-color:${color};${
            opacity !== undefined ? ` stop-opacity:${opacity};` : ""
          }" />`,
          depth + 1,
        ),
      ),
      indent(`</${this.tag}>`, depth),
    ]
  }
}

/**
 * A linear gradient running between two points.
 *
 * Created via {@link SolandraSvg.linearGradient}.
 */
export class LinearGradient extends Gradient {
  private readonly from: Point2D
  private readonly to: Point2D
  private readonly units: GradientUnits

  /**
   * @param id - The `id` used to reference this gradient
   * @param config - Optional geometry
   * @param config.from - Where the gradient starts (default `[0, 0]`)
   * @param config.to - Where the gradient ends (default `[1, 0]`, i.e. left to right)
   * @param config.units - How the coordinates are interpreted (default `"objectBoundingBox"`)
   */
  constructor(
    id: string,
    config: {
      from?: Point2D
      to?: Point2D
      units?: GradientUnits
    } = {},
  ) {
    super(id)
    const { from = [0, 0], to = [1, 0], units = "objectBoundingBox" } = config
    this.from = from
    this.to = to
    this.units = units
  }

  protected get tag(): string {
    return "linearGradient"
  }

  protected get geometry(): Record<string, string | number> {
    return {
      x1: this.from[0],
      y1: this.from[1],
      x2: this.to[0],
      y2: this.to[1],
      gradientUnits: this.units,
    }
  }
}

/**
 * A radial gradient spreading out from a centre point.
 *
 * Created via {@link SolandraSvg.radialGradient}.
 */
export class RadialGradient extends Gradient {
  private readonly at: Point2D
  private readonly r: number
  private readonly focus?: Point2D
  private readonly units: GradientUnits

  /**
   * @param id - The `id` used to reference this gradient
   * @param config - Optional geometry
   * @param config.at - The centre of the gradient (default `[0.5, 0.5]`)
   * @param config.r - The radius of the gradient (default `0.5`)
   * @param config.focus - Optional focal point, which offsets the highlight from the centre
   * @param config.units - How the coordinates are interpreted (default `"objectBoundingBox"`)
   */
  constructor(
    id: string,
    config: {
      at?: Point2D
      r?: number
      focus?: Point2D
      units?: GradientUnits
    } = {},
  ) {
    super(id)
    const {
      at = [0.5, 0.5],
      r = 0.5,
      focus,
      units = "objectBoundingBox",
    } = config
    this.at = at
    this.r = r
    this.focus = focus
    this.units = units
  }

  protected get tag(): string {
    return "radialGradient"
  }

  protected get geometry(): Record<string, string | number> {
    return {
      cx: this.at[0],
      cy: this.at[1],
      r: this.r,
      ...(this.focus ? { fx: this.focus[0], fy: this.focus[1] } : {}),
      gradientUnits: this.units,
    }
  }
}
