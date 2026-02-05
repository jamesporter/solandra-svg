import { Point2D, Vector2D } from "./util/types"
import { Path } from "./path"
import { Attributes } from "./attributes"
import { indent } from "./util/internalUtil"
import { RNG } from "./rng"
import { Transform } from "./transforms"

/**
 * An SVG `<g>` group element that can contain nested {@link Path} and {@link Group} children.
 *
 * Groups are created via {@link SolandraSvg.group} and allow shared attributes
 * (e.g. transforms, styles) to be applied to multiple child elements.
 */
export class Group {
  /** The child elements (paths or nested groups) within this group. */
  children: (Group | Path)[] = []

  /**
   * @param attributes - The {@link Attributes} applied to this `<g>` element
   */
  constructor(readonly attributes: Attributes) {}

  /**
   * Serialises this group and all its children to SVG markup lines.
   *
   * @param depth - The indentation depth for pretty-printing
   * @returns An array of indented SVG markup lines
   * @internal
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
   * Adds a child element (path or nested group) to this group.
   *
   * @param element - The child to add
   */
  push(element: Group | Path) {
    this.children.push(element)
  }
}

/**
 * The main entry point for creating SVG drawings with Solandra.
 *
 * Provides a declarative, fluent API for building SVG graphics with:
 * - Path creation ({@link path}, {@link strokedPath}, {@link cutPath}, {@link creasePath})
 * - Grouping ({@link group}, {@link groupWithId})
 * - Layout iteration ({@link forTiling}, {@link forHorizontal}, {@link forVertical}, {@link forGrid}, {@link aroundCircle})
 * - Seeded randomness ({@link random}, {@link gaussian}, {@link poisson}, {@link sample}, {@link shuffle})
 * - SVG output ({@link image}, {@link imageSrc})
 *
 * The drawing uses a normalised coordinate system where `x` ranges from `0` to `1`
 * and `y` ranges from `0` to `1/aspectRatio`.
 *
 * @example
 * ```ts
 * const s = new SolandraSvg(800, 600, 42)
 * s.forTiling({ n: 4, margin: 0.1 }, (point, delta, center) => {
 *   s.path(s.A.fill(200, 80, 50))
 *     .ellipse(center, delta[0] * 0.8, delta[1] * 0.8)
 * })
 * document.body.innerHTML = s.image
 * ```
 */
export class SolandraSvg {
  /** The width-to-height ratio of the drawing. */
  readonly aspectRatio: number
  private rng: RNG
  /** The top-level SVG elements (paths and groups). */
  elements: (Group | Path)[] = []
  private currentGroup: Group | null = null

  /**
   * Creates a new SolandraSvg drawing context.
   *
   * @param width - The pixel width of the SVG
   * @param height - The pixel height of the SVG
   * @param seed - Optional seed for the random number generator (for reproducible output)
   */
  constructor(readonly width: number, readonly height: number, seed?: number) {
    this.aspectRatio = width / height
    this.rng = new RNG(seed)
  }

  /**
   * Generates the complete SVG markup string for the drawing.
   *
   * The viewBox is normalised to `"0 0 1 {1/aspectRatio}"`.
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
   * Generates a data URI for the SVG image, suitable for use as an `<img>` `src`.
   *
   * @param encode - If `true` (default), URI-encodes the SVG; otherwise only escapes `#` characters
   * @returns A `data:image/svg+xml` URI string
   */
  imageSrc(encode: boolean = true): string {
    return `data:image/svg+xml;utf8,${
      encode ? encodeURIComponent(this.image) : this.image.replace(/\#/g, "%23")
    }`
  }

  /**
   * Generates SVG markup with millimetre dimensions, suitable for Inkscape import.
   *
   * @remarks This API is unstable and may change.
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
   * Generates a data URI for the Inkscape-ready SVG image.
   *
   * @param encode - If `true` (default), URI-encodes the SVG; otherwise only escapes `#` characters
   * @returns A `data:image/svg+xml` URI string
   * @remarks This API is unstable and may change.
   */
  UNSTABLE_imageSrcInkscapeReady(encode: boolean = true): string {
    return `data:image/svg+xml;utf8,${
      encode
        ? encodeURIComponent(this.UNSTABLE_imageInkscapeReady)
        : this.UNSTABLE_imageInkscapeReady.replace(/\#/g, "%23")
    }`
  }

