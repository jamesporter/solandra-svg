import { Point2D, CurveConfig } from "./types"
import { default as v } from "./vectors"

/**
 * Converts a curve configuration into an SVG cubic bezier path command string.
 *
 * Computes two control points for a cubic bezier curve between `from` and `to`,
 * shaped by the given {@link CurveConfig} parameters (polarity, size, angle, bulbousness, twist).
 *
 * @param config - The curve specification
 * @param config.from - The starting point of the curve
 * @param config.to - The ending point of the curve
 * @param config.curveSize - Amplitude of the curve relative to the distance between points
 * @param config.curveAngle - Rotation applied to the curve's perpendicular axis in radians
 * @param config.bulbousness - Controls the spread of the two control points
 * @param config.polarity - Direction of the curve (`1` or `-1`)
 * @param config.twist - Additional rotation applied to the control point spread axis in radians
 * @returns An SVG path `C` command string (e.g. `"C x1 y1, x2 y2, x y"`)
 */
// TODO in case where from == to, should handle in somewhat nice way?
export function convertToSVGCubicSpec({
  from,
  to,
  curveSize,
  curveAngle,
  bulbousness,
  polarity,
  twist,
}: { from: Point2D; to: Point2D } & Required<CurveConfig>): string {
  const u = v.subtract(to, from)
  const d = v.magnitude(u)
  const m = v.add(from, v.scale(u, 0.5))
  const perp = v.normalise(v.rotate(u, -Math.PI / 2))
  const rotatedPerp = v.rotate(perp, curveAngle)
  const controlMid = v.add(
    m,
    v.scale(rotatedPerp, curveSize * polarity * d * 0.5)
  )
  const perpOfRot = v.normalise(v.rotate(rotatedPerp, -Math.PI / 2 - twist))

  const control1 = v.add(controlMid, v.scale(perpOfRot, (bulbousness * d) / 2))
  const control2 = v.add(controlMid, v.scale(perpOfRot, (-bulbousness * d) / 2))

  return `C ${control1.join(" ")}, ${control2.join(" ")}, ${to.join(" ")}`
}
