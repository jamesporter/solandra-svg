import { describe, expect, it } from "vitest"
import { SolandraSvg } from "../svg"
import { randomSketch } from "./helpers/sketches"
import { findAll, parseXml } from "./helpers/xml"

// Golden-file regression tests. Each sketch renders to a checked-in .svg file
// that can be opened in a browser, so a refactor that changes what the library
// draws shows up as a reviewable diff of the drawing itself rather than as a
// wall of escaped string in a test file.
//
// If a change here is intentional, re-run with `vitest -u` and check the new
// files render as expected before committing them.

const snapshot = (name: string) => `./__snapshots__/${name}.svg`

const sketches: [name: string, draw: () => SolandraSvg][] = [
  [
    "tiled-ellipses",
    () => {
      const s = new SolandraSvg(400, 400, 1)
      s.forTiling({ n: 6, margin: 0.1 }, (_, delta, center, i) => {
        s.path(s.A.fill(200 + i * 3, 80, 50, 0.7)).ellipse(
          center,
          delta[0] * 0.9,
          delta[1] * 0.9,
        )
      })
      return s
    },
  ],
  [
    "stroked-polygons",
    () => {
      const s = new SolandraSvg(720, 240, 2)
      s.forHorizontal({ n: 12, margin: 0.1 }, (_, delta, center, i) => {
        s.strokedPath((a) => a.fill(340 - i * 5, 90, 60, 0.6)).regularPolygon(
          center,
          4 + i,
          delta[1] * 0.4,
        )
      })
      return s
    },
  ],
  [
    "curves-and-arcs",
    () => {
      const s = new SolandraSvg(500, 500, 3)
      s.forMargin(0.1, (at, delta) => {
        s.strokedPath((a) => a.strokeWidth(0.002))
          .moveTo(at)
          .curveTo([at[0] + delta[0], at[1] + delta[1]], { curveSize: 0.8 })
          .arcTo(at, { largeArc: true })
          .close()
      })
      s.aroundCircle({ n: 12, r: 0.3 }, (at, i) => {
        s.path(s.A.fillOklch(0.7, 0.2, i * 30, 0.8)).ellipse(at, 0.06, 0.06)
      })
      return s
    },
  ],
  [
    "transformed-groups",
    () => {
      const s = new SolandraSvg(400, 300, 4)
      s.range({ from: 0, to: 1, n: 4 }, (t) => {
        s.group(
          s.A.transform(s.T.translate(t * 0.2, 0).rotate(t)).transformOrigin("center"),
          () => {
            s.path(s.A.noFill().stroke(0, 0, 20).strokeWidth(0.003))
              .rect(s.meta.center, 0.5, 0.3)
              .close()
          },
        )
      })
      return s
    },
  ],
  [
    "smoothed-spiral",
    () => {
      const s = new SolandraSvg(400, 400, 5)
      s.cutPath().spiral(s.meta.center, 0.02, 60, 0, 0.01)
      s.creasePath()
        .moveTo([0.1, 0.1])
        .lineTo([0.9, 0.2])
        .lineTo([0.8, 0.9])
        .lineTo([0.2, 0.7])
        .lineTo([0.1, 0.1])
        .chaikin(3)
      return s
    },
  ],
  [
    "gradients-text-and-splines",
    () => {
      const s = new SolandraSvg(600, 400, 6)
      s.linearGradient("sky", { to: [0, 1] })
        .stop(0, 210, 80, 60)
        .stop(1, 340, 80, 65, 0.8)
      s.radialGradient("glow", { r: 0.6, focus: [0.35, 0.35] })
        .stop(0, 50, 90, 70)
        .stop(1, 20, 90, 40, 0)

      s.path(s.A.fillGradient("sky")).rect(s.meta.center, 0.9, 0.6)
      s.path(s.A.fillGradient("glow")).ellipse([0.3, 0.3], 0.3, 0.3)

      const wave: [number, number][] = []
      s.range({ from: 0.1, to: 0.9, n: 8 }, (x) =>
        wave.push([x, 0.4 + 0.12 * Math.sin(x * 8)]),
      )
      s.strokedPath((a) =>
        a.strokeGradient("sky").strokeWidth(0.006),
      ).smoothLine(wave)

      s.strokedPath((a) => a.strokeWidth(0.004)).smoothLine(
        s.build(s.aroundCircle, { n: 7, r: 0.12, at: [0.75, 0.5] }, (at) => at),
        { closed: true, tension: 0.8 },
      )

      s.strokedPath((a) => a.strokeWidth(0.003))
        .moveTo([0.1, 0.62])
        .cubicTo([0.3, 0.5], [0.5, 0.75], [0.7, 0.62])
        .quadraticTo([0.8, 0.5], [0.9, 0.62])

      s.text(
        "solandra & svg",
        [0.5, 0.15],
        s.A.fontSize(0.09)
          .fontFamily("Helvetica, sans-serif")
          .textAnchor("middle")
          .fillGradient("sky"),
      )
      return s
    },
  ],
  ["kitchen-sink", () => randomSketch(42)],
]

describe("drawings are stable across changes", () => {
  it.each(sketches)("renders %s the same way", async (name, draw) => {
    await expect(draw().image).toMatchFileSnapshot(snapshot(name))
  })

  it.each(sketches)("renders %s as well-formed SVG with visible content", (_, draw) => {
    const root = parseXml(draw().image)
    expect(root.tag).toBe("svg")
    expect(findAll(root, "path").length).toBeGreaterThan(0)
  })

  it("renders the same drawing twice from the same seed", () => {
    for (const [, draw] of sketches) {
      expect(draw().image).toBe(draw().image)
    }
  })

  it("renders different drawings from different seeds", () => {
    expect(randomSketch(1).image).not.toBe(randomSketch(2).image)
  })
})
