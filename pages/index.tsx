import Head from "next/head"
import { SVGSketch } from "../src/components/SVGSketch"
import { v, Point2D } from "../src/lib"

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Solandra SVG</title>
      </Head>

      <h1>solandra-svg</h1>

      <p>A little library for drawing in SVG, but with a nicer API</p>

      <h2>Hello World</h2>
      <SVGSketch
        width={480}
        height={480}
        sketch={(s) => {
          const path = s
            .strokedPath((attr) =>
              attr.stroke(220, 90, 30, 0.9).fill(20, 90, 80, 0.2)
            )
            .moveTo(s.randomPoint())
          s.times(25, () => {
            path.lineTo(s.randomPoint())
          })
        }}
      />

      <h2>Tiling</h2>
      <SVGSketch
        width={480}
        height={480}
        sketch={(s) => {
          s.forTiling(
            { n: 5, type: "square", margin: 0.1 },
            ([x, y], [dX], c, i) => {
              const path = s
                .strokedPath((attr) =>
                  attr.stroke(355, 10, 10, 0.9).fill(340, 90, 70, 0.2)
                )
                .moveTo([0.5, 0.5])

              s.times(10, () => {
                const pt = s.randomPoint()
                path.lineTo([x + pt[0] * dX, y + pt[1] * dX])
              })
            }
          )
        }}
      />

      <h2>Hello Curves</h2>
      <SVGSketch
        width={480}
        height={480}
        sketch={(s) => {
          const { center, bottom } = s.meta

          s.times(15, () => {
            let start = [s.random(), bottom] as Point2D
            let end = [s.random(), bottom] as Point2D
            s.strokedPath((attr) => attr.stroke(20, 90, 60, 0.5))
              .moveTo(start)
              .curveTo(end, { curveSize: 3 })

            start = [s.random(), 0] as Point2D
            end = [s.random(), 0] as Point2D
            s.strokedPath((attr) => attr.stroke(0, 90, 60, 0.5))
              .moveTo(start)
              .curveTo(end, { polarlity: -1, curveSize: 3 })
          })
        }}
      />
    </div>
  )
}
