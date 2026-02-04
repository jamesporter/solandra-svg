import { expect, it, describe } from "vitest"
import {
  add,
  subtract,
  magnitude,
  distance,
  rotate,
  normalise,
  scale,
  polarToCartesian,
  pointAlong,
  dot,
} from "../util/vectors"

describe("Vector operations", () => {
  describe("add", () => {
    it("should add two vectors", () => {
      expect(add([1, 2], [3, 4])).toEqual([4, 6])
    })

    it("should handle zero vectors", () => {
      expect(add([0, 0], [5, 5])).toEqual([5, 5])
      expect(add([5, 5], [0, 0])).toEqual([5, 5])
    })

    it("should handle negative values", () => {
      expect(add([1, 2], [-3, -4])).toEqual([-2, -2])
    })
  })

  describe("subtract", () => {
    it("should subtract two vectors", () => {
      expect(subtract([5, 7], [2, 3])).toEqual([3, 4])
    })

    it("should handle zero vectors", () => {
      expect(subtract([5, 5], [0, 0])).toEqual([5, 5])
    })

    it("should handle negative results", () => {
      expect(subtract([1, 1], [3, 5])).toEqual([-2, -4])
    })
  })

  describe("magnitude", () => {
    it("should calculate magnitude of a vector", () => {
      expect(magnitude([3, 4])).toBe(5)
    })

    it("should handle zero vector", () => {
      expect(magnitude([0, 0])).toBe(0)
    })

    it("should handle unit vectors", () => {
      expect(magnitude([1, 0])).toBe(1)
      expect(magnitude([0, 1])).toBe(1)
    })

    it("should handle negative values", () => {
      expect(magnitude([-3, -4])).toBe(5)
    })
  })

  describe("distance", () => {
    it("should calculate distance between two points", () => {
      expect(distance([0, 0], [3, 4])).toBe(5)
    })

    it("should return zero for same points", () => {
      expect(distance([2, 3], [2, 3])).toBe(0)
    })

    it("should be commutative", () => {
      expect(distance([1, 2], [4, 6])).toBe(distance([4, 6], [1, 2]))
    })
  })

  describe("rotate", () => {
    it("should rotate a vector by 90 degrees", () => {
      const result = rotate([1, 0], Math.PI / 2)
      expect(result[0]).toBeCloseTo(0, 10)
      expect(result[1]).toBeCloseTo(1, 10)
    })

    it("should rotate a vector by 180 degrees", () => {
      const result = rotate([1, 0], Math.PI)
      expect(result[0]).toBeCloseTo(-1, 10)
      expect(result[1]).toBeCloseTo(0, 10)
    })

    it("should rotate a vector by -90 degrees", () => {
      const result = rotate([1, 0], -Math.PI / 2)
      expect(result[0]).toBeCloseTo(0, 10)
      expect(result[1]).toBeCloseTo(-1, 10)
    })

    it("should handle zero angle", () => {
      const result = rotate([5, 3], 0)
      expect(result[0]).toBeCloseTo(5, 10)
      expect(result[1]).toBeCloseTo(3, 10)
    })
  })

  describe("normalise", () => {
    it("should normalise a vector to unit length", () => {
      const result = normalise([3, 4])
      expect(result[0]).toBeCloseTo(0.6, 10)
      expect(result[1]).toBeCloseTo(0.8, 10)
      expect(magnitude(result)).toBeCloseTo(1, 10)
    })

    it("should handle already normalised vectors", () => {
      const result = normalise([1, 0])
      expect(result[0]).toBeCloseTo(1, 10)
      expect(result[1]).toBeCloseTo(0, 10)
    })
  })

  describe("scale", () => {
    it("should scale a vector by a factor", () => {
      expect(scale([2, 3], 2)).toEqual([4, 6])
    })

    it("should handle zero scale", () => {
      expect(scale([5, 10], 0)).toEqual([0, 0])
    })

    it("should handle negative scale", () => {
      expect(scale([2, 3], -1)).toEqual([-2, -3])
    })

    it("should handle scale of 1", () => {
      expect(scale([7, 8], 1)).toEqual([7, 8])
    })
  })

  describe("polarToCartesian", () => {
    it("should convert polar to cartesian at angle 0", () => {
      const result = polarToCartesian([0, 0], 1, 0)
      expect(result[0]).toBeCloseTo(1, 10)
      expect(result[1]).toBeCloseTo(0, 10)
    })

    it("should convert polar to cartesian at 90 degrees", () => {
      const result = polarToCartesian([0, 0], 1, Math.PI / 2)
      expect(result[0]).toBeCloseTo(0, 10)
      expect(result[1]).toBeCloseTo(1, 10)
    })

    it("should handle offset center", () => {
      const result = polarToCartesian([5, 5], 1, 0)
      expect(result[0]).toBeCloseTo(6, 10)
      expect(result[1]).toBeCloseTo(5, 10)
    })

    it("should handle different radii", () => {
      const result = polarToCartesian([0, 0], 2.5, 0)
      expect(result[0]).toBeCloseTo(2.5, 10)
      expect(result[1]).toBeCloseTo(0, 10)
    })
  })

  describe("pointAlong", () => {
    it("should find midpoint by default", () => {
      const result = pointAlong([0, 0], [10, 10])
      expect(result).toEqual([5, 5])
    })

    it("should find point at proportion 0", () => {
      const result = pointAlong([0, 0], [10, 10], 0)
      expect(result).toEqual([0, 0])
    })

    it("should find point at proportion 1", () => {
      const result = pointAlong([0, 0], [10, 10], 1)
      expect(result).toEqual([10, 10])
    })

    it("should find point at proportion 0.25", () => {
      const result = pointAlong([0, 0], [8, 4], 0.25)
      expect(result).toEqual([2, 1])
    })

    it("should handle extrapolation beyond 1", () => {
      const result = pointAlong([0, 0], [10, 10], 2)
      expect(result).toEqual([20, 20])
    })
  })

  describe("dot", () => {
    it("should calculate dot product of two vectors", () => {
      expect(dot([1, 2], [3, 4])).toBe(11) // 1*3 + 2*4
    })

    it("should return zero for perpendicular vectors", () => {
      expect(dot([1, 0], [0, 1])).toBe(0)
    })

    it("should handle zero vectors", () => {
      expect(dot([0, 0], [5, 5])).toBe(0)
    })

    it("should handle parallel vectors", () => {
      expect(dot([2, 0], [3, 0])).toBe(6)
    })

    it("should be commutative", () => {
      expect(dot([1, 2], [3, 4])).toBe(dot([3, 4], [1, 2]))
    })
  })
})
