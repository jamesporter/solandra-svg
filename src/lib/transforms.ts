import { Point2D } from "./util/types"

/**
 * Simple class for svg transforms,
 * might expand/make safer?
 */
export class Transform {
  transforms: string[] = []

  translate(by: Point2D): Transform
  translate(x: number, y: number): Transform
  translate(x: number | Point2D, y?: number): Transform {
    if (Array.isArray(x)) {
      this.transforms.push(`translate(${x[0]}, ${x[1]})`)
    } else {
      this.transforms.push(`translate(${x}, ${y})`)
    }
    return this
  }

  scale(by: Point2D): Transform
  scale(a: number): Transform
  scale(x: number, y: number): Transform
  scale(x: number | Point2D, y?: number): Transform {
    if (Array.isArray(x)) {
      this.transforms.push(`scale(${x[0]}, ${x[1]})`)
    } else {
      this.transforms.push(`scale(${x}, ${y === undefined ? x : y})`)
    }
    return this
  }

  rotate(angle: number): Transform
  rotate(angle: number, x: number, y: number): Transform
  rotate(angle: number, x?: number, y?: number): Transform {
    let extra = ""
    if (x !== undefined && y !== undefined) {
      extra = `, ${x}, ${y}`
    }
    this.transforms.push(`rotate(${(180 * angle) / Math.PI}${extra})`)
    return this
  }

  skewX(x: number): Transform {
    this.transforms.push(`skewX(${x})`)
    return this
  }

  skewY(y: number): Transform {
    this.transforms.push(`skewY(${y})`)
    return this
  }

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
