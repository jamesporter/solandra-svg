import { describe, expect, it } from "vitest"
import v from "../util/vectors"
import c from "../util/collectionOps"
import {
  centroid,
  clamp,
  hexTransform,
  isoTransform,
  scaler,
  scaler2d,
  triTransform,
} from "../util/util"
import { perlin2 } from "../util/noise"
import { Point2D } from "../util/types"
import {
  aNonZeroNumber,
  aNonZeroPoint,
  aNumber,
  anAngle,
  anInteger,
  aPoint,
  forAll,
} from "./helpers/property"

// The example-based tests pin down specific values; these pin down the laws
// those values have to obey, over a few hundred generated inputs each. Between
// them they catch a different class of bug: a sign flip or an axis swap that
// happens to agree with the one example someone wrote down.

const closeTo = (actual: number, expected: number, epsilon = 1e-9) =>
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(
    epsilon * Math.max(1, Math.abs(expected)),
  )

const pointCloseTo = (actual: Point2D, expected: Point2D, epsilon = 1e-9) => {
  closeTo(actual[0], expected[0], epsilon)
  closeTo(actual[1], expected[1], epsilon)
}

describe("vector algebra", () => {
  it("subtract undoes add", () => {
    forAll(
      (rng) => [aPoint(rng), aPoint(rng)] as const,
      ([a, b]) => pointCloseTo(v.subtract(v.add(a, b), b), a),
    )
  })

  it("add is commutative and has the origin as its identity", () => {
    forAll(
      (rng) => [aPoint(rng), aPoint(rng)] as const,
      ([a, b]) => {
        expect(v.add(a, b)).toEqual(v.add(b, a))
        expect(v.add(a, [0, 0])).toEqual(a)
      },
    )
  })

  it("magnitude is non-negative and scales linearly", () => {
    forAll(
      (rng) => [aPoint(rng), aNumber(rng, -10, 10)] as const,
      ([p, k]) => {
        expect(v.magnitude(p)).toBeGreaterThanOrEqual(0)
        closeTo(v.magnitude(v.scale(p, k)), Math.abs(k) * v.magnitude(p))
      },
    )
  })

  it("distance is symmetric and zero only between identical points", () => {
    forAll(
      (rng) => [aPoint(rng), aPoint(rng)] as const,
      ([a, b]) => {
        closeTo(v.distance(a, b), v.distance(b, a))
        expect(v.distance(a, a)).toBe(0)
      },
    )
  })

  it("distance obeys the triangle inequality", () => {
    forAll(
      (rng) => [aPoint(rng), aPoint(rng), aPoint(rng)] as const,
      ([a, b, c]) => {
        const direct = v.distance(a, c)
        const viaB = v.distance(a, b) + v.distance(b, c)
        expect(direct).toBeLessThanOrEqual(viaB + 1e-9)
      },
    )
  })

  it("rotation preserves magnitude and composes additively", () => {
    forAll(
      (rng) => [aPoint(rng), anAngle(rng), anAngle(rng)] as const,
      ([p, a, b]) => {
        closeTo(v.magnitude(v.rotate(p, a)), v.magnitude(p))
        pointCloseTo(v.rotate(v.rotate(p, a), b), v.rotate(p, a + b), 1e-9)
      },
    )
  })

  it("rotating by a full turn is the identity", () => {
    forAll(
      (rng) => aPoint(rng),
      (p) => pointCloseTo(v.rotate(p, Math.PI * 2), p, 1e-9),
    )
  })

  it("normalise produces a unit vector in the same direction", () => {
    forAll(
      (rng) => aNonZeroPoint(rng),
      (p) => {
        const unit = v.normalise(p)
        closeTo(v.magnitude(unit), 1)
        // Same direction: the vector is a non-negative multiple of its unit form.
        closeTo(v.dot(unit, p), v.magnitude(p))
      },
    )
  })

  it("dot is symmetric, bilinear and gives the squared magnitude with itself", () => {
    forAll(
      (rng) => [aPoint(rng), aPoint(rng), aNumber(rng, -10, 10)] as const,
      ([a, b, k]) => {
        closeTo(v.dot(a, b), v.dot(b, a))
        closeTo(v.dot(v.scale(a, k), b), k * v.dot(a, b))
        closeTo(v.dot(a, a), v.magnitude(a) ** 2, 1e-9)
      },
    )
  })

  it("dot respects the Cauchy-Schwarz bound", () => {
    forAll(
      (rng) => [aPoint(rng), aPoint(rng)] as const,
      ([a, b]) => {
        const bound = v.magnitude(a) * v.magnitude(b)
        expect(Math.abs(v.dot(a, b))).toBeLessThanOrEqual(bound * (1 + 1e-9))
      },
    )
  })

  it("pointAlong hits the endpoints and stays on the segment", () => {
    forAll(
      (rng) => [aPoint(rng), aPoint(rng), rng.number()] as const,
      ([a, b, t]) => {
        pointCloseTo(v.pointAlong(a, b, 0), a)
        pointCloseTo(v.pointAlong(a, b, 1), b, 1e-9)

        // A point on the segment splits the distance in proportion to t.
        const p = v.pointAlong(a, b, t)
        closeTo(v.distance(a, p) + v.distance(p, b), v.distance(a, b), 1e-9)
      },
    )
  })

  it("pointAlong defaults to the midpoint", () => {
    forAll(
      (rng) => [aPoint(rng), aPoint(rng)] as const,
      ([a, b]) => {
        const mid = v.pointAlong(a, b)
        closeTo(v.distance(a, mid), v.distance(mid, b), 1e-9)
      },
    )
  })

  it("polarToCartesian lands at the requested radius and angle", () => {
    forAll(
      (rng) => [aPoint(rng), Math.abs(aNumber(rng, 0.001, 100)), anAngle(rng)] as const,
      ([center, radius, angle]) => {
        const p = v.polarToCartesian(center, radius, angle)
        closeTo(v.distance(center, p), radius, 1e-9)

        const offset = v.subtract(p, center)
        closeTo(Math.atan2(offset[1], offset[0]), Math.atan2(Math.sin(angle), Math.cos(angle)), 1e-9)
      },
    )
  })
})

