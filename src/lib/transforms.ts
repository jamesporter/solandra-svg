import { Point2D } from "./util/types"

/**
 * Manages SVG transformations with a fluent API.
 *
 * Allows chaining multiple transformations like translate, scale, rotate, and skew.
 * All transformations are applied in the order they are called.
 *
 * @example
 * ```typescript
 * svg.group(svg.A.transform(svg.T.translate(0.5, 0.5).rotate(Math.PI / 4)), () => {
 *   svg.path().circle([0, 0], 0.1);
 * });
 * ```
 */
export class Transform {
  transforms: string[] = []

  /**
   * Translates (moves) the element by a given offset
   * @param by - Point to translate by
   * @returns This transform for method chaining
   */
  translate(by: Point2D): Transform
  /**
   * Translates (moves) the element by x and y offsets
   * @param x - Horizontal offset
   * @param y - Vertical offset
   * @returns This transform for method chaining
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
   * Scales the element by different factors for x and y
   * @param by - Point with x and y scale factors
   * @returns This transform for method chaining
   */
  scale(by: Point2D): Transform
  /**
   * Scales the element uniformly in both dimensions
   * @param a - Scale factor for both x and y
   * @returns This transform for method chaining
   */
  scale(a: number): Transform
  /**
   * Scales the element by different factors for x and y
   * @param x - Horizontal scale factor
   * @param y - Vertical scale factor
   * @returns This transform for method chaining
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
   * Rotates the element around the origin
   * @param angle - Rotation angle in radians
   * @returns This transform for method chaining
   */
  rotate(angle: number): Transform
  /**
   * Rotates the element around a specific point
   * @param angle - Rotation angle in radians
   * @param x - X coordinate of rotation center
   * @param y - Y coordinate of rotation center
   * @returns This transform for method chaining
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
   * Skews the element along the x-axis
   * @param x - Skew angle in degrees
   * @returns This transform for method chaining
   */
  skewX(x: number): Transform {
    this.transforms.push(`skewX(${x})`)
    return this
  }

  /**
   * Skews the element along the y-axis
   * @param y - Skew angle in degrees
   * @returns This transform for method chaining
   */
  skewY(y: number): Transform {
    this.transforms.push(`skewY(${y})`)
    return this
  }

  /**
   * Gets the complete transform string for SVG
   * @returns Space-separated transform commands
   */
  get string(): string {
    return this.transforms.join(" ")
  }

  /**
   * @deprecated plan to remove this, can use s.T and will be comparably concise, more consistent and often better completions
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
      typeof scale === "object" ? tr.scale(...scale) : tr.scale(scale)
    }
    if (rotate !== undefined) {
      typeof rotate === "object"
        ? tr.rotate(rotate[0], ...rotate[1])
        : tr.rotate(rotate)
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
