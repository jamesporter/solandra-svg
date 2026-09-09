import { Point2D, CurveConfig, ArcConfig } from "./util/types.js"
import { convertToSVGCubicSpec } from "./util/curveCalcs.js"
import { Attributes } from "./attributes.js"
import v from "./util/vectors.js"
import { indent } from "./util/internalUtil.js"

/**
 * A discriminated union representing a single segment in an SVG path.
 *
 * Each variant corresponds to an SVG path command:
 * - `"move"` - Move to a point (`M`)
 * - `"line"` - Draw a line to a point (`L`)
 * - `"cubicCurve"` - Draw a cubic bezier curve from a {@link CurveConfig} (`C`)
 * - `"bezier"` - Draw a cubic bezier curve from explicit control points (`C`)
 * - `"quadratic"` - Draw a quadratic bezier curve from an explicit control point (`Q`)
 * - `"arc"` - Draw an elliptical arc (`A`)
 * - `"close"` - Close the path (`Z`)
 */
export type PathSegment =
  | { kind: "move"; to: Point2D }
  | {
      kind: "line"
      to: Point2D
    }
  | {
      kind: "cubicCurve"
      to: Point2D
      config: Required<CurveConfig>
    }
  | { kind: "arc"; to: Point2D; config: Required<ArcConfig> }
  | {
      kind: "bezier"
      to: Point2D
      control1: Point2D
      control2: Point2D
    }
  | { kind: "quadratic"; to: Point2D; control: Point2D }
  | { kind: "close" }

/**
 * Returns the point a segment finishes at, or `undefined` for segments that
 * have no destination of their own (i.e. `close`).
 *
 * @param segment - The segment to inspect
 * @internal
 */
function endPointOf(segment: PathSegment | undefined): Point2D | undefined {
  return segment && segment.kind !== "close" ? segment.to : undefined
}

function cloneSegment(segment: PathSegment): PathSegment {
  switch (segment.kind) {
    case "close":
      return { kind: "close" }
    case "move":
      return { kind: "move", to: [...segment.to] }
    case "line":
      return { kind: "line", to: [...segment.to] }
    case "cubicCurve":
      return {
        kind: "cubicCurve",
        to: [...segment.to],
        config: { ...segment.config },
      }
    case "arc":
      return {
        kind: "arc",
        to: [...segment.to],
        config: { ...segment.config },
      }
    case "bezier":
      return {
        kind: "bezier",
        to: [...segment.to],
        control1: [...segment.control1],
        control2: [...segment.control2],
      }
    case "quadratic":
      return {
        kind: "quadratic",
        to: [...segment.to],
        control: [...segment.control],
      }
  }
}

/**
 * Converts a {@link PathSegment} to its SVG path data string representation.
 *
 * @param segment - The path segment to convert
 * @param previous - The endpoint of the preceding segment (needed for cubic curves)
 * @returns The SVG path command string
 * @internal
 */
function segmentToString(segment: PathSegment, previous?: Point2D): string {
  switch (segment.kind) {
    case "move":
      return `M ${segment.to.join(" ")}`
    case "close":
      return `Z`
    case "line":
      return `L ${segment.to.join(" ")}`
    case "cubicCurve":
      if (!previous) {
        throw new Error(
          "A curve must follow a segment with a destination point",
        )
      }
      return convertToSVGCubicSpec({
        from: previous,
        to: segment.to,
        ...segment.config,
      })
    case "bezier":
      return `C ${segment.control1.join(" ")}, ${segment.control2.join(
        " ",
      )}, ${segment.to.join(" ")}`
    case "quadratic":
      return `Q ${segment.control.join(" ")}, ${segment.to.join(" ")}`
    case "arc": {
      const {
        config: { rX, rY, largeArc, sweep, xAxisRotation },
        to,
      } = segment
      return `A ${rX} ${rY} ${xAxisRotation} ${largeArc ? 1 : 0} ${
        sweep ? 1 : 0
      } ${to[0]} ${to[1]}`
    }
  }
}

