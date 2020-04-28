import Head from "next/head"
import Link from "next/link"
import { SVGSketch } from "../src/components/SVGSketch"
import { v, Point2D, Transform } from "../src/lib"
import { motion } from "framer-motion"
import { useState } from "react"

export default function Home() {
  const [n, setN] = useState(25)
  const [h, setH] = useState(20)

  return (
    <div className="container">
      <Head>
        <title>Solandra SVG</title>
      </Head>

      <SVGSketch
        width={480}
        height={480}
        sketch={(s) => {
          s.times(n, () => {
            s.strokedPath((attr) =>
              attr.fill(s.sample([h, h - 10, h + 10]), 90, 50, 0.2)
            )
              .moveTo(s.randomPoint())
              .arcTo(s.randomPoint())
          })
        }}
      />

      <div
        style={{
          width: 400,
          height: 40,
          borderRadius: 20,
          backgroundColor: "#fcf0f0",
          margin: "auto",
        }}
      >
        <motion.div
          style={{
            height: 40,
            width: 40,
            borderRadius: 20,
            background: "#991414",
          }}
          drag="x"
          dragElastic={0}
          dragMomentum={false}
          dragConstraints={{ left: 0, right: 360 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onDrag={(event, info) => {
            const x = info.point.x
            const newN = Math.floor(25 + x / 8)
            // 'throttling'!
            if (newN !== n) setN(newN)
          }}
        />
      </div>

      <br />

      <div
        style={{
          width: 400,
          height: 40,
          borderRadius: 20,
          backgroundColor: "#fcf0f0",
          margin: "auto",
        }}
      >
        <motion.div
          style={{
            height: 40,
            width: 40,
            borderRadius: 20,
            background: "#991414",
          }}
          drag="x"
          dragElastic={0}
          dragMomentum={false}
          dragConstraints={{ left: 0, right: 360 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onDrag={(event, info) => {
            const x = info.point.x
            const newH = Math.floor(20 + x / 4)
            // 'throttling'!
            if (newH !== h) setH(newH)
          }}
        />
      </div>
      <h1 style={{ textAlign: "center", paddingTop: 40 }}>solandra-svg</h1>

      <p>A little library for drawing in SVG, but with a nicer API.</p>

      <p>
        Basically I made this to generate stuff to plot.{" "}
        <Link href="/one">
          <a>My first generated drawings for a 2D plotter</a>
        </Link>
        .
      </p>

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

      <h2>Hello Rectangles</h2>
      <SVGSketch
        width={480}
        height={480}
        sketch={(s) => {
          s.times(25, () => {
            s.strokedPath((attr) => attr.fill(220, 90, 50, 0.2)).rect(
              s.randomPoint(),
              s.gaussian({ sd: 0.05, mean: 0.2 }),
              s.gaussian({ sd: 0.1, mean: 0.3 })
            )
          })
        }}
      />

      <h2>Hello Ellipses</h2>
      <SVGSketch
        width={480}
        height={480}
        sketch={(s) => {
          s.times(35, () => {
            const size = s.gaussian({ sd: 0.2, mean: 0.25 })
            s.strokedPath((attr) =>
              attr.fill(s.sample([130, 200, 210]), 90, 40, 0.2)
            ).ellipse(s.randomPoint(), size, size / 1.25, "center")
          })
        }}
      />

      <h2>Hello Chaiken</h2>

      <p>
        An elegant algorithm for smooth a path of lines. Repeatedly cut the
        corners. In solandra-svg this is only applied to lines (as it doesn't
        make sense for other path segments).
      </p>
      <SVGSketch
        width={480}
        height={480}
        sketch={(s) => {
          const { bottom } = s.meta
          s.times(4, (n) => {
            const path = s
              .strokedPath((attr) =>
                attr.strokeOpacity(0.2 + n * 0.1).stroke(15, 90, 60)
              )
              .moveTo([0.1, bottom * 0.4])
            for (let i = 0.1; i <= 0.9; i += 0.2) {
              path.lineTo([i, bottom * 0.4 + 0.3 * Math.cos(i * 10)])
            }

            path
              .map((el) => {
                if (el.kind === "line" || el.kind === "move") {
                  return { ...el, to: v.add(el.to, [0, 0.1 * n]) }
                } else {
                  return el
                }
              })
              .chaiken(n + 1)
          })
        }}
      />

      <h2>Hello Transforms</h2>

      <SVGSketch
        width={480}
        height={480}
        sketch={(s) => {
          s.strokedPath((attr) => attr.fill(90, 90, 40, 0.5)).ellipse(
            [0.5, 0.5],
            0.2,
            0.3,
            "center"
          )

          s.strokedPath((attr) =>
            attr
              .fill(70, 90, 40, 0.5)
              .transform(new Transform().rotate(Math.PI / 8))
          ).ellipse([0.5, 0.5], 0.2, 0.3, "center")

          s.strokedPath((attr) =>
            attr
              .fill(50, 90, 40, 0.5)
              .transform(new Transform().scale(1.2, 1.6))
          ).ellipse([0.5, 0.5], 0.2, 0.3, "center")

          s.strokedPath((attr) =>
            attr.fill(30, 90, 40, 0.5).transform(new Transform().skewX(20))
          ).ellipse([0.5, 0.5], 0.2, 0.3, "center")

          s.strokedPath((attr) =>
            attr.fill(10, 90, 40, 0.5).transform(new Transform().skewY(20))
          ).ellipse([0.5, 0.5], 0.2, 0.3, "center")
        }}
      />

      <h2>Hello Clone</h2>

      <SVGSketch
        width={480}
        height={480}
        sketch={(s) => {
          const path = s.strokedPath().ellipse([0, 0], 0.3, 0.4)

          s.times(20, (n) => {
            s.clonePath(path).configureAttributes((attr) =>
              attr
                .transform(new Transform().scale(n / 2, n / 2))
                .stroke(n * 5, 90, 40)
            )
          })
        }}
      />
    </div>
  )
}
