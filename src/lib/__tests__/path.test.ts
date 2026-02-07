import { expect, it, describe } from "vitest"
import { Path } from "../path"
import { Attributes } from "../attributes"

describe("Path", () => {
  describe("moveTo", () => {
    it("should add a move segment", () => {
      const path = new Path(Attributes.empty)
      path.moveTo([0.5, 0.5])
      expect(path.segments).toHaveLength(1)
      expect(path.segments[0]).toEqual({ kind: "move", to: [0.5, 0.5] })
    })

    it("should be chainable", () => {
      const path = new Path(Attributes.empty)
      const result = path.moveTo([0, 0])
      expect(result).toBe(path)
    })
  })

  describe("lineTo", () => {
    it("should add a line segment", () => {
      const path = new Path(Attributes.empty)
      path.moveTo([0, 0]).lineTo([1, 1])
      expect(path.segments).toHaveLength(2)
      expect(path.segments[1]).toEqual({ kind: "line", to: [1, 1] })
    })

    it("should be chainable", () => {
      const path = new Path(Attributes.empty)
      const result = path.moveTo([0, 0]).lineTo([1, 1])
      expect(result).toBe(path)
    })
  })

  describe("curveTo", () => {
    it("should add a cubic curve segment with defaults", () => {
      const path = new Path(Attributes.empty)
      path.moveTo([0, 0]).curveTo([1, 1])
      expect(path.segments).toHaveLength(2)
      expect(path.segments[1]).toEqual({
        kind: "cubicCurve",
        to: [1, 1],
        config: {
          curveSize: 1,
          polarity: 1,
          bulbousness: 1,
          curveAngle: 0,
          twist: 0,
        },
      })
    })

    it("should add a cubic curve segment with custom config", () => {
      const path = new Path(Attributes.empty)
      path.moveTo([0, 0]).curveTo([1, 1], {
        curveSize: 0.5,
        polarity: -1,
        bulbousness: 0.8,
        curveAngle: Math.PI / 4,
        twist: 0.1,
      })
      expect(path.segments[1]).toEqual({
        kind: "cubicCurve",
        to: [1, 1],
        config: {
          curveSize: 0.5,
          polarity: -1,
          bulbousness: 0.8,
          curveAngle: Math.PI / 4,
          twist: 0.1,
        },
      })
    })
  })

  describe("arcTo", () => {
    it("should add an arc segment with default config", () => {
      const path = new Path(Attributes.empty)
      path.moveTo([0, 0]).arcTo([1, 1])
      expect(path.segments).toHaveLength(2)
      expect(path.segments[1]).toMatchObject({
        kind: "arc",
        to: [1, 1],
        config: {
          rX: 1,
          rY: 1,
          largeArc: false,
          xAxisRotation: 0,
        },
      })
    })

    it("should add an arc segment with custom config", () => {
      const path = new Path(Attributes.empty)
      path.moveTo([0, 0]).arcTo([1, 1], {
        rX: 0.5,
        rY: 0.5,
        largeArc: true,
        xAxisRotation: 45,
      })
      expect(path.segments[1]).toMatchObject({
        kind: "arc",
        to: [1, 1],
        config: {
          rX: 0.5,
          rY: 0.5,
          largeArc: true,
          xAxisRotation: 45,
        },
      })
    })
  })

  describe("rect", () => {
    it("should add a rectangle with center alignment", () => {
      const path = new Path(Attributes.empty)
      path.rect([0.5, 0.5], 0.2, 0.4)
      expect(path.segments).toHaveLength(5)
      expect(path.segments[0].kind).toBe("move")
      expect((path.segments[0] as any).to[0]).toBeCloseTo(0.4, 10)
      expect((path.segments[0] as any).to[1]).toBeCloseTo(0.3, 10)
      expect(path.segments[1].kind).toBe("line")
      expect((path.segments[1] as any).to[0]).toBeCloseTo(0.6, 10)
      expect((path.segments[1] as any).to[1]).toBeCloseTo(0.3, 10)
      expect((path.segments[2] as any).to[0]).toBeCloseTo(0.6, 10)
      expect((path.segments[2] as any).to[1]).toBeCloseTo(0.7, 10)
      expect((path.segments[3] as any).to[0]).toBeCloseTo(0.4, 10)
      expect((path.segments[3] as any).to[1]).toBeCloseTo(0.7, 10)
      expect((path.segments[4] as any).to[0]).toBeCloseTo(0.4, 10)
      expect((path.segments[4] as any).to[1]).toBeCloseTo(0.3, 10)
    })

    it("should add a rectangle with topLeft alignment", () => {
      const path = new Path(Attributes.empty)
      path.rect([0.1, 0.1], 0.2, 0.3, "topLeft")
      expect(path.segments).toHaveLength(5)
      expect(path.segments[0].kind).toBe("move")
      expect((path.segments[0] as any).to[0]).toBeCloseTo(0.1, 10)
      expect((path.segments[0] as any).to[1]).toBeCloseTo(0.1, 10)
      expect((path.segments[1] as any).to[0]).toBeCloseTo(0.3, 10)
      expect((path.segments[1] as any).to[1]).toBeCloseTo(0.1, 10)
      expect((path.segments[2] as any).to[0]).toBeCloseTo(0.3, 10)
      expect((path.segments[2] as any).to[1]).toBeCloseTo(0.4, 10)
      expect((path.segments[3] as any).to[0]).toBeCloseTo(0.1, 10)
      expect((path.segments[3] as any).to[1]).toBeCloseTo(0.4, 10)
      expect((path.segments[4] as any).to[0]).toBeCloseTo(0.1, 10)
      expect((path.segments[4] as any).to[1]).toBeCloseTo(0.1, 10)
    })
  })

  describe("regularPolygon", () => {
    it("should create a triangle (n=3)", () => {
      const path = new Path(Attributes.empty)
      path.regularPolygon([0.5, 0.5], 3, 0.1)
      expect(path.segments).toHaveLength(4) // move + 3 lines
      expect(path.segments[0].kind).toBe("move")
      expect(path.segments[1].kind).toBe("line")
      expect(path.segments[2].kind).toBe("line")
      expect(path.segments[3].kind).toBe("line")
    })

    it("should create a square (n=4)", () => {
      const path = new Path(Attributes.empty)
      path.regularPolygon([0.5, 0.5], 4, 0.1)
      expect(path.segments).toHaveLength(5) // move + 4 lines
    })

    it("should create a hexagon (n=6)", () => {
      const path = new Path(Attributes.empty)
      path.regularPolygon([0.5, 0.5], 6, 0.1)
      expect(path.segments).toHaveLength(7) // move + 6 lines
    })

    it("should apply rotation", () => {
      const path1 = new Path(Attributes.empty)
      const path2 = new Path(Attributes.empty)
      path1.regularPolygon([0.5, 0.5], 4, 0.1, 0)
      path2.regularPolygon([0.5, 0.5], 4, 0.1, Math.PI / 4)
      // Starting points should be different due to rotation
      expect(path1.segments[0]).not.toEqual(path2.segments[0])
    })

    it("should handle topLeft alignment", () => {
      const path = new Path(Attributes.empty)
      path.regularPolygon([0, 0], 4, 0.1, 0, "topLeft")
      // Center should be offset by radius
      const moveSegment = path.segments[0] as {
        kind: "move"
        to: [number, number]
      }
      expect(moveSegment.to[0]).toBeCloseTo(0.2, 5) // 0 + 0.1 + 0.1 * cos(0) = 0.2
    })
  })

  describe("ellipse", () => {
    it("should create an ellipse with center alignment", () => {
      const path = new Path(Attributes.empty)
      path.ellipse([0.5, 0.5], 0.2, 0.4)
      // Should have move + 4 arcs
      expect(path.segments[0].kind).toBe("move")
      expect(path.segments.filter((s) => s.kind === "arc")).toHaveLength(4)
    })

    it("should create an ellipse with topLeft alignment", () => {
      const path = new Path(Attributes.empty)
      path.ellipse([0, 0], 0.2, 0.4, "topLeft")
      // Starting position should be top center of ellipse
      const moveSegment = path.segments[0] as {
        kind: "move"
        to: [number, number]
      }
      expect(moveSegment.to[0]).toBeCloseTo(0.1, 5) // at[0] + width/2
      expect(moveSegment.to[1]).toBeCloseTo(0, 5) // at[1]
    })
  })

  describe("close", () => {
    it("should add a close segment", () => {
      const path = new Path(Attributes.empty)
      path.moveTo([0, 0]).lineTo([1, 0]).lineTo([1, 1]).close()
      expect(path.segments[path.segments.length - 1]).toEqual({ kind: "close" })
    })
  })

  describe("chaikin", () => {
    it("should smooth a path with default iterations", () => {
      const path = new Path(Attributes.empty)
      path.moveTo([0, 0]).lineTo([0.5, 0]).lineTo([0.5, 0.5]).lineTo([1, 0.5])
      const originalLength = path.segments.length
      path.chaikin()
      // Chaikin should increase the number of segments
      expect(path.segments.length).toBeGreaterThan(originalLength)
    })

    it("should smooth a path with custom iterations", () => {
      const path = new Path(Attributes.empty)
      path.moveTo([0, 0]).lineTo([0.5, 0]).lineTo([0.5, 0.5]).lineTo([1, 0.5])
      path.chaikin(1)
      const path2 = new Path(Attributes.empty)
      path2.moveTo([0, 0]).lineTo([0.5, 0]).lineTo([0.5, 0.5]).lineTo([1, 0.5])
      path2.chaikin(3)
      // More iterations should produce more segments
      expect(path2.segments.length).toBeGreaterThan(path.segments.length)
    })
  })

  describe("map", () => {
    it("should transform all segments", () => {
      const path = new Path(Attributes.empty)
      path.moveTo([0, 0]).lineTo([1, 1])
      path.map((segment) => {
        if ("to" in segment) {
          return {
            ...segment,
            to: [segment.to[0] * 2, segment.to[1] * 2] as [number, number],
          }
        }
        return segment
      })
      expect((path.segments[0] as any).to).toEqual([0, 0])
      expect((path.segments[1] as any).to).toEqual([2, 2])
    })
  })

  describe("clone", () => {
    it("should create a deep copy of the path", () => {
      const path = new Path(Attributes.stroked)
      path.moveTo([0, 0]).lineTo([1, 1])
      const cloned = path.clone()
      expect(cloned.segments).toEqual(path.segments)
      expect(cloned.segments).not.toBe(path.segments)
    })

    it("should use new attributes if provided", () => {
      const path = new Path(Attributes.stroked)
      path.moveTo([0, 0])
      const newAttrs = new Attributes().fill(120, 50, 50)
      const cloned = path.clone(newAttrs)
      expect(cloned.attributes).toBe(newAttrs)
    })
  })

  describe("string", () => {
    it("should throw if path is empty", () => {
      const path = new Path(Attributes.empty)
      expect(() => path.string(0)).toThrow("Must add to path")
    })

    it("should throw if path doesn't start with moveTo", () => {
      const path = new Path(Attributes.empty)
      path.segments.push({ kind: "line", to: [1, 1] })
      expect(() => path.string(0)).toThrow(
        "Must start path with move to initial position",
      )
    })

    it("should generate correct SVG path string", () => {
      const path = new Path(Attributes.empty)
      path.moveTo([0, 0]).lineTo([1, 0]).lineTo([1, 1]).close()
      expect(path.string(0)).toMatchInlineSnapshot(
        `"<path d="M 0 0 L 1 0 L 1 1 Z" />"`,
      )
    })

    it("should include attributes in output", () => {
      const path = new Path(new Attributes().stroke(0, 0, 0))
      path.moveTo([0, 0]).lineTo([1, 1])
      expect(path.string(0)).toMatch(/style=/)
      expect(path.string(0)).toMatch(/stroke/)
    })

    it("should apply correct indentation", () => {
      const path = new Path(Attributes.empty)
      path.moveTo([0, 0]).lineTo([1, 1])
      expect(path.string(2)).toMatch(/^    /)
    })
  })

  describe("configureAttributes", () => {
    it("should allow modifying attributes through a callback", () => {
      const path = new Path(new Attributes())
      path.moveTo([0, 0])
      path.configureAttributes((attrs) => {
        attrs.stroke(180, 50, 50)
      })
      expect(path.string(0)).toMatch(/stroke/)
    })
  })
})
