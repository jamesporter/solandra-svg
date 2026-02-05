import { Point2D } from "./types"

/**
 * Clamps a number to a given range.
 *
 * @param range - The range to clamp to
 * @param range.from - The minimum allowed value
 * @param range.to - The maximum allowed value
 * @param n - The number to clamp
 * @returns The clamped value, guaranteed to be within `[from, to]`
 */
export const clamp = (
  { from, to }: { from: number; to: number },
  n: number
): number => {
  return Math.min(to, Math.max(from, n))
}

/**
 * Configuration for a linear scale that maps values from a domain to a range.
 */
type ScaleConfig = {
  /** The minimum input value */
  minDomain: number
  /** The maximum input value */
  maxDomain: number
  /** The minimum output value */
  minRange: number
  /** The maximum output value */
  maxRange: number
}

/**
 * Creates a linear scale function that maps values from a domain to a range.
 *
 * @param config - The scale configuration defining domain and range bounds
 * @returns A function that maps a domain value to its corresponding range value
 *
 * @example
 * ```ts
 * const toPercent = scaler({ minDomain: 0, maxDomain: 1, minRange: 0, maxRange: 100 })
 * toPercent(0.5) // 50
 * ```
 */
export const scaler = ({
  minDomain,
  maxDomain,
  minRange,
  maxRange,
}: ScaleConfig): ((n: number) => number) => {
  const rangeS = maxRange - minRange
  const domainS = maxDomain - minDomain
  return (n) => minRange + (rangeS * (n - minDomain)) / domainS
}

/**
 * Creates a 2D linear scale function that independently maps x and y coordinates.
 *
 * @param c1 - The scale configuration for the x-axis
 * @param c2 - The scale configuration for the y-axis
 * @returns A function that maps a {@link Point2D} from domain space to range space
 */
export const scaler2d = (
  c1: ScaleConfig,
  c2: ScaleConfig
): ((point: Point2D) => Point2D) => {
  const s1 = scaler(c1)
  const s2 = scaler(c2)
  return ([x, y]: Point2D) => [s1(x), s2(y)]
}

/**
 * Creates a function that projects 3D coordinates onto a 2D isometric plane.
 *
 * @param height - The height of the vertical parts of isometric grid cells
 * @returns A function mapping `[x, y, z]` to an isometric `[x, y]` position
 */
export const isoTransform = (height: number) => {
  const w = (height * Math.sqrt(3)) / 2
  return ([x, y, z]: [number, number, number]): [number, number] => [
    -w * (z - x),
    -height * (x / 2 + y + z / 2),
  ]
}

/**
 * Computes the centroid (geometric center) of a set of points.
 *
 * If the first and last points are identical (i.e. the polygon is closed),
 * the duplicate point is excluded from the calculation.
 *
 * @param points - An array of points (must contain at least one)
 * @returns The centroid point
 * @throws If the array is empty
 */
export const centroid = (points: Point2D[]): Point2D => {
  const n = points.length
  if (n === 0) {
    throw new Error("centroid must have at least one point")
  } else if (n === 1) {
    return points[0]
  } else {
    let m =
      points[0][0] == points[n - 1][0] && points[0][1] == points[n - 1][1]
        ? n - 1
        : n

    let x = 0
    let y = 0
    for (let i = 0; i < m; i++) {
      x += points[i][0]
      y += points[i][1]
    }
    return [x / m, y / m]
  }
}

const cp6 = Math.cos(Math.PI / 6)

/**
 * Creates a function that transforms integer grid coordinates to hexagonal grid positions.
 *
 * Assumes an integer grid as input. Supply a radius and orientation to control the layout.
 *
 * @param config - The hexagonal grid configuration
 * @param config.r - The radius of each hexagon
 * @param config.vertical - If `true` (default), vertices point up; if `false`, edges point up
 * @returns A function mapping integer `[x, y]` grid coordinates to hexagonal `[x, y]` positions
 */
export const hexTransform = ({
  r,
  vertical = true,
}: {
  r: number
  vertical?: boolean
}) => ([x, y]: Point2D): Point2D => {
  if (vertical) {
    return [y % 2 === 0 ? 2 * r * cp6 * x : (2 * x - 1) * r * cp6, 1.5 * y * r]
  } else {
    return [r * 1.5 * x, x % 2 === 0 ? 2 * r * cp6 * y : (2 * y - 1) * r * cp6]
  }
}

/**
 * Creates a function that transforms integer grid coordinates to triangular grid positions.
 *
 * Assumes an integer grid as input. Returns both the center position of each triangle
 * and whether it is flipped (pointing downward).
 *
 * @param config - The triangular grid configuration
 * @param config.s - The side length of each triangle
 * @returns A function mapping integer `[x, y]` to `{ at, flipped }` where `at` is the center
 *   position and `flipped` indicates if the triangle points downward
 */
export const triTransform = ({ s }: { s: number }) => {
  const r = s / (2 * Math.sin(Math.PI / 3))
  const h = (s * 0.5) / Math.tan(Math.PI / 3)

  return ([x, y]: Point2D): { at: Point2D; flipped: boolean } => {
    const isUp = (x + y) % 2 === 0
    if (isUp) {
      return { at: [0.5 * s * x, (h + r) * y], flipped: false }
    } else {
      return { at: [0.5 * s * x, (h + r) * y + h - r], flipped: true }
    }
  }
}