describe("scales", () => {
  it("map the domain bounds onto the range bounds", () => {
    forAll(
      (rng) => ({
        minDomain: aNumber(rng, -100, 0),
        maxDomain: aNumber(rng, 1, 100),
        minRange: aNumber(rng, -100, 100),
        maxRange: aNumber(rng, -100, 100),
      }),
      (config) => {
        const s = scaler(config)
        closeTo(s(config.minDomain), config.minRange, 1e-9)
        closeTo(s(config.maxDomain), config.maxRange, 1e-9)
      },
    )
  })

  it("are invertible by the scale that swaps domain and range", () => {
    forAll(
      (rng) => {
        const minDomain = aNumber(rng, -100, 0)
        const maxDomain = aNumber(rng, 1, 100)
        const minRange = aNumber(rng, -100, 0)
        const maxRange = aNumber(rng, 1, 100)
        return {
          config: { minDomain, maxDomain, minRange, maxRange },
          n: aNumber(rng, minDomain, maxDomain),
        }
      },
      ({ config, n }) => {
        const forwards = scaler(config)
        const backwards = scaler({
          minDomain: config.minRange,
          maxDomain: config.maxRange,
          minRange: config.minDomain,
          maxRange: config.maxDomain,
        })
        closeTo(backwards(forwards(n)), n, 1e-6)
      },
    )
  })

  it("scaler2d applies its two scales independently", () => {
    forAll(
      (rng) => aPoint(rng, 0, 1),
      (point) => {
        const cX = { minDomain: 0, maxDomain: 1, minRange: 0, maxRange: 10 }
        const cY = { minDomain: 0, maxDomain: 1, minRange: 100, maxRange: 0 }
        expect(scaler2d(cX, cY)(point)).toEqual([scaler(cX)(point[0]), scaler(cY)(point[1])])
      },
    )
  })
})

