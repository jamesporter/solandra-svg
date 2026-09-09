import { Point2D, Vector2D } from "./util/types.js"
import { Path } from "./path.js"
import { Attributes } from "./attributes.js"
import { indent } from "./util/internalUtil.js"
import { RNG } from "./rng.js"
import { Transform } from "./transforms.js"
import { Text } from "./text.js"
import {
  Gradient,
  GradientUnits,
  LinearGradient,
  RadialGradient,
} from "./gradients.js"

/**
 * Anything that can be drawn at the top level of a drawing, or nested inside a
 * {@link Group}.
 */
export type SvgElement = Group | Path | Text

/**
 * An SVG `<g>` group element that can contain nested {@link Path}, {@link Text}
 * and {@link Group} children.
 *
 * Groups are created via {@link SolandraSvg.group} and allow shared attributes
 * (e.g. transforms, styles) to be applied to multiple child elements.
 */
export class Group {
  /** The child elements (paths, text or nested groups) within this group. */
  children: SvgElement[] = []

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
      ...this.children.flatMap((el) => renderElement(el, depth + 1)),
      indent(`</g>`, depth),
    ]
  }

  /**
   * Adds a child element (path, text or nested group) to this group.
   *
   * @param element - The child to add
   */
  push(element: SvgElement) {
    this.children.push(element)
  }
}

/**
 * Serialises a top-level or nested SVG element to indented markup lines.
 *
 * @param element - The group, path or text run to serialise
 * @param depth - The indentation depth for pretty-printing
 * @internal
 */
function renderElement(element: SvgElement, depth: number): string[] {
  return element instanceof Group
    ? element.strings(depth)
    : [element.string(depth)]
}

/**
 * Wraps SVG markup in a `data:` URI suitable for use as an `<img>` `src`.
 *
 * @param svg - The SVG markup
 * @param encode - If `true`, URI-encodes the SVG; otherwise only escapes `#` characters
 * @internal
 */
function toDataUri(svg: string, encode: boolean): string {
  return `data:image/svg+xml;utf8,${
    encode ? encodeURIComponent(svg) : svg.replace(/#/g, "%23")
  }`
}

/**
 * The callback signature shared by the region-based iteration utilities
 * ({@link SolandraSvg.forTiling}, {@link SolandraSvg.forHorizontal},
 * {@link SolandraSvg.forVertical}, {@link SolandraSvg.forMargin}).
 *
 * @param point - The top-left corner of the region
 * @param delta - The `[width, height]` of the region
 * @param center - The center of the region
 * @param i - The zero-based iteration index
 */
export type RegionCallback = (
  point: Point2D,
  delta: Vector2D,
  center: Point2D,
  i: number,
) => void

/**
 * Visits every `(i, j)` cell of an `nX` by `nY` grid in the requested order.
 *
 * @param nX - The number of columns
 * @param nY - The number of rows
 * @param order - `"columnFirst"` walks down each column, `"rowFirst"` across each row
 * @param visit - Called with the column and row index of each cell
 * @internal
 */
function forEachCell(
  nX: number,
  nY: number,
  order: "columnFirst" | "rowFirst",
  visit: (i: number, j: number) => void,
) {
  if (order === "columnFirst") {
    for (let i = 0; i < nX; i++) {
      for (let j = 0; j < nY; j++) {
        visit(i, j)
      }
    }
  } else {
    for (let j = 0; j < nY; j++) {
      for (let i = 0; i < nX; i++) {
        visit(i, j)
      }
    }
  }
}

