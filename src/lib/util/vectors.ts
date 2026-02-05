import { Point2D } from "./types"

/**
 * Adds two 2D points component-wise.
 *
 * @param a - The first point
 * @param b - The second point
 * @returns A new point `[a.x + b.x, a.y + b.y]`
 */
export const add = ([x1, y1]: Point2D, [x2, y2]: Point2D): Point2D => [
  x1 + x2,
  y1 + y2,
]

/**
 * Subtracts the second point from the first, component-wise.
 *
 * @param a - The point to subtract from
 * @param b - The point to subtract
 * @returns A new point `[a.x - b.x, a.y - b.y]`
 */
export const subtract = ([x1, y1]: Point2D, [x2, y2]: Point2D): Point2D => [
  x1 - x2,
  y1 - y2,
]

/**
 * Computes the Euclidean magnitude (length) of a 2D vector.
 *
 * @param p - The vector
 * @returns The magnitude `sqrt(x² + y²)`
 */
export const magnitude = ([x, y]: Point2D): number => Math.sqrt(x ** 2 + y ** 2)

/**
 * Computes the Euclidean distance between two 2D points.
 *
 * @param a - The first point
 * @param b - The second point
 * @returns The distance between `a` and `b`
 */
export const distance = (a: Point2D, b: Point2D): number =>
  magnitude(subtract(a, b))

/**
 * Rotates a 2D point around the origin by the given angle.
 *
 * @param p - The point to rotate
 * @param a - The rotation angle in radians
 * @returns The rotated point
 */
export const rotate = ([x, y]: Point2D, a: number): Point2D => [
  x * Math.cos(a) - y * Math.sin(a),
  x * Math.sin(a) + y * Math.cos(a),
]

/**
 * Normalises a 2D vector to unit length (magnitude of 1).
 *
 * @param p - The vector to normalise
 * @returns A unit vector in the same direction as `p`
 */
export const normalise = (p: Point2D): Point2D => {
  const m = magnitude(p)
  return [p[0] / m, p[1] / m]
}

/**
 * Scales a 2D point by a scalar factor.
 *
 * @param p - The point to scale
 * @param scale - The scalar multiplier
 * @returns A new point with each component multiplied by `scale`
 */
export const scale = ([x, y]: Point2D, scale: number): Point2D => [
  scale * x,
  scale * y,
]

/**
 * Converts polar coordinates to Cartesian, offset from a given center point.
 *
 * @param center - The origin point to offset from
 * @param radius - The distance from the center
 * @param angle - The angle in radians
 * @returns The Cartesian point at the specified polar position
 */
export const polarToCartesian = (
  [x, y]: Point2D,
  radius: number,
  angle: number
): Point2D => [x + radius * Math.cos(angle), y + radius * Math.sin(angle)]

/**
 * Linearly interpolates between two points.
 *
 * @param a - The start point (returned when `proportion` is `0`)
 * @param b - The end point (returned when `proportion` is `1`)
 * @param proportion - The interpolation factor, defaults to `0.5` (midpoint)
 * @returns The interpolated point
 */
export const pointAlong = (
  a: Point2D,
  b: Point2D,
  proportion = 0.5
): Point2D => {
  return add(a, scale(subtract(b, a), proportion))
}

/**
 * Computes the dot product of two 2D vectors.
 *
 * @param a - The first vector
 * @param b - The second vector
 * @returns The scalar dot product `a.x * b.x + a.y * b.y`
 */
export const dot = ([x1, y1]: Point2D, [x2, y2]: Point2D): number =>
  x1 * x2 + y1 * y2

export default {
  add,
  subtract,
  magnitude,
  rotate,
  normalise,
  scale,
  polarToCartesian,
  pointAlong,
  dot,
  distance,
}
