import { PageLayout } from "@/components/PageLayout"
import Source from "@/components/Source"
import { SVGSketch } from "@/components/SVGSketch"
import { Point2D, v } from "@/lib"

export default function APIReference() {
  return (
    <PageLayout>
      <h1>API Reference</h1>
      <h2>SVG</h2>
      <p>The starting point; create an instance of this class.</p>
      <Source
        code={`import { SolandraSvg } from "solandra-svg"

const svg = new SolandraSvg(width, height, 1)`}
      />
      <p>Do some drawing (see below), then export with</p>
      <ul className="list-disc list-inside">
        <li>
          <span className="font-mono">image</span>: a SVG string
        </li>
        <li>
          <span className="font-mono">imageSrc</span>: a data URL
        </li>
      </ul>
      <h2>Path</h2>
      <h3>Rectangles</h3>
      <Source
        code={`s.filledPath((a) => a.fill(210, 80, 50)).rect(s.meta.center, 0.5, 0.2)`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.filledPath((a) => a.fill(210, 80, 50)).rect(s.meta.center, 0.5, 0.2)
        }}
        className="bg-zinc-100"
      />
      <h3>Regular Polygon</h3>
      <Source code={`s.strokedPath().regularPolygon(s.meta.center, 8, 0.2)`} />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.strokedPath().regularPolygon(s.meta.center, 8, 0.2)
        }}
        className="bg-zinc-100"
      />
      <h3>Spiral</h3>
      <Source code={`s.strokedPath().spiral(s.meta.center, 0.1, 50)`} />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.strokedPath().spiral(s.meta.center, 0.1, 50)
        }}
        className="bg-zinc-100"
      />
      <h3>Chaiken</h3>
      <p>Cuts corners to smooth out (note does not apply to start point).</p>
      <Source
        code={`s.filledPath((a) => a.fill(210, 80, 50))
    .rect(s.meta.center, 0.5, 0.2)
    .chaiken(2)`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.filledPath((a) => a.fill(210, 80, 50))
            .rect(s.meta.center, 0.5, 0.2)
            .chaiken(2)
        }}
        className="bg-zinc-100"
      />
      <h2>Attributes</h2>
      <p>
        Use the fluent <span className="font-mono">Attributes</span> builder to
        configure reusable fill and stroke styles, opacity, dash patterns,{" "}
        <span className="font-mono">class</span>/
        <span className="font-mono">id</span> hooks, and even transforms. Start
        from helpers like <span className="font-mono">Attributes.stroked</span>{" "}
        or <span className="font-mono">Attributes.filled</span>, then chain
        calls to tailor the output for each path.
      </p>
      <h2>Transforms</h2>
      <p>
        Native SVG transforms such as translations, rotations and scales can be
        composed with the <span className="font-mono">Transform</span> helpers
        or the fluent <span className="font-mono">Attributes.transform</span>{" "}
        chain. Combine operations with{" "}
        <span className="font-mono">Transform.of</span>, or set an origin via{" "}
        <span className="font-mono">transformOrigin</span> to rotate and scale
        around specific points. Though in many cases for creative coding you
        might more directly want to derive your own transforms or shapes, for
        example by using utility functions imported via{" "}
        <span className="font-mono">v</span>.
      </p>
      <h2>Iteration (across 'canvas')</h2>
      <p>
        Solandra SVG offers a number of helpers to iterate over the 'canvas'; so
        adding a margin, or tiling becomes trivially simple rather than another
        verbose, repetitive bit of code.
      </p>
      <h3>forMargin</h3>
      <Source
        code={`s.forMargin(0.1, (_, d, c) => {
  s.strokedPath().rect(c, ...d)
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.forMargin(0.1, (_, d, c) => {
            s.strokedPath().rect(c, ...d)
          })
        }}
        className="bg-zinc-100"
      />
      <h3>forTiling</h3>
      <Source
        code={`s.forTiling({ n: 5, type: "square" }, (_, d, c, i) => {
  s.filledPath((a) => a.fill(210 - i * 6, 80, 50)).rect(c, ...d)
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.forTiling({ n: 5, type: "square" }, (_, d, c, i) => {
            s.filledPath((a) => a.fill(210 - i * 6, 80, 50)).rect(c, ...d)
          })
        }}
        className="bg-zinc-100"
      />
      <h3>forHorizontal</h3>
      <Source
        code={`s.forHorizontal({ n: 40, margin: 0.1 }, (_, d, c, i) => {
  s.filledPath((a) => a.fill(210, 80 - i, 50)).rect(s.perturb({ at: c }), ...d)
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.forHorizontal({ n: 40, margin: 0.1 }, (_, d, c, i) => {
            s.filledPath((a) => a.fill(210, 80 - i, 50)).rect(
              s.perturb({ at: c }),
              ...d
            )
          })
        }}
        className="bg-zinc-100"
      />

      <h3>forVertical</h3>
      <p>Same as forHorizontal but vertically</p>
      <h3>forGrid</h3>
      <p>Iterate over a integer grid</p>
      <h3>build</h3>
      <p>Higher order utility</p>
      <h3>aroundCircle</h3>
      <Source
        code={`s.aroundCircle({ n: 40 }, (p, i) => {
  s.filledPath((a) => a.fill(340 - i, 80, 50, 0.8)).regularPolygon(
    s.perturb({ at: p }),
    6,
    0.05
  )
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.aroundCircle({ n: 40 }, (p, i) => {
            s.filledPath((a) => a.fill(340 - i, 80, 50, 0.8)).regularPolygon(
              s.perturb({ at: p }),
              6,
              0.05
            )
          })
        }}
        className="bg-zinc-100"
      />
      <h3>range</h3>
      <p>Simple range utility.</p>

      <h2>(Pseudo)Randomness</h2>
      <p>
        Quite a lot of the API of SolandraSVG is for pseudo-randomness. The
        library allows for pseudo-random generation in a bunch of different ways
        with an internal seed. You can set this when constructing the main
        object.
      </p>
      <h3>withRandomOrder</h3>
      <p>
        Shuffle any iterator so repeated patterns are drawn in a fresh order.
      </p>
      <Source
        code={`s.withRandomOrder(
  (config, cb) => s.forTiling(config, cb),
  { n: 5, type: "square" } as const,
  (_, d: Point2D, c, i) => {
    const hue = 200 + (i % 6) * 15
    s.filledPath((a) => a.fill(hue, 80, 60, 0.9)).rect(
      c,
      ...v.scale(d, 1.8)
    )
  }
)`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.withRandomOrder(
            (config, cb) => s.forTiling(config, cb),
            { n: 5, type: "square" } as const,
            (_, d: Point2D, c, i) => {
              const hue = 200 + (i % 6) * 15
              s.filledPath((a) => a.fill(hue, 80, 60, 0.9)).rect(
                c,
                ...v.scale(d, 1.8)
              )
            }
          )
        }}
        className="bg-zinc-100"
      />
      <h3>doProportion</h3>
      <p>
        Run a callback with probability <span className="font-mono">p</span>.
      </p>
      <Source
        code={`s.forTiling({ n: 6, type: "square" }, (_, d, c) => {
  s.strokedPath().rect(c, ...d)
  s.doProportion(0.3, () => {
    const r = Math.min(d[0], d[1]) * 0.35
    s.filledPath((a) => a.fill(340, 80, 60, 0.8)).regularPolygon(c, 6, r)
  })
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.forTiling({ n: 6, type: "square" }, (_, d, c) => {
            s.strokedPath().rect(c, ...d)
            s.doProportion(0.3, () => {
              const r = Math.min(d[0], d[1]) * 0.35
              s.filledPath((a) => a.fill(340, 80, 60, 0.8)).regularPolygon(
                c,
                6,
                r
              )
            })
          })
        }}
        className="bg-zinc-100"
      />
      <h3>proportionately</h3>
      <p>Pick outcomes with weighted probabilities.</p>
      <Source
        code={`s.forTiling({ n: 5, type: "square" }, (_, d, c) => {
  const hue = s.proportionately([
    [5, () => 210],
    [2, () => 40],
    [1, () => 330],
  ])
  s.filledPath((a) => a.fill(hue, 80, 60)).rect(c, ...d)
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.forTiling({ n: 5, type: "square" }, (_, d, c) => {
            const hue = s.proportionately([
              [5, () => 210],
              [2, () => 40],
              [1, () => 330],
            ])
            s.filledPath((a) => a.fill(hue, 80, 60)).rect(c, ...d)
          })
        }}
        className="bg-zinc-100"
      />
      <h3>randomPoint</h3>
      <p>Grab a uniform point within the drawing bounds.</p>
      <Source
        code={`s.times(120, () => {
  const point = s.randomPoint()
  s.filledPath((a) => a.fill(210, 80, 60, 0.6)).regularPolygon(
    point,
    3,
    0.02
  )
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.times(120, () => {
            const point = s.randomPoint()
            s.filledPath((a) => a.fill(210, 80, 60, 0.6)).regularPolygon(
              point,
              3,
              0.02
            )
          })
        }}
        className="bg-zinc-100"
      />
      <h3>random</h3>
      <p>
        Get a uniform number in <span className="font-mono">[0, 1)</span>.
      </p>
      <Source
        code={`s.times(45, () => {
  const radius = 0.05 + s.random() * 0.25
  s.strokedPath((a) => a.strokeWidth(0.002 + s.random() * 0.003)).regularPolygon(
    s.meta.center,
    6,
    radius
  )
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.times(45, () => {
            const radius = 0.05 + s.random() * 0.25
            s.strokedPath((a) =>
              a.strokeWidth(0.002 + s.random() * 0.003)
            ).regularPolygon(s.meta.center, 6, radius)
          })
        }}
        className="bg-zinc-100"
      />
      <h3>randomAngle</h3>
      <p>
        Sample a rotation between <span className="font-mono">0</span> and{" "}
        <span className="font-mono">2π</span>.
      </p>
      <Source
        code={`s.forTiling({ n: 5, type: "square" }, (_, d, c) => {
  const angle = s.randomAngle()
  const r = Math.min(d[0], d[1]) * 0.45
  s.strokedPath().regularPolygon(c, 4, r, angle)
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.forTiling({ n: 5, type: "square" }, (_, d, c) => {
            const angle = s.randomAngle()
            const r = Math.min(d[0], d[1]) * 0.45
            s.strokedPath().regularPolygon(c, 4, r, angle)
          })
        }}
        className="bg-zinc-100"
      />
      <h3>uniformRandomInt</h3>
      <p>Get inclusive integer ranges with optional bounds.</p>
      <Source
        code={`s.forTiling({ n: 6, type: "square" }, (_, d, c) => {
  const sides = s.uniformRandomInt({ from: 3, to: 8 })
  const r = Math.min(d[0], d[1]) * 0.45
  s.filledPath((a) => a.fill(60 + sides * 30, 80, 60)).regularPolygon(
    c,
    sides,
    r
  )
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.forTiling({ n: 6, type: "square" }, (_, d, c) => {
            const sides = s.uniformRandomInt({ from: 3, to: 8 })
            const r = Math.min(d[0], d[1]) * 0.45
            s.filledPath((a) => a.fill(60 + sides * 30, 80, 60)).regularPolygon(
              c,
              sides,
              r
            )
          })
        }}
        className="bg-zinc-100"
      />
      <h3>uniformGridPoint</h3>
      <p>Choose integer points from a discrete grid.</p>
      <Source
        code={`const stepX = 1 / 6
const stepY = (1 / s.meta.aspectRatio) / 6

s.times(200, () => {
  const [gx, gy] = s.uniformGridPoint({ minX: 0, maxX: 5, minY: 0, maxY: 5 })
  const point: [number, number] = [
    stepX / 2 + gx * stepX,
    stepY / 2 + gy * stepY,
  ]
  s.filledPath((a) => a.fill(210, 80, 60, 0.3)).ellipse(point, stepX, stepY)
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          const stepX = 1 / 6
          const stepY = 1 / s.meta.aspectRatio / 6

          s.times(200, () => {
            const [gx, gy] = s.uniformGridPoint({
              minX: 0,
              maxX: 5,
              minY: 0,
              maxY: 5,
            })
            const point: [number, number] = [
              stepX / 2 + gx * stepX,
              stepY / 2 + gy * stepY,
            ]
            s.filledPath((a) => a.fill(210, 80, 60, 0.3)).ellipse(
              s.perturb({ at: point, magnitude: 0.025 }),
              stepX,
              stepY
            )
          })
        }}
        className="bg-zinc-100"
      />
      <h3>randomPolarity</h3>
      <p>
        Flip signs randomly between <span className="font-mono">-1</span> and{" "}
        <span className="font-mono">1</span>.
      </p>
      <Source
        code={`s.times(20, (i) => {
  const polarity = s.randomPolarity()
  const y = 0.1 + (i / 20) * (0.8 / s.meta.aspectRatio)
  const x = 0.5 + polarity * 0.25
  s.filledPath((a) =>
    a.fill(polarity === 1 ? 210 : 340, 80, 60, 0.85)
  ).rect([x, y], 0.18, 0.05)
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.times(20, (i) => {
            const polarity = s.randomPolarity()
            const y = 0.1 + (i / 20) * (0.8 / s.meta.aspectRatio)
            const x = 0.5 + polarity * 0.25
            s.filledPath((a) =>
              a.fill(polarity === 1 ? 210 : 340, 80, 60, 0.85)
            ).rect([x, y], 0.18, 0.05)
          })
        }}
        className="bg-zinc-100"
      />
      <h3>sample</h3>
      <p>Select one item uniformly from an array.</p>
      <Source
        code={`const palette: [number, number, number][] = [
  [210, 80, 60],
  [340, 80, 60],
  [40, 80, 60],
]

s.forTiling({ n: 6, type: "square" }, (_, d, c) => {
  const [h, sValue, l] = s.sample(palette)
  s.filledPath((a) => a.fill(h, sValue, l)).rect(c, ...d)
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          const palette: [number, number, number][] = [
            [210, 80, 60],
            [340, 80, 60],
            [40, 80, 60],
          ]

          s.forTiling({ n: 6, type: "square" }, (_, d, c) => {
            const [h, sValue, l] = s.sample(palette)
            s.filledPath((a) => a.fill(h, sValue, l)).rect(c, ...d)
          })
        }}
        className="bg-zinc-100"
      />
      <h3>samples</h3>
      <p>Draw multiple samples (with replacement) from an array.</p>
      <Source
        code={`const palette: [number, number, number][] = [
  [210, 80, 60],
  [280, 70, 60],
  [40, 80, 60],
  [340, 80, 60],
]
const picks = s.samples(8, palette)

picks.forEach(([h, sValue, l], i) => {
  const w = 1 / picks.length
  const x = w * i + w / 2
  s.filledPath((a) => a.fill(h, sValue, l, 0.9)).rect(
    [x, s.meta.center[1]],
    w,
    0.9 / s.meta.aspectRatio
  )
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          const palette: [number, number, number][] = [
            [210, 80, 60],
            [280, 70, 60],
            [40, 80, 60],
            [340, 80, 60],
          ]
          const picks = s.samples(8, palette)

          picks.forEach(([h, sValue, l], i) => {
            const w = 1 / picks.length
            const x = w * i + w / 2
            s.filledPath((a) => a.fill(h, sValue, l, 0.9)).rect(
              [x, s.meta.center[1]],
              w,
              0.9 / s.meta.aspectRatio
            )
          })
        }}
        className="bg-zinc-100"
      />
      <h3>shuffle</h3>
      <p>Randomise an array in place.</p>
      <Source
        code={`const hues = s.shuffle([210, 260, 40, 10, 320, 180])

s.forHorizontal({ n: hues.length, margin: 0.05 }, (_, d, c, i) => {
  const hue = hues[i % hues.length]
  s.filledPath((a) => a.fill(hue, 80, 60, 0.85)).rect(c, ...d)
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          const hues = s.shuffle([210, 260, 40, 10, 320, 180])

          s.forHorizontal({ n: hues.length, margin: 0.05 }, (_, d, c, i) => {
            const hue = hues[i % hues.length]
            s.filledPath((a) => a.fill(hue, 80, 60, 0.85)).rect(c, ...d)
          })
        }}
        className="bg-zinc-100"
      />
      <h3>perturb</h3>
      <p>Jitter a point by a small random offset.</p>
      <Source
        code={`s.forTiling({ n: 6, type: "square" }, (_, d, c) => {
  const center = s.perturb({ at: c, magnitude: 0.08 })
  const r = Math.min(d[0], d[1]) * 0.4
  s.strokedPath().regularPolygon(center, 6, r)
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.forTiling({ n: 6, type: "square" }, (_, d, c) => {
            const center = s.perturb({ at: c, magnitude: 0.08 })
            const r = Math.min(d[0], d[1]) * 0.4
            s.strokedPath().regularPolygon(center, 6, r)
          })
        }}
        className="bg-zinc-100"
      />
      <h3>gaussian</h3>
      <p>Generate bell-curve distributed numbers.</p>
      <Source
        code={`s.times(200, () => {
  const x = 0.5 + Math.max(-0.4, Math.min(0.4, s.gaussian({ sd: 0.12 })))
  const y =
    s.meta.center[1] +
    Math.max(
      -0.25 / s.meta.aspectRatio,
      Math.min(0.25 / s.meta.aspectRatio, s.gaussian({ sd: 0.08 }) / s.meta.aspectRatio)
    )
  s.filledPath((a) => a.fill(210, 80, 60, 0.5)).ellipse([x, y], 0.04, 0.04)
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.times(200, () => {
            const x =
              0.5 + Math.max(-0.4, Math.min(0.4, s.gaussian({ sd: 0.12 })))
            const y =
              s.meta.center[1] +
              Math.max(
                -0.25 / s.meta.aspectRatio,
                Math.min(
                  0.25 / s.meta.aspectRatio,
                  s.gaussian({ sd: 0.08 }) / s.meta.aspectRatio
                )
              )
            s.filledPath((a) => a.fill(210, 80, 60, 0.5)).ellipse(
              [x, y],
              0.04,
              0.04
            )
          })
        }}
        className="bg-zinc-100"
      />
      <h3>poisson</h3>
      <p>Sample counts from a Poisson distribution.</p>
      <Source
        code={`s.times(10, () => {
  const petals = Math.max(3, s.poisson(6))
  s.aroundCircle({ n: petals, r: 0.28 }, (p, i) => {
    const hue = 200 + i * (120 / petals)
    s.filledPath((a) => a.fill(hue, 80, 60, 0.85)).regularPolygon(
      p,
      3,
      0.05
    )
  })
})`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.times(10, () => {
            const petals = Math.max(3, s.poisson(6))
            s.aroundCircle({ n: petals, r: 0.28 }, (p, i) => {
              const hue = 200 + i * (120 / petals)
              s.filledPath((a) => a.fill(hue, 80, 60, 0.85)).regularPolygon(
                p,
                3,
                0.05
              )
            })
          })
        }}
        className="bg-zinc-100"
      />
      <h2>Utilities</h2>
      <p>Various helpers with a concise import</p>
      <Source
        code={`import { v, c } from "solandra-svg"

c.pairWise(...)
c.tripleWise(...)
c.zip2(...)
c.sum(...)
c.arrayOf(...)          

v.add(...)
v.subtract(...)
v.magnitude(...)
v.rotate(...)
v.normalise(...)
v.scale(...)
v.polarToCartesian(...)
v.pointAlong(...)
v.dot(...)
v.distance(...)`}
      />
    </PageLayout>
  )
}