/**
 * A fluent builder for constructing SVG path elements.
 *
 * Provides methods for common path operations (lines, curves, arcs) as well as
 * higher-level shape helpers (rectangles, regular polygons, ellipses).
 * Each drawing method returns `this` for chaining.
 *
 * @example
 * ```ts
 * s.path(s.A.fill(200, 80, 50))
 *   .moveTo([0.1, 0.1])
 *   .lineTo([0.9, 0.1])
 *   .curveTo([0.9, 0.9])
 *   .close()
 * ```
 */
export class Path {
  /** The ordered list of path segments that make up this path. */
  segments: PathSegment[] = []

  /**
   * Creates a new Path with the given attributes.
   *
   * @param attributes - The {@link Attributes} to apply to this path element
   */
  constructor(readonly attributes: Attributes) {}

  /**
   * Moves the pen to a point without drawing.
   *
   * @param point - The target position
   * @returns `this` for chaining
   */
  moveTo(point: Point2D): Path {
    this.segments.push({ kind: "move", to: point })
    return this
  }

  /**
   * Draws a straight line from the current position to the given point.
   *
   * @param point - The target position
   * @returns `this` for chaining
   */
  lineTo(point: Point2D): Path {
    this.segments.push({ kind: "line", to: point })
    return this
  }

  /**
   * Draws a cubic bezier curve from the current position to the given point.
   *
   * The curve shape is controlled by the optional {@link CurveConfig}.
   *
   * @param point - The target position
   * @param config - Optional curve configuration (size, polarity, bulbousness, angle, twist)
   * @returns `this` for chaining
   */
  curveTo(point: Point2D, config: CurveConfig = {}): Path {
    const {
      curveSize = 1,
      polarity = 1,
      bulbousness = 1,
      curveAngle = 0,
      twist = 0,
    } = config

    this.segments.push({
      kind: "cubicCurve",
      to: point,
      config: { curveSize, polarity, bulbousness, curveAngle, twist },
    })
    return this
  }

  /**
   * Draws an elliptical arc from the current position to the given point.
   *
   * If radii are not specified, they default to the absolute x/y distance between
   * the current position and the target point.
   *
   * The `sweep` flag defaults to the value of `largeArc`, which keeps the short
   * and long arcs on the same ellipse; set it explicitly to draw the mirrored arcs.
   *
   * @param point - The target position
   * @param config - Optional arc configuration (radii, rotation, large arc and sweep flags)
   * @returns `this` for chaining
   */
  arcTo(point: Point2D, config: ArcConfig = {}): Path {
    const previous = endPointOf(this.segments[this.segments.length - 1])
    if (!previous) {
      throw new Error(
        "arcTo requires a previous segment with a destination point",
      )
    }

    const {
      rX = Math.abs(point[0] - previous[0]),
      rY = Math.abs(point[1] - previous[1]),
      largeArc = false,
      sweep = largeArc,
      xAxisRotation = 0,
    } = config

    this.segments.push({
      kind: "arc",
      to: point,
      config: {
        rX: rX,
        rY: rY,
        xAxisRotation,
        largeArc,
        sweep,
      },
    })

    return this
  }

  /**
   * Draws a cubic bezier curve from the current position, using explicit
   * control points.
   *
   * Where {@link curveTo} describes a curve in terms of how far it bulges from
   * the straight line between two points, this is the raw SVG `C` command: you
   * place both control points yourself.
   *
   * @param control1 - The control point leaving the current position
   * @param control2 - The control point arriving at `point`
   * @param point - The target position
   * @returns `this` for chaining
   */
  cubicTo(control1: Point2D, control2: Point2D, point: Point2D): Path {
    this.segments.push({
      kind: "bezier",
      to: point,
      control1,
      control2,
    })
    return this
  }

  /**
   * Draws a quadratic bezier curve from the current position, using an explicit
   * control point (the SVG `Q` command).
   *
   * @param control - The single control point shaping the curve
   * @param point - The target position
   * @returns `this` for chaining
   */
  quadraticTo(control: Point2D, point: Point2D): Path {
    this.segments.push({ kind: "quadratic", to: point, control })
    return this
  }

