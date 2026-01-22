/**
 * Vector and point manipulation utilities for 2D graphics
 */
import { Point2D } from "./types"

/**
 * Adds two points/vectors component-wise
 * @param p1 - First point
 * @param p2 - Second point
 * @returns Sum of the two points
 */
export const add = ([x1, y1]: Point2D, [x2, y2]: Point2D): Point2D => [
  x1 + x2,
  y1 + y2,
]

/**
 * Subtracts one point/vector from another
 * @param p1 - Point to subtract from
 * @param p2 - Point to subtract
 * @returns Difference of the two points
 */
export const subtract = ([x1, y1]: Point2D, [x2, y2]: Point2D): Point2D => [
  x1 - x2,
  y1 - y2,
]

/**
 * Calculates the magnitude (length) of a vector
 * @param p - The vector/point
 * @returns The magnitude of the vector
 */
export const magnitude = ([x, y]: Point2D): number => Math.sqrt(x ** 2 + y ** 2)

/**
 * Calculates the distance between two points
 * @param a - First point
 * @param b - Second point
 * @returns The Euclidean distance between the points
 */
export const distance = (a: Point2D, b: Point2D): number =>
  magnitude(subtract(a, b))

/**
 * Rotates a point around the origin
 * @param p - The point to rotate
 * @param a - Rotation angle in radians
 * @returns The rotated point
 */
export const rotate = ([x, y]: Point2D, a: number): Point2D => [
  x * Math.cos(a) - y * Math.sin(a),
  x * Math.sin(a) + y * Math.cos(a),
]

/**
 * Normalizes a vector to unit length
 * @param p - The vector to normalize
 * @returns A unit vector in the same direction
 */
export const normalise = (p: Point2D): Point2D => {
  const m = magnitude(p)
  return [p[0] / m, p[1] / m]
}

/**
 * Scales a vector by a scalar value
 * @param p - The vector to scale
 * @param scale - The scale factor
 * @returns The scaled vector
 */
export const scale = ([x, y]: Point2D, scale: number): Point2D => [
  scale * x,
  scale * y,
]

/**
 * Converts polar coordinates to Cartesian coordinates relative to a center point
 * @param center - The center point
 * @param radius - The radius from center
 * @param angle - The angle in radians
 * @returns The Cartesian coordinates
 */
export const polarToCartesian = (
  [x, y]: Point2D,
  radius: number,
  angle: number
): Point2D => [x + radius * Math.cos(angle), y + radius * Math.sin(angle)]

/**
 * Finds a point along the line segment between two points
 * @param a - Starting point
 * @param b - Ending point
 * @param proportion - Position along the line (0 = at a, 1 = at b, 0.5 = midpoint)
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
 * Calculates the dot product of two vectors
 * @param p1 - First vector
 * @param p2 - Second vector
 * @returns The dot product
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
