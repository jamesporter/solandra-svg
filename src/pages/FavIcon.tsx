import { PageLayout } from "@/components/PageLayout"
import Source from "@/components/Source"
import { Slider } from "@/components/ui/slider"

import { Attributes, SolandraSvg, Transform } from "@/lib"
import { useControls } from "leva"

export default function Favicon() {
  const { seed } = useControls({
    seed: {
      value: 0,
      min: 0,
      max: 100,
      step: 1,
    },
  })

  return (
    <PageLayout>
      <h1>A Favicon for Solandra-SVG</h1>

      <div className="flex flex-col gap-4">
        <SmallSketch
          seed={seed}
          sketch={(s) => {
            s.forMargin(0.2, ([sX, sY], [w, h]) => {
              s.path(
                s.A.fill(220, 90, 50, 0.5)
                  .transform(s.T.rotate(Math.PI / 4))
                  .transformOrigin("center")
              )
                .moveTo([sX, sY])
                .lineTo([sX + w, sY])
                .lineTo([sX + w, sY + h])
                .lineTo([sX, sY + h])
                .lineTo([sX, sY])
            })
          }}
          codeSnippet={`s.forMargin(0.2, ([sX, sY], [w, h]) => {
s.path(
  s.A
    .fill(220, 90, 50, 0.5)
    .transform(s.T.rotate(Math.PI / 4))
    .transformOrigin("center")
)
  .moveTo([sX, sY])
  .lineTo([sX + w, sY])
  .lineTo([sX + w, sY + h])
  .lineTo([sX, sY + h])
  .lineTo([sX, sY])`}
        />

        <SmallSketch
          seed={seed}
          sketch={(s) => {
            s.forMargin(0.2, ([sX, sY], [w, h], [cX, cY]) => {
              s.path(s.A.fill(350, 90, 50, 0.5))
                .moveTo([sX, sY])
                .curveTo([sX + w, sY], { curveSize: -0.5, bulbousness: 0.1 })
                .curveTo([sX + w, sY + h], {
                  curveSize: -0.5,
                  bulbousness: 0.1,
                })
                .curveTo([sX, sY + h], { curveSize: -0.5, bulbousness: 0.1 })
                .curveTo([sX, sY], { curveSize: -0.5, bulbousness: 0.1 })
            })
          }}
          codeSnippet={`s.forMargin(0.2, ([sX, sY], [w, h], [cX, cY]) => {
s.path(s.A.fill(350, 90, 50, 0.5))
  .moveTo([sX, sY])
  .curveTo([sX + w, sY], { curveSize: -0.5, bulbousness: 0.1 })
  .curveTo([sX + w, sY + h], {
    curveSize: -0.5,
    bulbousness: 0.1,
  })
  .curveTo([sX, sY + h], { curveSize: -0.5, bulbousness: 0.1 })
  .curveTo([sX, sY], { curveSize: -0.5, bulbousness: 0.1 })`}
        />

        <SmallSketch
          seed={seed}
          sketch={(s) => {
            s.forTiling(
              {
                n: 3,
                type: "proportionate",
                margin: 0.2,
              },
              ([sX, sY], [w, h], [cX, cY], i) => {
                s.path(s.A.fill(350, 90, 50, 0.5))
                  .moveTo([sX, sY])
                  .curveTo([sX + w, sY], { curveSize: -0.5, bulbousness: 0.1 })
                  .curveTo([sX + w, sY + h], {
                    curveSize: -0.5,
                    bulbousness: 0.1,
                  })
                  .curveTo([sX, sY + h], { curveSize: -0.5, bulbousness: 0.1 })
                  .curveTo([sX, sY], { curveSize: -0.5, bulbousness: 0.1 })
              }
            )
          }}
          codeSnippet={`s.forTiling(
  {
    n: 3,
    type: "proportionate",
    margin: 0.2,
  },
  ([sX, sY], [w, h], [cX, cY], i) => {
    s.path(s.A.fill(350, 90, 50, 0.5))
      .moveTo([sX, sY])
      .curveTo([sX + w, sY], { curveSize: -0.5, bulbousness: 0.1 })
      .curveTo([sX + w, sY + h], {
        curveSize: -0.5,
        bulbousness: 0.1,
      })
      .curveTo([sX, sY + h], { curveSize: -0.5, bulbousness: 0.1 })
      .curveTo([sX, sY], { curveSize: -0.5, bulbousness: 0.1 })
  }
)`}
        />

        <SmallSketch
          seed={seed}
          sketch={(s) => {
            s.forTiling(
              {
                n: 3,
                type: "proportionate",
                margin: 0.3,
              },
              ([sX, sY], [w, h], [cX, cY], i) => {
                const hue = (330 + 60 * s.random()) % 360

                s.path(
                  s.A.fill(hue, 90, 50, 0.5)
                    .transform(s.T.scale(0.75 + 2 * s.random()))
                    .transformOrigin("center")
                )
                  .moveTo([sX, sY])
                  .curveTo([sX + w, sY], { curveSize: -0.5, bulbousness: 0.1 })
                  .curveTo([sX + w, sY + h], {
                    curveSize: -0.5,
                    bulbousness: 0.1,
                  })
                  .curveTo([sX, sY + h], { curveSize: -0.5, bulbousness: 0.1 })
                  .curveTo([sX, sY], { curveSize: -0.5, bulbousness: 0.1 })
              }
            )
          }}
          codeSnippet={`s.forTiling(
  {
    n: 3,
    type: "proportionate",
    margin: 0.3,
  },
  ([sX, sY], [w, h], [cX, cY], i) => {
    const hue = (330 + 60 * s.random()) % 360

    s.path(
      s.A
        .fill(hue, 90, 50, 0.5)
        .transform(s.T.scale(0.75 + 2 * s.random()))
        .transformOrigin("center")
    )
      .moveTo([sX, sY])
      .curveTo([sX + w, sY], { curveSize: -0.5, bulbousness: 0.1 })
      .curveTo([sX + w, sY + h], {
        curveSize: -0.5,
        bulbousness: 0.1,
      })
      .curveTo([sX, sY + h], { curveSize: -0.5, bulbousness: 0.1 })
      .curveTo([sX, sY], { curveSize: -0.5, bulbousness: 0.1 })
  }
)`}
        />

        <SmallSketch
          seed={seed}
          sketch={(s) => {
            const { center } = s.meta
            s.forTiling(
              {
                n: 3,
                type: "proportionate",
                margin: 0.1,
              },
              ([sX, sY], [w, h], c, i) => {
                const hue = (330 + 60 * s.random()) % 360

                const dX = 0.3 * (center[0] - c[0])
                const dY = 0.3 * (center[1] - c[1])

                s.path(
                  s.A.fill(hue, 90, 50, 0.5)
                    .transform(
                      s.T.scale(0.75 + 2 * s.random()).rotate(s.randomAngle())
                    )
                    .transformOrigin("center")
                )
                  .moveTo([sX + dX, sY + dY])
                  .curveTo([sX + dX + w, sY + dY], {
                    curveSize: -0.5,
                    bulbousness: 0.1,
                  })
                  .curveTo([sX + dX + w, sY + dY + h], {
                    curveSize: -0.5,
                    bulbousness: 0.1,
                  })
                  .curveTo([sX + dX, sY + dY + h], {
                    curveSize: -0.5,
                    bulbousness: 0.1,
                  })
                  .curveTo([sX + dX, sY + dY], {
                    curveSize: -0.5,
                    bulbousness: 0.1,
                  })
              }
            )
          }}
          codeSnippet={`const { center } = s.meta
s.forTiling(
  {
    n: 3,
    type: "proportionate",
    margin: 0.3,
  },
  ([sX, sY], [w, h], c, i) => {
    const hue = (330 + 60 * s.random()) % 360

    const dX = 0.3 * (center[0] - c[0])
    const dY = 0.3 * (center[1] - c[1])

    s.path(
      s.A
        .fill(hue, 90, 50, 0.5)
        .transform(
          s.T
            .scale(0.75 + 2 * s.random())
            .rotate(s.randomAngle())
        )
        .transformOrigin("center")
    )
      .moveTo([sX + dX, sY + dY])
      .curveTo([sX + dX + w, sY + dY], {
        curveSize: -0.5,
        bulbousness: 0.1,
      })
      .curveTo([sX + dX + w, sY + dY + h], {
        curveSize: -0.5,
        bulbousness: 0.1,
      })
      .curveTo([sX + dX, sY + dY + h], {
        curveSize: -0.5,
        bulbousness: 0.1,
      })
      .curveTo([sX + dX, sY + dY], {
        curveSize: -0.5,
        bulbousness: 0.1,
      })
  }
)`}
        />
      </div>
    </PageLayout>
  )
}

export function SmallSketch({
  sketch,
  codeSnippet,
  seed = 0,
}: {
  sketch: (sol: SolandraSvg) => void
  codeSnippet: string
  seed?: number
}) {
  const svg = new SolandraSvg(128, 128, seed)
  sketch(svg)

  return (
    <div className="flex flex-col gap-4 md:flex-row items-center">
      <a href={svg.imageSrc()} download="solandra.svg">
        <img src={svg.imageSrc(false)} alt="favicon" className="shadow" />
      </a>
      <Source code={codeSnippet} />
    </div>
  )
}
