import { Point2D, CurveConfig } from "./util/types"
import { convertToSVGCubicSpec } from "./util/curveCalcs"
import { Attributes } from "./attributes"
import { v } from "."

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
  | { kind: "close" }

// To force types later, a bit nasty but to cover most potential errors with runtime checks
type Toable = { to: Point2D }

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
  }
}

export class Path {
  segments: PathSegment[] = []

  constructor(readonly attributes: Attributes) {}

  moveTo(point: Point2D): Path {
    this.segments.push({ kind: "move", to: point })
    return this
  }

  lineTo(point: Point2D): Path {
    this.segments.push({ kind: "line", to: point })
    return this
  }

  curveTo(point: Point2D, config: CurveConfig = {}): Path {
    const {
      curveSize = 1,
      polarlity = 1,
      bulbousness = 1,
      curveAngle = 0,
      twist = 0,
    } = config

    this.segments.push({
      kind: "cubicCurve",
      to: point,
      config: { curveSize, polarlity, bulbousness, curveAngle, twist },
    })
    return this
  }

  rect(
    at: Point2D,
    width: number,
    height: number,
    align: "topLeft" | "center" = "topLeft"
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

  circle(
    at: Point2D,
    size: number,
    align: "topLeft" | "center" = "topLeft"
  ): Path {
    const [cX, cY]: Point2D =
      align === "center" ? at : [at[0] + size / 2, at[1] + size / 2]
    const a = (4 / 3) * Math.tan(Math.PI / 8)

    const start: Point2D = [cX, cY - size / 2]
    const firstPoint: Point2D = [cX + size / 2, cY]
    const secondPoint: Point2D = [cX, cY + size / 2]
    const thirdPoint: Point2D = [cX - size / 2, cY]

    const D = v.subtract(firstPoint, start)

    this.segments.push({ kind: "move", to: start })

    const bulbousness =
      v.magnitude([((1 - a) * size) / 2, ((a - 1) * size) / 2]) / v.magnitude(D)

    const ac = v.add(start, v.scale(D, (1 - bulbousness) / 2))
    const cp1: Point2D = [cX + (a * size) / 2, cY - size / 2]

    const curveSize = (v.magnitude(v.subtract(cp1, ac)) * 2) / v.magnitude(D)

    ;[firstPoint, secondPoint, thirdPoint, start].forEach((pt) => {
      this.segments.push({
        kind: "cubicCurve",
        to: pt,
        config: {
          polarlity: 1,
          curveAngle: 0,
          twist: 0,
          curveSize,
          bulbousness,
        },
      })
    })

    return this
  }

  close(): Path {
    this.segments.push({ kind: "close" })
    return this
  }

  // chaiken(n: number = 2): Path {

  // }

  get string(): string {
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
    return `<path ${this.attributes.string} d="${d}" />`
  }

  configureAttributes(configureAttributes: (attributes: Attributes) => void) {
    configureAttributes(this.attributes)
  }
}
