import Head from "next/head"
import { A4ishSketch, A4InkscapeSketch } from "../src/components/SVGSketch"
import { v, Point2D, SolandraSvg } from "../src/lib"
import Link from "next/link"
import PageWithTransition from "../src/components/PageWithTransition"
import { perlin2 } from "../src/lib/util/noise"
import { useState } from "react"

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
    </PageWithTransition>
  )
}
