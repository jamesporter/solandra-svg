import { Point2D, Vector2D } from "./util/types"
import { Path } from "./path"
import { Attributes } from "./attributes"
import { indent } from "./util/internalUtil"
import { RNG } from "./rng"
import { Transform } from "./transforms"

export class Group {
  children: (Group | Path)[] = []
  constructor(readonly attributes: Attributes) {}

  strings(depth: number): string[] {
    return [
      indent(`<g${this.attributes.string}>`, depth),
      ...this.children.flatMap((el) => {
        if (el instanceof Group) {
          return el.strings(depth + 1)
        } else {
          return el.string(depth + 1)
        }
      }),
      indent(`</g>`, depth),
    ]
  }

  push(element: Group | Path) {
    this.children.push(element)
  }
}

export class SolandraSvg {
  readonly aspectRatio: number
  private rng: RNG
  elements: (Group | Path)[] = []
  // Basically track current group for paths to be added to, null = no group/top level scope
  private currentGroup: Group | null = null

  constructor(readonly width: number, readonly height: number, seed?: number) {
    this.aspectRatio = width / height
    this.rng = new RNG(seed)
  }

  get image(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 ${
      1 / this.aspectRatio
    }" width="${this.width}" height="${this.height}">
${this.elements
  .flatMap((el) => {
    if (el instanceof Group) {
      return el.strings(1)
    } else {
      return el.string(1)
    }
  })
  .join("\n")}
</svg>`
  }

  imageSrc(encode: boolean = true): string {
    return `data:image/svg+xml;utf8,${
      encode ? encodeURIComponent(this.image) : this.image.replace(/\#/g, "%23")
    }`
  }

  get UNSTABLE_imageInkscapeReady(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 ${
      1 / this.aspectRatio
    }" width="${this.width}mm" height="${this.height}mm">
${this.elements
  .flatMap((el) => {
    if (el instanceof Group) {
      return el.strings(1)
    } else {
      return el.string(1)
    }
  })
  .join("\n")}    
</svg>`
  }

  UNSTABLE_imageSrcInkscapeReady(encode: boolean = true): string {
    return `data:image/svg+xml;utf8,${
      encode
        ? encodeURIComponent(this.UNSTABLE_imageInkscapeReady)
        : this.UNSTABLE_imageInkscapeReady.replace(/\#/g, "%23")
    }`
  }

  group(attributes: Attributes, contents: () => void) {
    const parent = this.currentGroup
    const newGroup = new Group(attributes)
    this.currentElements.push(newGroup)
    this.currentGroup = newGroup
    contents()
    this.currentGroup = parent
  }

  groupWithId(id: string, contents: () => void) {
    this.group(new Attributes().id(id), contents)
  }

  get currentElements(): Group | (Group | Path)[] {
    if (this.currentGroup) {
      return this.currentGroup
    } else {
      return this.elements
    }
  }

  path(attributes: Attributes = new Attributes()): Path {
    const path = new Path(attributes)
    this.currentElements.push(path)
    return path
  }

  strokedPath(configureAttributes?: (attributes: Attributes) => void): Path {
    const attr = Attributes.stroked
      .stroke(0, 0, 0)
      .strokeWidth(0.005)
      .strokeOpacity(1)
      .lineCap("round")
    configureAttributes?.(attr)
    const path = new Path(attr)
    this.currentElements.push(path)
    return path
  }

  clonePath(path: Path, attributes?: Attributes): Path {
    const newPath = path.clone(attributes)
    this.currentElements.push(newPath)
    return newPath
  }

  /**
   * @returns Simple preset path for cut and fold designs; optionally provide a function to further configure the attributes
   */
  cutPath(configureAttributes?: (attributes: Attributes) => void) {
    return this.strokedPath((a) => {
      a.lineCap("round").lineJoin("round").stroke(0, 0, 60).strokeWidth(0.005)
      configureAttributes?.(a)
    })
  }

  /**
   * @returns Simple preset path for cut and fold designs; optionally provide a function to further configure the attributes
   */
  creasePath(configureAttributes?: (attributes: Attributes) => void) {
    return this.strokedPath((a) => {
      a.lineCap("round").lineJoin("round").stroke(0, 0, 90).strokeWidth(0.005)
      configureAttributes?.(a)
    })
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                                                              //
  //     Literally copied from Solandra... should probably figure out decent way to share(!)      //
  //                                                                                              //
  //////////////////////////////////////////////////////////////////////////////////////////////////

  forMargin = (
    margin: number,
    callback: (
      point: Point2D,
      delta: Vector2D,
      center: Point2D,
      i: number
    ) => void
  ) => this.forTiling({ n: 1, margin }, callback)

  forTiling = (
    config: {
      n: number
      type?: "square" | "proportionate"
      margin?: number
      order?: "columnFirst" | "rowFirst"
    },
    callback: (
      point: Point2D,
      delta: Vector2D,
      center: Point2D,
      i: number
    ) => void
  ) => {
    let k = 0
    const {
      n,
      type = "proportionate",
      margin = 0,
      order = "columnFirst",
    } = config
    const nY = type === "square" ? Math.floor(n * (1 / this.aspectRatio)) : n
    const deltaX = (1 - margin * 2) / n

    const hY =
      type === "square" ? deltaX * nY : 1 / this.aspectRatio - 2 * margin
    const deltaY = hY / nY

    const sX = margin
    const sY = (1 / this.aspectRatio - hY) / 2

    if (order === "columnFirst") {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < nY; j++) {
          callback(
            [sX + i * deltaX, sY + j * deltaY],
            [deltaX, deltaY],
            [sX + i * deltaX + deltaX / 2, sY + j * deltaY + deltaY / 2],
            k
          )
          k++
        }
      }
    } else {
      for (let j = 0; j < nY; j++) {
        for (let i = 0; i < n; i++) {
          callback(
            [sX + i * deltaX, sY + j * deltaY],
            [deltaX, deltaY],
            [sX + i * deltaX + deltaX / 2, sY + j * deltaY + deltaY / 2],
            k
          )
          k++
        }
      }
    }
  }

