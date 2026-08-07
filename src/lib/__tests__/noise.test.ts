import { describe, expect, it } from "vitest"
import { perlin2 } from "../util/noise"

describe("perlin2", () => {
  it("is zero at lattice points", () => {
    for (let x = -3; x <= 3; x++) {
      for (let y = -3; y <= 3; y++) {
        expect(perlin2(x, y)).toBeCloseTo(0, 12)
      }
    }
  })

  it("is deterministic for the same coordinates", () => {
    expect(perlin2(0.3, 1.7)).toBe(perlin2(0.3, 1.7))
    expect(perlin2(-12.25, 4.5)).toBe(perlin2(-12.25, 4.5))
  })

  it("stays within the documented [-1, 1] range", () => {
    const limit = 1
    for (let i = 0; i < 2000; i++) {
      const x = (i % 71) * 0.137
      const y = (i % 53) * 0.219
      const n = perlin2(x, y)
      expect(n).toBeGreaterThanOrEqual(-limit)
      expect(n).toBeLessThanOrEqual(limit)
    }
  })

  it("produces varied, non-constant output", () => {
    const values = new Set<number>()
    for (let i = 0; i < 200; i++) {
      values.add(perlin2(i * 0.13, i * 0.29))
    }
    expect(values.size).toBeGreaterThan(150)
  })

  it("is continuous: nearby inputs give nearby outputs", () => {
    for (let i = 0; i < 100; i++) {
      const x = i * 0.31
      const y = i * 0.17
      const delta = Math.abs(perlin2(x, y) - perlin2(x + 0.001, y + 0.001))
      expect(delta).toBeLessThan(0.02)
    }
  })

  it("tiles with a period of 256 on both axes", () => {
    expect(perlin2(0.5, 0.5)).toBeCloseTo(perlin2(256.5, 0.5), 12)
    expect(perlin2(0.5, 0.5)).toBeCloseTo(perlin2(0.5, 256.5), 12)
    expect(perlin2(3.25, 7.75)).toBeCloseTo(perlin2(259.25, 263.75), 12)
  })

  it("takes both positive and negative values", () => {
    let min = Infinity
    let max = -Infinity
    for (let i = 0; i < 500; i++) {
      const n = perlin2(i * 0.11, i * 0.07)
      min = Math.min(min, n)
      max = Math.max(max, n)
    }
    expect(min).toBeLessThan(-0.1)
    expect(max).toBeGreaterThan(0.1)
  })
})
