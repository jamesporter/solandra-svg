import { Point2D, CurveConfig, ArcConfig } from "./util/types"
import { convertToSVGCubicSpec } from "./util/curveCalcs"
import { Attributes } from "./attributes"
import { v } from "."
import { indent } from "./util/internalUtil"

/**
 * Represents a segment in an SVG path.
 * Can be a move, line, cubic curve, arc, or close command.
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
 * Converts a path segment to its SVG string representation
 * @param segment - The path segment to convert
 * @param previous - The previous point in the path (needed for curves)
 * @returns SVG path command string
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
 * Represents an SVG path that can contain lines, curves, arcs, and shapes.
 *
 * Path provides a fluent API for building complex SVG path elements.
 * All methods return the Path instance to enable method chaining.
 *
 * @example
 * ```typescript
 * svg.path()
 *   .moveTo([0.1, 0.1])
 *   .lineTo([0.9, 0.1])
 *   .curveTo([0.9, 0.9], { polarity: -1 })
 *   .close();
 * ```
 */
export class Path {
  segments: PathSegment[] = []

  constructor(readonly attributes: Attributes) {}

  /**
   * Moves the drawing cursor to a point without drawing
   * @param point - The point to move to
   * @returns This path for method chaining
   */
  moveTo(point: Point2D): Path {
    this.segments.push({ kind: "move", to: point })
    return this
  }

  /**
   * Draws a straight line to a point
   * @param point - The endpoint of the line
   * @returns This path for method chaining
   */
  lineTo(point: Point2D): Path {
    this.segments.push({ kind: "line", to: point })
    return this
  }

  /**
   * Draws a cubic Bezier curve to a point with configurable characteristics
   * @param point - The endpoint of the curve
   * @param config - Curve configuration options
   * @param config.curveSize - Size/amplitude of the curve (default: 1)
   * @param config.polarity - Direction of curve, 1 or -1 (default: 1)
   * @param config.bulbousness - How bulbous vs flat the curve is (default: 1)
   * @param config.curveAngle - Angle offset for the curve (default: 0)
   * @param config.twist - Additional twist to apply (default: 0)
   * @returns This path for method chaining
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
   * Draws an elliptical arc to a point
   * @param point - The endpoint of the arc
   * @param config - Arc configuration options
   * @param config.rX - Horizontal radius (default: horizontal distance to endpoint)
   * @param config.rY - Vertical radius (default: vertical distance to endpoint)
   * @param config.largeArc - Whether to use the larger arc (default: false)
   * @param config.xAxisRotation - Rotation of the arc's x-axis in degrees (default: 0)
   * @returns This path for method chaining
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
   * Draws a rectangle
   * @param at - Position of the rectangle
   * @param width - Width of the rectangle
   * @param height - Height of the rectangle
   * @param align - Alignment mode: "center" positions at the center, "topLeft" at top-left corner (default: "center")
   * @returns This path for method chaining
   */
  rect(
    at: Point2D,
    width: number,
    height: number,
    align: "topLeft" | "center" = "center"
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
   * Draws a regular polygon with n sides
   * @param at - Position of the polygon
   * @param n - Number of sides
   * @param radius - Radius from center to vertices
   * @param rotate - Rotation angle in radians (default: 0)
   * @param align - Alignment mode: "center" positions at the center, "topLeft" at bounding box top-left (default: "center")
   * @returns This path for method chaining
   */
  regularPolygon(
    at: Point2D,
    n: number,
    radius: number,
    rotate: number = 0,
    align: "topLeft" | "center" = "center"
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
   * Draws an ellipse (or circle if width equals height)
   * @param at - Position of the ellipse
   * @param width - Width of the ellipse
   * @param height - Height of the ellipse
   * @param align - Alignment mode: "center" positions at the center, "topLeft" at bounding box top-left (default: "center")
   * @returns This path for method chaining
   */
  ellipse(
    at: Point2D,
    width: number,
    height: number,
    align: "topLeft" | "center" = "center"
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
        { rX, rY }
      )
    }
    return this
  }

  /**
   * Closes the path by drawing a line back to the starting point
   * @returns This path for method chaining
   */
  close(): Path {
    this.segments.push({ kind: "close" })
    return this
  }

  /**
   * Applies Chaikin's corner-cutting algorithm to smooth the path
   * Each iteration replaces line segments with smoother curves
   * @param n - Number of smoothing iterations (default: 2)
   * @returns This path for method chaining
   */
  chaikin(n: number = 2): Path {
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
   * Transforms each path segment using a mapping function
   * @param fn - Function that takes a segment and index, returns a new segment
   * @returns This path for method chaining
   */
  map(fn: (el: PathSegment, index: number) => PathSegment): Path {
    this.segments = this.segments.map(fn)
    return this
  }

  /**
   * Creates a copy of this path with its segments
   * @param attributes - Optional new attributes (if omitted, clones existing attributes)
   * @returns A new Path instance with copied segments
   * @warning The cloned path won't be added to the drawing automatically. Use SolandraSvg.clonePath() to clone and add.
   */
  clone(attributes?: Attributes): Path {
    const p = new Path(attributes || this.attributes.clone())
    p.segments = this.segments.map((s) => JSON.parse(JSON.stringify(s)))
    return p
  }

  /**
   * Generates the SVG string representation of this path
   * @param depth - Indentation depth for formatting
   * @returns SVG path element as a string
   * @throws Error if the path has no segments or doesn't start with moveTo
   */
  string(depth: number): string {
    if (this.segments.length === 0) throw Error("Must add to path")
    if (this.segments[0].kind !== "move")
      throw Error("Must start path with move to initial position")

    const d = this.segments
      .map((s, i) =>
        segmentToString(
          s,
          i > 0 ? (this.segments[i - 1] as Toable).to : undefined
        )
      )
      .join(" ")
    return indent(`<path${this.attributes.string} d="${d}" />`, depth)
  }

  /**
   * Applies configuration to this path's attributes
   * @param configureAttributes - Callback function that modifies the attributes
   */
  configureAttributes(configureAttributes: (attributes: Attributes) => void) {
    configureAttributes(this.attributes)
  }
}
