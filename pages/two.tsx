import Head from "next/head"
import { A4ishSketch, A4InkscapeSketch } from "../src/components/SVGSketch"
import { v, Point2D } from "../src/lib"
import Link from "next/link"
import PageWithTransition from "../src/components/PageWithTransition"

export default function One() {
  return (
    <PageWithTransition>
      <Head>
        <title>More plots</title>
      </Head>

      <h1>More plots</h1>
      <p>
        <Link href="/">
          <a>Home</a>
        </Link>
      </p>

      <p>With new, hopefully more Inkscape ready approach</p>

      <h2>Third Set</h2>

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta
          const path = s.strokedPath().moveTo(center)
          s.times(40, () => {
            const pt = v.add(
              [0.15, 0.15 * bottom],
              v.scale(s.randomPoint(), 0.7)
            )
            path.curveTo(pt)
            s.strokedPath().ellipse(pt, 0.03, 0.02)
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          s.forHorizontal(
            { n: 30, margin: 0.1 },
            ([x, y], [dX, dY], [cX, cY], i) => {
              const a: Point2D = [cX, y]
              const b: Point2D = [cX, y + dY * Math.random()]

              s.strokedPath().moveTo(a).lineTo(b)
            }
          )

          s.forVertical(
            { n: 20, margin: 0.1 },
            ([x, y], [dX, dY], [cX, cY], i) => {
              const a: Point2D = [x, cY]
              const b: Point2D = [x + dX * Math.random(), cY]

              s.strokedPath().moveTo(a).lineTo(b)
            }
          )
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const points = s.shuffle(
            s.build(
              s.aroundCircle,
              { n: 40, r: 0.25, at: s.meta.center },
              (pt) => pt
            )
          )
          const path = s.strokedPath().moveTo(points[0])
          points.slice(1).forEach((pt) => path.lineTo(pt))
        }}
      />
    </PageWithTransition>
  )
}
