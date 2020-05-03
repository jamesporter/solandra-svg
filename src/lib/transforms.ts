/**
 * Simple class for svg transforms,
 * might expand/make safer?
 */
export class Transform {
  transforms: string[] = []

  translate(x: number, y: number): Transform {
    this.transforms.push(`translate(${x}, ${y})`)
    return this
  }

  scale(x: number, y: number): Transform {
    this.transforms.push(`scale(${x}, ${y})`)
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
}
