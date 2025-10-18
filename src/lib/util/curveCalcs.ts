import { Point2D, CurveConfig } from "./types"
import { default as v } from "./vectors"

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
