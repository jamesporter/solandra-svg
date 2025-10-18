import { A4InkscapeSketch } from "@/components/SVGSketch"
import {
  isoTransform,
  perlin2,
  Point2D,
  SolandraSvg,
  Transform,
  v,
} from "@/lib"

import { useState } from "react"
import { PageLayout } from "@/components/PageLayout"

const gcd = (n: number, m: number): number => {
  let a = m
  let b = n

  while (b !== 0) {
    let temp = b
    b = a % b
    a = temp
  }

  return a
}

const makePath = ({
  s,
  innerRadius,
  outerRadius,
  distance,
  amount = 1.0,
  center,
  scale,
}: {
  s: SolandraSvg
  innerRadius: number
  outerRadius: number
  distance: number
  amount?: number
  center: Point2D
  scale: number
}) => {
  let divisor = gcd(innerRadius, outerRadius)
  const difference = innerRadius - outerRadius
  let endPoint = Math.ceil((2 * Math.PI * outerRadius) / divisor) * amount

  const path = s.strokedPath()

  for (let theta = 0; theta < endPoint; theta += 0.05) {
    let x =
      scale *
      (difference * Math.cos(theta) +
        distance * Math.cos((difference / outerRadius) * theta))
    let y =
      scale *
      (difference * Math.sin(theta) -
        distance * Math.sin((difference / outerRadius) * theta))

    x += center[0]
    y += center[1]

    if (theta == 0) {
      path.moveTo([x, y])
    } else {
      path.lineTo([x, y])
    }
  }

  return path
}