describe("clamp", () => {
  it("returns a value in range, and is idempotent", () => {
    forAll(
      (rng) => {
        const from = aNumber(rng, -100, 0)
        return { range: { from, to: from + Math.abs(aNumber(rng, 0, 100)) }, n: aNumber(rng) }
      },
      ({ range, n }) => {
        const clamped = clamp(range, n)
        expect(clamped).toBeGreaterThanOrEqual(range.from)
        expect(clamped).toBeLessThanOrEqual(range.to)
        expect(clamp(range, clamped)).toBe(clamped)
      },
    )
  })

  it("leaves values already inside the range alone", () => {
    forAll(
      (rng) => ({ range: { from: -10, to: 10 }, n: aNumber(rng, -10, 10) }),
      ({ range, n }) => expect(clamp(range, n)).toBe(n),
    )
  })
})

describe("centroid", () => {
  it("lies within the bounding box of its points", () => {
    forAll(
      (rng) => c.arrayOf(anInteger(rng, 1, 8), () => aPoint(rng)),
      (points) => {
        const [x, y] = centroid(points)
        const xs = points.map((p) => p[0])
        const ys = points.map((p) => p[1])
        expect(x).toBeGreaterThanOrEqual(Math.min(...xs) - 1e-9)
        expect(x).toBeLessThanOrEqual(Math.max(...xs) + 1e-9)
        expect(y).toBeGreaterThanOrEqual(Math.min(...ys) - 1e-9)
        expect(y).toBeLessThanOrEqual(Math.max(...ys) + 1e-9)
      },
    )
  })

  it("is unchanged by closing the polygon", () => {
    forAll(
      (rng) => c.arrayOf(anInteger(rng, 2, 8), () => aPoint(rng)),
      (points) => pointCloseTo(centroid([...points, points[0]]), centroid(points), 1e-9),
    )
  })

  it("moves with a translation of every point", () => {
    forAll(
      (rng) => ({
        points: c.arrayOf(anInteger(rng, 1, 8), () => aPoint(rng)),
        by: aPoint(rng),
      }),
      ({ points, by }) =>
        pointCloseTo(
          centroid(points.map((p) => v.add(p, by))),
          v.add(centroid(points), by),
          1e-9,
        ),
    )
  })
})

describe("grid transforms", () => {
  it("isoTransform maps the origin to the origin and is linear", () => {
    forAll(
      (rng) => ({
        height: aNonZeroNumber(rng, 0.1, 10),
        a: [aNumber(rng, -10, 10), aNumber(rng, -10, 10), aNumber(rng, -10, 10)] as [
          number,
          number,
          number,
        ],
        k: aNumber(rng, -5, 5),
      }),
      ({ height, a, k }) => {
        const iso = isoTransform(height)
        pointCloseTo(iso([0, 0, 0]), [0, 0])
        pointCloseTo(
          iso([a[0] * k, a[1] * k, a[2] * k]),
          v.scale(iso(a), k),
          1e-9,
        )
      },
    )
  })

  it("hexTransform keeps neighbouring rows a constant distance apart", () => {
    forAll(
      (rng) => ({ r: Math.abs(aNonZeroNumber(rng, 0.1, 10)), y: anInteger(rng, -5, 5) }),
      ({ r, y }) => {
        const hex = hexTransform({ r })
        // Vertical spacing between rows is always 1.5r, whatever the offset.
        closeTo(hex([0, y + 1])[1] - hex([0, y])[1], 1.5 * r, 1e-9)
      },
    )
  })

  it("hexTransform's horizontal variant is the vertical one with the axes swapped", () => {
    forAll(
      (rng) => ({ r: Math.abs(aNonZeroNumber(rng, 0.1, 10)), p: [anInteger(rng, -5, 5), anInteger(rng, -5, 5)] as Point2D }),
      ({ r, p }) => {
        const vertical = hexTransform({ r, vertical: true })([p[1], p[0]])
        const horizontal = hexTransform({ r, vertical: false })(p)
        pointCloseTo(horizontal, [vertical[1], vertical[0]], 1e-9)
      },
    )
  })

  it("triTransform alternates orientation between horizontal neighbours", () => {
    forAll(
      (rng) => ({ s: Math.abs(aNonZeroNumber(rng, 0.1, 10)), p: [anInteger(rng, -5, 5), anInteger(rng, -5, 5)] as Point2D }),
      ({ s, p }) => {
        const tri = triTransform({ s })
        expect(tri(p).flipped).not.toBe(tri([p[0] + 1, p[1]]).flipped)
        // Columns are always half a side apart, whichever way a triangle points.
        closeTo(tri([p[0] + 1, p[1]]).at[0] - tri(p).at[0], s / 2, 1e-9)
      },
    )
  })
})