  /**
   * Draws a smooth curve that passes through every one of the given points.
   *
   * Unlike {@link chaikin}, which cuts corners off a polyline and so pulls away
   * from it, this fits a Catmull-Rom spline through the points and emits it as
   * cubic bezier segments: the curve is smooth *and* hits each point exactly.
   *
   * @param points - The points to pass through (at least two)
   * @param config - Optional configuration
   * @param config.tension - How much the curve overshoots at corners; `0` gives
   *   straight lines, `1` (the default) a standard Catmull-Rom spline
   * @param config.closed - If `true`, joins the last point smoothly back to the
   *   first and closes the path (default `false`)
   * @returns `this` for chaining
   * @throws If fewer than two points are given
   *
   * @example
   * ```ts
   * s.strokedPath().smoothLine([
   *   [0.1, 0.5],
   *   [0.4, 0.2],
   *   [0.7, 0.7],
   *   [0.9, 0.4],
   * ])
   * ```
   */
  smoothLine(
    points: Point2D[],
    config: { tension?: number; closed?: boolean } = {},
  ): Path {
    const { tension = 1, closed = false } = config
    const n = points.length
    if (n < 2) {
      throw new Error("smoothLine requires at least two points")
    }

    // Catmull-Rom needs a point either side of each segment. A closed curve
    // wraps around for those; an open one repeats its endpoints, which keeps
    // the first and last segments from curling away.
    const at = (i: number): Point2D =>
      closed
        ? points[((i % n) + n) % n]
        : points[Math.min(Math.max(i, 0), n - 1)]

    this.moveTo(points[0])
    const segments = closed ? n : n - 1
    for (let i = 0; i < segments; i++) {
      const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
      this.cubicTo(
        v.add(p1, v.scale(v.subtract(p2, p0), tension / 6)),
        v.subtract(p2, v.scale(v.subtract(p3, p1), tension / 6)),
        p2,
      )
    }
    if (closed) this.close()

    return this
  }

  /**
   * Draws a rectangle as a closed path.
   *
   * @param at - The position of the rectangle
   * @param width - The width of the rectangle
   * @param height - The height of the rectangle
   * @param align - Whether `at` is the `"topLeft"` corner or the `"center"` (default)
   * @returns `this` for chaining
   */
  rect(
    at: Point2D,
    width: number,
    height: number,
    align: "topLeft" | "center" = "center",
  ): Path {
    const start =
      align === "topLeft" ? at : v.subtract(at, [width / 2, height / 2])
    return this.moveTo(start)
      .lineTo(v.add(start, [width, 0]))
      .lineTo(v.add(start, [width, height]))
      .lineTo(v.add(start, [0, height]))
      .lineTo(start)
  }

  /**
   * Draws a regular polygon with `n` sides inscribed in a circle.
   *
   * @param at - The position of the polygon
   * @param n - The number of sides
   * @param radius - The circumscribed circle radius
   * @param rotate - Initial rotation angle in radians (default `0`)
   * @param align - Whether `at` is the `"topLeft"` of the bounding box or the `"center"` (default)
   * @returns `this` for chaining
   */
  regularPolygon(
    at: Point2D,
    n: number,
    radius: number,
    rotate: number = 0,
    align: "topLeft" | "center" = "center",
  ): Path {
    const c = align === "topLeft" ? v.add(at, [radius, radius]) : at

    this.moveTo(v.polarToCartesian(c, radius, rotate))

    for (let i = 1; i <= n; i++) {
      this.lineTo(v.polarToCartesian(c, radius, (i * Math.PI * 2) / n + rotate))
    }

    return this
  }

  /**
   * Draws an ellipse using four arc segments.
   *
   * @param at - The position of the ellipse
   * @param width - The full width of the ellipse
   * @param height - The full height of the ellipse
   * @param align - Whether `at` is the `"topLeft"` of the bounding box or the `"center"` (default)
   * @returns `this` for chaining
   */
  ellipse(
    at: Point2D,
    width: number,
    height: number,
    align: "topLeft" | "center" = "center",
  ): Path {
    const [cX, cY]: Point2D =
      align === "center" ? at : [at[0] + width / 2, at[1] + height / 2]

    const rX = width / 2
    const rY = height / 2

    // draw from top, seems most natural, like a clock?
    // four quarter arcs counterclockwise: top, left, bottom, right, back to top
    this.moveTo([cX, cY - rY])
    for (let i = 0; i < 4; i++) {
      const angle = ((i + 2) * Math.PI) / 2
      this.arcTo([cX + rX * Math.cos(angle), cY - rY * Math.sin(angle)], {
        rX,
        rY,
      })
    }
    return this
  }