export default function Three() {
  const [r1, setR1] = useState(29)
  const [r2, setR2] = useState(14)

  return (
    <PageLayout>
      <h2>Little Patterns</h2>

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

      <h2>Spiro</h2>

      <div className="param">
        <label>r1</label>&nbsp;
        <input
          min={3}
          max={200}
          type="number"
          value={r1}
          onChange={(evt) => {
            const n = parseInt(evt.target.value)
            if (n) setR1(n)
          }}
        />
      </div>

      <div className="param">
        <label>r2</label>&nbsp;
        <input
          min={3}
          max={200}
          type="number"
          value={r2}
          onChange={(evt) => {
            const n = parseInt(evt.target.value)
            if (n) setR2(n)
          }}
        />
      </div>

      <A4InkscapeSketch
        sketch={(s) => {
          makePath({
            s,
            innerRadius: r1,
            outerRadius: r2,
            distance: Math.max(r1, r2),
            amount: 1.0,
            center: s.meta.center,
            scale: 0.18 / Math.max(r1, r2),
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          s.forTiling(
            { n: 5, type: "square", margin: 0.05, order: "rowFirst" },
            (pt, d, center, i) => {
              const rA = 16 - i
              const rB = 3 + i

              makePath({
                s,
                innerRadius: rA,
                outerRadius: rB,
                distance: Math.max(rA, rB),
                amount: 1.0,
                center,
                scale: (0.24 * d[0]) / Math.max(rA, rB),
              })
            }
          )
        }}
      />

      <h2>Curves</h2>

      <A4InkscapeSketch
        sketch={(s) => {
          s.forMargin(0.2, (start, size) => {
            const end = v.add(start, size)

            const path = s.strokedPath()
            s.times(20, () => {
              path.moveTo(start).curveTo(end, {
                curveSize: s.gaussian({ sd: 0.2 }),
                curveAngle: s.gaussian(),
                twist: s.gaussian(),
                bulbousness: s.gaussian({ mean: 1 }),
              })
            })
          })
        }}
      />

      <h2>Arcs</h2>

      <A4InkscapeSketch
        sketch={(s) => {
          const path = s.strokedPath()
          s.forTiling(
            { margin: 0.1, n: 15, type: "square" },
            ([x, y], [dX]) => {
              let points: [Point2D, Point2D]

              s.proportionately([
                [
                  1,
                  () =>
                    (points = [
                      [x, y],
                      [x + dX, y + dX],
                    ]),
                ],
                [
                  1,
                  () =>
                    (points = [
                      [x + dX, y],
                      [x, y + dX],
                    ]),
                ],
                [
                  1,
                  () =>
                    (points = [
                      [x, y + dX],
                      [x + dX, y],
                    ]),
                ],
                [
                  1,
                  () =>
                    (points = [
                      [x + dX, y + dX],
                      [x, y],
                    ]),
                ],
              ])

              const [start, end] = points!
              path.moveTo(start).arcTo(end)
            }
          )
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const path = s.strokedPath()
          s.forTiling(
            { margin: 0.1, n: 15, type: "square" },
            ([x_, y_], [dX_]) => {
              let points: [Point2D, Point2D]

              const eN = s.gaussian({ mean: 0.02, sd: 0.01 })
              const x = x_ - eN
              const y = y_ - eN
              const dX = dX_ + eN * 2

              s.proportionately([
                [
                  1,
                  () =>
                    (points = [
                      [x, y],
                      [x + dX, y + dX],
                    ]),
                ],
                [
                  1,
                  () =>
                    (points = [
                      [x + dX, y],
                      [x, y + dX],
                    ]),
                ],
                [
                  1,
                  () =>
                    (points = [
                      [x, y + dX],
                      [x + dX, y],
                    ]),
                ],
                [
                  1,
                  () =>
                    (points = [
                      [x + dX, y + dX],
                      [x, y],
                    ]),
                ],
              ])

              const [start, end] = points!
              path.moveTo(start).arcTo(end)
            }
          )
        }}
      />

      <h2>Hatching</h2>

      <A4InkscapeSketch
        sketch={(s) => {
          const path = s.strokedPath()
          s.forTiling(
            { n: 8, type: "square", margin: 0.05 },
            ([sX, sY], [dX]) => {
              s.doProportion(0.6, () =>
                s.range(
                  { from: sX, to: sX + dX, n: 10, inclusive: true },
                  (x) => {
                    path.moveTo([x, sY]).lineTo([x, sY + dX])
                  }
                )
              )
            }
          )
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const path = s.strokedPath()
          s.forTiling(
            { n: 8, type: "square", margin: 0.05 },
            ([sX, sY], [dX], _c, i) => {
              if (i % 2 === 0) {
                s.range(
                  { from: sX, to: sX + dX, n: 10, inclusive: true },
                  (x) => {
                    path.moveTo([x, sY]).lineTo([x, sY + dX])
                  }
                )
              } else {
                s.range(
                  { from: sY, to: sY + dX, n: 10, inclusive: true },
                  (y) => {
                    path.moveTo([sX, y]).lineTo([sX + dX, y])
                  }
                )
              }
            }
          )
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const path = s.strokedPath((attr) => attr.strokeWidth(0.0035))
          s.forTiling(
            { n: 10, type: "square", margin: 0.05 },
            ([sX, sY], [dX], _c, i) => {
              s.proportionately([
                [
                  1,
                  () =>
                    s.range(
                      { from: sX, to: sX + dX, n: 10, inclusive: true },
                      (x) => {
                        path.moveTo([x, sY]).lineTo([x, sY + dX])
                      }
                    ),
                ],
                [
                  1,
                  () =>
                    s.range(
                      { from: sY, to: sY + dX, n: 10, inclusive: true },
                      (y) => {
                        path.moveTo([sX, y]).lineTo([sX + dX, y])
                      }
                    ),
                ],
                [1, () => {}],
              ])
            }
          )
        }}
        seed={2}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          s.forTiling(
            { n: 10, type: "square", margin: 0.05 },
            ([sX, sY], [dX], c, i) => {
              const path = s.strokedPath((attr) =>
                attr
                  .strokeWidth(0.0035)
                  .transform(s.T.rotate(Math.PI / 3, c[0], c[1]))
              )
              s.proportionately([
                [
                  1,
                  () =>
                    s.range(
                      { from: sX, to: sX + dX, n: 10, inclusive: true },
                      (x) => {
                        path.moveTo([x, sY]).lineTo([x, sY + dX])
                      }
                    ),
                ],
                [
                  1,
                  () =>
                    s.range(
                      { from: sY, to: sY + dX, n: 10, inclusive: true },
                      (y) => {
                        path.moveTo([sX, y]).lineTo([sX + dX, y])
                      }
                    ),
                ],
                // solandra-svg checks that a path is non empty
                [1, () => path.moveTo([0, 0])],
              ])
            }
          )
        }}
        seed={3}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          s.forTiling(
            { n: 10, type: "square", margin: 0.05 },
            ([sX, sY], [dX], c, i) => {
              const path = s.strokedPath((attr) =>
                attr
                  .strokeWidth(0.0035)
                  .transform(
                    s.T.rotate(
                      s.sample([0, Math.PI / 3, (Math.PI * 2) / 3]),
                      c[0],
                      c[1]
                    )
                  )
              )
              s.proportionately([
                [
                  1,
                  () =>
                    s.range(
                      { from: sX, to: sX + dX, n: 10, inclusive: true },
                      (x) => {
                        path.moveTo([x, sY]).lineTo([x, sY + dX])
                      }
                    ),
                ],
                [
                  1,
                  () =>
                    s.range(
                      { from: sY, to: sY + dX, n: 10, inclusive: true },
                      (y) => {
                        path.moveTo([sX, y]).lineTo([sX + dX, y])
                      }
                    ),
                ],
                // solandra-svg checks that a path is non empty
                [1, () => path.moveTo([0, 0])],
              ])
            }
          )
        }}
        seed={4}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          s.forTiling(
            { n: 10, type: "square", margin: 0.075 },
            ([sX, sY], [dX], c, i) => {
              s.doProportion(0.85, () => {
                const path = s.strokedPath((attr) =>
                  attr
                    .strokeWidth(0.0035)
                    .transform(s.T.rotate((i * Math.PI) / 32 / 3, c[0], c[1]))
                )

                s.range(
                  { from: sX, to: sX + dX, n: 8, inclusive: true },
                  (x) => {
                    path.moveTo([x, sY]).lineTo([x, sY + dX])
                  }
                )
              })
            }
          )
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          s.forTiling(
            { n: 8, type: "square", margin: 0.075, order: "rowFirst" },
            ([sX, sY], [dX], c, i) => {
              const path = s.strokedPath((attr) =>
                attr
                  .strokeWidth(0.0035)
                  .transform(s.T.rotate((i * Math.PI) / 19, c[0], c[1]))
              )

              s.range({ from: sX, to: sX + dX, n: 8, inclusive: true }, (x) => {
                path.moveTo([x, sY]).lineTo([x, sY + dX])
              })
            }
          )
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          s.forTiling(
            { n: 10, type: "square", margin: 0.075 },
            ([sX, sY], [dX], c, i) => {
              s.doProportion(0.85, () => {
                const path = s.strokedPath((attr) =>
                  attr
                    .strokeWidth(0.0035)
                    .transform(s.T.rotate((i * Math.PI) / 32 / 3, c[0], c[1]))
                )

                s.range(
                  { from: sX, to: sX + dX, n: 8, inclusive: true },
                  (x) => {
                    path
                      .moveTo(s.perturb({ magnitude: 0.01, at: [x, sY] }))
                      .lineTo(s.perturb({ magnitude: 0.01, at: [x, sY + dX] }))
                  }
                )
              })
            }
          )
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          s.forTiling(
            { n: 9, type: "square", margin: 0.075 },
            ([sX, sY], [dX], c, i) => {
              s.doProportion(0.85, () => {
                const path = s.strokedPath((attr) =>
                  attr
                    .strokeWidth(0.0035)
                    .transform(s.T.rotate((i * Math.PI) / 14 / 3, c[0], c[1]))
                )

                s.range(
                  { from: sX, to: sX + dX, n: 8, inclusive: true },
                  (x) => {
                    path
                      .moveTo(s.perturb({ magnitude: 0.015, at: [x, sY] }))
                      .lineTo(s.perturb({ magnitude: 0.015, at: [x, sY + dX] }))
                  }
                )
              })
            }
          )
        }}
        seed={7}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          s.forTiling(
            { n: 8, type: "square", margin: 0.075 },
            ([sX, sY], [dX], c, i) => {
              s.doProportion(0.85, () => {
                const path = s.strokedPath((attr) =>
                  attr
                    .strokeWidth(0.0035)
                    .transform(s.T.rotate((i * Math.PI) / 14 / 3, c[0], c[1]))
                )

                s.range(
                  { from: sX, to: sX + dX, n: 8, inclusive: true },
                  (x) => {
                    path
                      .moveTo(s.perturb({ magnitude: 0.015, at: [x, sY] }))
                      .lineTo(s.perturb({ magnitude: 0.015, at: [x, sY + dX] }))
                  }
                )

                s.range(
                  { from: sY, to: sY + dX, n: 6, inclusive: true },
                  (y) => {
                    path
                      .moveTo(s.perturb({ magnitude: 0.01, at: [sX, y] }))
                      .lineTo(s.perturb({ magnitude: 0.01, at: [sX + dX, y] }))
                  }
                )
              })
            }
          )
        }}
        seed={8}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          s.forTiling(
            { n: 8, type: "square", margin: 0.075 },
            ([sX, sY], [dX], c, i) => {
              s.doProportion(0.8, () => {
                const path = s.strokedPath((attr) =>
                  attr
                    .strokeWidth(0.0035)
                    .transform(
                      s.T.rotate(s.gaussian({ sd: Math.PI }), c[0], c[1])
                    )
                )

                s.range(
                  { from: sX, to: sX + dX, n: 8, inclusive: true },
                  (x) => {
                    path
                      .moveTo(s.perturb({ magnitude: 0.015, at: [x, sY] }))
                      .lineTo(s.perturb({ magnitude: 0.015, at: [x, sY + dX] }))
                  }
                )

                s.range(
                  { from: sY, to: sY + dX, n: 6, inclusive: true },
                  (y) => {
                    path
                      .moveTo(s.perturb({ magnitude: 0.01, at: [sX, y] }))
                      .lineTo(s.perturb({ magnitude: 0.01, at: [sX + dX, y] }))
                  }
                )
              })
            }
          )
        }}
        seed={8}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          s.forTiling(
            { n: 11, type: "square", margin: 0.075 },
            ([sX, sY], [dX], c, i) => {
              s.doProportion(0.8, () => {
                const path = s.strokedPath((attr) =>
                  attr
                    .strokeWidth(0.0035)
                    .transform(
                      s.T.rotate(s.gaussian({ sd: Math.PI }), c[0], c[1])
                    )
                )

                s.range(
                  { from: sX, to: sX + dX, n: 6, inclusive: true },
                  (x) => {
                    path
                      .moveTo(s.perturb({ magnitude: 0.015, at: [x, sY] }))
                      .lineTo(
                        s.perturb({ magnitude: 0.015, at: [sX, sY + dX] })
                      )
                  }
                )
              })
            }
          )
        }}
        seed={8}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          s.forTiling(
            { n: 11, type: "square", margin: 0.075 },
            (_, [dX], c, i) => {
              s.doProportion(0.66, () => {
                const path = s.strokedPath((attr) =>
                  attr
                    .strokeWidth(0.0035)
                    .transform(
                      s.T.rotate(s.gaussian({ sd: Math.PI }), c[0], c[1])
                    )
                )

                s.range(
                  { from: 0, to: Math.PI * 2, n: 18, inclusive: false },
                  (a) => {
                    path.moveTo(s.perturb({ magnitude: 0.015, at: c })).lineTo(
                      s.perturb({
                        magnitude: 0.015,
                        at: v.add(c, [
                          0.5 * dX * Math.cos(a),
                          0.5 * dX * Math.sin(a),
                        ]),
                      })
                    )
                  }
                )
              })
            }
          )
        }}
        seed={18}
      />

      <h2>Isometrics</h2>

      <A4InkscapeSketch
        sketch={(s) => {
          const isofy = isoTransform(0.1)
          const { bottom, center } = s.meta

          const path = s.strokedPath((attr) =>
            attr.transform(s.T.translate(0.4, bottom * 0.75))
          )

          path
            .moveTo(isofy([0, 0, 0]))
            .lineTo(isofy([1, 0, 0]))
            .lineTo(isofy([2, 0, 0]))
            .lineTo(isofy([2, 0, 1]))
            .lineTo(isofy([2, 1, 1]))
            .lineTo(isofy([2, 1, 2]))
            .lineTo(isofy([3, 1, 2]))
            .lineTo(isofy([3, 1, -2]))
            .lineTo(isofy([0, 1, -2]))
            .lineTo(isofy([0, 1, 3]))
            .lineTo(isofy([4, 1, 3]))
            .lineTo(isofy([4, 1, 0]))
            .lineTo(isofy([4, -2, 0]))
            .lineTo(isofy([1, -2, 0]))
            .lineTo(isofy([1, -2, 1]))
            .lineTo(isofy([0, 0, 0]))
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const isofy = isoTransform(0.25)
          const { bottom, center } = s.meta

          const pointOnSphere = (): [number, number, number] => {
            const [x, y, z] = [s.gaussian(), s.gaussian(), s.gaussian()]
            const n = 1 / Math.sqrt(x * x + y * y + z * z)
            return [n * x, n * y, n * z]
          }

          const path = s.strokedPath((attr) =>
            attr.transform(s.T.translate(0.5, bottom * 0.5))
          )

          path.moveTo(isofy([0, 0, 0]))
          s.times(40, () => {
            path
              .moveTo(isofy([0, 0, 0]))
              .lineTo(isofy(pointOnSphere()))
              .lineTo(isofy(pointOnSphere()))
              .lineTo(isofy([0, 0, 0]))
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const isofy = isoTransform(0.018)
          const { bottom, center } = s.meta

          const path = s.strokedPath((attr) =>
            attr.transform(s.T.translate(0.5, bottom * 0.5))
          )

          s.forGrid({ minX: -15, maxX: 15, minY: -15, maxY: 15 }, (pt) => {
            const [x, y] = s.perturb({ at: pt, magnitude: 0.2 })
            path
              .moveTo(isofy([x, -2, y]))
              .lineTo(isofy([x, s.gaussian({ mean: 0, sd: 2 }), y]))
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const isofy = isoTransform(0.018)
          const { bottom, center } = s.meta

          const path = s.strokedPath((attr) =>
            attr.transform(s.T.translate(0.5, bottom * 0.5))
          )

          s.forGrid({ minX: -15, maxX: 15, minY: -15, maxY: 15 }, (pt) => {
            const [x, y] = s.perturb({ at: pt, magnitude: 0.25 })
            path
              .moveTo(isofy([x, -2, y]))
              .lineTo(isofy([x, -2 - 6 * perlin2(x / 15, y / 15), y]))
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const isofy = isoTransform(0.018)
          const { bottom, center } = s.meta

          s.times(10, (n) => {
            let point: Point2D = [0, 0]
            const points: Point2D[] = []

            while (Math.abs(point[0]) < 15 && Math.abs(point[1]) < 15) {
              points.push(point)

              s.proportionately([
                [
                  1,
                  () => {
                    point = [point[0], point[1] + 1]
                  },
                ],
                [
                  1,
                  () => {
                    point = [point[0], point[1] - 1]
                  },
                ],
                [
                  1,
                  () => {
                    point = [point[0] + 1, point[1]]
                  },
                ],
                [
                  1,
                  () => {
                    point = [point[0] - 1, point[1]]
                  },
                ],
              ])
            }
            const path = s.strokedPath((attr) =>
              attr.transform(s.T.translate(0.5, bottom * 0.5))
            )
            path.moveTo(isofy([0, n * 1.6 - 8, 0]))

            points.slice(1).forEach((pt) => {
              path.lineTo(isofy([pt[0], n * 1.6 - 8, pt[1]]))
            })
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta
          const isofy = isoTransform(0.05)

          const path = s.strokedPath((attr) =>
            attr.transform(s.T.translate(0.5, bottom * 0.5))
          )

          s.range({ from: 5, to: 3, n: 7, inclusive: true }, (n) => {
            const points: [number, number, number][] = s.build(
              s.range,
              { from: 0, to: Math.PI * 2, n: 128, inclusive: false },
              (a) => [n * Math.cos(a), 5 - n, n * Math.sin(a)]
            )
            path.moveTo(isofy(points[0]))
            points.slice(1).forEach((pt) => path.lineTo(isofy(pt)))
            path.lineTo(isofy(points[0]))
          })
        }}
      />

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom, center } = s.meta
          const isofy = isoTransform(0.05)

          const path = s.strokedPath((attr) =>
            attr.transform(s.T.translate(0.5, bottom * 0.55))
          )

          s.range({ from: -5, to: 5, n: 21, inclusive: true }, (n) => {
            const points: [number, number][] = s
              .build(
                s.range,
                { from: -5, to: 5, n: 41, inclusive: true },
                (m) => {
                  return [m, Math.cos(n + m * 1.2 + (n * m) / 7), n] as [
                    number,
                    number,
                    number
                  ]
                }
              )
              .map(isofy)

            path.moveTo(points[0])
            points.slice(1).forEach((pt) => path.lineTo(pt))
          })
        }}
      />

      <h2>Diagrams</h2>
      <A4InkscapeSketch
        sketch={(s) => {
          const path = s.strokedPath()
          s.forTiling(
            { margin: 0.1, type: "square", n: 12 },
            ([x, y], [dX, dY], [cX, cY]) => {
              s.proportionately([
                [1, () => path.moveTo([x, y]).lineTo([x + dX, y + dY])],
                [1, () => path.moveTo([x, y + dY]).lineTo([x + dX, y])],
                [1, () => path.moveTo([x + dX, y]).lineTo([x + dX, y + dY])],
                [1, () => path.moveTo([x, y + dY]).lineTo([x + dX, y + dY])],
              ])

              s.proportionately([
                [1, () => path.ellipse([cX, y], dX / 5, dX / 5)],
                [1, () => path.ellipse([x + dX, cY], dX / 5, dX / 5)],
                [1, () => path.rect([x, cY], dX / 5, dX / 5)],
              ])
            }
          )
        }}
      />
    </PageLayout>
  )
}