describe("collection operations", () => {
  it("pairWise and tripleWise produce one window per starting position", () => {
    forAll(
      (rng) => c.arrayOf(anInteger(rng, 0, 12), () => anInteger(rng, 0, 100)),
      (items) => {
        expect(c.pairWise(items)).toHaveLength(Math.max(0, items.length - 1))
        expect(c.tripleWise(items)).toHaveLength(Math.max(0, items.length - 2))
        for (const [a, b] of c.pairWise(items)) {
          expect(items).toContain(a)
          expect(items).toContain(b)
        }
      },
    )
  })

  it("zip2 is as long as the shorter input and preserves order", () => {
    forAll(
      (rng) => ({
        a: c.arrayOf(anInteger(rng, 0, 8), () => anInteger(rng, 0, 100)),
        b: c.arrayOf(anInteger(rng, 0, 8), () => anInteger(rng, 0, 100)),
      }),
      ({ a, b }) => {
        const zipped = c.zip2(a, b)
        expect(zipped).toHaveLength(Math.min(a.length, b.length))
        zipped.forEach(([x, y], i) => {
          expect(x).toBe(a[i])
          expect(y).toBe(b[i])
        })
      },
    )
  })

  it("sum matches adding the elements one at a time", () => {
    forAll(
      (rng) => c.arrayOf(anInteger(rng, 0, 20), () => anInteger(rng, -50, 50)),
      (numbers) => {
        let total = 0
        for (const n of numbers) total += n
        expect(c.sum(numbers)).toBe(total)
      },
    )
  })
})

describe("perlin noise", () => {
  it("stays within [-1, 1] across the plane", () => {
    forAll(
      (rng) => aPoint(rng, -500, 500),
      ([x, y]) => {
        const n = perlin2(x, y)
        expect(n).toBeGreaterThanOrEqual(-1)
        expect(n).toBeLessThanOrEqual(1)
      },
      { runs: 500 },
    )
  })

  it("is continuous: a small step changes the value only a little", () => {
    forAll(
      (rng) => aPoint(rng, -100, 100),
      ([x, y]) => {
        const step = 1e-4
        expect(Math.abs(perlin2(x + step, y) - perlin2(x, y))).toBeLessThan(0.01)
        expect(Math.abs(perlin2(x, y + step) - perlin2(x, y))).toBeLessThan(0.01)
      },
    )
  })

  it("repeats with a period of 256 on both axes", () => {
    forAll(
      (rng) => aPoint(rng, -50, 50),
      ([x, y]) => {
        closeTo(perlin2(x + 256, y), perlin2(x, y), 1e-9)
        closeTo(perlin2(x, y + 256), perlin2(x, y), 1e-9)
      },
    )
  })
})