  /**
   * Creates an SVG `<g>` group with the given attributes.
   *
   * All paths and groups created within the `contents` callback are nested inside this group.
   * Groups can be nested arbitrarily.
   *
   * @param attributes - The {@link Attributes} for the group element
   * @param contents - A callback in which child elements are added to the group
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
   * Creates an SVG `<g>` group with the given ID.
   *
   * Convenience wrapper around {@link group} that only sets the `id` attribute.
   *
   * @param id - The group element ID
   * @param contents - A callback in which child elements are added to the group
   */
  groupWithId(id: string, contents: () => void) {
    this.group(new Attributes().id(id), contents)
  }

  /**
   * Returns the current element container (either the active group or the top-level element list).
   * @internal
   */
  get currentElements(): Group | (Group | Path)[] {
    if (this.currentGroup) {
      return this.currentGroup
    } else {
      return this.elements
    }
  }

  /**
   * Creates a new {@link Path} and adds it to the current drawing context.
   *
   * @param attributes - Optional {@link Attributes} for the path (defaults to empty)
   * @returns The new path, ready for drawing commands
   */
  path(attributes: Attributes = new Attributes()): Path {
    const path = new Path(attributes)
    this.currentElements.push(path)
    return path
  }

  /**
   * Creates a new stroked {@link Path} with sensible defaults for line drawing.
   *
   * Defaults: no fill, black stroke, width `0.005`, round line cap.
   *
   * @param configureAttributes - Optional callback to further customise the attributes
   * @returns The new stroked path
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
   * Clones an existing path, adds the clone to the drawing, and returns it.
   *
   * @param path - The path to clone
   * @param attributes - Optional replacement attributes for the clone
   * @returns The cloned path (now part of the drawing)
   */
  clonePath(path: Path, attributes?: Attributes): Path {
    const newPath = path.clone(attributes)
    this.currentElements.push(newPath)
    return newPath
  }

  /**
   * Creates a preset path for cut lines in cut-and-fold designs.
   *
   * Defaults: round caps and joins, grey stroke (`lightness: 60`), width `0.005`.
   *
   * @param configureAttributes - Optional callback to further customise the attributes
   * @returns The new cut path
   */
  cutPath(configureAttributes?: (attributes: Attributes) => void) {
    return this.strokedPath((a) => {
      a.lineCap("round").lineJoin("round").stroke(0, 0, 60).strokeWidth(0.005)
      configureAttributes?.(a)
    })
  }

  /**
   * Creates a preset path for crease/fold lines in cut-and-fold designs.
   *
   * Defaults: round caps and joins, light grey stroke (`lightness: 90`), width `0.005`.
   *
   * @param configureAttributes - Optional callback to further customise the attributes
   * @returns The new crease path
   */
  creasePath(configureAttributes?: (attributes: Attributes) => void) {
    return this.strokedPath((a) => {
      a.lineCap("round").lineJoin("round").stroke(0, 0, 90).strokeWidth(0.005)
      configureAttributes?.(a)
    })
  }

  // ── Iteration utilities ────────────────────────────────────────────

