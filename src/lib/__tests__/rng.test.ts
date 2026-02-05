import { expect, it, describe } from "vitest"
import { RNG } from "../rng"

describe("RNG (PCG Random Number Generator)", () => {
  describe("constructor", () => {
    it("should create RNG with no seed (random)", () => {
      const rng = new RNG()
      expect(rng).toBeInstanceOf(RNG)
    })

    it("should create RNG with single seed", () => {
      const rng = new RNG(12345)
      expect(rng).toBeInstanceOf(RNG)
    })

    it("should create RNG with full 64-bit seed", () => {
      const rng = new RNG(0x12345678, 0x87654321)
      expect(rng).toBeInstanceOf(RNG)
    })
  })

  describe("determinism with seed", () => {
    it("should produce same sequence with same seed", () => {
      const rng1 = new RNG(42)
      const rng2 = new RNG(42)

      const seq1 = [rng1.next(), rng1.next(), rng1.next()]
      const seq2 = [rng2.next(), rng2.next(), rng2.next()]

      expect(seq1).toEqual(seq2)
    })

    it("should produce different sequences with different seeds", () => {
      const rng1 = new RNG(42)
      const rng2 = new RNG(43)

      const seq1 = [rng1.next(), rng1.next(), rng1.next()]
      const seq2 = [rng2.next(), rng2.next(), rng2.next()]

      expect(seq1).not.toEqual(seq2)
    })
  })

  describe("next", () => {
    it("should return 32-bit unsigned integers", () => {
      const rng = new RNG(42)
      for (let i = 0; i < 100; i++) {
        const n = rng.next()
        expect(n).toBeGreaterThanOrEqual(0)
        expect(n).toBeLessThanOrEqual(0xffffffff)
        expect(Number.isInteger(n)).toBe(true)
      }
    })

    it("should produce varying values", () => {
      const rng = new RNG(42)
      const values = new Set<number>()
      for (let i = 0; i < 100; i++) {
        values.add(rng.next())
      }
      // Should have many unique values
      expect(values.size).toBeGreaterThan(90)
    })
  })

  describe("integer", () => {
    it("should return values in range [0, max)", () => {
      const rng = new RNG(42)
      const max = 10
      for (let i = 0; i < 100; i++) {
        const n = rng.integer(max)
        expect(n).toBeGreaterThanOrEqual(0)
        expect(n).toBeLessThan(max)
        expect(Number.isInteger(n)).toBe(true)
      }
    })

    it("should work with power of 2", () => {
      const rng = new RNG(42)
      const max = 8 // power of 2
      for (let i = 0; i < 100; i++) {
        const n = rng.integer(max)
        expect(n).toBeGreaterThanOrEqual(0)
        expect(n).toBeLessThan(max)
      }
    })

    it("should work with non-power of 2", () => {
      const rng = new RNG(42)
      const max = 7 // non-power of 2
      for (let i = 0; i < 100; i++) {
        const n = rng.integer(max)
        expect(n).toBeGreaterThanOrEqual(0)
        expect(n).toBeLessThan(max)
      }
    })

    it("should return raw next() when max is 0 or falsy", () => {
      const rng = new RNG(42)
      const n = rng.integer(0)
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThanOrEqual(0xffffffff)
    })

    it("should produce uniform distribution", () => {
      const rng = new RNG(42)
      const max = 5
      const counts = [0, 0, 0, 0, 0]
      const samples = 10000

      for (let i = 0; i < samples; i++) {
        counts[rng.integer(max)]++
      }

      // Each bucket should be roughly 20% of samples
      const expected = samples / max
      for (const count of counts) {
        expect(count).toBeGreaterThan(expected * 0.8)
        expect(count).toBeLessThan(expected * 1.2)
      }
    })
  })

  describe("number", () => {
    it("should return values in range [0, 1)", () => {
      const rng = new RNG(42)
      for (let i = 0; i < 100; i++) {
        const n = rng.number()
        expect(n).toBeGreaterThanOrEqual(0)
        expect(n).toBeLessThan(1)
      }
    })

    it("should produce uniform distribution", () => {
      const rng = new RNG(42)
      const buckets = 10
      const counts = Array(buckets).fill(0)
      const samples = 10000

      for (let i = 0; i < samples; i++) {
        const bucket = Math.floor(rng.number() * buckets)
        counts[bucket]++
      }

      const expected = samples / buckets
      for (const count of counts) {
        expect(count).toBeGreaterThan(expected * 0.8)
        expect(count).toBeLessThan(expected * 1.2)
      }
    })

    it("should produce varying values", () => {
      const rng = new RNG(42)
      const values = new Set<number>()
      for (let i = 0; i < 100; i++) {
        values.add(rng.number())
      }
      // Should have all unique values
      expect(values.size).toBe(100)
    })
  })

  describe("getState / setState", () => {
    it("should save and restore state", () => {
      const rng = new RNG(42)

      // Advance state
      rng.next()
      rng.next()

      // Save state
      const state = rng.getState()

      // Generate some numbers
      const n1 = rng.next()
      const n2 = rng.next()

      // Restore state
      rng.setState(state)

      // Should get same numbers
      expect(rng.next()).toBe(n1)
      expect(rng.next()).toBe(n2)
    })

    it("should return a tuple of 4 numbers", () => {
      const rng = new RNG(42)
      const state = rng.getState()
      expect(state).toHaveLength(4)
      expect(typeof state[0]).toBe("number")
      expect(typeof state[1]).toBe("number")
      expect(typeof state[2]).toBe("number")
      expect(typeof state[3]).toBe("number")
    })

    it("should allow cloning RNG state to another instance", () => {
      const rng1 = new RNG(42)
      rng1.next()
      rng1.next()

      const rng2 = new RNG(0)
      rng2.setState(rng1.getState())

      // Both should produce same sequence now
      expect(rng1.next()).toBe(rng2.next())
      expect(rng1.next()).toBe(rng2.next())
    })
  })
})
