import { PageLayout } from "@/components/PageLayout"
import { A4ishSketch } from "@/components/SVGSketch"
import { Point2D, v } from "@/lib"

export default function One() {
  return (
    <PageLayout>
      <h1>First Prints</h1>

      <p>Some things to try out on plotter</p>

      <h2>First Set</h2>

      <A4ishSketch
        sketch={(s) => {
          s.forTiling(
            { margin: 0.1, n: 10, type: "square" },
            (_pt, [dX], [x, y]) => {
              s.strokedPath()
                .moveTo([x, y])
                .lineTo([
                  x + dX * (s.random() - 0.5),
                  y + dX * (s.random() - 0.5),
                ])
                .curveTo(
                  [
                    x + dX * (s.random() - 0.5),
                    y + (dX / 2) * (s.random() - 0.5),
                  ],
                  { polarlity: -1 }
                )
                .curveTo([
                  x + (dX / 2) * (s.random() - 0.5),
                  y + dX * (s.random() - 0.5),
                ])
            }
          )
        }}
      />

      <A4ishSketch
        sketch={(s) => {
          const { center, bottom } = s.meta
          const [cX, cY] = center
          const p = s
            .strokedPath((attr) => attr.strokeWidth(0.005).strokeOpacity(0.9))
            .moveTo(center)
          s.times(72, (n) => {
            const a = (n * Math.PI * 2) / 72
            const r = 0.33 * Math.cos(a * 4)
            p.curveTo([cX + r * Math.cos(a), cY + r * Math.sin(a)], {
              curveSize: s.gaussian({ sd: 0.3, mean: 0.8 }),
            }).moveTo([cX + 0.1 * Math.cos(a), cY + 0.1 * Math.sin(a)])
          })
        }}
      />

      <A4ishSketch
        sketch={(s) => {
          s.forMargin(0.1, ([sX, sY], [w, h], [cX, cY]) => {
            s.times(32, () => {
              const x1 = s.random() * w + sX
              const x2 = s.random() * w + sX
              s.strokedPath().moveTo([x1, cY]).curveTo([x2, cY])
            })
          })
        }}
      />

      <A4ishSketch
        sketch={(s) => {
          const { center, bottom } = s.meta
          const [cX, cY] = center
          const path = s.strokedPath().moveTo(center)
          const N = 14
          s.times(N, (n) => {
            const a = (n * Math.PI * 2) / N
            const aDash =
              ((n + s.gaussian({ mean: 1, sd: 0.5 })) * Math.PI * 2) / N

            ;[0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.32].forEach((r) => {
              s.doProportion(0.8, () => {
                path.lineTo([cX + Math.cos(a) * r, cY + Math.sin(a) * r])
                path.lineTo([
                  cX + Math.cos(aDash) * r,
                  cY + Math.sin(aDash) * r,
                ])
                path.moveTo([cX + Math.cos(a) * r, cY + Math.sin(a) * r])
              })
            })

            path.lineTo(center)
          })
        }}
      />

      <A4ishSketch
        sketch={(s) => {
          s.times(3, () => {
            const path = s.strokedPath()
            const points: Point2D[] = []
            s.forTiling(
              { n: 8, type: "square", margin: 0.1 },
              (pt, d, c, i) => {
                points.push(s.perturb({ at: c, magnitude: d[0] }))
              }
            )

            path.moveTo(points[0])
            points.slice(1).forEach((pt: Point2D) => path.lineTo(pt))
          })
        }}
      />

      <h2>Second set</h2>

      <p>Adapted from some previous ones using Solandra.</p>

      <A4ishSketch
        sketch={(s) => {
          const { center, bottom } = s.meta

          const start: Point2D = [0, 0]
          const path = [start]
          let current = start

          s.times(1000, () => {
            let next: Point2D
            s.proportionately([
              [1, () => (next = [current[0] + 1, current[1]])],
              [1, () => (next = [current[0] - 1, current[1]])],
              [1, () => (next = [current[0], current[1] + 1])],
              [1, () => (next = [current[0], current[1] - 1])],
            ])

            if (Math.abs(next![0]) > 13 || Math.abs(next![1]) > 7) next = start
            current = next!
            path.push(next!)
          })

          const sPath = s
            .strokedPath((attr) => attr.strokeWidth(0.002))
            .moveTo(center)

          path.forEach((pt) => {
            sPath.lineTo(
              s.perturb({
                at: v.add(center, v.scale(pt, 0.04)),
                magnitude: 0.01,
              })
            )
          })
        }}
      />

      <A4ishSketch
        sketch={(s) => {
          const { center } = s.meta
          const N = 100
          const sPath = s
            .strokedPath((attr) => attr.strokeWidth(0.002))
            .moveTo(center)

          s.times(N, (n) => {
            const a = s.random() * Math.PI * 2
            const r = (0.22 * n + 1) / N
            sPath.curveTo(
              v.add(center, [2 * r * Math.cos(a), 0.8 * r * Math.sin(a)])
            )
          })
          sPath.curveTo(center)
        }}
      />

      <A4ishSketch
        sketch={(s) => {
          const { bottom, center } = s.meta
          const N = 40

          const start: Point2D = [0.5, bottom * 0.95]
          const left: Point2D = [0.2, bottom * 0.35]
          const right: Point2D = [0.8, bottom * 0.35]

          const lv = v.subtract(left, start)
          const rv = v.subtract(right, start)

          s.times(2, (r) => {
            const sPath = s
              .strokedPath((attr) => attr.strokeWidth(0.002))
              .moveTo(start)
            s.times(N, (n) => {
              if (n % 2 == 0) {
                sPath.curveTo(
                  s.perturb({
                    at: v.add(start, v.scale(lv, n / N)),
                    magnitude: 0.05,
                  }),
                  { polarlity: -1 }
                )
              } else {
                sPath.curveTo(
                  s.perturb({
                    at: v.add(start, v.scale(rv, n / N)),
                    magnitude: 0.05,
                  })
                )
              }
            })
          })
        }}
      />

      <A4ishSketch
        sketch={(s) => {
          s.forHorizontal({ n: 12, margin: 0.1 }, ([x, y], [dX, dY]) => {
            s.strokedPath()
              .moveTo([x - dX, y + dY])
              .lineTo(s.perturb({ at: [x + dX, y] }))
              .lineTo([x + 2 * dX, y + dY])
              .lineTo([x + dX, y])
          })
        }}
      />
    </PageLayout>
  )
}
