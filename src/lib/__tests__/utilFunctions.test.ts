import { expect, it, describe } from "vitest"
import {
  clamp,
  scaler,
  scaler2d,
  isoTransform,
  centroid,
  hexTransform,
  triTransform,
} from "../util/util"

describe("Utility functions", () => {
  describe("clamp", () => {
    it("should clamp value within range", () => {
      expect(clamp({ from: 0, to: 10 }, 5)).toBe(5)
    })

    it("should clamp value below range to minimum", () => {
      expect(clamp({ from: 0, to: 10 }, -5)).toBe(0)
    })

    it("should clamp value above range to maximum", () => {
      expect(clamp({ from: 0, to: 10 }, 15)).toBe(10)
    })

    it("should handle value at boundary", () => {
      expect(clamp({ from: 0, to: 10 }, 0)).toBe(0)
      expect(clamp({ from: 0, to: 10 }, 10)).toBe(10)
    })

    it("should handle negative ranges", () => {
      expect(clamp({ from: -10, to: -5 }, -7)).toBe(-7)
      expect(clamp({ from: -10, to: -5 }, -20)).toBe(-10)
      expect(clamp({ from: -10, to: -5 }, 0)).toBe(-5)
    })
  })

  describe("scaler", () => {
    it("should scale value from domain to range", () => {
      const scale = scaler({
        minDomain: 0,
        maxDomain: 100,
        minRange: 0,
        maxRange: 1,
      })
      expect(scale(50)).toBe(0.5)
      expect(scale(0)).toBe(0)
      expect(scale(100)).toBe(1)
    })

    it("should handle reverse scaling", () => {
      const scale = scaler({
        minDomain: 0,
        maxDomain: 100,
        minRange: 1,
        maxRange: 0,
      })
      expect(scale(0)).toBe(1)
      expect(scale(100)).toBe(0)
      expect(scale(50)).toBe(0.5)
    })

    it("should scale outside domain (extrapolation)", () => {
      const scale = scaler({
        minDomain: 0,
        maxDomain: 10,
        minRange: 0,
        maxRange: 100,
      })
      expect(scale(15)).toBe(150)
      expect(scale(-5)).toBe(-50)
    })

    it("should handle non-zero domain start", () => {
      const scale = scaler({
        minDomain: 10,
        maxDomain: 20,
        minRange: 0,
        maxRange: 100,
      })
      expect(scale(10)).toBe(0)
      expect(scale(15)).toBe(50)
      expect(scale(20)).toBe(100)
    })
  })

  describe("scaler2d", () => {
    it("should scale 2D point", () => {
      const scale = scaler2d(
        { minDomain: 0, maxDomain: 10, minRange: 0, maxRange: 100 },
        { minDomain: 0, maxDomain: 10, minRange: 0, maxRange: 200 }
      )
      expect(scale([5, 5])).toEqual([50, 100])
    })

    it("should scale differently in x and y", () => {
      const scale = scaler2d(
        { minDomain: 0, maxDomain: 100, minRange: 0, maxRange: 1 },
        { minDomain: 0, maxDomain: 200, minRange: 0, maxRange: 2 }
      )
      expect(scale([50, 100])).toEqual([0.5, 1])
    })
  })

  describe("isoTransform", () => {
    it("should transform 3D isometric coordinates to 2D", () => {
      const transform = isoTransform(1)
      const result = transform([0, 0, 0])
      expect(result[0]).toBeCloseTo(0, 10)
      expect(result[1]).toBeCloseTo(0, 10)
    })

    it("should handle different heights", () => {
      const transform1 = isoTransform(1)
      const transform2 = isoTransform(2)
      const p: [number, number, number] = [1, 1, 1]
      const r1 = transform1(p)
      const r2 = transform2(p)
      // Different heights should produce different results
      expect(r1).not.toEqual(r2)
    })

    it("should transform x axis", () => {
      const transform = isoTransform(1)
      const result = transform([1, 0, 0])
      // Moving along x should affect both 2D x and y
      expect(result[0]).not.toBe(0)
      expect(result[1]).not.toBe(0)
    })
  })

  describe("centroid", () => {
    it("should return single point as centroid", () => {
      expect(centroid([[5, 5]])).toEqual([5, 5])
    })

    it("should calculate centroid of two points", () => {
      expect(centroid([[0, 0], [10, 10]])).toEqual([5, 5])
    })

    it("should calculate centroid of triangle", () => {
      expect(centroid([[0, 0], [3, 0], [0, 3]])).toEqual([1, 1])
    })

    it("should calculate centroid of square", () => {
      expect(centroid([[0, 0], [2, 0], [2, 2], [0, 2]])).toEqual([1, 1])
    })

    it("should handle closed polygon (first == last)", () => {
      // When first and last points are the same, it should exclude the duplicate
      const result = centroid([[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]])
      expect(result).toEqual([2, 2])
    })

    it("should throw error for empty array", () => {
      expect(() => centroid([])).toThrow("centroid must have at least one point")
    })
  })

  describe("hexTransform", () => {
    it("should transform to hex grid (vertical)", () => {
      const transform = hexTransform({ r: 1 })
      const result = transform([0, 0])
      expect(result).toEqual([0, 0])
    })

    it("should offset alternate rows (vertical)", () => {
      const transform = hexTransform({ r: 1 })
      const row0 = transform([0, 0])
      const row1 = transform([0, 1])
      // Odd row should be offset
      expect(row0[0]).not.toBe(row1[0])
    })

    it("should transform to hex grid (horizontal)", () => {
      const transform = hexTransform({ r: 1, vertical: false })
      const result = transform([0, 0])
      expect(result).toEqual([0, 0])
    })

    it("should scale with radius", () => {
      const transform1 = hexTransform({ r: 1 })
      const transform2 = hexTransform({ r: 2 })
      const p: [number, number] = [1, 0]
      const r1 = transform1(p)
      const r2 = transform2(p)
      // Larger radius should produce larger coordinates
      expect(Math.abs(r2[0])).toBeGreaterThan(Math.abs(r1[0]))
    })
  })

  describe("triTransform", () => {
    it("should transform to triangular grid", () => {
      const transform = triTransform({ s: 1 })
      const result = transform([0, 0])
      expect(result.at).toBeDefined()
      expect(result.flipped).toBeDefined()
    })

    it("should alternate flipped state", () => {
      const transform = triTransform({ s: 1 })
      const r00 = transform([0, 0])
      const r10 = transform([1, 0])
      const r20 = transform([2, 0])
      // Alternating triangles should have different flipped states
      expect(r00.flipped).toBe(false)
      expect(r10.flipped).toBe(true)
      expect(r20.flipped).toBe(false)
    })

    it("should scale with side length", () => {
      const transform1 = triTransform({ s: 1 })
      const transform2 = triTransform({ s: 2 })
      const r1 = transform1([2, 0])
      const r2 = transform2([2, 0])
      // Larger side length should produce larger spacing
      expect(Math.abs(r2.at[0])).toBeGreaterThan(Math.abs(r1.at[0]))
    })
  })
})
