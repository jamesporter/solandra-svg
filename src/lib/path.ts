import { Point2D, CurveConfig, ArcConfig } from "./util/types"
import { convertToSVGCubicSpec } from "./util/curveCalcs"
import { Attributes } from "./attributes"
import { v } from "."
import { indent } from "./util/internalUtil"

/**
 * A discriminated union representing a single segment in an SVG path.
 *
 * Each variant corresponds to an SVG path command:
 * - `"move"` - Move to a point (`M`)
 * - `"line"` - Draw a line to a point (`L`)
 * - `"cubicCurve"` - Draw a cubic bezier curve (`C`)
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
  | { kind: "close" }

// To force types later, a bit nasty but to cover most potential errors with runtime checks
type Toable = { to: Point2D }

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
      return convertToSVGCubicSpec({
        from: previous!,
        to: segment.to,
        ...segment.config,
      })
    case "arc":
      const {
        config: { rX, rY, largeArc, xAxisRotation },
        to,
      } = segment
      return `A ${rX} ${rY} ${xAxisRotation} ${largeArc ? 1 : 0} ${
        largeArc ? 1 : 0
      } ${to[0]} ${to[1]}`
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
   * @param point - The target position
   * @param config - Optional arc configuration (radii, rotation, large arc flag)
   * @returns `this` for chaining
   */
  arcTo(point: Point2D, config: ArcConfig = {}): Path {
    try {
      const previous: Point2D = (this.segments[this.segments.length - 1] as any)
        .to
      const {
        rX = Math.abs(point[0] - previous[0]),
        rY = Math.abs(point[1] - previous[1]),
        largeArc = false,
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
        },
      })

      return this
    } catch (ex) {
      console.error("Probably no previous point", ex)
      return this
    }
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
    this.segments.push({ kind: "move", to: start })
    this.segments.push({ kind: "line", to: v.add(start, [width, 0]) })
    this.segments.push({ kind: "line", to: v.add(start, [width, height]) })
    this.segments.push({ kind: "line", to: v.add(start, [0, height]) })
    this.segments.push({ kind: "line", to: start })
    return this
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

    let start: Point2D = [
      c[0] + radius * Math.cos(rotate),
      c[1] + radius * Math.sin(rotate),
    ]

    this.segments.push({ kind: "move", to: start })

    for (let i = 1; i <= n; i++) {
      const angle = (i * Math.PI * 2) / n + rotate
      this.segments.push({
        kind: "line",
        to: [c[0] + radius * Math.cos(angle), c[1] + radius * Math.sin(angle)],
      })
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
    this.segments.push({ kind: "move", to: [cX, cY - height / 2] })
    for (let i = 0; i < 4; i++) {
      this.arcTo(
        [
          cX + rX * Math.cos(Math.PI * (i + 1)),
          cY + rY * Math.sin(Math.PI * (i + 1)),
        ],
        { rX, rY },
      )
    }
    return this
  }

  spiral(
    at: Point2D,
    l: number,
    n: number,
    angle: number = 0,
    rate: number = 0.005,
  ) {
    let a = angle
    let r = l

    this.segments.push({
      kind: "move",
      to: v.add(at, [r * Math.cos(a), r * Math.sin(a)]),
    })

    for (let i = 0; i < n; i++) {
      const dA = 2 * Math.asin(l / (r * 2))
      r += rate * dA
      a += dA
      this.segments.push({
        kind: "line",
        to: v.add(at, [r * Math.cos(a), r * Math.sin(a)]),
      })
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
  chaiken(n: number = 2): Path {
    for (let k = 0; k < n; k++) {
      const newSegments: PathSegment[] = []
      newSegments.push(this.segments[0])

      for (let i = 1; i < this.segments.length - 1; i++) {
        const a = this.segments[i - 1]
        const b = this.segments[i]
        const c = this.segments[i + 1]

        if (b.kind === "line" && c.kind === "line" && (a as Toable)["to"]) {
          newSegments.push({
            kind: "line",
            to: v.pointAlong((a as Toable).to, b.to, 0.75),
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
    p.segments = this.segments.map((s) => JSON.parse(JSON.stringify(s)))
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
    if (this.segments.length === 0) throw Error("Must add to path")
    if (this.segments[0].kind !== "move")
      throw Error("Must start path with move to initial position")

    const d = this.segments
      .map((s, i) =>
        segmentToString(
          s,
          i > 0 ? (this.segments[i - 1] as Toable).to : undefined,
        ),
      )
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
