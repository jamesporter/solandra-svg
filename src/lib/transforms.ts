/**
 * Simple class for svg transforms,
 * might expand/make safer?
 */
export class Transform {
  string = ""

  translate(x: number, y: number): Transform {
    this.string += ` translate(${x}, ${y})`
    return this
  }

  scale(x: number, y: number): Transform {
    this.string += ` scale(${x}, ${y})`
    return this
  }

  rotate(angle: number): Transform {
    this.string += ` rotate(${(180 * angle) / Math.PI})`
    return this
  }

  skewX(x: number): Transform {
    this.string += ` skewX(${x})`
    return this
  }

  skewY(y: number): Transform {
    this.string += ` skewY(${y})`
    return this
  }
}
