import { expect, it, describe } from "vitest"
import { pairWise, tripleWise, zip2, sum, arrayOf } from "../util/collectionOps"

describe("Collection operations", () => {
  describe("pairWise", () => {
    it("should return consecutive pairs", () => {
      expect(pairWise([1, 2, 3, 4])).toEqual([
        [1, 2],
        [2, 3],
        [3, 4],
      ])
    })

    it("should return empty array for single item", () => {
      expect(pairWise([1])).toEqual([])
    })

    it("should return empty array for empty input", () => {
      expect(pairWise([])).toEqual([])
    })

    it("should return single pair for two items", () => {
      expect(pairWise([1, 2])).toEqual([[1, 2]])
    })

    it("should work with strings", () => {
      expect(pairWise(["a", "b", "c"])).toEqual([
        ["a", "b"],
        ["b", "c"],
      ])
    })

    it("should work with objects", () => {
      const a = { x: 1 }
      const b = { x: 2 }
      const c = { x: 3 }
      expect(pairWise([a, b, c])).toEqual([
        [a, b],
        [b, c],
      ])
    })
  })

  describe("tripleWise", () => {
    it("should return consecutive triples", () => {
      expect(tripleWise([1, 2, 3, 4, 5])).toEqual([
        [1, 2, 3],
        [2, 3, 4],
        [3, 4, 5],
      ])
    })

    it("should return empty array for less than 3 items", () => {
      expect(tripleWise([1, 2])).toEqual([])
      expect(tripleWise([1])).toEqual([])
      expect(tripleWise([])).toEqual([])
    })

    it("should return single triple for exactly 3 items", () => {
      expect(tripleWise([1, 2, 3])).toEqual([[1, 2, 3]])
    })

    it("should handle looped mode", () => {
      // In looped mode, it wraps around the array
      const result = tripleWise([1, 2, 3, 4], true)
      // Should include wrap-around triples
      expect(result.length).toBeGreaterThan(2)
      expect(result[0]).toEqual([3, 1, 2]) // Wrap from end
    })

    it("should work with strings", () => {
      expect(tripleWise(["a", "b", "c", "d"])).toEqual([
        ["a", "b", "c"],
        ["b", "c", "d"],
      ])
    })
  })

  describe("zip2", () => {
    it("should combine two arrays of equal length", () => {
      expect(zip2([1, 2, 3], ["a", "b", "c"])).toEqual([
        [1, "a"],
        [2, "b"],
        [3, "c"],
      ])
    })

    it("should stop at shorter array (first shorter)", () => {
      expect(zip2([1, 2], ["a", "b", "c"])).toEqual([
        [1, "a"],
        [2, "b"],
      ])
    })

    it("should stop at shorter array (second shorter)", () => {
      expect(zip2([1, 2, 3], ["a", "b"])).toEqual([
        [1, "a"],
        [2, "b"],
      ])
    })

    it("should return empty array if first array is empty", () => {
      expect(zip2([], ["a", "b"])).toEqual([])
    })

    it("should return empty array if second array is empty", () => {
      expect(zip2([1, 2], [])).toEqual([])
    })

    it("should work with same types", () => {
      expect(zip2([1, 2, 3], [4, 5, 6])).toEqual([
        [1, 4],
        [2, 5],
        [3, 6],
      ])
    })
  })

  describe("sum", () => {
    it("should sum an array of numbers", () => {
      expect(sum([1, 2, 3, 4])).toBe(10)
    })

    it("should return 0 for empty array", () => {
      expect(sum([])).toBe(0)
    })

    it("should handle single element", () => {
      expect(sum([5])).toBe(5)
    })

    it("should handle negative numbers", () => {
      expect(sum([1, -2, 3, -4])).toBe(-2)
    })

    it("should handle decimal numbers", () => {
      expect(sum([0.1, 0.2, 0.3])).toBeCloseTo(0.6, 10)
    })
  })

  describe("arrayOf", () => {
    it("should create array of specified length", () => {
      const result = arrayOf(5, () => 0)
      expect(result).toHaveLength(5)
    })

    it("should call init function for each element", () => {
      let count = 0
      arrayOf(3, () => {
        count++
        return count
      })
      expect(count).toBe(3)
    })

    it("should use init function result as elements", () => {
      let i = 0
      const result = arrayOf(3, () => i++)
      expect(result).toEqual([0, 1, 2])
    })

    it("should return empty array for n=0", () => {
      expect(arrayOf(0, () => 1)).toEqual([])
    })

    it("should work with object init function", () => {
      const result = arrayOf(2, () => ({ value: Math.random() }))
      expect(result).toHaveLength(2)
      expect(result[0]).not.toBe(result[1]) // Different objects
    })
  })
})
