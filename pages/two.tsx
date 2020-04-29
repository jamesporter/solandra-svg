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
            s.strokedPath().ellipse(pt, 0.02, 0.02)
          })
        }}
      />
    </PageWithTransition>
  )
}
