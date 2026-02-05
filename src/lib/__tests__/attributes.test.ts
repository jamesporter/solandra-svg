import { expect, it, describe } from "vitest"

import { Attributes } from "../attributes"
import { Transform } from "../transforms"

describe("Attributes", () => {
  describe("string conversion", () => {
    it("should be able to convert to string", () => {
      expect(Attributes.stroked.lineCap("butt").string).toMatchInlineSnapshot(
        `" style="fill:none; stroke-width:0.005; stroke:#000000; stroke-linecap:butt;""`
      )
    })

    it("should not have unnecessary white space if one type present only", () => {
      expect(Attributes.stroked.string).toMatchInlineSnapshot(
        `" style="fill:none; stroke-width:0.005; stroke:#000000;""`
      )

      expect(new Attributes().class("test").string).toMatchInlineSnapshot(
        `" class="test""`
      )
    })

    it("should convert to empty string if empty", () => {
      expect(Attributes.empty.string).toBe("")
    })
  })

  describe("opacity", () => {
    it("should set opacity", () => {
      const attr = new Attributes().opacity(0.5)
      expect(attr.string).toMatch(/opacity:0\.5/)
    })
  })

  describe("fill", () => {
    it("should set fill color with HSL values", () => {
      const attr = new Attributes().fill(0, 100, 50) // Red
      expect(attr.string).toMatch(/fill:#FF0000/)
    })

    it("should set fill color with opacity", () => {
      const attr = new Attributes().fill(120, 100, 50, 0.5) // Green with opacity
      expect(attr.string).toMatch(/fill:#00FF00/)
      expect(attr.string).toMatch(/fill-opacity:0\.5/)
    })

    it("should convert HSL degrees to 0-1 range", () => {
      const attr = new Attributes().fill(240, 100, 50) // Blue (240/360 = 0.667)
      expect(attr.string).toMatch(/fill:#0000FF/)
    })
  })

  describe("noFill", () => {
    it("should set fill to none", () => {
      const attr = new Attributes().noFill()
      expect(attr.string).toMatch(/fill:none/)
    })
  })

  describe("fillOpacity", () => {
    it("should set fill opacity", () => {
      const attr = new Attributes().fillOpacity(0.7)
      expect(attr.string).toMatch(/fill-opacity:0\.7/)
    })
  })

  describe("fillOklch", () => {
    it("should set fill with OkLCH color", () => {
      const attr = new Attributes().fillOklch(0.7, 0.15, 180, 1)
      expect(attr.string).toMatch(/oklch\(0\.7 0\.15 180 \/ 100%\)/)
    })
  })

  describe("stroke", () => {
    it("should set stroke color with HSL values", () => {
      const attr = new Attributes().stroke(0, 100, 50) // Red
      expect(attr.string).toMatch(/stroke:#FF0000/)
    })

    it("should set stroke color with alpha", () => {
      const attr = new Attributes().stroke(60, 100, 50, 0.8) // Yellow with opacity
      expect(attr.string).toMatch(/stroke:#FFFF00/)
      expect(attr.string).toMatch(/stroke-opacity:0\.8/)
    })
  })

  describe("strokeOklch", () => {
    it("should set stroke with OkLCH color", () => {
      const attr = new Attributes().strokeOklch(0.5, 0.2, 90, 0.9)
      expect(attr.string).toMatch(/stroke:oklch\(0\.5 0\.2 90\)/)
      expect(attr.string).toMatch(/stroke-opacity:0\.9/)
    })
  })

  describe("strokeOpacity", () => {
    it("should set stroke opacity", () => {
      const attr = new Attributes().strokeOpacity(0.3)
      expect(attr.string).toMatch(/stroke-opacity:0\.3/)
    })
  })

  describe("strokeWidth", () => {
    it("should set stroke width", () => {
      const attr = new Attributes().strokeWidth(0.01)
      expect(attr.string).toMatch(/stroke-width:0\.01/)
    })
  })

  describe("lineCap", () => {
    it("should set butt line cap", () => {
      const attr = new Attributes().lineCap("butt")
      expect(attr.string).toMatch(/stroke-linecap:butt/)
    })

    it("should set round line cap", () => {
      const attr = new Attributes().lineCap("round")
      expect(attr.string).toMatch(/stroke-linecap:round/)
    })

    it("should set square line cap", () => {
      const attr = new Attributes().lineCap("square")
      expect(attr.string).toMatch(/stroke-linecap:square/)
    })
  })

  describe("lineJoin", () => {
    it("should set miter line join", () => {
      const attr = new Attributes().lineJoin("miter")
      expect(attr.string).toMatch(/stroke-linejoin:miter/)
    })

    it("should set round line join", () => {
      const attr = new Attributes().lineJoin("round")
      expect(attr.string).toMatch(/stroke-linejoin:round/)
    })

    it("should set bevel line join", () => {
      const attr = new Attributes().lineJoin("bevel")
      expect(attr.string).toMatch(/stroke-linejoin:bevel/)
    })
  })

  describe("miterLimit", () => {
    it("should set miter limit", () => {
      const attr = new Attributes().miterLimit(4)
      expect(attr.string).toMatch(/stroke-miterlimit:4/)
    })
  })

  describe("dashArray", () => {
    it("should set dash array with single value", () => {
      const attr = new Attributes().dashArray(0.1)
      expect(attr.string).toMatch(/stroke-dasharray:0\.1/)
    })

    it("should set dash array with multiple values", () => {
      const attr = new Attributes().dashArray(0.1, 0.05, 0.02)
      expect(attr.string).toMatch(/stroke-dasharray:0\.1 0\.05 0\.02/)
    })
  })

  describe("dashOffset", () => {
    it("should set dash offset", () => {
      const attr = new Attributes().dashOffset(0.05)
      expect(attr.string).toMatch(/stroke-dashoffset:0\.05/)
    })
  })

  describe("class", () => {
    it("should set class attribute", () => {
      const attr = new Attributes().class("my-class")
      expect(attr.string).toMatch(/class="my-class"/)
    })
  })

  describe("id", () => {
    it("should set id attribute", () => {
      const attr = new Attributes().id("my-id")
      expect(attr.string).toMatch(/id="my-id"/)
    })
  })

  describe("transform", () => {
    it("should set transform attribute", () => {
      const t = new Transform().translate([10, 20])
      const attr = new Attributes().transform(t)
      expect(attr.string).toMatch(/transform="translate\(10, 20\)"/)
    })
  })

  describe("transformOrigin", () => {
    it("should set transform origin with Point2D", () => {
      const attr = new Attributes().transformOrigin([0.5, 0.5])
      expect(attr.string).toMatch(/transform-origin="0\.5 0\.5"/)
    })

    it("should set transform origin with center keyword", () => {
      const attr = new Attributes().transformOrigin("center")
      expect(attr.string).toMatch(/transform-origin="center"/)
    })
  })

  describe("clone", () => {
    it("should create a deep copy", () => {
      const original = new Attributes().fill(0, 100, 50).class("test")
      const cloned = original.clone()
      expect(cloned.string).toBe(original.string)
    })

    it("should not modify original when cloned is modified", () => {
      const original = new Attributes().fill(0, 100, 50)
      const originalStr = original.string
      const cloned = original.clone()
      cloned.stroke(240, 100, 50)
      expect(original.string).toBe(originalStr)
    })
  })

  describe("static getters", () => {
    it("should return stroked attributes", () => {
      expect(Attributes.stroked.string).toMatch(/fill:none/)
      expect(Attributes.stroked.string).toMatch(/stroke-width/)
      expect(Attributes.stroked.string).toMatch(/stroke:#000000/)
    })

    it("should return filled attributes", () => {
      expect(Attributes.filled.string).toMatch(/fill:#000000/)
    })

    it("should return empty attributes", () => {
      expect(Attributes.empty.string).toBe("")
    })
  })

  describe("Attributes.transform static method", () => {
    it("should create attributes with transform", () => {
      const t = new Transform().scale(2)
      const attr = Attributes.transform(t)
      expect(attr.string).toMatch(/transform="scale\(2, 2\)"/)
    })
  })

  describe("Attributes.of static factory", () => {
    it("should create attributes from object config", () => {
      const attr = Attributes.of({
        fill: { h: 0, s: 100, l: 50 },
        strokeWidth: 0.01,
        class: "my-class",
      })
      expect(attr.string).toMatch(/fill:#FF0000/)
      expect(attr.string).toMatch(/stroke-width:0\.01/)
      expect(attr.string).toMatch(/class="my-class"/)
    })

    it("should handle all options", () => {
      const attr = Attributes.of({
        fill: { h: 120, s: 100, l: 50, a: 0.5 },
        stroke: { h: 0, s: 100, l: 50 },
        strokeWidth: 0.02,
        lineCap: "round",
        lineJoin: "miter",
        miterLimit: 4,
        dashArray: [0.1, 0.05],
        dashOffset: 0.02,
        opacity: 0.9,
        id: "my-id",
        class: "my-class",
      })
      expect(attr.string).toMatch(/fill:#00FF00/)
      expect(attr.string).toMatch(/fill-opacity:0\.5/)
      expect(attr.string).toMatch(/stroke:#FF0000/)
      expect(attr.string).toMatch(/stroke-width:0\.02/)
      expect(attr.string).toMatch(/stroke-linecap:round/)
      expect(attr.string).toMatch(/stroke-linejoin:miter/)
      expect(attr.string).toMatch(/stroke-miterlimit:4/)
      expect(attr.string).toMatch(/stroke-dasharray:0\.1 0\.05/)
      expect(attr.string).toMatch(/stroke-dashoffset:0\.02/)
      expect(attr.string).toMatch(/opacity:0\.9/)
      expect(attr.string).toMatch(/id="my-id"/)
      expect(attr.string).toMatch(/class="my-class"/)
    })

    it("should handle fillOKLCH", () => {
      const attr = Attributes.of({
        fillOKLCH: { l: 0.7, c: 0.15, h: 180, a: 0.8 },
      })
      expect(attr.string).toMatch(/oklch/)
    })

    it("should handle transformOrigin", () => {
      const attr = Attributes.of({
        transformOrigin: [0.5, 0.5],
      })
      expect(attr.string).toMatch(/transform-origin="0\.5 0\.5"/)
    })
  })

  describe("chaining", () => {
    it("should allow chaining multiple methods", () => {
      const attr = new Attributes()
        .fill(120, 100, 50)
        .stroke(0, 100, 50)
        .strokeWidth(0.01)
        .lineCap("round")
        .opacity(0.9)
        .class("styled-path")

      expect(attr.string).toMatch(/fill:#00FF00/)
      expect(attr.string).toMatch(/stroke:#FF0000/)
      expect(attr.string).toMatch(/stroke-width:0\.01/)
      expect(attr.string).toMatch(/stroke-linecap:round/)
      expect(attr.string).toMatch(/opacity:0\.9/)
      expect(attr.string).toMatch(/class="styled-path"/)
    })
  })
})
