import { describe, expect, it } from "vitest"
import { SolandraSvg } from "../svg"
import { Point2D, Vector2D } from "../util/types"

type Region = {
  point: Point2D
  delta: Vector2D
  center: Point2D
  i: number
}

const collectRegions = (
  run: (cb: (p: Point2D, d: Vector2D, c: Point2D, i: number) => void) => void,
): Region[] => {
  const regions: Region[] = []
  run((point, delta, center, i) => regions.push({ point, delta, center, i }))
  return regions
}

describe("forTiling", () => {
  it("splits a square drawing into n x n cells, column first by default", () => {
    const s = new SolandraSvg(100, 100, 1)
    const regions = collectRegions((cb) => s.forTiling({ n: 2 }, cb))

    expect(regions.map((r) => r.point)).toEqual([
      [0, 0],
      [0, 0.5],
      [0.5, 0],
      [0.5, 0.5],
    ])
    expect(regions.map((r) => r.i)).toEqual([0, 1, 2, 3])
    for (const r of regions) {
      expect(r.delta).toEqual([0.5, 0.5])
      expect(r.center).toEqual([r.point[0] + 0.25, r.point[1] + 0.25])
    }
  })

  it("walks across rows when order is rowFirst", () => {
    const s = new SolandraSvg(100, 100, 1)
    const regions = collectRegions((cb) =>
      s.forTiling({ n: 2, order: "rowFirst" }, cb),
    )

    expect(regions.map((r) => r.point)).toEqual([
      [0, 0],
      [0.5, 0],
      [0, 0.5],
      [0.5, 0.5],
    ])
  })

  it("produces square cells for type: square on a non-square drawing", () => {
    const s = new SolandraSvg(200, 100, 1) // aspectRatio 2
    const regions = collectRegions((cb) =>
      s.forTiling({ n: 4, type: "square" }, cb),
    )

    // 4 columns x 2 rows of 0.25 square cells fills the 1 x 0.5 drawing.
    expect(regions).toHaveLength(8)
    for (const r of regions) {
      expect(r.delta[0]).toBeCloseTo(r.delta[1], 10)
      expect(r.delta[0]).toBeCloseTo(0.25, 10)
    }
  })

  it("centres the tiling vertically when square cells do not fill the height", () => {
    const s = new SolandraSvg(100, 300, 1) // aspectRatio 1/3, height 3
    const regions = collectRegions((cb) =>
      s.forTiling({ n: 2, type: "square" }, cb),
    )

    // nY = floor(2 * 3) = 6 rows of 0.5 => height 3, exactly filling; offset 0
    expect(regions[0].point[1]).toBeCloseTo(0, 10)
    expect(regions).toHaveLength(12)
  })

  it("insets the tiling by the margin", () => {
    const s = new SolandraSvg(100, 100, 1)
    const regions = collectRegions((cb) =>
      s.forTiling({ n: 1, margin: 0.1 }, cb),
    )

    expect(regions).toHaveLength(1)
    expect(regions[0].point[0]).toBeCloseTo(0.1, 10)
    expect(regions[0].point[1]).toBeCloseTo(0.1, 10)
    expect(regions[0].delta[0]).toBeCloseTo(0.8, 10)
    expect(regions[0].delta[1]).toBeCloseTo(0.8, 10)
  })
})

describe("forMargin", () => {
  it("is a single region inset by the margin", () => {
    const s = new SolandraSvg(200, 100, 1)
    const regions = collectRegions((cb) => s.forMargin(0.05, cb))

    expect(regions).toHaveLength(1)
    expect(regions[0].point[0]).toBeCloseTo(0.05, 10)
    expect(regions[0].point[1]).toBeCloseTo(0.05, 10)
    expect(regions[0].delta[0]).toBeCloseTo(0.9, 10)
    expect(regions[0].delta[1]).toBeCloseTo(0.4, 10)
    expect(regions[0].i).toBe(0)
  })
})