  forHorizontal = (
    config: {
      n: number
      margin?: number
    },
    callback: (
      point: Point2D,
      delta: Vector2D,
      center: Point2D,
      i: number
    ) => void
  ) => {
    const { n, margin = 0 } = config

    const sX = margin
    const eX = 1 - margin
    const sY = margin
    const dY = 1 / this.aspectRatio - 2 * margin
    const dX = (eX - sX) / n

    for (let i = 0; i < n; i++) {
      callback(
        [sX + i * dX, sY],
        [dX, dY],
        [sX + i * dX + dX / 2, sY + dY / 2],
        i
      )
    }
  }

  forVertical = (
    config: {
      n: number
      margin?: number
    },
    callback: (
      point: Point2D,
      delta: Vector2D,
      center: Point2D,
      i: number
    ) => void
  ) => {
    const { n, margin = 0 } = config

    const sX = margin
    const eY = 1 / this.aspectRatio - margin
    const sY = margin
    const dX = 1 - 2 * margin
    const dY = (eY - sY) / n

    for (let i = 0; i < n; i++) {
      callback(
        [sX, sY + i * dY],
        [dX, dY],
        [sX + dX / 2, sY + i * dY + dY / 2],
        i
      )
    }
  }

  forGrid = (
    config: {
      minX: number
      maxX: number
      minY: number
      maxY: number
      order?: "columnFirst" | "rowFirst"
    },
    callback: (point: Point2D, i: number) => void
  ) => {
    let k = 0
    const { minX, maxX, minY, maxY, order = "columnFirst" } = config

    if (order === "columnFirst") {
      for (let i = minX; i <= maxX; i++) {
        for (let j = minY; j <= maxY; j++) {
          callback([i, j], k)
          k++
        }
      }
    } else {
      for (let j = minY; j <= maxY; j++) {
        for (let i = minX; i <= maxX; i++) {
          callback([i, j], k)
          k++
        }
      }
    }
  }

  /*
    Build something using other iteration utlities rather than drawing within callback

    I tried a  curried version with first argument so could compose with random order etc, but TypeScript wasn't figuring out types properly at use site. Would probably require explicit annotation so don't want that.
  */
  build = <C, T extends any[], U>(
    iterFn: (config: C, callback: (...args: T) => void) => void,
    config: C,
    cb: (...args: T) => U
  ): U[] => {
    const res: U[] = []
    iterFn(config, (...as: T) => {
      res.push(cb(...as))
    })
    return res
  }

  /*
    Take existing iteration function and apply in random order
  */
  withRandomOrder<C, T extends any[]>(
    iterFn: (config: C, callback: (...args: T) => void) => void,
    config: C,
    cb: (...args: T) => void
  ) {
    const args: T[] = []
    iterFn(config, (...as: T) => {
      args.push(as)
    })
    this.shuffle(args)

    for (let a of args) {
      cb(...a)
    }
  }

  doProportion(p: number, callback: () => void) {
    if (this.rng.number() < p) {
      callback()
    }
  }

  times(n: number, callback: (n: number) => void) {
    for (let i = 0; i < n; i++) {
      callback(i)
    }
  }

  downFrom(n: number, callback: (n: number) => void) {
    for (let i = n; i > 0; i--) {
      callback(i)
    }
  }

  aroundCircle = (
    config: {
      at?: Point2D
      r?: number
      n: number
    },
    callback: (point: Point2D, i: number) => void
  ) => {
    const { n, at: [cX, cY] = [0.5, 0.5 / this.aspectRatio], r = 0.25 } = config
    const da = (Math.PI * 2) / n

    let a = -Math.PI * 0.5
    for (let i = 0; i < n; i++) {
      callback([cX + r * Math.cos(a + da), cY + r * Math.sin(a + da)], i)
      a += da
    }
  }

