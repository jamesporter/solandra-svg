import { PageLayout } from "@/components/PageLayout"
import { A4InkscapeSketch } from "@/components/SVGSketch"
import { Point2D, Transform } from "@/lib"

export default function Card() {
  return (
    <PageLayout>
      <h2>A Card</h2>
      <p>In layers</p>

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom } = s.meta
          const margin = 0.12

          const d = {
            l: 0.5 + 0.5 * margin,
            r: 0.5 + (1 - margin) * 0.5,
            t: 0.5 * margin,
            b: bottom - 0.5 * margin,
            c: [0.75, bottom * 0.5] as Point2D,
          }

          const points = s.shuffle(
            s.build(s.aroundCircle, { at: d.c, r: 0.13, n: 35 }, (pt) => pt)
          )

          const start = s.perturb({ at: [d.l, d.t], magnitude: 0.05 })
          const path = s.strokedPath().moveTo(start)

          s.times(3, () => {
            path
              .lineTo(s.perturb({ at: [d.r, d.t], magnitude: 0.05 }))
              .lineTo(s.perturb({ at: [d.r, d.b], magnitude: 0.05 }))
              .lineTo(s.perturb({ at: [d.l, d.b], magnitude: 0.05 }))
              .lineTo(s.perturb({ at: [d.l, d.t], magnitude: 0.05 }))
          })
          path.lineTo(start)

          s.times(3, (n) => {
            const p3 = s
              .strokedPath((a) =>
                a.transform(
                  Transform.of({
                    translate: [-0.125, 0.175 + (n - 1) * 0.2],
                    scale: [0.5, 0.5],
                  })
                )
              )
              .moveTo(points[0])
            points
              .slice(1)
              .forEach((pt) => p3.curveTo(pt, { curveSize: (n + 1) * 0.2 }))
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom } = s.meta
          const margin = 0.12

          const d = {
            l: 0.5 + 0.5 * margin,
            r: 0.5 + (1 - margin) * 0.5,
            t: 0.5 * margin,
            b: bottom - 0.5 * margin,
            c: [0.75, bottom * 0.5] as Point2D,
          }

          const points = s.shuffle(
            s.build(s.aroundCircle, { at: d.c, r: 0.13, n: 35 }, (pt) => pt)
          )

          const p2 = s.strokedPath().moveTo(points[0])
          points.slice(1).forEach((pt) => p2.curveTo(pt, { curveSize: 0.2 }))
        }}
      />
    </PageLayout>
  )
}