describe("forHorizontal", () => {
  it("splits the drawing into n full-height columns", () => {
    const s = new SolandraSvg(200, 100, 1) // aspectRatio 2, height 0.5
    const regions = collectRegions((cb) => s.forHorizontal({ n: 2 }, cb))

    expect(regions.map((r) => r.point)).toEqual([
      [0, 0],
      [0.5, 0],
    ])
    for (const r of regions) {
      expect(r.delta).toEqual([0.5, 0.5])
    }
    expect(regions.map((r) => r.center)).toEqual([
      [0.25, 0.25],
      [0.75, 0.25],
    ])
  })

  it("respects the margin on both axes", () => {
    const s = new SolandraSvg(100, 100, 1)
    const regions = collectRegions((cb) =>
      s.forHorizontal({ n: 2, margin: 0.1 }, cb),
    )

    expect(regions[0].point).toEqual([0.1, 0.1])
    expect(regions[0].delta[0]).toBeCloseTo(0.4, 10)
    expect(regions[0].delta[1]).toBeCloseTo(0.8, 10)
    expect(regions[1].point[0]).toBeCloseTo(0.5, 10)
  })
})

describe("forVertical", () => {
  it("splits the drawing into n full-width rows", () => {
    const s = new SolandraSvg(200, 100, 1)
    const regions = collectRegions((cb) => s.forVertical({ n: 2 }, cb))

    expect(regions.map((r) => r.point)).toEqual([
      [0, 0],
      [0, 0.25],
    ])
    for (const r of regions) {
      expect(r.delta).toEqual([1, 0.25])
    }
  })

  it("respects the margin on both axes", () => {
    const s = new SolandraSvg(100, 100, 1)
    const regions = collectRegions((cb) =>
      s.forVertical({ n: 2, margin: 0.1 }, cb),
    )

    expect(regions[0].point).toEqual([0.1, 0.1])
    expect(regions[0].delta[0]).toBeCloseTo(0.8, 10)
    expect(regions[0].delta[1]).toBeCloseTo(0.4, 10)
    expect(regions[1].point[1]).toBeCloseTo(0.5, 10)
  })
})

describe("forGrid", () => {
  it("visits every integer point, inclusive of the bounds, column first", () => {
    const s = new SolandraSvg(100, 100, 1)
    const points: Point2D[] = []
    const indices: number[] = []
    s.forGrid({ minX: 0, maxX: 1, minY: 0, maxY: 1 }, (p, i) => {
      points.push(p)
      indices.push(i)
    })

    expect(points).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ])
    expect(indices).toEqual([0, 1, 2, 3])
  })

  it("walks across rows when order is rowFirst", () => {
    const s = new SolandraSvg(100, 100, 1)
    const points: Point2D[] = []
    s.forGrid({ minX: 0, maxX: 1, minY: 0, maxY: 1, order: "rowFirst" }, (p) =>
      points.push(p),
    )

    expect(points).toEqual([
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ])
  })

  it("supports negative bounds", () => {
    const s = new SolandraSvg(100, 100, 1)
    const points: Point2D[] = []
    s.forGrid({ minX: -1, maxX: 0, minY: -2, maxY: -1 }, (p) => points.push(p))

    expect(points).toEqual([
      [-1, -2],
      [-1, -1],
      [0, -2],
      [0, -1],
    ])
  })

  it("visits nothing when the bounds are inverted", () => {
    const s = new SolandraSvg(100, 100, 1)
    const points: Point2D[] = []
    s.forGrid({ minX: 1, maxX: 0, minY: 0, maxY: 0 }, (p) => points.push(p))

    expect(points).toEqual([])
  })
})

describe("build", () => {
  it("collects a value per iteration", () => {
    const s = new SolandraSvg(100, 100, 1)
    const indices = s.build(s.forTiling, { n: 2 }, (_p, _d, _c, i) => i)

    expect(indices).toEqual([0, 1, 2, 3])
  })

  it("works with forGrid too", () => {
    const s = new SolandraSvg(100, 100, 1)
    const sums = s.build(
      s.forGrid,
      { minX: 0, maxX: 1, minY: 0, maxY: 1 },
      ([x, y]: Point2D) => x + y,
    )

    expect(sums).toEqual([0, 1, 1, 2])
  })
})