  /**
   * Draws a spiral of `n` straight segments of (roughly) equal length around a point.
   *
   * @param at - The center of the spiral
   * @param l - The length of each segment (and the starting radius)
   * @param n - The number of segments
   * @param angle - The starting angle in radians (default `0`)
   * @param rate - How quickly the radius grows per radian turned (default `0.005`)
   * @returns `this` for chaining
   */
  spiral(
    at: Point2D,
    l: number,
    n: number,
    angle: number = 0,
    rate: number = 0.005,
  ): Path {
    let a = angle
    let r = l

    this.moveTo(v.polarToCartesian(at, r, a))

    for (let i = 0; i < n; i++) {
      const dA = 2 * Math.asin(l / (r * 2))
      r += rate * dA
      a += dA
      this.lineTo(v.polarToCartesian(at, r, a))
    }

    return this
  }

  /**
   * Closes the current sub-path by drawing a line back to the starting point.
   *
   * @returns `this` for chaining
   */
  close(): Path {
    this.segments.push({ kind: "close" })
    return this
  }

  /**
   * Applies Chaikin's corner-cutting algorithm to smooth line segments.
   *
   * Each iteration replaces sharp corners with two new points at 25% and 75%
   * along each edge, progressively smoothing the path.
   *
   * @param n - The number of smoothing iterations (default `2`)
   * @returns `this` for chaining
   */
  chaikin(n: number = 2): Path {
    // With fewer than three segments there are no corners to cut.
    if (this.segments.length < 3) return this
    for (let k = 0; k < n; k++) {
      const newSegments: PathSegment[] = []
      newSegments.push(this.segments[0])

      for (let i = 1; i < this.segments.length - 1; i++) {
        const a = endPointOf(this.segments[i - 1])
        const b = this.segments[i]
        const c = this.segments[i + 1]

        if (b.kind === "line" && c.kind === "line" && a) {
          newSegments.push({
            kind: "line",
            to: v.pointAlong(a, b.to, 0.75),
          })
          newSegments.push({
            kind: "line",
            to: v.pointAlong(b.to, c.to, 0.25),
          })
        } else {
          newSegments.push(b)
        }
      }
      newSegments.push(this.segments[this.segments.length - 1])
      this.segments = newSegments
    }
    return this
  }

  /**
   * Transforms each segment of the path using a mapping function.
   *
   * @param fn - A function that receives each segment and its index, returning a new segment
   * @returns `this` for chaining
   */
  map(fn: (el: PathSegment, index: number) => PathSegment): Path {
    this.segments = this.segments.map(fn)
    return this
  }

  /**
   * Creates a deep copy of this path.
   *
   * Note: The cloned path is not automatically included in the drawing.
   * Use {@link SolandraSvg.clonePath} to clone a path and add it to the drawing.
   *
   * @param attributes - Optional replacement attributes for the clone
   * @returns A new {@link Path} with copied segments
   */
  clone(attributes?: Attributes): Path {
    const p = new Path(attributes || this.attributes.clone())
    p.segments = this.segments.map(cloneSegment)
    return p
  }

  /**
   * Serialises this path to an SVG `<path>` element string.
   *
   * @param depth - The indentation depth for pretty-printing
   * @returns The SVG path element string
   * @throws If no segments have been added or the first segment is not a move
   */
  string(depth: number): string {
    if (this.segments.length === 0) throw new Error("Must add to path")
    if (this.segments[0].kind !== "move")
      throw new Error("Must start path with move to initial position")

    const d = this.segments
      .map((s, i) => segmentToString(s, endPointOf(this.segments[i - 1])))
      .join(" ")
    return indent(`<path${this.attributes.string} d="${d}" />`, depth)
  }

  /**
   * Provides mutable access to this path's attributes via a callback.
   *
   * @param configureAttributes - A function that receives the {@link Attributes} instance to modify
   */
  configureAttributes(configureAttributes: (attributes: Attributes) => void) {
    configureAttributes(this.attributes)
  }
}
