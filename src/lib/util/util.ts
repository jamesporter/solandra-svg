/**
 * General utility functions for graphics and geometry
 */
import { Point2D } from "./types"

/**
 * Clamps a number to be within a specified range
 * @param config - Configuration object
 * @param config.from - Minimum value
 * @param config.to - Maximum value
 * @param n - The number to clamp
 * @returns The clamped value
 */
export const clamp = (
  { from, to }: { from: number; to: number },
  n: number
): number => {
  return Math.min(to, Math.max(from, n))
}

type ScaleConfig = {
  minDomain: number
  maxDomain: number
  minRange: number
  maxRange: number
}

/**
 * Creates a function that maps values from one range (domain) to another (range)
 * @param config - Configuration object
 * @param config.minDomain - Minimum value in input domain
 * @param config.maxDomain - Maximum value in input domain
 * @param config.minRange - Minimum value in output range
 * @param config.maxRange - Maximum value in output range
 * @returns A function that scales values from domain to range
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
 * Creates a function that maps 2D points from one coordinate space to another
 * @param c1 - Scale configuration for x coordinate
 * @param c2 - Scale configuration for y coordinate
 * @returns A function that scales Point2D from domain to range
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
 * @param height The height of the (vertical parts of) isometric grid cells
 * @returns A function mapping from [x,y,z] to [x,y].
 */
export const isoTransform = (height: number) => {
  const w = (height * Math.sqrt(3)) / 2
  return ([x, y, z]: [number, number, number]): [number, number] => [
    -w * (z - x),
    -height * (x / 2 + y + z / 2),
  ]
}

/**
 * Calculates the centroid (geometric center) of a set of points
 * If the first and last points are the same, treats as a closed polygon and excludes the duplicate
 * @param points - Array of points
 * @returns The centroid point
 * @throws Error if points array is empty
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
 * Creates a function that transforms integer grid coordinates to hexagonal grid positions
 * @param config - Configuration object
 * @param config.r - Radius of each hexagon
 * @param config.vertical - If true, hexagons have vertex at top; if false, flat top (default: true)
 * @returns A function that maps [x, y] grid coordinates to hexagonal positions
 * @note Assumes integer grid coordinates
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
 * Creates a function that transforms integer grid coordinates to triangular grid positions
 * @param config - Configuration object
 * @param config.s - Side length of each triangle
 * @returns A function that maps [x, y] grid coordinates to triangle center and orientation
 * @note Assumes integer grid coordinates. Returns object with center position and flip status
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
