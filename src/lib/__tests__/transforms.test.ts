import { expect, it, describe } from "vitest"
import { Transform } from "../transforms"

describe("Transform", () => {
  describe("translate", () => {
    it("should translate with Point2D", () => {
      const t = new Transform()
      t.translate([10, 20])
      expect(t.string).toBe("translate(10, 20)")
    })

    it("should translate with x, y parameters", () => {
      const t = new Transform()
      t.translate(5, 15)
      expect(t.string).toBe("translate(5, 15)")
    })

    it("should be chainable", () => {
      const t = new Transform()
      const result = t.translate([0, 0])
      expect(result).toBe(t)
    })
  })

  describe("scale", () => {
    it("should scale with Point2D", () => {
      const t = new Transform()
      t.scale([2, 3])
      expect(t.string).toBe("scale(2, 3)")
    })

    it("should scale uniformly with single value", () => {
      const t = new Transform()
      t.scale(2)
      expect(t.string).toBe("scale(2, 2)")
    })

    it("should scale with x, y parameters", () => {
      const t = new Transform()
      t.scale(2, 3)
      expect(t.string).toBe("scale(2, 3)")
    })

    it("should be chainable", () => {
      const t = new Transform()
      const result = t.scale(1)
      expect(result).toBe(t)
    })
  })

  describe("rotate", () => {
    it("should rotate by angle in radians (converted to degrees)", () => {
      const t = new Transform()
      t.rotate(Math.PI) // 180 degrees
      expect(t.string).toBe("rotate(180)")
    })

    it("should rotate with rotation center", () => {
      const t = new Transform()
      t.rotate(Math.PI / 2, 0.5, 0.5) // 90 degrees around center
      expect(t.string).toBe("rotate(90, 0.5, 0.5)")
    })

    it("should handle zero rotation", () => {
      const t = new Transform()
      t.rotate(0)
      expect(t.string).toBe("rotate(0)")
    })

    it("should be chainable", () => {
      const t = new Transform()
      const result = t.rotate(0)
      expect(result).toBe(t)
    })
  })

  describe("skewX", () => {
    it("should skew along X axis", () => {
      const t = new Transform()
      t.skewX(30)
      expect(t.string).toBe("skewX(30)")
    })

    it("should be chainable", () => {
      const t = new Transform()
      const result = t.skewX(0)
      expect(result).toBe(t)
    })
  })

  describe("skewY", () => {
    it("should skew along Y axis", () => {
      const t = new Transform()
      t.skewY(45)
      expect(t.string).toBe("skewY(45)")
    })

    it("should be chainable", () => {
      const t = new Transform()
      const result = t.skewY(0)
      expect(result).toBe(t)
    })
  })

  describe("string getter", () => {
    it("should return empty string for no transforms", () => {
      const t = new Transform()
      expect(t.string).toBe("")
    })

    it("should combine multiple transforms with space", () => {
      const t = new Transform()
      t.translate([10, 20])
        .scale(2)
        .rotate(Math.PI / 4)
      expect(t.string).toBe("translate(10, 20) scale(2, 2) rotate(45)")
    })
  })

  describe("Transform.of (static factory)", () => {
    it("should create transform with translate", () => {
      const t = Transform.of({ translate: [10, 20] })
      expect(t.string).toBe("translate(10, 20)")
    })

    it("should create transform with uniform scale", () => {
      const t = Transform.of({ scale: 2 })
      expect(t.string).toBe("scale(2, 2)")
    })

    it("should create transform with non-uniform scale", () => {
      const t = Transform.of({ scale: [2, 3] })
      expect(t.string).toBe("scale(2, 3)")
    })

    it("should create transform with simple rotate", () => {
      const t = Transform.of({ rotate: Math.PI })
      expect(t.string).toBe("rotate(180)")
    })

    it("should create transform with rotate around center", () => {
      const t = Transform.of({ rotate: [Math.PI / 2, [0.5, 0.5]] })
      expect(t.string).toBe("rotate(90, 0.5, 0.5)")
    })

    it("should create transform with skewX", () => {
      const t = Transform.of({ skewX: 30 })
      expect(t.string).toBe("skewX(30)")
    })

    it("should create transform with skewY", () => {
      const t = Transform.of({ skewY: 45 })
      expect(t.string).toBe("skewY(45)")
    })

    it("should combine multiple transforms", () => {
      const t = Transform.of({
        translate: [10, 20],
        scale: 2,
        rotate: Math.PI / 4,
        skewX: 10,
        skewY: 5,
      })
      expect(t.string).toBe(
        "translate(10, 20) scale(2, 2) rotate(45) skewX(10) skewY(5)",
      )
    })

    it("should return empty transform if no options provided", () => {
      const t = Transform.of({})
      expect(t.string).toBe("")
    })
  })
})
