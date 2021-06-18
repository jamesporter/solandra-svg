import Head from "next/head"
import { A4ishSketch, A4InkscapeSketch } from "../src/components/SVGSketch"
import { v, Point2D, isoTransform, Transform } from "../src/lib"
import Link from "next/link"
import PageWithTransition from "../src/components/PageWithTransition"
import { perlin2 } from "../src/lib/util/noise"
import { useState } from "react"
import { Point } from "framer-motion"

export default function Five() {
  return (
    <PageWithTransition>
      <Head>
        <title>Laser printer Sketches I</title>
      </Head>
      <h1>Laser printer Sketches I</h1>
      <h2>Because plotters are slow.</h2>

      <A4InkscapeSketch
        sketch={(s) => {
          s.forHorizontal(
            {
              n: 24,
              margin: 0.1,
            },
            ([x, y], [dX, dY], [cX, cY], i) => {
              s.strokedPath((attr) => attr.strokeWidth(0.005).stroke(0, 0, 0))
                .moveTo([cX, y + dY + s.randomPolarity() * 0.025])
                .curveTo([cX, y + s.randomPolarity() * 0.025], {
                  curveSize: (i - 11.5) * 0.1,
                  curveAngle: perlin2(cX, 0),
                  twist: 3 * perlin2(cY, cX),
                })
            }
          )
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const N = 20
          const { bottom } = s.meta
          const scale: Point2D = [1 / 20, bottom / 20]

          const done = new Set<string>()
          function newPoint(): Point2D {
            return [
              s.uniformRandomInt({
                from: 0,
                to: N,
              }),
              s.uniformRandomInt({
                from: 0,
                to: N,
              }),
            ]
          }
          let current: Point2D = newPoint()
          let nextPos: Point2D = newPoint()

          let path = s.strokedPath((attr) => attr.strokeWidth(0.005))

          for (let i = 0; i < 600; i++) {
            s.proportionately([
              [
                1,
                () => {
                  nextPos = [current[0], current[1] + 1]
                },
              ],
              [
                1,
                () => {
                  nextPos = [current[0], current[1] - 1]
                },
              ],
              [
                1,
                () => {
                  nextPos = [current[0] + 1, current[1]]
                },
              ],
              [
                1,
                () => {
                  nextPos = [current[0] - 1, current[1]]
                },
              ],
            ])

            if (
              done.has(`${nextPos}`) ||
              nextPos[0] < 0 ||
              nextPos[0] > N ||
              nextPos[1] < 0 ||
              nextPos[1] > N
            ) {
              nextPos = newPoint()
            } else {
              path
                .moveTo(v.multiply(current, scale))
                .lineTo(v.multiply(nextPos, scale))
              done.add(`${nextPos}`)
            }

            current = nextPos
          }
        }}
      />
    </PageWithTransition>
  )
}
