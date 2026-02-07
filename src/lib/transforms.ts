import { Point2D } from "./util/types"

/**
 * Fluent builder for SVG transform attribute strings.
 *
 * Supports translate, scale, rotate, skewX, and skewY operations.
 * Methods return `this` for chaining, and the result is obtained via the {@link string} getter.
 *
 * Accessible as `s.T` on a {@link SolandraSvg} instance for convenience.
 *
 * @example
 * ```ts
 * new Transform()
 *   .translate([0.5, 0.5])
 *   .rotate(Math.PI / 4)
 *   .scale(2)
 * ```
 */
export class Transform {
  /** The accumulated list of SVG transform function strings. */
  transforms: string[] = []

  /**
   * Applies a translation by the given point.
   *
   * @param by - The translation offset as a {@link Point2D}
   * @returns `this` for chaining
   */
  translate(by: Point2D): Transform
  /**
   * Applies a translation by separate x and y values.
   *
   * @param x - The horizontal offset
   * @param y - The vertical offset
   * @returns `this` for chaining
   */
  translate(x: number, y: number): Transform
  translate(x: number | Point2D, y?: number): Transform {
    if (Array.isArray(x)) {
      this.transforms.push(`translate(${x[0]}, ${x[1]})`)
    } else {
      this.transforms.push(`translate(${x}, ${y})`)
    }
    return this
  }

  /**
   * Applies a scale transformation by the given point (independent x/y scaling).
   *
   * @param by - The scale factors as a {@link Point2D}
   * @returns `this` for chaining
   */
  scale(by: Point2D): Transform
  /**
   * Applies a uniform scale transformation.
   *
   * @param a - The uniform scale factor
   * @returns `this` for chaining
   */
  scale(a: number): Transform
  /**
   * Applies a non-uniform scale transformation.
   *
   * @param x - The horizontal scale factor
   * @param y - The vertical scale factor
   * @returns `this` for chaining
   */
  scale(x: number, y: number): Transform
  scale(x: number | Point2D, y?: number): Transform {
    if (Array.isArray(x)) {
      this.transforms.push(`scale(${x[0]}, ${x[1]})`)
    } else {
      this.transforms.push(`scale(${x}, ${y === undefined ? x : y})`)
    }
    return this
  }

  /**
   * Applies a rotation around the origin.
   *
   * @param angle - The rotation angle in radians
   * @returns `this` for chaining
   */
  rotate(angle: number): Transform
  /**
   * Applies a rotation around a specified center point.
   *
   * @param angle - The rotation angle in radians
   * @param x - The x coordinate of the rotation center
   * @param y - The y coordinate of the rotation center
   * @returns `this` for chaining
   */
  rotate(angle: number, x: number, y: number): Transform
  rotate(angle: number, x?: number, y?: number): Transform {
    let extra = ""
    if (x !== undefined && y !== undefined) {
      extra = `, ${x}, ${y}`
    }
    this.transforms.push(`rotate(${(180 * angle) / Math.PI}${extra})`)
    return this
  }

  /**
   * Applies a skew transformation along the x-axis.
   *
   * @param x - The skew angle in degrees
   * @returns `this` for chaining
   */
  skewX(x: number): Transform {
    this.transforms.push(`skewX(${x})`)
    return this
  }

  /**
   * Applies a skew transformation along the y-axis.
   *
   * @param y - The skew angle in degrees
   * @returns `this` for chaining
   */
  skewY(y: number): Transform {
    this.transforms.push(`skewY(${y})`)
    return this
  }

  /**
   * Serialises the accumulated transforms into an SVG `transform` attribute value.
   *
   * @returns A space-separated string of SVG transform functions
   */
  get string(): string {
    return this.transforms.join(" ")
  }

  /**
   * Creates a {@link Transform} from a plain configuration object.
   *
   * @param config - An object specifying the transforms to apply
   * @returns A new {@link Transform} with the specified operations
   *
   * @deprecated Use the fluent API via `new Transform()` (accessible as `s.T`) instead
   */
  static of({
    translate,
    scale,
    rotate,
    skewX,
    skewY,
  }: {
    translate?: [number, number]
    scale?: number | [number, number]
    rotate?: number | [number, [number, number]]
    skewX?: number
    skewY?: number
  }): Transform {
    const tr = new Transform()

    if (translate !== undefined) {
      tr.translate(translate)
    }
    if (scale !== undefined) {
      if (typeof scale === "object") {
        tr.scale(...scale)
      } else {
        tr.scale(scale)
      }
    }
    if (rotate !== undefined) {
      if (typeof rotate === "object") {
        tr.rotate(rotate[0], ...rotate[1])
      } else {
        tr.rotate(rotate)
      }
    }
    if (skewX !== undefined) {
      tr.skewX(skewX)
    }
    if (skewY !== undefined) {
      tr.skewY(skewY)
    }

    return tr
  }
}
