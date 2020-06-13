import Head from "next/head"
import Link from "next/link"
import { SVGSketch } from "../src/components/SVGSketch"
import { v, Point2D, Transform, Attributes } from "../src/lib"
import { motion } from "framer-motion"
import { useState } from "react"
import PageWithTransition from "../src/components/PageWithTransition"
import Source from "../src/components/Source"

function SeeSource() {
  return (
    <p>
      The full code for all these examples is{" "}
      <a href="https://github.com/jamesporter/solandra-svg/blob/master/pages/index.tsx">
        available on GitHub
      </a>
      .
    </p>
  )
}

export default function Home() {
  const [n, setN] = useState(25)
  const [h, setH] = useState(20)

  return (
    <PageWithTransition>
      <Head>
        <title>Solandra SVG</title>
      </Head>

      <div
        className="hideIfNotLarge"
        style={{
          position: "relative",
          top: 340,
          marginTop: -120,
          marginLeft: 720,
          color: "hsla(0, 0%, 0%, 0.65)",
          width: 320,
        }}
      >
        <Source
          code={`s.times(${n}, () => {
  s.strokedPath((attr) =>
    attr.fill(
      s.sample([${h - 20}, ${h}, ${h + 20}]), 90, 50, 0.2)
  )
    .moveTo(s.randomPoint())
    .arcTo(s.randomPoint())
})`}
        />
      </div>

      <SVGSketch
        width={480}
        height={480}
        sketch={(s) => {
          s.times(n, () => {
            s.strokedPath((attr) =>
              attr.fill(s.sample([h - 20, h, h + 20]), 90, 50, 0.2)
            )
              .moveTo(s.randomPoint())
              .arcTo(s.randomPoint())
          })
        }}
      />

      <div
        style={{
          width: 300,
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
          dragConstraints={{ left: 0, right: 260 }}
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
          width: 300,
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
          dragConstraints={{ left: 0, right: 260 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onDrag={(event, info) => {
            const x = info.point.x
            const newH = Math.floor(20 + x)
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
        . And my{" "}
        <Link href="/two">
          <a>Second collection</a>
        </Link>
        . And a{" "}
        <Link href="/three">
          <a>Third collection</a>
        </Link>
        . And a{" "}
        <Link href="/four">
          <a>Fourth collection</a>
        </Link>
        .
      </p>

      <div className="ctas">
        <div>
          <a href="https://codesandbox.io/s/simple-solandra-svg-demo-obinl">
            Try out
          </a>

          <p>A ready to play with CodeSandbox.</p>
        </div>

        <div>
          <a href="https://github.com/jamesporter/solandra-svg">GitHub</a>
          <p>Full soure code for the library and this site</p>
        </div>

        <div>
          <a href="https://www.npmjs.com/package/solandra-svg">Install</a>
          <p>
            npm install solandra-svg
            <br />
            yarn add solandra-svg
          </p>
        </div>
      </div>

      <h2>Tiling</h2>

      <p>
        Quickly create graphics that tile the canvas without having to worry
        about all the low lever details.
      </p>
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

      <Source
        code={`s.forTiling(
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
)`}
      />

      <h2>Hello Curves</h2>

      <p>
        Curves are easy and fun to draw with an API from{" "}
        <a href="https://solandra.netlify.app">Solandra</a> that actually makes
        sense.
      </p>
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

      <Source
        code={`s.times(15, () => {
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
})`}
      />

      <h2>Hello Rectangles</h2>

      <p>
        Rectangles are easy to draw and the framework takes care of alignment.
      </p>
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

      <Source
        code={`s.times(25, () => {
  s.strokedPath((attr) => attr.fill(220, 90, 50, 0.2)).rect(
    s.randomPoint(),
    s.gaussian({ sd: 0.05, mean: 0.2 }),
    s.gaussian({ sd: 0.1, mean: 0.3 })
  )
})`}
      />

      <h2>Hello Ellipses</h2>

      <p>
        Ellipses are easy to draw and the framework takes care of alignment.
      </p>

      <SVGSketch
        width={480}
        height={480}
        sketch={(s) => {
          s.times(35, () => {
            const size = s.gaussian({ sd: 0.2, mean: 0.25 })
            s.strokedPath((attr) =>
              attr.fill(s.sample([130, 200, 210]), 90, 40, 0.2)
            ).ellipse(s.randomPoint(), size, size / 1.25)
          })
        }}
      />

      <Source
        code={`s.times(35, () => {
  const size = s.gaussian({ sd: 0.2, mean: 0.25 })
  s.strokedPath((attr) =>
    attr.fill(s.sample([130, 200, 210]), 90, 40, 0.2)
  ).ellipse(s.randomPoint(), size, size / 1.25)
})`}
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

      <Source
        code={`const { bottom } = s.meta
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
})`}
      />

      <h2>Hello Transforms</h2>
      <SVGSketch
        width={480}
        height={480}
        sketch={(s) => {
          s.strokedPath((attr) => attr.fill(210, 90, 10, 0.5)).rect(
            [0.3, 0.3],
            0.2,
            0.3,
            "center"
          )

          s.strokedPath((attr) =>
            attr
              .fill(210, 90, 20, 0.5)
              .transform(new Transform().rotate(Math.PI / 8))
          ).rect([0.3, 0.3], 0.2, 0.3)

          s.strokedPath((attr) =>
            attr
              .fill(210, 90, 30, 0.5)
              .transform(new Transform().rotate(Math.PI / 3, 0.3, 0.3))
          ).rect([0.3, 0.3], 0.2, 0.3)

          s.strokedPath((attr) =>
            attr
              .fill(210, 90, 40, 0.5)
              .transform(new Transform().scale(1.5, 1.8))
          ).rect([0.3, 0.3], 0.2, 0.3)

          s.strokedPath((attr) =>
            attr.fill(210, 90, 50, 0.5).transform(new Transform().skewX(20))
          ).rect([0.3, 0.3], 0.2, 0.3)

          s.strokedPath((attr) =>
            attr.fill(210, 90, 60, 0.5).transform(new Transform().skewY(20))
          ).rect([0.3, 0.3], 0.2, 0.3)
        }}
      />
      <Source
        code={`s.strokedPath((attr) =>
  attr
    .fill(210, 90, 20, 0.5)
    .transform(new Transform().rotate(Math.PI / 8))
).rect([0.3, 0.3], 0.2, 0.3)`}
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

      <Source
        code={`const path = s.strokedPath().ellipse([0, 0], 0.3, 0.4)

s.times(20, (n) => {
  s.clonePath(path).configureAttributes((attr) =>
    attr
      .transform(new Transform().scale(n / 2, n / 2))
      .stroke(n * 5, 90, 40)
  )
})`}
      />

      <h2>Hello Groups</h2>
      <p>
        solandra-svg offers a closure based API for building svg groups. You use
        the same fluent Attributes api to set up their attributes.
      </p>
      <SVGSketch
        width={480}
        height={480}
        sketch={(s) => {
          const { center } = s.meta
          s.times(8, (n) => {
            s.group(
              Attributes.stroked.transform(
                Transform.of({ translate: center, scale: (4 + n) / 14 })
              ),
              () => {
                s.path(
                  Attributes.of({
                    opacity: (8 - n) / 10,
                  })
                ).rect([0, 0], 1, 1)

                s.path(
                  Attributes.of({
                    stroke: { h: n * 4, s: 90, l: 50 },
                    transform: Transform.of({ rotate: n }),
                  })
                ).ellipse([0, 0], 1, 0.8)
              }
            )
          })
        }}
      />

      <Source
        code={`const { center } = s.meta
s.times(8, (n) => {
  s.group(
    Attributes.stroked.transform(
      Transform.of({ translate: center, scale: (4 + n) / 14 })
    ),
    () => {
      s.path(
        Attributes.of({
          opacity: (8 - n) / 10,
        })
      ).rect([0, 0], 1, 1)

      s.path(
        Attributes.of({
          stroke: { h: n * 4, s: 90, l: 50 },
          transform: Transform.of({ rotate: n }),
        })
      ).ellipse([0, 0], 1, 0.8)
    }
  )
})`}
      />

      <SeeSource />
    </PageWithTransition>
  )
}
