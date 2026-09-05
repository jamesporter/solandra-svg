/**
 * Sketch builders used by the output-validity and regression tests.
 *
 * {@link randomSketch} exercises a wide slice of the drawing API at once, so a
 * single assertion about its output ("this is valid SVG") covers combinations
 * no hand-written example would reach.
 */

import { SolandraSvg } from "../../svg.js"

/**
 * Builds a drawing that touches most of the public drawing surface, driven
 * entirely by the instance's seeded RNG.
 *
 * @param seed - The seed for the drawing's RNG
 * @param size - Optional pixel dimensions (defaults to a non-square canvas)
 * @returns The completed drawing
 */
export function randomSketch(
  seed: number,
  size: { width?: number; height?: number } = {},
): SolandraSvg {
  const { width = 800, height = 500 } = size
  const s = new SolandraSvg(width, height, seed)

  s.forTiling({ n: 3, margin: 0.05, type: "square" }, (_, delta, center) => {
    s.proportionately([
      [
        1,
        () =>
          s
            .path(s.A.fill(s.random() * 360, 80, 50, s.random()))
            .ellipse(center, delta[0], delta[1]),
      ],
      [
        1,
        () =>
          s
            .path(s.A.strokeOklch(0.7, 0.2, s.random() * 360).strokeWidth(0.004))
            .regularPolygon(center, s.uniformRandomInt({ from: 3, to: 8 }), delta[0] / 2, s.randomAngle()),
      ],
      [
        1,
        () =>
          s
            .strokedPath((a) => a.dashArray(0.01, 0.005).dashOffset(0.002))
            .moveTo(center)
            .curveTo(s.perturb({ at: center, magnitude: 0.3 }), {
              curveSize: s.random(),
              polarity: s.randomPolarity(),
              twist: s.gaussian({ sd: 0.2 }),
            })
            .close(),
      ],
      [
        1,
        () =>
          s
            .path(s.A.transform(s.T.translate(center).rotate(s.randomAngle())).id(`spiral-${s.random()}`))
            .spiral([0, 0], delta[0] / 8, 12),
      ],
    ])
  })

  s.groupWithId("strips", () => {
    s.forHorizontal({ n: 4, margin: 0.02 }, (at, delta) => {
      s.path(s.A.fill(0, 0, 20, 0.2)).rect(at, delta[0], delta[1], "topLeft")
    })
    s.group(s.A.transform(s.T.scale(0.5).skewX(0.1)), () => {
      s.forVertical({ n: 3 }, (_, __, center) => {
        s.filledPath((a) => a.opacity(0.3)).ellipse(center, 0.1, 0.05)
      })
    })
  })

  s.withRandomOrder(s.forGrid, { minX: 0, maxX: 3, minY: 0, maxY: 2 }, (point) => {
    const at = s.perturb({ at: [point[0] / 4, point[1] / 4] })
    s.cutPath().moveTo(at).arcTo(s.randomPoint(), { largeArc: s.random() > 0.5 })
  })

  s.aroundCircle({ n: 7, r: 0.2 }, (at) => {
    s.creasePath()
      .moveTo(at)
      .lineTo(s.sample([s.meta.center, s.randomPoint()]))
      .chaikin(s.uniformRandomInt({ from: 1, to: 3 }))
  })

  return s
}