  /**
   * Iterates once over the drawing area with the given margin.
   *
   * Shorthand for `forTiling({ n: 1, margin }, callback)`.
   *
   * @param margin - The margin around the drawing area (in normalised coordinates)
   * @param callback - Called with the top-left point, the size delta, the center, and index `0`
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
   * Tiles the drawing area into a grid of cells and iterates over each cell.
   *
   * @param config - Tiling configuration
   * @param config.n - Number of columns (and rows, unless `type` is `"square"`)
   * @param config.type - `"proportionate"` (default) uses `n` rows, `"square"` calculates rows from aspect ratio
   * @param config.margin - Margin around the grid (default `0`)
   * @param config.order - Iteration order: `"columnFirst"` (default) or `"rowFirst"`
   * @param callback - Called for each cell with `(topLeft, cellSize, cellCenter, index)`
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
   * Divides the drawing area into `n` horizontal strips and iterates over each.
   *
   * @param config - Configuration
   * @param config.n - Number of horizontal strips
   * @param config.margin - Margin around the area (default `0`)
   * @param callback - Called for each strip with `(topLeft, stripSize, stripCenter, index)`
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
   * Divides the drawing area into `n` vertical strips and iterates over each.
   *
   * @param config - Configuration
   * @param config.n - Number of vertical strips
   * @param config.margin - Margin around the area (default `0`)
   * @param callback - Called for each strip with `(topLeft, stripSize, stripCenter, index)`
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
   * Iterates over all integer points in a 2D grid defined by min/max bounds.
   *
   * @param config - Grid bounds and ordering
   * @param config.minX - Minimum x value (inclusive)
   * @param config.maxX - Maximum x value (inclusive)
   * @param config.minY - Minimum y value (inclusive)
   * @param config.maxY - Maximum y value (inclusive)
   * @param config.order - Iteration order: `"columnFirst"` (default) or `"rowFirst"`
   * @param callback - Called for each grid point with `(point, index)`
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
   * Collects results from an iteration utility into an array, rather than drawing within the callback.
   *
   * @param iterFn - An iteration function (e.g. {@link forTiling}, {@link forGrid})
   * @param config - The configuration to pass to the iteration function
   * @param cb - A mapping callback that returns a value for each iteration
   * @returns An array of values produced by `cb`
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
   * Runs an iteration utility's callback in random order.
   *
   * Collects all iteration arguments first, shuffles them, then calls `cb` for each.
   *
   * @param iterFn - An iteration function (e.g. {@link forTiling}, {@link forGrid})
   * @param config - The configuration to pass to the iteration function
   * @param cb - The callback to execute in random order
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
   * Executes a callback with probability `p`.
   *
   * @param p - The probability of executing (between `0` and `1`)
   * @param callback - The callback to conditionally execute
   */
  doProportion(p: number, callback: () => void) {
    if (this.rng.number() < p) {
      callback()
    }
  }

  /**
   * Executes a callback `n` times, passing the iteration index.
   *
   * @param n - The number of iterations
   * @param callback - Called with the index `0` through `n-1`
   */
  times(n: number, callback: (n: number) => void) {
    for (let i = 0; i < n; i++) {
      callback(i)
    }
  }

  /**
   * Executes a callback counting down from `n` to `1`.
   *
   * @param n - The starting count
   * @param callback - Called with values from `n` down to `1`
   */
  downFrom(n: number, callback: (n: number) => void) {
    for (let i = n; i > 0; i--) {
      callback(i)
    }
  }

  /**
   * Iterates over `n` evenly spaced points around a circle.
   *
   * @param config - Circle configuration
   * @param config.at - Center of the circle (defaults to the drawing center)
   * @param config.r - Radius of the circle (default `0.25`)
   * @param config.n - Number of points around the circle
   * @param callback - Called for each point with `(point, index)`
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
   * Randomly selects and executes one of several weighted cases.
   *
   * @param cases - An array of `[weight, callback]` pairs
   * @returns The return value of the selected callback
   * @throws If the total weight is not positive
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
    // fallback (should never happen)
    return cases[0][1]()
  }

  /**
   * Generates a random point within the drawing bounds.
   *
   * @returns A random {@link Point2D} with `x` in `[0, 1]` and `y` in `[0, 1/aspectRatio]`
   */
  randomPoint(): Point2D {
    return [this.rng.number(), this.rng.number() / this.aspectRatio]
  }

