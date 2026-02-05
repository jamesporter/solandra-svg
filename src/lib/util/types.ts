/**
 * A point in 2D space represented as a tuple of `[x, y]` coordinates.
 */
export type Point2D = [number, number]

/**
 * A 2D vector represented as a tuple of `[x, y]` components.
 * Structurally identical to {@link Point2D} but semantically represents a direction and magnitude.
 */
export type Vector2D = [number, number]

/**
 * Configuration for cubic bezier curve generation between two points.
 *
 * All properties are optional and have sensible defaults when used via {@link Path.curveTo}.
 */
export type CurveConfig = {
  /** Flips the curve direction. Use `1` for default or `-1` for mirrored. */
  polarity?: 1 | -1
  /** Controls the overall size/amplitude of the curve. Defaults to `1`. */
  curveSize?: number
  /** Rotates the curve's control midpoint in radians. Defaults to `0`. */
  curveAngle?: number
  /** Controls how rounded/bulbous the curve appears. Defaults to `1`. */
  bulbousness?: number
  /** Applies a twist to the perpendicular control offset in radians. Defaults to `0`. */
  twist?: number
}

/**
 * Configuration for SVG arc path segments.
 *
 * All properties are optional; radii default to the absolute distance between the start and end points.
 */
export type ArcConfig = {
  /** Horizontal radius of the arc ellipse. */
  rX?: number
  /** Vertical radius of the arc ellipse. */
  rY?: number
  /** Rotation of the arc ellipse's x-axis in degrees. */
  xAxisRotation?: number
  /** Whether the arc should take the longer path (arc greater than pi). */
  largeArc?: boolean
}