describe("withRandomOrder", () => {
  it("visits every iteration exactly once, in a different order", () => {
    const s = new SolandraSvg(100, 100, 1)
    const seen: number[] = []
    s.withRandomOrder(s.forTiling, { n: 4 }, (_p, _d, _c, i: number) =>
      seen.push(i),
    )

    expect([...seen].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 16 }, (_, i) => i),
    )
    expect(seen).not.toEqual(Array.from({ length: 16 }, (_, i) => i))
  })

  it("is deterministic for a given seed", () => {
    const order = (seed: number) => {
      const s = new SolandraSvg(100, 100, seed)
      const seen: number[] = []
      s.withRandomOrder(s.forTiling, { n: 3 }, (_p, _d, _c, i: number) =>
        seen.push(i),
      )
      return seen
    }

    expect(order(5)).toEqual(order(5))
    expect(order(5)).not.toEqual(order(6))
  })
})

describe("range", () => {
  it("includes both endpoints by default", () => {
    const s = new SolandraSvg(100, 100, 1)
    const values: number[] = []
    s.range({ n: 4 }, (n) => values.push(n))

    expect(values).toEqual([0, 0.25, 0.5, 0.75, 1])
  })

  it("excludes the endpoint when inclusive is false", () => {
    const s = new SolandraSvg(100, 100, 1)
    const values: number[] = []
    s.range({ n: 4, inclusive: false }, (n) => values.push(n))

    expect(values).toEqual([0, 0.25, 0.5, 0.75])
  })

  it("honours from and to", () => {
    const s = new SolandraSvg(100, 100, 1)
    const values: number[] = []
    s.range({ from: 10, to: 20, n: 2 }, (n) => values.push(n))

    expect(values).toEqual([10, 15, 20])
  })
})

describe("times and downFrom", () => {
  it("times counts up from zero", () => {
    const s = new SolandraSvg(100, 100, 1)
    const values: number[] = []
    s.times(3, (n) => values.push(n))
    expect(values).toEqual([0, 1, 2])
  })

  it("downFrom counts down to one", () => {
    const s = new SolandraSvg(100, 100, 1)
    const values: number[] = []
    s.downFrom(3, (n) => values.push(n))
    expect(values).toEqual([3, 2, 1])
  })

  it("both do nothing for n = 0", () => {
    const s = new SolandraSvg(100, 100, 1)
    let calls = 0
    s.times(0, () => calls++)
    s.downFrom(0, () => calls++)
    expect(calls).toBe(0)
  })
})

describe("doProportion", () => {
  it("never runs for p = 0 and always runs for p = 1", () => {
    const s = new SolandraSvg(100, 100, 1)
    let never = 0
    let always = 0
    for (let i = 0; i < 50; i++) {
      s.doProportion(0, () => never++)
      s.doProportion(1, () => always++)
    }
    expect(never).toBe(0)
    expect(always).toBe(50)
  })

  it("runs roughly p of the time", () => {
    const s = new SolandraSvg(100, 100, 1)
    let count = 0
    for (let i = 0; i < 4000; i++) {
      s.doProportion(0.25, () => count++)
    }
    expect(count).toBeGreaterThan(800)
    expect(count).toBeLessThan(1200)
  })
})

describe("inDrawing", () => {
  it("is true strictly inside the drawing and false on the boundary", () => {
    const s = new SolandraSvg(200, 100, 1) // 1 x 0.5

    expect(s.inDrawing(s.meta.center)).toBe(true)
    expect(s.inDrawing([0.5, 0.25])).toBe(true)
    expect(s.inDrawing([0, 0.25])).toBe(false)
    expect(s.inDrawing([1, 0.25])).toBe(false)
    expect(s.inDrawing([0.5, 0])).toBe(false)
    expect(s.inDrawing([0.5, 0.5])).toBe(false)
    expect(s.inDrawing([-0.1, 0.25])).toBe(false)
    expect(s.inDrawing([0.5, 0.6])).toBe(false)
  })
})
