import Head from "next/head"
import { A4ishSketch, A4InkscapeSketch } from "../src/components/SVGSketch"
import { v, Point2D, isoTransform, Transform } from "../src/lib"
import Link from "next/link"
import PageWithTransition from "../src/components/PageWithTransition"
import { perlin2 } from "../src/lib/util/noise"
import { useState } from "react"
import { Point } from "framer-motion"

export default function One() {
  const [nMaze, setNMaze] = useState(64)
  const [n, setN] = useState(48)
  const [depth, setDepth] = useState(200)
  const [noiseX, setNoiseX] = useState(0)

  return (
    <PageWithTransition>
      <Head>
        <title>More plots</title>
      </Head>
      <h1>More plots</h1>
      <h2>Early ideas for different colours</h2>
      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta

          const twisty = (scale: number, start: Point2D) => {
            const isofy = isoTransform(scale)

            const path = s.strokedPath((attr) =>
              attr.transform(
                Transform.of({
                  translate: start,
                })
              )
            )

            path
              .moveTo(isofy([0, 0, 0]))
              .lineTo(isofy([1, 0, 0]))
              .lineTo(isofy([1, 0, 1]))
              .lineTo(isofy([-1, 0, 1]))
              .lineTo(isofy([-1, 0, -1]))
              .lineTo(isofy([2, 0, -1]))
              .lineTo(isofy([2, 0, 2]))
              .lineTo(isofy([-2, 0, 2]))
              .lineTo(isofy([-2, 0, -2]))
              .lineTo(isofy([2, 0, -2]))
          }

          twisty(0.1, [0.5, bottom * 0.4])
          twisty(0.05, [0.2, bottom * 0.65])
          twisty(0.05, [0.5, bottom * 0.65])
          twisty(0.05, [0.8, bottom * 0.65])

          s.forHorizontal({ n: 5 }, (_pt, [w], [cX]) => {
            twisty(0.025, [cX, bottom * 0.85])
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta
          const points: Point2D[] = []
          s.range(
            { from: 0, to: Math.PI * 2, inclusive: false, n: 12 },
            (a) => {
              const r = s.gaussian({ mean: 0.2, sd: 0.05 })
              points.push([
                0.5 + r * Math.cos(a),
                bottom * 0.5 + r * Math.sin(a),
              ])
            }
          )

          const path = s.strokedPath()
          points.forEach((pt) => {
            path.moveTo(center)
            path.lineTo(pt)
          })

          // deliberately set up to allow for swapping pen
          const path2 = s.strokedPath((attr) => attr.stroke(0, 100, 50))
          points.forEach((pt) => {
            path2.ellipse(pt, 0.05, 0.05)
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta

          s.times(3, (n) => {
            const path = s.strokedPath((attr) =>
              attr.stroke(160 + n * 20, 90, 40)
            )
            let end: Point2D
            s.aroundCircle(
              { at: center, r: bottom * 0.3, n: 14 - n * 2 },
              (pt, i) => {
                if (i == 0) {
                  path.moveTo(pt)
                  end = pt
                } else {
                  path.curveTo(pt, {
                    curveSize: s.gaussian({ mean: 2, sd: 0.4 }),
                    polarlity: s.randomPolarity(),
                  })
                }
              }
            )
            path.curveTo(end, {})
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta
          const pathOne = s.strokedPath()
          const pathTwo = s.strokedPath((attr) => attr.stroke(220, 90, 40))

          type DrawFn = (pt: Point2D, s: number) => void
          const tileDrawers: [DrawFn, DrawFn][] = [
            [
              (pt, s) => {
                pathOne
                  .moveTo(v.add(pt, [s / 2, 0]))
                  .lineTo(v.add(pt, [s / 2, s]))
              },
              (pt, s) => {
                pathTwo
                  .moveTo(v.add(pt, [0, s / 2]))
                  .lineTo(v.add(pt, [s, s / 2]))
              },
            ],
            [
              (pt, s) => {
                pathOne
                  .moveTo(v.add(pt, [s / 2, 0]))
                  .lineTo(v.add(pt, [s, s / 2]))
                  .lineTo(v.add(pt, [s / 2, s]))
                  .lineTo(v.add(pt, [0, s / 2]))
                  .lineTo(v.add(pt, [s / 2, 0]))
              },
              (pt, s) => {
                pathTwo
                  .moveTo(v.add(pt, [s / 2, s / 2]))
                  .lineTo(v.add(pt, [s / 2, s]))
              },
            ],
            [
              (pt, s) => {
                pathOne
                  .moveTo(v.add(pt, [s / 2, 0]))
                  .lineTo(v.add(pt, [0, s / 2]))
              },
              (pt, s) => {
                pathTwo.moveTo(v.add(pt, [0, s])).lineTo(v.add(pt, [s, 0]))
              },
            ],
          ]

          s.forTiling(
            { n: 12, margin: 0.1, type: "square" },
            (pt, [dX], c, i) => {
              const j = s.uniformRandomInt({
                from: 0,
                to: tileDrawers.length,
                inclusive: false,
              })

              tileDrawers[j][0](pt, dX)
              tileDrawers[j][1](pt, dX)
            }
          )
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta
          const pathOne = s.strokedPath().moveTo([0.1, 0.1])
          const pathTwo = s
            .strokedPath((attr) => attr.stroke(170, 90, 40))
            .moveTo([0.1, bottom - 0.1])

          s.forHorizontal({ n: 20, margin: 0.1 }, ([x, y], [dX, dY], [cX]) => {
            pathOne
              .lineTo([cX, y + s.gaussian({ mean: bottom / 2, sd: 0.05 })])
              .lineTo([x + dX, y])

            pathTwo
              .lineTo([cX, y + dY - s.gaussian({ mean: bottom / 2, sd: 0.05 })])
              .lineTo([x + dX, y + dY])
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta
          const pathOne = s.strokedPath().moveTo([0.1, bottom / 2])
          const pathTwo = s
            .strokedPath((attr) => attr.stroke(170, 90, 40))
            .moveTo([0.1, bottom / 2])

          s.forHorizontal(
            { n: 20, margin: 0.1 },
            ([x, y], [dX, dY], [cX, cY]) => {
              pathOne
                .lineTo([cX, y + s.gaussian({ mean: bottom / 2, sd: 0.05 })])
                .lineTo([x + dX, cY])

              pathTwo
                .lineTo([
                  cX,
                  y + dY - s.gaussian({ mean: bottom / 2, sd: 0.05 }),
                ])
                .lineTo([x + dX, cY])
            }
          )
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          s.forTiling(
            { n: 3, type: "square", margin: 0.175 },
            ([sX, sY], [dX], c, i) => {
              const path = s.strokedPath((attr) =>
                attr
                  .strokeWidth(0.0035)
                  .stroke(140 + i * 24, 80, 40)
                  .transform(
                    Transform.of({
                      rotate: [(i * Math.PI) / 4 / 3, c],
                    })
                  )
              )

              s.range(
                { from: sX, to: sX + dX, n: 16, inclusive: true },
                (x) => {
                  path
                    .moveTo(s.perturb({ magnitude: 0.01, at: [x, sY] }))
                    .lineTo(s.perturb({ magnitude: 0.01, at: [x, sY + dX] }))
                }
              )
            }
          )
        }}
      />
    </PageWithTransition>
  )
}
