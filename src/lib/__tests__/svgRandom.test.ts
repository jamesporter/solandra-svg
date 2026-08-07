import { describe, expect, it } from "vitest"
import { SolandraSvg } from "../svg"
import { Point2D } from "../util/types"

describe("random", () => {
  it("stays in [0, 1) and is reproducible for a seed", () => {
    const a = new SolandraSvg(100, 100, 11)
    const b = new SolandraSvg(100, 100, 11)

    for (let i = 0; i < 100; i++) {
      const n = a.random()
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(1)
      expect(n).toBe(b.random())
    }
  })
})

describe("randomAngle", () => {
  it("stays in [0, 2pi)", () => {
    const s = new SolandraSvg(100, 100, 1)
    for (let i = 0; i < 200; i++) {
      const a = s.randomAngle()
      expect(a).toBeGreaterThanOrEqual(0)
      expect(a).toBeLessThan(Math.PI * 2)
    }
  })
})

describe("randomPoint", () => {
  it("lands inside the drawing bounds", () => {
    const s = new SolandraSvg(200, 100, 1) // 1 x 0.5

    for (let i = 0; i < 200; i++) {
      const [x, y] = s.randomPoint()
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThan(0.5)
    }
  })
})

describe("randomPolarity", () => {
  it("only returns 1 or -1, and returns both", () => {
    const s = new SolandraSvg(100, 100, 1)
    const seen = new Set<number>()
    for (let i = 0; i < 100; i++) {
      const p = s.randomPolarity()
      expect(Math.abs(p)).toBe(1)
      seen.add(p)
    }
    expect(seen).toEqual(new Set([1, -1]))
  })
})

describe("uniformGridPoint", () => {
  it("returns integer points inside the inclusive bounds", () => {
    const s = new SolandraSvg(100, 100, 1)
    for (let i = 0; i < 200; i++) {
      const [x, y] = s.uniformGridPoint({
        minX: -2,
        maxX: 2,
        minY: 0,
        maxY: 3,
      })
      expect(Number.isInteger(x)).toBe(true)
      expect(Number.isInteger(y)).toBe(true)
      expect(x).toBeGreaterThanOrEqual(-2)
      expect(x).toBeLessThanOrEqual(2)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThanOrEqual(3)
    }
  })

  it("can reach every point of a small grid", () => {
    const s = new SolandraSvg(100, 100, 1)
    const seen = new Set<string>()
    for (let i = 0; i < 500; i++) {
      seen.add(
        s.uniformGridPoint({ minX: 0, maxX: 1, minY: 0, maxY: 1 }).join(),
      )
    }
    expect(seen.size).toBe(4)
  })
})

describe("sample and samples", () => {
  it("sample always returns a member of the source array", () => {
    const s = new SolandraSvg(100, 100, 1)
    const source = ["a", "b", "c"]
    for (let i = 0; i < 100; i++) {
      expect(source).toContain(s.sample(source))
    }
  })

  it("sample reaches every element eventually", () => {
    const s = new SolandraSvg(100, 100, 1)
    const source = ["a", "b", "c"]
    const seen = new Set(Array.from({ length: 200 }, () => s.sample(source)))
    expect(seen).toEqual(new Set(source))
  })

  it("samples returns n elements, with replacement", () => {
    const s = new SolandraSvg(100, 100, 1)
    const result = s.samples(10, [1, 2])

    expect(result).toHaveLength(10)
    for (const n of result) {
      expect([1, 2]).toContain(n)
    }
  })

  it("samples returns an empty array for n = 0", () => {
    const s = new SolandraSvg(100, 100, 1)
    expect(s.samples(0, [1, 2, 3])).toEqual([])
  })
})

describe("shuffle", () => {
  it("permutes in place, preserving every element", () => {
    const s = new SolandraSvg(100, 100, 1)
    const items = Array.from({ length: 20 }, (_, i) => i)
    const result = s.shuffle(items)

    expect(result).toBe(items)
    expect([...result].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 20 }, (_, i) => i),
    )
    expect(result).not.toEqual(Array.from({ length: 20 }, (_, i) => i))
  })

  it("is deterministic for a given seed", () => {
    const shuffled = (seed: number) =>
      new SolandraSvg(100, 100, seed).shuffle([1, 2, 3, 4, 5, 6, 7, 8])

    expect(shuffled(3)).toEqual(shuffled(3))
    expect(shuffled(3)).not.toEqual(shuffled(4))
  })

  it("handles empty and single-element arrays", () => {
    const s = new SolandraSvg(100, 100, 1)
    expect(s.shuffle([])).toEqual([])
    expect(s.shuffle(["only"])).toEqual(["only"])
  })
})

describe("perturb", () => {
  it("offsets a point by at most magnitude/2 on each axis", () => {
    const s = new SolandraSvg(100, 100, 1)
    const at: Point2D = [0.5, 0.5]

    for (let i = 0; i < 200; i++) {
      const [x, y] = s.perturb({ at, magnitude: 0.4 })
      expect(Math.abs(x - 0.5)).toBeLessThanOrEqual(0.2)
      expect(Math.abs(y - 0.5)).toBeLessThanOrEqual(0.2)
    }
  })

  it("defaults to a magnitude of 0.1", () => {
    const s = new SolandraSvg(100, 100, 1)
    for (let i = 0; i < 200; i++) {
      const [x, y] = s.perturb({ at: [0, 0] })
      expect(Math.abs(x)).toBeLessThanOrEqual(0.05)
      expect(Math.abs(y)).toBeLessThanOrEqual(0.05)
    }
  })

  it("does not mutate the input point", () => {
    const s = new SolandraSvg(100, 100, 1)
    const at: Point2D = [0.25, 0.75]
    s.perturb({ at })
    expect(at).toEqual([0.25, 0.75])
  })
})

describe("seeding", () => {
  it("gives identical drawings for identical seeds", () => {
    const draw = (seed: number) => {
      const s = new SolandraSvg(100, 100, seed)
      s.forTiling({ n: 3 }, (_p, _d, c) => {
        s.filledPath((a) => a.fill(s.random() * 360, 80, 50)).ellipse(
          s.perturb({ at: c }),
          0.1,
          0.1,
        )
      })
      return s.image
    }

    expect(draw(42)).toBe(draw(42))
    expect(draw(42)).not.toBe(draw(43))
  })
})
