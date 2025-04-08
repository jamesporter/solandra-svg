import { Point2D, CurveConfig, ArcConfig } from "./util/types"
import { convertToSVGCubicSpec } from "./util/curveCalcs"
import { Attributes } from "./attributes"
import { v } from "."
import { indent } from "./util/internalUtil"

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

  close(): Path {
    this.segments.push({ kind: "close" })
    return this
  }

  chaiken(n: number = 2): Path {
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

  map(fn: (el: PathSegment, index: number) => PathSegment): Path {
    this.segments = this.segments.map(fn)
    return this
  }

  /**
   * NB while this copies a path it won't be inclued in a drawing
   * use SolandraSVG.clonePath(path) for this.
   */
  clone(attributes?: Attributes): Path {
    const p = new Path(attributes || this.attributes.clone())
    p.segments = this.segments.map((s) => JSON.parse(JSON.stringify(s)))
    return p
  }

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

  configureAttributes(configureAttributes: (attributes: Attributes) => void) {
    configureAttributes(this.attributes)
  }
}