  proportionately<T>(cases: [number, () => T][]): T {
    const total = cases.map((c) => c[0]).reduce((a, b) => a + b, 0)
    if (total <= 0) throw new Error("Must be positive total")
    let r = this.rng.number() * total

    for (let i = 0; i < cases.length; i++) {
      if (cases[i][0] > r) {
        return cases[i][1]()
      } else {
        r -= cases[i][0]
      }
    }
    //fallback *should never happen!*
    return cases[0][1]()
  }

  randomPoint(): Point2D {
    return [this.rng.number(), this.rng.number() / this.aspectRatio]
  }

  range(
    config: { from: number; to: number; n: number; inclusive?: boolean },
    callback: (n: number) => void
  ) {
    const { from = 0, to = 1, n, inclusive = true } = config

    const di = (to - from) / n
    const max = inclusive ? n : n - 1
    for (let i = 0; i <= max; i++) {
      callback(i * di + from)
    }
  }

  inDrawing = (point: Point2D): boolean => {
    const { left, right, top, bottom } = this.meta
    return (
      point[0] > left && point[0] < right && point[1] > top && point[1] < bottom
    )
  }

  // Randomness

  /**
   * A uniform random number betweeon 0 and 1
   */
  random = (): number => {
    return this.rng.number()
  }

  /**
   * A uniform random number betweeon 0 and 2π
   */
  randomAngle = (): number => {
    return this.rng.number() * Math.PI * 2
  }

  /**
   * A uniform random integer. Default lower bound is 0.
   * Upper bound can be inclusive (default) or exclusive
   */
  uniformRandomInt = (config: {
    from?: number
    to: number
    inclusive?: boolean
  }) => {
    const { to, from = 0, inclusive = true } = config
    const d = to - from + (inclusive ? 1 : 0)
    return from + Math.floor(this.random() * d)
  }

  /**
   * A random Point2D on a grid
   */
  uniformGridPoint = ({
    minX,
    maxX,
    minY,
    maxY,
  }: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  }): Point2D => {
    return [
      this.uniformRandomInt({ from: minX, to: maxX }),
      this.uniformRandomInt({ from: minY, to: maxY }),
    ]
  }

  /**
   * A coin toss with result either -1 or 1
   */
  randomPolarity = (): 1 | -1 => {
    return this.rng.number() > 0.5 ? 1 : -1
  }

  /**
   * Sample uniformly from an array
   */
  sample = <T>(from: T[]): T => {
    return from[Math.floor(this.rng.number() * from.length)]
  }

  /**
   * n uniform samples from an array
   */
  samples = <T>(n: number, from: T[]): T[] => {
    let res: T[] = []
    for (let i = 0; i < n; i++) {
      res.push(this.sample(from))
    }
    return res
  }

  /**
   * Shuffle an array
   */
  shuffle = <T>(items: T[]): T[] => {
    let currentIndex = items.length
    let temporaryValue: T
    let randomIndex = 0

    while (0 !== currentIndex) {
      randomIndex = Math.floor(this.rng.number() * currentIndex)
      currentIndex -= 1

      // And swap it with the current element.
      temporaryValue = items[currentIndex]
      items[currentIndex] = items[randomIndex]
      items[randomIndex] = temporaryValue
    }

    return items
  }

  /**
   * Perturb a point by a random amount (by default uniform random changes in
   * -0.05 to 0.05, optional magnitude scales this e.g. magnitude 1 is perturbations
   * of -0.5 to 0.5)
   */
  perturb = (config: { at: Point2D; magnitude?: number }): Point2D => {
    const {
      at: [x, y],
      magnitude = 0.1,
    } = config
    return [
      x + magnitude * (this.rng.number() - 0.5),
      y + magnitude * (this.rng.number() - 0.5),
    ]
  }

  /**
   * Gaussian random number, default mean 0, default standard deviation 1
   */
  gaussian = (config?: { mean?: number; sd?: number }): number => {
    const { mean = 0, sd = 1 } = config || {}
    const a = this.rng.number()
    const b = this.rng.number()
    const n = Math.sqrt(-2.0 * Math.log(a)) * Math.cos(2.0 * Math.PI * b)
    return mean + n * sd
  }

  /**
   * Poisson random number, lambda (the mean and variance) is only parameter
   */
  poisson = (lambda: number): number => {
    const limit = Math.exp(-lambda)
    let prod = this.rng.number()
    let n = 0
    while (prod >= limit) {
      n++
      prod *= this.rng.number()
    }
    return n
  }

  get meta() {
    return {
      top: 0,
      bottom: 1 / this.aspectRatio,
      right: 1,
      left: 0,
      aspectRatio: this.aspectRatio,
      center: [0.5, 0.5 / this.aspectRatio] as Point2D,
    }
  }

  get A(): Attributes {
    return new Attributes()
  }

  get T(): Transform {
    return new Transform()
  }
}
