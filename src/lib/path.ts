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

  // Was copying from solandra but there I jump to raw bezier, wanted to stay in curve config world: TODO Maths: can I do it? How?
  // seems likely to work?
  //
  // ellipse(
  //   at: Point2D,
  //   width: number,
  //   height: number,
  //   align: "topLeft" | "center" = "topLeft"
  // ): Path {
  //   const [cX, cY]: Point2D =
  //   align === "center" ? at : [at[0] + width / 2, at[1] + height / 2]
  // const a = (4 / 3) * Math.tan(Math.PI / 8)

  // this.segments
  // }

  close(): Path {
    this.segments.push({ kind: "close" })
    return this
  }

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
