import Head from "next/head"
import { A4ishSketch, A4InkscapeSketch } from "../src/components/SVGSketch"
import { v, Point2D, isoTransform, Transform } from "../src/lib"
import Link from "next/link"
import PageWithTransition from "../src/components/PageWithTransition"
import { perlin2 } from "../src/lib/util/noise"
import { useState } from "react"
import { Point } from "framer-motion"
import { c } from "../package"

export default function One() {
  return (
    <PageWithTransition>
      <Head>
        <title>Simple lines</title>
      </Head>
      <h1>Simple lines</h1>
      <p>Some simple line based plots</p>

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta
          s.range({ from: 0.3, to: 0.8, n: 32, inclusive: true }, (n) => {
            const path = s.strokedPath().moveTo([n, bottom * 0.9])
            path
              .lineTo([n, bottom * 0.8])
              .curveTo(
                [
                  n - 0.2,
                  bottom * (0.8 - n) +
                    s.gaussian({ mean: 0.1 * bottom, sd: 0.02 }),
                ],
                {
                  polarlity: s.randomPolarity(),
                  curveSize: n,
                  bulbousness: 0.5 - n / 4,
                  twist: n,
                }
              )
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta
          s.range({ from: 0.3, to: 0.7, n: 24, inclusive: true }, (n) => {
            const path = s
              .strokedPath()
              .moveTo([n, bottom * 0.9])
              .lineTo([n, bottom * 0.8])
              .curveTo([n, 3 * Math.abs(n - 0.5) * bottom])
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta
          s.range({ from: 0.3, to: 0.7, n: 25, inclusive: true }, (n) => {
            const path = s
              .strokedPath()
              .moveTo([n, bottom * 0.9])
              .lineTo([n, bottom * 0.8])
              .curveTo(
                [n + s.gaussian({ sd: 0.03 }), 3 * Math.abs(n - 0.5) * bottom],
                {
                  polarlity: n > 0.5 ? -1 : 1,
                }
              )
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta
          s.range({ from: 0.3, to: 0.7, n: 25, inclusive: true }, (n) => {
            if (n < 0.55 && n > 0.45) return
            const path = s
              .strokedPath((attr) =>
                n > 0.5 ? attr.stroke(180, 95, 25) : attr.stroke(200, 90, 30)
              )
              .moveTo([n, bottom * 0.9])
              .lineTo([n, bottom * 0.8])
              .curveTo([n - 0.5 + n, 4 * Math.abs(n - 0.5) * bottom], {
                polarlity: n > 0.5 ? 1 : -1,
                twist: (n > 0.5 ? -1 : 1) * 12 * Math.abs(n - 0.5),
              })
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta
          s.range({ from: 0.3, to: 0.7, n: 25, inclusive: true }, (n) => {
            const x1 = n + s.gaussian({ sd: 0.05 })
            const y1 = bottom * 0.5 + s.gaussian({ sd: 0.1 * bottom })
            const x2 = s.gaussian({ mean: x1, sd: 0.1 })
            const path = s
              .strokedPath((a) => a.stroke(170, 100, 30))
              .moveTo([n, bottom * 0.9])
              .lineTo([n, bottom * 0.8])
              .curveTo([x1, y1], {
                curveSize: 0.4,
                polarlity: n > 0.5 ? 1 : -1,
                twist: (n > 0.5 ? -1 : 1) * 12 * Math.abs(n - 0.5),
              })

            path.curveTo([x2, bottom * 0.2], {
              curveSize: 0.4,
              polarlity: n > 0.5 ? 1 : -1,
              twist: (n > 0.5 ? -1 : 1) * 12 * Math.abs(n - 0.5),
            })

            s.strokedPath().ellipse([x1, y1], 0.02, 0.02)
          })
        }}
      />
    </PageWithTransition>
  )
}
