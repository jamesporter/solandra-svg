import { Point2D, Vector2D } from "./util/types"
import { Path } from "./path"
import { Attributes } from "./attributes"
import { indent } from "./util/internalUtil"
import { RNG } from "./rng"
import { Transform } from "./transforms"

/**
 * Represents an SVG group element (<g>) that can contain paths and nested groups.
 * Groups allow you to organize related elements and apply common attributes/transformations
 * to multiple elements at once.
 */
export class Group {
  children: (Group | Path)[] = []
  constructor(readonly attributes: Attributes) {}

  /**
   * Generates SVG string representation of the group and its children
   * @param depth - Indentation depth for formatting
   * @returns Array of strings representing the SVG group element
   */
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

  /**
   * Adds a path or nested group to this group
   * @param element - The Path or Group to add
   */
  push(element: Group | Path) {
    this.children.push(element)
  }
}

/**
 * Main entry point for creating SVG graphics with Solandra.
 *
 * SolandraSvg provides a fluent, declarative API for building SVG graphics programmatically.
 * It uses normalized coordinates (0 to 1 for x, 0 to 1/aspectRatio for y) which are automatically
 * scaled to the specified pixel dimensions.
 *
 * @example
 * ```typescript
 * const svg = new SolandraSvg(800, 600, 42); // width, height, optional random seed
 * svg.path().moveTo([0.1, 0.1]).lineTo([0.9, 0.9]);
 * console.log(svg.image); // Get SVG string
 * ```
 */
export class SolandraSvg {
  readonly aspectRatio: number
  private rng: RNG
  elements: (Group | Path)[] = []
  // Basically track current group for paths to be added to, null = no group/top level scope
  private currentGroup: Group | null = null

  /**
   * Creates a new SolandraSvg instance
   * @param width - Width in pixels
   * @param height - Height in pixels
   * @param seed - Optional random seed for deterministic randomness
   */
  constructor(readonly width: number, readonly height: number, seed?: number) {
    this.aspectRatio = width / height
    this.rng = new RNG(seed)
  }

  /**
   * Generates the complete SVG document as a string
   * @returns Complete SVG markup including all paths and groups
   */
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

  /**
   * Generates a data URI for the SVG that can be used in img src or CSS
   * @param encode - Whether to URL-encode the SVG (default: true). Set to false for better readability
   * @returns Data URI string suitable for use in img src attributes
   */
  imageSrc(encode: boolean = true): string {
    return `data:image/svg+xml;utf8,${
      encode ? encodeURIComponent(this.image) : this.image.replace(/\#/g, "%23")
    }`
  }

  /**
   * Generates SVG with millimeter units for better Inkscape compatibility
   * @unstable This API may change in future versions
   * @returns SVG markup with mm units instead of pixels
   */
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

  /**
   * Generates a data URI for Inkscape-compatible SVG
   * @unstable This API may change in future versions
   * @param encode - Whether to URL-encode the SVG (default: true)
   * @returns Data URI with Inkscape-ready SVG
   */
  UNSTABLE_imageSrcInkscapeReady(encode: boolean = true): string {
    return `data:image/svg+xml;utf8,${
      encode
        ? encodeURIComponent(this.UNSTABLE_imageInkscapeReady)
        : this.UNSTABLE_imageInkscapeReady.replace(/\#/g, "%23")
    }`
  }

  /**
   * Creates an SVG group to organize related elements and apply common transformations
   * @param attributes - Attributes to apply to the group (e.g., transforms, opacity)
   * @param contents - Callback function that creates the group's contents
   * @example
   * ```typescript
   * svg.group(svg.A.opacity(0.5), () => {
   *   svg.path().circle([0.5, 0.5], 0.2);
   *   svg.path().rect([0.3, 0.3], [0.4, 0.4]);
   * });
   * ```
   */
  group(attributes: Attributes, contents: () => void) {
    const parent = this.currentGroup
    const newGroup = new Group(attributes)
    this.currentElements.push(newGroup)
    this.currentGroup = newGroup
    contents()
    this.currentGroup = parent
  }

  /**
   * Creates an SVG group with a specific ID attribute
   * @param id - The ID to assign to the group
   * @param contents - Callback function that creates the group's contents
   */
  groupWithId(id: string, contents: () => void) {
    this.group(new Attributes().id(id), contents)
  }

  /**
   * Gets the current container for elements (either a group or the root elements array)
   * @returns The current group if inside a group() call, otherwise the root elements array
   */
  get currentElements(): Group | (Group | Path)[] {
    if (this.currentGroup) {
      return this.currentGroup
    } else {
      return this.elements
    }
  }

  /**
   * Creates a new path with the specified attributes
   * @param attributes - Styling attributes for the path (default: empty attributes)
   * @returns A new Path instance that can be drawn on
   * @example
   * ```typescript
   * svg.path(svg.A.fill(180, 50, 50)).circle([0.5, 0.5], 0.2);
   * ```
   */
  path(attributes: Attributes = new Attributes()): Path {
    const path = new Path(attributes)
    this.currentElements.push(path)
    return path
  }

  /**
   * Creates a path with preset stroke styling (black, 0.005 width, round caps)
   * @param configureAttributes - Optional callback to further customize the stroke attributes
   * @returns A new stroked Path instance
   * @example
   * ```typescript
   * svg.strokedPath(a => a.stroke(200, 50, 50)).lineTo([0.5, 0.5]);
   * ```
   */
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

  /**
   * Clones an existing path and adds it to the current container
   * @param path - The path to clone
   * @param attributes - Optional new attributes to apply (if omitted, uses original attributes)
   * @returns The cloned Path instance
   */
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

