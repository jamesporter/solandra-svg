import Head from "next/head"
import { A4ishSketch, A4InkscapeSketch } from "../src/components/SVGSketch"
import { v, Point2D } from "../src/lib"
import Link from "next/link"
import PageWithTransition from "../src/components/PageWithTransition"
import { perlin2 } from "../src/lib/util/noise"
import { useState } from "react"

export default function Three() {
  return (
    <PageWithTransition>
      <Head>
        <title>Even more plots</title>
      </Head>
      <h1>Even more plots</h1>
      <p>
        <Link href="/">
          <a>Home</a>
        </Link>
      </p>

      <A4InkscapeSketch
        sketch={(s) => {
          s.forTiling({ n: 5, type: "square", margin: 0.1 }, (pt, [dX], at) => {
            const points = s.shuffle(
              s.build(s.aroundCircle, { at, r: dX / 12, n: 16 }, (pt) =>
                s.perturb({ at: pt })
              )
            )

            const path = s.strokedPath().moveTo(points[points.length - 1])
            points.forEach((pt) => path.curveTo(pt))
          })
        }}
      />
    </PageWithTransition>
  )
}
