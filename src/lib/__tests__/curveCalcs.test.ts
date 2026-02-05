import { expect, it, describe } from "vitest"
import { convertToSVGCubicSpec } from "../util/curveCalcs"

describe("Curve calculations", () => {
  describe("convertToSVGCubicSpec", () => {
    it("should generate SVG cubic bezier command", () => {
      const result = convertToSVGCubicSpec({
        from: [0, 0],
        to: [1, 0],
        curveSize: 1,
        curveAngle: 0,
        bulbousness: 1,
        polarity: 1,
        twist: 0,
      })
      expect(result).toMatch(/^C /)
      expect(result).toMatch(/1 0$/) // ends with "to" point
    })

    it("should include control points and end point", () => {
      const result = convertToSVGCubicSpec({
        from: [0, 0],
        to: [2, 0],
        curveSize: 1,
        curveAngle: 0,
        bulbousness: 1,
        polarity: 1,
        twist: 0,
      })
      // Format: C control1x control1y, control2x control2y, endx endy
      const parts = result.split(/[,\s]+/)
      expect(parts).toHaveLength(7) // C x1 y1 x2 y2 ex ey
      expect(parts[0]).toBe("C")
    })

    it("should vary with curveSize", () => {
      const small = convertToSVGCubicSpec({
        from: [0, 0],
        to: [1, 0],
        curveSize: 0.5,
        curveAngle: 0,
        bulbousness: 1,
        polarity: 1,
        twist: 0,
      })
      const large = convertToSVGCubicSpec({
        from: [0, 0],
        to: [1, 0],
        curveSize: 2,
        curveAngle: 0,
        bulbousness: 1,
        polarity: 1,
        twist: 0,
      })
      expect(small).not.toBe(large)
    })

    it("should vary with polarity", () => {
      const positive = convertToSVGCubicSpec({
        from: [0, 0],
        to: [1, 0],
        curveSize: 1,
        curveAngle: 0,
        bulbousness: 1,
        polarity: 1,
        twist: 0,
      })
      const negative = convertToSVGCubicSpec({
        from: [0, 0],
        to: [1, 0],
        curveSize: 1,
        curveAngle: 0,
        bulbousness: 1,
        polarity: -1,
        twist: 0,
      })
      expect(positive).not.toBe(negative)
    })

    it("should vary with bulbousness", () => {
      const flat = convertToSVGCubicSpec({
        from: [0, 0],
        to: [1, 0],
        curveSize: 1,
        curveAngle: 0,
        bulbousness: 0.5,
        polarity: 1,
        twist: 0,
      })
      const bulbous = convertToSVGCubicSpec({
        from: [0, 0],
        to: [1, 0],
        curveSize: 1,
        curveAngle: 0,
        bulbousness: 2,
        polarity: 1,
        twist: 0,
      })
      expect(flat).not.toBe(bulbous)
    })

    it("should vary with curveAngle", () => {
      const angle0 = convertToSVGCubicSpec({
        from: [0, 0],
        to: [1, 0],
        curveSize: 1,
        curveAngle: 0,
        bulbousness: 1,
        polarity: 1,
        twist: 0,
      })
      const angle45 = convertToSVGCubicSpec({
        from: [0, 0],
        to: [1, 0],
        curveSize: 1,
        curveAngle: Math.PI / 4,
        bulbousness: 1,
        polarity: 1,
        twist: 0,
      })
      expect(angle0).not.toBe(angle45)
    })

    it("should vary with twist", () => {
      const noTwist = convertToSVGCubicSpec({
        from: [0, 0],
        to: [1, 0],
        curveSize: 1,
        curveAngle: 0,
        bulbousness: 1,
        polarity: 1,
        twist: 0,
      })
      const twisted = convertToSVGCubicSpec({
        from: [0, 0],
        to: [1, 0],
        curveSize: 1,
        curveAngle: 0,
        bulbousness: 1,
        polarity: 1,
        twist: 0.5,
      })
      expect(noTwist).not.toBe(twisted)
    })

    it("should handle vertical line", () => {
      const result = convertToSVGCubicSpec({
        from: [0, 0],
        to: [0, 1],
        curveSize: 1,
        curveAngle: 0,
        bulbousness: 1,
        polarity: 1,
        twist: 0,
      })
      expect(result).toMatch(/^C /)
      expect(result).toMatch(/0 1$/)
    })

    it("should handle diagonal line", () => {
      const result = convertToSVGCubicSpec({
        from: [0, 0],
        to: [1, 1],
        curveSize: 1,
        curveAngle: 0,
        bulbousness: 1,
        polarity: 1,
        twist: 0,
      })
      expect(result).toMatch(/^C /)
      expect(result).toMatch(/1 1$/)
    })

    it("should handle negative coordinates", () => {
      const result = convertToSVGCubicSpec({
        from: [-1, -1],
        to: [1, 1],
        curveSize: 1,
        curveAngle: 0,
        bulbousness: 1,
        polarity: 1,
        twist: 0,
      })
      expect(result).toMatch(/^C /)
      expect(result).toMatch(/1 1$/)
    })
  })
})
