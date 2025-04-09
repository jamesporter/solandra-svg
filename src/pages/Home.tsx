import { OkLCHExample, PolygonExample } from "@/components/examples"
import { FooterLayout } from "@/components/FooterLayout"
import { PageLayout } from "@/components/PageLayout"
import { SmallCopyText } from "@/components/SmallCopyText"
import Source from "@/components/Source"
import { SVGSketch } from "@/components/SVGSketch"

import { Slider } from "@/components/ui/slider"
import { Attributes, Point2D, Transform, v } from "@/lib"
import { ChevronsLeftRight, Play, Sparkles } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

export function Home() {
  const [n, setN] = useState(25)
  const [h, setH] = useState(20)

  return (
    <>
      <PageLayout>
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
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

          <div className="flex lg:justify-center flex-col">
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

            <div className="flex flex-col gap-8">
              <Slider
                value={[n]}
                onValueChange={(v) => {
                  const newN = v[0]
                  setN(newN)
                }}
                min={1}
                max={100}
                step={1}
              />

              <Slider
                value={[h]}
                onValueChange={(v) => {
                  const newH = v[0]
                  setH(newH)
                }}
                min={1}
                max={100}
                step={1}
              />
            </div>
          </div>
        </div>

        <h1 className="pt-12">Solandra-SVG</h1>

        <p>
          A little library for drawing in SVG, but with a fluent TypeScript
          (many things use chained methods).
        </p>

        <p>
          Basically I made this to generate stuff to plot.{" "}
          <Link to="/one">
            <a>My first generated drawings for a 2D plotter</a>
          </Link>
          . And my{" "}
          <Link to="/two">
            <a>Second collection</a>
          </Link>
          . And a{" "}
          <Link to="/three">
            <a>Third collection</a>
          </Link>
          . And a{" "}
          <Link to="/four">
            <a>Fourth collection</a>
          </Link>
          . I've been using it more recently for creating cut and fold
          scupltures/pop ups.
        </p>

        <div className="flex flex-col md:flex-row gap-4 ">
          <div className="bg-rose-100 rounded p-4 flex-[1.2]">
            <a
              className="mb-4 flex flex-row gap-2 items-center"
              href="https://codesandbox.io/s/simple-solandra-svg-demo-obinl"
            >
              <Play /> Try out
            </a>

            <p>A ready to play with CodeSandbox.</p>
          </div>

          <div className="bg-rose-100 rounded p-4 flex-[1.2]">
            <a
              className="mb-4 flex flex-row gap-2 items-center"
              href="https://github.com/jamesporter/solandra-svg"
            >
              <ChevronsLeftRight />
              GitHub
            </a>
            <p>Full soure code for the library and this site</p>
          </div>

          <div className="bg-rose-100 rounded p-4 flex-[2]">
            <a
              className="mb-4 flex flex-row gap-2 items-center"
              href="https://www.npmjs.com/package/solandra-svg"
            >
              <Sparkles />
              Install
            </a>

            <div className="flex flex-col gap-2">
              <SmallCopyText text="npm install solandra-svg" />
              <SmallCopyText text="pnpm install solandra-svg" />
              <SmallCopyText text="yarn add solandra-svg" />
            </div>
          </div>
        </div>

        <h2>New</h2>
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="">
            <p>Support for OkLCH colours.</p>

            <OkLCHExample />
          </div>
          <div className="">
            <p>Easy Regular Polygons.</p>
            <PolygonExample />
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
              ([x, y], [dX]) => {
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
  ([x, y], [dX]) => {
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
          <a href="https://solandra.netlify.app">Solandra</a> that actually
          makes sense.
        </p>
        <SVGSketch
          width={480}
          height={480}
          sketch={(s) => {
            const { bottom } = s.meta

            s.times(15, () => {
              let start: Point2D = [s.random(), bottom]
              let end: Point2D = [s.random(), bottom]
              s.strokedPath((attr) => attr.stroke(20, 90, 60, 0.5))
                .moveTo(start)
                .curveTo(end, { curveSize: 3 })

              start = [s.random(), 0]
              end = [s.random(), 0]
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
              attr.fill(210, 90, 20, 0.5).transform(s.T.rotate(Math.PI / 8))
            ).rect([0.3, 0.3], 0.2, 0.3)

            s.strokedPath((attr) =>
              attr
                .fill(210, 90, 30, 0.5)
                .transform(s.T.rotate(Math.PI / 3, 0.3, 0.3))
            ).rect([0.3, 0.3], 0.2, 0.3)

            s.strokedPath((attr) =>
              attr.fill(210, 90, 40, 0.5).transform(s.T.scale(1.5, 1.8))
            ).rect([0.3, 0.3], 0.2, 0.3)

            s.strokedPath((attr) =>
              attr.fill(210, 90, 50, 0.5).transform(s.T.skewX(20))
            ).rect([0.3, 0.3], 0.2, 0.3)

            s.strokedPath((attr) =>
              attr.fill(210, 90, 60, 0.5).transform(s.T.skewY(20))
            ).rect([0.3, 0.3], 0.2, 0.3)
          }}
        />
        <Source
          code={`s.strokedPath((attr) =>
  attr
    .fill(210, 90, 20, 0.5)
    .transform(s.T.rotate(Math.PI / 8))
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
                attr.transform(s.T.scale(n / 2, n / 2)).stroke(n * 5, 90, 40)
              )
            })
          }}
        />

        <Source
          code={`const path = s.strokedPath().ellipse([0, 0], 0.3, 0.4)

s.times(20, (n) => {
  s.clonePath(path).configureAttributes((attr) =>
    attr
      .transform(s.T.scale(n / 2, n / 2))
      .stroke(n * 5, 90, 40)
  )
})`}
        />

        <h2>Hello Groups</h2>
        <p>
          solandra-svg offers a closure based API for building svg groups. You
          use the same fluent Attributes api to set up their attributes.
        </p>
        <SVGSketch
          width={480}
          height={480}
          sketch={(s) => {
            const { center } = s.meta
            s.times(8, (n) => {
              s.group(
                Attributes.stroked.transform(
                  s.T.translate(...center).scale((4 + n) / 14)
                ),
                () => {
                  s.path(s.A.opacity((8 - n) / 10)).rect([0, 0], 1, 1)

                  s.path(
                    s.A.stroke(n * 4, 90, 50).transform(s.T.rotate(n))
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
      s.T.translate(...center).scale((4 + n) / 14)
    ),
    () => {
      s.path(s.A.opacity((8 - n) / 10)).rect([0, 0], 1, 1)

      s.path(
        s.A.stroke(n * 4, 90, 50).transform(s.T.rotate(n))
      ).ellipse([0, 0], 1, 0.8)
    }
  )
})`}
        />
      </PageLayout>
      <FooterLayout>
        <div className="h-2" />
        <SeeSource />
      </FooterLayout>
    </>
  )
}

function SeeSource() {
  return (
    <p>
      Solandra SVG is made by{" "}
      <a href="https://www.amimetic.co.uk">James Porter</a>. The full code for
      all these examples is{" "}
      <a href="https://github.com/jamesporter/solandra-svg/blob/master/src/pages/Home.tsx">
        available on GitHub
      </a>
      .
    </p>
  )
}