  /**
   * Executes a callback with a single centered tile with the specified margin
   * @param margin - Margin around the edges (in normalized coordinates)
   * @param callback - Function called with position, size, center, and index
   */
  forMargin = (
    margin: number,
    callback: (
      point: Point2D,
      delta: Vector2D,
      center: Point2D,
      i: number
    ) => void
  ) => this.forTiling({ n: 1, margin }, callback)

  /**
   * Iterates over a grid of tiles with configurable layout
   * @param config - Configuration object
   * @param config.n - Number of columns
   * @param config.type - "square" for square tiles or "proportionate" to fill the canvas (default: "proportionate")
   * @param config.margin - Margin around edges (default: 0)
   * @param config.order - "columnFirst" or "rowFirst" iteration order (default: "columnFirst")
   * @param callback - Function called for each tile with (position, size, center, index)
   * @example
   * ```typescript
   * svg.forTiling({ n: 5, margin: 0.1 }, (pos, size, center) => {
   *   svg.path().rect(pos, size);
   * });
   * ```
   */
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

  /**
   * Iterates over n horizontal tiles in a single row
   * @param config - Configuration object
   * @param config.n - Number of tiles
   * @param config.margin - Margin around edges (default: 0)
   * @param callback - Function called for each tile with (position, size, center, index)
   */
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

  /**
   * Iterates over n vertical tiles in a single column
   * @param config - Configuration object
   * @param config.n - Number of tiles
   * @param config.margin - Margin around edges (default: 0)
   * @param callback - Function called for each tile with (position, size, center, index)
   */
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

  /**
   * Iterates over integer grid coordinates within the specified bounds
   * @param config - Configuration object
   * @param config.minX - Minimum x coordinate (inclusive)
   * @param config.maxX - Maximum x coordinate (inclusive)
   * @param config.minY - Minimum y coordinate (inclusive)
   * @param config.maxY - Maximum y coordinate (inclusive)
   * @param config.order - "columnFirst" or "rowFirst" iteration order (default: "columnFirst")
   * @param callback - Function called for each grid point with (point, index)
   */
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

  /**
   * Transforms an iteration function into a builder that collects results
   * Instead of executing side effects in the callback, returns an array of results
   * @param iterFn - An iteration function like forTiling, forGrid, etc.
   * @param config - Configuration for the iteration function
   * @param cb - Callback that returns a value for each iteration
   * @returns Array of all returned values
   * @example
   * ```typescript
   * const points = svg.build(svg.forTiling, { n: 5 }, (pos) => pos);
   * ```
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

  /**
   * Wraps an iteration function to execute callbacks in random order
   * @param iterFn - An iteration function like forTiling, forGrid, etc.
   * @param config - Configuration for the iteration function
   * @param cb - Callback to execute for each iteration (in random order)
   * @example
   * ```typescript
   * svg.withRandomOrder(svg.forTiling, { n: 5 }, (pos) => {
   *   svg.path().circle(pos, 0.05);
   * });
   * ```
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

  /**
   * Executes a callback with the given probability
   * @param p - Probability between 0 and 1
   * @param callback - Function to execute if random check passes
   */
  doProportion(p: number, callback: () => void) {
    if (this.rng.number() < p) {
      callback()
    }
  }

  /**
   * Executes a callback n times, passing the iteration index (0 to n-1)
   * @param n - Number of iterations
   * @param callback - Function called with iteration index
   */
  times(n: number, callback: (n: number) => void) {
    for (let i = 0; i < n; i++) {
      callback(i)
    }
  }

  /**
   * Executes a callback n times counting down from n to 1
   * @param n - Starting number (counts down to 1)
   * @param callback - Function called with current count
   */
  downFrom(n: number, callback: (n: number) => void) {
    for (let i = n; i > 0; i--) {
      callback(i)
    }
  }

  /**
   * Iterates over n points evenly distributed around a circle
   * @param config - Configuration object
   * @param config.n - Number of points
   * @param config.at - Center of circle (default: center of canvas)
   * @param config.r - Radius (default: 0.25)
   * @param callback - Function called for each point with (point, index)
   */
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

  /**
   * Randomly selects and executes one case based on weighted probabilities
   * @param cases - Array of [weight, callback] tuples
   * @returns The result of the selected callback
   * @example
   * ```typescript
   * const color = svg.proportionately([
   *   [0.7, () => 'red'],    // 70% chance
   *   [0.3, () => 'blue']    // 30% chance
   * ]);
   * ```
   */
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

  /**
   * Generates a random point within the canvas bounds
   * @returns A random Point2D within the normalized coordinate space
   */
  randomPoint(): Point2D {
    return [this.rng.number(), this.rng.number() / this.aspectRatio]
  }

  /**
   * Iterates over n evenly-spaced values in a range
   * @param config - Configuration object
   * @param config.from - Starting value
   * @param config.to - Ending value
   * @param config.n - Number of steps
   * @param config.inclusive - Whether to include the final value (default: true)
   * @param callback - Function called with each value
   */
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

  /**
   * Checks if a point is within the canvas bounds
   * @param point - The point to check
   * @returns true if the point is within bounds, false otherwise
   */
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

  /**
   * Gets metadata about the canvas dimensions and bounds
   * @returns Object containing top, bottom, left, right bounds, aspectRatio, and center point
   */
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

  /**
   * Convenience getter for creating new Attributes instances
   * @returns A new Attributes instance
   * @example
   * ```typescript
   * svg.path(svg.A.fill(180, 50, 50).opacity(0.5));
   * ```
   */
  get A(): Attributes {
    return new Attributes()
  }

  /**
   * Convenience getter for creating new Transform instances
   * @returns A new Transform instance
   * @example
   * ```typescript
   * svg.group(svg.A.transform(svg.T.translate(0.5, 0.5)), () => { ... });
   * ```
   */
  get T(): Transform {
    return new Transform()
  }
}