/**
 * The main entry point for creating SVG drawings with Solandra.
 *
 * Provides a declarative, fluent API for building SVG graphics with:
 * - Path creation ({@link path}, {@link strokedPath}, {@link cutPath}, {@link creasePath})
 * - Text ({@link text})
 * - Gradients ({@link linearGradient}, {@link radialGradient})
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
  /** The top-level SVG elements (paths, text and groups). */
  elements: SvgElement[] = []
  private currentGroup: Group | null = null
  private definitions: Gradient[] = []

  /**
   * Creates a new SolandraSvg drawing context.
   *
   * @param width - The pixel width of the SVG
   * @param height - The pixel height of the SVG
   * @param seed - Optional seed for the random number generator (for reproducible output)
   */
  constructor(
    readonly width: number,
    readonly height: number,
    seed?: number,
  ) {
    this.aspectRatio = width / height
    this.rng = new RNG(seed)
  }

  /**
   * Renders the drawing as SVG markup, with the given unit suffix on the
   * `width`/`height` attributes.
   *
   * @param unit - The CSS unit appended to the pixel dimensions (e.g. `""` or `"mm"`)
   * @internal
   */
  private render(unit: string): string {
    const defs =
      this.definitions.length > 0
        ? [
            indent("<defs>", 1),
            ...this.definitions.flatMap((d) => d.strings(2)),
            indent("</defs>", 1),
          ]
        : []
    const body = [
      ...defs,
      ...this.elements.flatMap((el) => renderElement(el, 1)),
    ].join("\n")
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 ${
      1 / this.aspectRatio
    }" width="${this.width}${unit}" height="${this.height}${unit}">
${body}
</svg>`
  }

  /**
   * Generates the complete SVG markup string for the drawing.
   *
   * The viewBox is normalised to `"0 0 1 {1/aspectRatio}"`.
   */
  get image(): string {
    return this.render("")
  }

  /**
   * Generates a data URI for the SVG image, suitable for use as an `<img>` `src`.
   *
   * @param encode - If `true` (default), URI-encodes the SVG; otherwise only escapes `#` characters
   * @returns A `data:image/svg+xml` URI string
   */
  imageSrc(encode: boolean = true): string {
    return toDataUri(this.image, encode)
  }

  /**
   * Generates SVG markup with millimetre dimensions, suitable for Inkscape import.
   *
   * @remarks This API is unstable and may change.
   */
  get UNSTABLE_imageInkscapeReady(): string {
    return this.render("mm")
  }

  /**
   * Generates a data URI for the Inkscape-ready SVG image.
   *
   * @param encode - If `true` (default), URI-encodes the SVG; otherwise only escapes `#` characters
   * @returns A `data:image/svg+xml` URI string
   * @remarks This API is unstable and may change.
   */
  UNSTABLE_imageSrcInkscapeReady(encode: boolean = true): string {
    return toDataUri(this.UNSTABLE_imageInkscapeReady, encode)
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
  get currentElements(): Group | SvgElement[] {
    if (this.currentGroup) {
      return this.currentGroup
    } else {
      return this.elements
    }
  }

  /**
   * Adds an already-constructed path to the current drawing context.
   *
   * @param path - The path to add
   * @returns The same path, for convenience
   * @internal
   */
  private addPath(path: Path): Path {
    this.currentElements.push(path)
    return path
  }

  /**
   * Creates a new {@link Path} and adds it to the current drawing context.
   *
   * @param attributes - Optional {@link Attributes} for the path (defaults to empty)
   * @returns The new path, ready for drawing commands
   */
  path(attributes: Attributes = new Attributes()): Path {
    return this.addPath(new Path(attributes))
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
    return this.addPath(new Path(attr))
  }

  /**
   * Creates a new filled {@link Path} with sensible defaults for solid shapes.
   *
   * Defaults: black fill, full opacity, no stroke.
   *
   * @param configureAttributes - Optional callback to further customise the attributes
   * @returns The new filled path
   */
  filledPath(configureAttributes?: (attributes: Attributes) => void): Path {
    const attr = Attributes.filled.fill(0, 0, 0).fillOpacity(1)
    configureAttributes?.(attr)
    return this.addPath(new Path(attr))
  }

  /**
   * Clones an existing path, adds the clone to the drawing, and returns it.
   *
   * @param path - The path to clone
   * @param attributes - Optional replacement attributes for the clone
   * @returns The cloned path (now part of the drawing)
   */
  clonePath(path: Path, attributes?: Attributes): Path {
    return this.addPath(path.clone(attributes))
  }

  /**
   * Draws a run of text anchored at a point.
   *
   * Typography is set through the usual {@link Attributes} builder
   * ({@link Attributes.fontSize}, {@link Attributes.fontFamily},
   * {@link Attributes.textAnchor}, ...). Sizes are in the drawing's coordinate
   * system, so `0.1` is a tenth of its width. The content is escaped, so any
   * text is safe to draw.
   *
   * @param content - The text to draw
   * @param at - The anchor position
   * @param attributes - Optional {@link Attributes} for the text element
   * @returns The new {@link Text} element
   *
   * @example
   * ```ts
   * s.text("solandra", s.meta.center, s.A.fontSize(0.1).textAnchor("middle"))
   * ```
   */
  text(
    content: string,
    at: Point2D,
    attributes: Attributes = new Attributes(),
  ): Text {
    const element = new Text(content, at, attributes)
    this.currentElements.push(element)
    return element
  }

  /**
   * Defines a linear gradient on the drawing, which paths and text can then be
   * painted with.
   *
   * The gradient is added to the drawing's `<defs>`; reference it by `id` with
   * {@link Attributes.fillGradient} or {@link Attributes.strokeGradient}. Add
   * colours with {@link Gradient.stop}.
   *
   * @param id - The `id` used to reference this gradient
   * @param config - Optional geometry
   * @param config.from - Where the gradient starts (default `[0, 0]`)
   * @param config.to - Where the gradient ends (default `[1, 0]`, i.e. left to right)
   * @param config.units - `"objectBoundingBox"` (default) makes the coordinates
   *   fractions of the painted shape; `"userSpaceOnUse"` uses drawing coordinates
   * @returns The new {@link LinearGradient}, for chaining stops onto
   *
   * @example
   * ```ts
   * s.linearGradient("sky", { to: [0, 1] })
   *   .stop(0, 210, 80, 60)
   *   .stop(1, 340, 80, 60)
   * s.path(s.A.fillGradient("sky")).rect(s.meta.center, 0.8, 0.4)
   * ```
   */
  linearGradient(
    id: string,
    config: { from?: Point2D; to?: Point2D; units?: GradientUnits } = {},
  ): LinearGradient {
    const gradient = new LinearGradient(id, config)
    this.definitions.push(gradient)
    return gradient
  }

  /**
   * Defines a radial gradient on the drawing, which paths and text can then be
   * painted with.
   *
   * @param id - The `id` used to reference this gradient
   * @param config - Optional geometry
   * @param config.at - The centre of the gradient (default `[0.5, 0.5]`)
   * @param config.r - The radius of the gradient (default `0.5`)
   * @param config.focus - Optional focal point, which offsets the highlight from the centre
   * @param config.units - `"objectBoundingBox"` (default) makes the coordinates
   *   fractions of the painted shape; `"userSpaceOnUse"` uses drawing coordinates
   * @returns The new {@link RadialGradient}, for chaining stops onto
   */
  radialGradient(
    id: string,
    config: {
      at?: Point2D
      r?: number
      focus?: Point2D
      units?: GradientUnits
    } = {},
  ): RadialGradient {
    const gradient = new RadialGradient(id, config)
    this.definitions.push(gradient)
    return gradient
  }

  /**
   * Creates a stroked path preset for cut-and-fold designs.
   *
   * @param lightness - The stroke lightness (`0`-`100`)
   * @param configureAttributes - Optional callback to further customise the attributes
   * @internal
   */
  private cutAndFoldPath(
    lightness: number,
    configureAttributes?: (attributes: Attributes) => void,
  ): Path {
    return this.strokedPath((a) => {
      a.lineCap("round")
        .lineJoin("round")
        .stroke(0, 0, lightness)
        .strokeWidth(0.005)
      configureAttributes?.(a)
    })
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
    return this.cutAndFoldPath(60, configureAttributes)
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
    return this.cutAndFoldPath(90, configureAttributes)
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
  forMargin = (margin: number, callback: RegionCallback) =>
    this.forTiling({ n: 1, margin }, callback)

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
    callback: RegionCallback,
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

    const emit = (i: number, j: number) => {
      const x = sX + i * deltaX
      const y = sY + j * deltaY
      callback([x, y], [deltaX, deltaY], [x + deltaX / 2, y + deltaY / 2], k)
      k++
    }

    forEachCell(n, nY, order, emit)
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
    config: { n: number; margin?: number },
    callback: RegionCallback,
  ) => this.forStrips(config, "horizontal", callback)

  /**
   * Divides the drawing area into `n` vertical strips and iterates over each.
   *
   * @param config - Configuration
   * @param config.n - Number of vertical strips
   * @param config.margin - Margin around the area (default `0`)
   * @param callback - Called for each strip with `(topLeft, stripSize, stripCenter, index)`
   */
  forVertical = (
    config: { n: number; margin?: number },
    callback: RegionCallback,
  ) => this.forStrips(config, "vertical", callback)

  /**
   * Divides the drawing area into `n` strips along one axis and iterates over each.
   *
   * @param config - Strip count and margin
   * @param direction - `"horizontal"` splits along x, `"vertical"` along y
   * @param callback - Called for each strip
   * @internal
   */
  private forStrips(
    { n, margin = 0 }: { n: number; margin?: number },
    direction: "horizontal" | "vertical",
    callback: RegionCallback,
  ) {
    const horizontal = direction === "horizontal"
    const width = 1 - 2 * margin
    const height = 1 / this.aspectRatio - 2 * margin
    const dX = horizontal ? width / n : width
    const dY = horizontal ? height : height / n

    for (let i = 0; i < n; i++) {
      const x = margin + (horizontal ? i * dX : 0)
      const y = margin + (horizontal ? 0 : i * dY)
      callback([x, y], [dX, dY], [x + dX / 2, y + dY / 2], i)
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
    callback: (point: Point2D, i: number) => void,
  ) => {
    let k = 0
    const { minX, maxX, minY, maxY, order = "columnFirst" } = config

    forEachCell(maxX - minX + 1, maxY - minY + 1, order, (i, j) => {
      callback([minX + i, minY + j], k)
      k++
    })
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
    cb: (...args: T) => U,
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
    cb: (...args: T) => void,
  ) {
    const args: T[] = []
    iterFn(config, (...as: T) => {
      args.push(as)
    })
    this.shuffle(args)

    for (const a of args) {
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
    callback: (point: Point2D, i: number) => void,
  ) => {
    const { n, at: [cX, cY] = [0.5, 0.5 / this.aspectRatio], r = 0.25 } = config
    const da = (Math.PI * 2) / n

    let a = -Math.PI * 0.5
    for (let i = 0; i < n; i++) {
      callback([cX + r * Math.cos(a), cY + r * Math.sin(a)], i)
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
    /* v8 ignore next 2 -- unreachable: with a positive total some case
       always outweighs the remaining r; kept as a defensive fallback. */
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
    config: { from?: number; to?: number; n: number; inclusive?: boolean },
    callback: (n: number) => void,
  ) {
    const { from = 0, to = 1, n, inclusive = true } = config

    // n = 0 would otherwise make di infinite and every emitted value NaN.
    const di = n === 0 ? 0 : (to - from) / n
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
