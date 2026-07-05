import { expect, it, describe } from "vitest"
import { SolandraSvg } from "../svg"
import { Point2D } from "../util/types"

describe("aroundCircle", () => {
  it("places the first point at the top of the circle", () => {
    const s = new SolandraSvg(100, 100, 1)
    const points: Point2D[] = []
    s.aroundCircle({ n: 4, at: [0, 0], r: 1 }, (p) => points.push(p))

    // Starting angle is -PI/2 (the top), so the first point is [0, -1].
    expect(points[0][0]).toBeCloseTo(0)
    expect(points[0][1]).toBeCloseTo(-1)
  })

  it("distributes n evenly spaced points and defaults to the drawing centre", () => {
    const s = new SolandraSvg(200, 100, 1) // aspectRatio 2 => centre [0.5, 0.25]
    const points: Point2D[] = []
    s.aroundCircle({ n: 8, r: 0.25 }, (p) => points.push(p))

    expect(points).toHaveLength(8)
    // Every point sits at radius r from the default centre.
    for (const [x, y] of points) {
      const d = Math.hypot(x - 0.5, y - 0.25)
      expect(d).toBeCloseTo(0.25)
    }
  })

  it("passes an incrementing index", () => {
    const s = new SolandraSvg(100, 100, 1)
    const indices: number[] = []
    s.aroundCircle({ n: 5 }, (_p, i) => indices.push(i))
    expect(indices).toEqual([0, 1, 2, 3, 4])
  })
})

describe("randomness helpers are deterministic for a given seed", () => {
  it("gaussian produces the same sequence for the same seed", () => {
    const a = new SolandraSvg(100, 100, 7)
    const b = new SolandraSvg(100, 100, 7)
    const seqA = [a.gaussian(), a.gaussian(), a.gaussian()]
    const seqB = [b.gaussian(), b.gaussian(), b.gaussian()]
    expect(seqA).toEqual(seqB)
  })

  it("gaussian roughly matches the requested mean and sd", () => {
    const s = new SolandraSvg(100, 100, 1)
    const n = 5000
    let sum = 0
    for (let i = 0; i < n; i++) sum += s.gaussian({ mean: 10, sd: 2 })
    const mean = sum / n
    expect(mean).toBeGreaterThan(9.5)
    expect(mean).toBeLessThan(10.5)
  })

  it("poisson is deterministic and non-negative", () => {
    const a = new SolandraSvg(100, 100, 3)
    const b = new SolandraSvg(100, 100, 3)
    const seqA = [a.poisson(4), a.poisson(4), a.poisson(4)]
    const seqB = [b.poisson(4), b.poisson(4), b.poisson(4)]
    expect(seqA).toEqual(seqB)
    for (const v of seqA) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(v)).toBe(true)
    }
  })

  it("poisson mean is close to lambda", () => {
    const s = new SolandraSvg(100, 100, 1)
    const n = 5000
    const lambda = 3
    let sum = 0
    for (let i = 0; i < n; i++) sum += s.poisson(lambda)
    const mean = sum / n
    expect(mean).toBeGreaterThan(lambda * 0.85)
    expect(mean).toBeLessThan(lambda * 1.15)
  })
})

describe("proportionately", () => {
  it("throws when the total weight is not positive", () => {
    const s = new SolandraSvg(100, 100, 1)
    expect(() => s.proportionately([])).toThrow()
    expect(() => s.proportionately([[0, () => 1]])).toThrow()
  })

  it("returns the value of the selected case", () => {
    const s = new SolandraSvg(100, 100, 1)
    const result = s.proportionately([[1, () => "only"]])
    expect(result).toBe("only")
  })

  it("respects the relative weights", () => {
    const s = new SolandraSvg(100, 100, 1)
    let a = 0
    let b = 0
    for (let i = 0; i < 4000; i++) {
      s.proportionately<void>([
        [9, () => { a++ }],
        [1, () => { b++ }],
      ])
    }
    // 'a' should be selected roughly 9x as often as 'b'.
    expect(a).toBeGreaterThan(b * 4)
  })
})

describe("uniformRandomInt", () => {
  it("stays within an inclusive range", () => {
    const s = new SolandraSvg(100, 100, 1)
    for (let i = 0; i < 200; i++) {
      const n = s.uniformRandomInt({ from: 2, to: 5 })
      expect(n).toBeGreaterThanOrEqual(2)
      expect(n).toBeLessThanOrEqual(5)
      expect(Number.isInteger(n)).toBe(true)
    }
  })

  it("excludes the upper bound when inclusive is false", () => {
    const s = new SolandraSvg(100, 100, 1)
    for (let i = 0; i < 200; i++) {
      const n = s.uniformRandomInt({ to: 3, inclusive: false })
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(3)
    }
  })
})
