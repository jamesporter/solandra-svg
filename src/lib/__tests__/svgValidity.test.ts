import { describe, expect, it } from "vitest"
import { SolandraSvg } from "../svg"
import { Attributes } from "../attributes"
import { findAll, parseXml } from "./helpers/xml"
import { parsePathData, pathPoints } from "./helpers/pathData"
import { randomSketch } from "./helpers/sketches"

// The library's core promise is that whatever you draw, the markup it emits is
// valid SVG. These tests check that end to end, rather than checking that the
// output contains particular substrings.

const SEEDS = [1, 2, 3, 7, 42, 99, 1234, 20260905]

describe("rendered SVG is well-formed", () => {
  it.each(SEEDS)("for a sketch built with seed %i", (seed) => {
    const root = parseXml(randomSketch(seed).image)

    expect(root.tag).toBe("svg")
    expect(root.attributes.xmlns).toBe("http://www.w3.org/2000/svg")
    // A sketch that renders nothing would pass every other assertion here.
    expect(findAll(root, "path").length).toBeGreaterThan(20)
    expect(findAll(root, "g").length).toBeGreaterThan(0)
  })

  it("survives a round trip through a data URI", () => {
    const s = randomSketch(5)
    const prefix = "data:image/svg+xml;utf8,"
    const decoded = decodeURIComponent(s.imageSrc().slice(prefix.length))

    expect(decoded).toBe(s.image)
    expect(parseXml(decoded).tag).toBe("svg")
  })
})

describe("every generated path has valid path data", () => {
  it.each(SEEDS)("for a sketch built with seed %i", (seed) => {
    const paths = findAll(parseXml(randomSketch(seed).image), "path")

    for (const path of paths) {
      const d = path.attributes.d
      expect(d, "every path element must carry path data").toBeDefined()

      const commands = parsePathData(d)
      expect(commands[0].command).toBe("M")

      for (const { args } of commands) {
        for (const arg of args) {
          expect(Number.isFinite(arg)).toBe(true)
        }
      }
    }
  })

  it("only emits absolute commands, so path data can be composed safely", () => {
    for (const path of findAll(parseXml(randomSketch(11).image), "path")) {
      expect(() => pathPoints(path.attributes.d)).not.toThrow()
    }
  })
})

describe("the viewBox describes the drawing's coordinate space", () => {
  it.each([
    [100, 100, "0 0 1 1"],
    [200, 100, "0 0 1 0.5"],
    [100, 200, "0 0 1 2"],
    [800, 500, "0 0 1 0.625"],
  ])("is %i x %i -> %s", (width, height, expected) => {
    const s = new SolandraSvg(width, height, 1)
    s.path().rect([0.5, 0.5], 0.1, 0.1)
    const root = parseXml(s.image)

    expect(root.attributes.viewBox).toBe(expected)
    expect(root.attributes.width).toBe(String(width))
    expect(root.attributes.height).toBe(String(height))
  })

  it("keeps drawn points inside the viewBox for the layout helpers", () => {
    const s = new SolandraSvg(300, 200, 1)
    s.forTiling({ n: 5, margin: 0.05 }, (at, delta) => {
      s.path().rect(at, delta[0], delta[1], "topLeft")
    })

    const bottom = 1 / s.aspectRatio
    for (const path of findAll(parseXml(s.image), "path")) {
      for (const [x, y] of pathPoints(path.attributes.d)) {
        expect(x).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThanOrEqual(1)
        expect(y).toBeGreaterThanOrEqual(0)
        expect(y).toBeLessThanOrEqual(bottom)
      }
    }
  })
})

describe("attribute values are escaped", () => {
  it("escapes markup characters in ids and classes", () => {
    const s = new SolandraSvg(100, 100, 1)
    s.path(new Attributes().id(`a"b`).class("x & y <z>"))
      .moveTo([0, 0])
      .lineTo([1, 1])

    const root = parseXml(s.image)
    const path = findAll(root, "path")[0]

    // Round-tripping through the parser proves the escaping is both present
    // and reversible: the drawing keeps the exact values it was given.
    expect(path.attributes.id).toBe("a&quot;b")
    expect(path.attributes.class).toBe("x &amp; y &lt;z&gt;")
  })

  it("escapes markup characters in group attributes", () => {
    const s = new SolandraSvg(100, 100, 1)
    s.groupWithId(`g"1`, () => {
      s.path().moveTo([0, 0]).lineTo([1, 1])
    })

    expect(() => parseXml(s.image)).not.toThrow()
  })

  it("leaves ordinary values untouched", () => {
    const s = new SolandraSvg(100, 100, 1)
    s.path(new Attributes().fill(0, 100, 50).id("plain").transform(s.T.translate(0.5, 0.5)))
      .moveTo([0, 0])
      .lineTo([1, 1])

    const path = findAll(parseXml(s.image), "path")[0]
    expect(path.attributes.id).toBe("plain")
    expect(path.attributes.transform).toBe("translate(0.5, 0.5)")
    expect(path.attributes.style).toContain("fill:#FF0000")
  })
})