  /**
   * Iterates over evenly spaced values in a numeric range.
   *
   * @param config - Range configuration
   * @param config.from - The start value (default `0`)
   * @param config.to - The end value (default `1`)
   * @param config.n - The number of steps
   * @param config.inclusive - Whether to include the endpoint (default `true`)
   * @param callback - Called with each value in the range
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
   * Tests whether a point is within the drawing bounds.
   *
   * @param point - The point to test
   * @returns `true` if the point is strictly inside the drawing area
   */
  inDrawing = (point: Point2D): boolean => {
    const { left, right, top, bottom } = this.meta
    return (
      point[0] > left && point[0] < right && point[1] > top && point[1] < bottom
    )
  }

  // ── Randomness ─────────────────────────────────────────────────────

  /**
   * Generates a uniform random number between 0 and 1.
   *
   * @returns A random number in `[0, 1)`
   */
  random = (): number => {
    return this.rng.number()
  }

  /**
   * Generates a uniform random angle between 0 and 2pi.
   *
   * @returns A random angle in `[0, 2pi)` radians
   */
  randomAngle = (): number => {
    return this.rng.number() * Math.PI * 2
  }

  /**
   * Generates a uniform random integer within the given bounds.
   *
   * @param config - Integer range configuration
   * @param config.from - Lower bound (default `0`)
   * @param config.to - Upper bound
   * @param config.inclusive - Whether the upper bound is inclusive (default `true`)
   * @returns A random integer
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
   * Generates a random integer {@link Point2D} within the given grid bounds.
   *
   * @param bounds - The grid bounds (all inclusive)
   * @returns A random grid point
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
   * Returns either `-1` or `1` with equal probability.
   *
   * @returns `1` or `-1`
   */
  randomPolarity = (): 1 | -1 => {
    return this.rng.number() > 0.5 ? 1 : -1
  }

  /**
   * Selects a single random element from an array with uniform probability.
   *
   * @param from - The source array
   * @returns A randomly selected element
   */
  sample = <T>(from: T[]): T => {
    return from[Math.floor(this.rng.number() * from.length)]
  }

  /**
   * Selects `n` random elements from an array with replacement.
   *
   * @param n - The number of samples
   * @param from - The source array
   * @returns An array of `n` randomly selected elements
   */
  samples = <T>(n: number, from: T[]): T[] => {
    let res: T[] = []
    for (let i = 0; i < n; i++) {
      res.push(this.sample(from))
    }
    return res
  }

  /**
   * Shuffles an array in place using the Fisher-Yates algorithm.
   *
   * @param items - The array to shuffle
   * @returns The same array, now shuffled
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
   * Perturbs a point by a random offset.
   *
   * By default applies uniform random changes in the range `[-0.05, 0.05]` per axis.
   * The `magnitude` parameter scales this range (e.g. `magnitude: 1` gives `[-0.5, 0.5]`).
   *
   * @param config - Perturbation configuration
   * @param config.at - The point to perturb
   * @param config.magnitude - Scale factor for the perturbation range (default `0.1`)
   * @returns A new perturbed point
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
   * Generates a Gaussian (normally distributed) random number using the Box-Muller transform.
   *
   * @param config - Optional distribution parameters
   * @param config.mean - The mean of the distribution (default `0`)
   * @param config.sd - The standard deviation (default `1`)
   * @returns A normally distributed random number
   */
  gaussian = (config?: { mean?: number; sd?: number }): number => {
    const { mean = 0, sd = 1 } = config || {}
    const a = this.rng.number()
    const b = this.rng.number()
    const n = Math.sqrt(-2.0 * Math.log(a)) * Math.cos(2.0 * Math.PI * b)
    return mean + n * sd
  }

  /**
   * Generates a Poisson-distributed random integer.
   *
   * @param lambda - The rate parameter (both the mean and variance of the distribution)
   * @returns A non-negative integer drawn from the Poisson distribution
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
   * Returns metadata about the drawing dimensions and bounds.
   *
   * @returns An object with `top`, `bottom`, `left`, `right`, `aspectRatio`, and `center` properties
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
   * Shorthand to create a new empty {@link Attributes} instance.
   */
  get A(): Attributes {
    return new Attributes()
  }

  /**
   * Shorthand to create a new empty {@link Transform} instance.
   */
  get T(): Transform {
    return new Transform()
  }
}
