import { describe, expect, it } from "vitest"
import { Attributes } from "../attributes"
import { Transform } from "../transforms"
import { Path } from "../path"
import { SolandraSvg } from "../svg"
import { parsePathData } from "./helpers/pathData"

// Corners of the API that the example-driven tests skip: deprecated factories
// that are still published, and the segment kinds that only some code paths
// construct. They are part of the surface consumers can reach, so they are
// covered here.

describe("deprecated Attributes factories", () => {
  it("Attributes.transform wraps a Transform", () => {
    const attr = Attributes.transform(new Transform().translate(0.5, 0.25))
    expect(attr.string).toContain(`transform="translate(0.5, 0.25)"`)
  })

  it("Attributes.transformOf builds the transform from a spec", () => {
    const attr = Attributes.transformOf({
      translate: [0.5, 0.25],
      rotate: Math.PI / 2,
      scale: 2,
    })

    expect(attr.string).toBe(Attributes.transform(
      Transform.of({ translate: [0.5, 0.25], rotate: Math.PI / 2, scale: 2 }),
    ).string)
    expect(attr.string).toContain("translate(0.5, 0.25)")
    expect(attr.string).toContain("rotate(90)")
    expect(attr.string).toContain("scale(2, 2)")
  })

  it("Attributes.of applies the opacity and stroke options the fluent API has", () => {
    const attr = Attributes.of({
      fillOpacity: 0.4,
      strokeOpacity: 0.6,
      strokeWidth: 0.03,
      transform: new Transform().scale(3),
      transformOrigin: "center",
    })

    expect(attr.string).toContain("fill-opacity:0.4")
    expect(attr.string).toContain("stroke-opacity:0.6")
    expect(attr.string).toContain("stroke-width:0.03")
    expect(attr.string).toContain(`transform="scale(3, 3)"`)
    expect(attr.string).toContain(`transform-origin="center"`)
  })

  it("Attributes.of sets the same declarations as the equivalent fluent chain", () => {
    const fromConfig = Attributes.of({
      fill: { h: 200, s: 80, l: 50, a: 0.5 },
      stroke: { h: 0, s: 0, l: 0 },
      strokeWidth: 0.01,
      lineCap: "round",
      id: "x",
    })
    const fluent = new Attributes()
      .fill(200, 80, 50, 0.5)
      .stroke(0, 0, 0)
      .strokeWidth(0.01)
      .lineCap("round")
      .id("x")

    // The two build their style declarations in a different order, which CSS
    // does not care about, so compare the sets of declarations.
    const declarations = (attributes: Attributes) =>
      attributes.string
        .match(/style="([^"]*)"/)![1]
        .split(";")
        .map((d) => d.trim())
        .filter(Boolean)
        .sort()

    expect(declarations(fromConfig)).toEqual(declarations(fluent))
    expect(fromConfig.string).toContain(`id="x"`)
  })

  it("Attributes.of returns empty attributes for an empty config", () => {
    expect(Attributes.of({}).string).toBe("")
  })
})

describe("OkLCH colours", () => {
  it("omit the alpha component when none is given", () => {
    expect(new Attributes().fillOklch(0.7, 0.15, 180).string).toContain(
      "fill:oklch(0.7 0.15 180)",
    )
    expect(new Attributes().strokeOklch(0.4, 0.1, 20).string).toContain(
      "stroke:oklch(0.4 0.1 20)",
    )
  })

  it("apply the alpha as documented for each property", () => {
    // fill embeds the alpha in the colour value...
    expect(new Attributes().fillOklch(0.7, 0.15, 180, 0.25).string).toContain(
      "fill:oklch(0.7 0.15 180 / 25%)",
    )
    // ...while stroke sets it as a separate stroke-opacity declaration.
    const stroke = new Attributes().strokeOklch(0.4, 0.1, 20, 0.5).string
    expect(stroke).toContain("stroke:oklch(0.4 0.1 20)")
    expect(stroke).toContain("stroke-opacity:0.5")
  })
})

describe("Path.clone copies every kind of segment", () => {
  const original = () =>
    new Path(new Attributes().id("source"))
      .moveTo([0.1, 0.1])
      .lineTo([0.2, 0.2])
      .curveTo([0.3, 0.3], { curveSize: 0.5, polarity: -1 })
      .arcTo([0.4, 0.4], { rX: 0.2, rY: 0.1, largeArc: true })
      .close()

  it("reproduces the same path data", () => {
    const source = original()
    const copy = source.clone()

    expect(copy.segments.map((s) => s.kind)).toEqual([
      "move",
      "line",
      "cubicCurve",
      "arc",
      "close",
    ])
    expect(copy.string(0)).toBe(source.string(0))
  })

  it("copies the points and configs rather than sharing them", () => {
    const source = original()
    const copy = source.clone()

    for (let i = 0; i < source.segments.length; i++) {
      const from = source.segments[i]
      const to = copy.segments[i]
      expect(to).toEqual(from)
      expect(to).not.toBe(from)
      if (from.kind !== "close" && to.kind !== "close") {
        expect(to.to).not.toBe(from.to)
      }
    }
  })

  it("does not let a mutated clone affect the original", () => {
    const source = original()
    const before = source.string(0)
    const copy = source.clone()

    copy.map((segment) =>
      segment.kind === "line" ? { kind: "line", to: [0.9, 0.9] } : segment,
    )
    copy.segments.push({ kind: "close" })

    expect(source.string(0)).toBe(before)
    expect(copy.string(0)).not.toBe(before)
  })

  it("clones the attributes too, unless replacements are given", () => {
    const source = original()
    const copy = source.clone()
    copy.configureAttributes((a) => a.id("copy"))

    expect(source.string(0)).toContain(`id="source"`)
    expect(copy.string(0)).toContain(`id="copy"`)

    const replaced = source.clone(new Attributes().id("replaced"))
    expect(replaced.string(0)).toContain(`id="replaced"`)
  })
})

describe("path building edge cases", () => {
  it("chaikin on a path with nothing to smooth leaves it alone", () => {
    const single = new Path(Attributes.empty).moveTo([0, 0])
    expect(single.chaikin(3).segments).toEqual([{ kind: "move", to: [0, 0] }])

    const pair = new Path(Attributes.empty).moveTo([0, 0]).lineTo([1, 1])
    expect(pair.chaikin(3).segments).toEqual([
      { kind: "move", to: [0, 0] },
      { kind: "line", to: [1, 1] },
    ])
  })

  it("chaikin on an empty path is a no-op", () => {
    const path = new Path(Attributes.empty)
    expect(path.chaikin().segments).toEqual([])
  })

  it("regularPolygon returns to its starting point", () => {
    const path = new Path(Attributes.empty).regularPolygon([0.5, 0.5], 5, 0.2)
    const points = path.segments.map((s) => (s.kind === "close" ? null : s.to))

    expect(points).toHaveLength(6)
    expect(points[5]![0]).toBeCloseTo(points[0]![0], 10)
    expect(points[5]![1]).toBeCloseTo(points[0]![1], 10)
  })

  it("an ellipse is four arcs back to where it started", () => {
    const path = new Path(Attributes.empty).ellipse([0.5, 0.5], 0.4, 0.2)
    const commands = parsePathData(path.string(0).match(/d="([^"]*)"/)![1])

    expect(commands.map((c) => c.command)).toEqual(["M", "A", "A", "A", "A"])
    expect(commands[4].args[5]).toBeCloseTo(commands[0].args[0], 10)
    expect(commands[4].args[6]).toBeCloseTo(commands[0].args[1], 10)
  })
})

describe("drawing edge cases", () => {
  it("renders an empty drawing as an empty svg element", () => {
    const s = new SolandraSvg(100, 100, 1)
    expect(s.image).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" width="100" height="100">\n\n</svg>`,
    )
  })

  it("renders an empty group", () => {
    const s = new SolandraSvg(100, 100, 1)
    s.groupWithId("empty", () => {})
    expect(s.image).toContain(`<g id="empty">\n  </g>`)
  })

  it("restores the enclosing group after a nested one closes", () => {
    const s = new SolandraSvg(100, 100, 1)
    s.groupWithId("outer", () => {
      s.groupWithId("inner", () => {
        s.path().moveTo([0, 0]).lineTo([1, 1])
      })
      // This path belongs to "outer", not "inner".
      s.path().moveTo([1, 0]).lineTo([0, 1])
    })
    s.path().moveTo([0, 0]).lineTo([0.5, 0.5])

    expect(s.elements).toHaveLength(2)
    const outer = s.elements[0] as { children: unknown[] }
    expect(outer.children).toHaveLength(2)
  })

  it("build and withRandomOrder work on an iteration that yields nothing", () => {
    const s = new SolandraSvg(100, 100, 1)
    const config = { minX: 0, maxX: -1, minY: 0, maxY: -1 }

    expect(s.build(s.forGrid, config, (p) => p)).toEqual([])
    let calls = 0
    s.withRandomOrder(s.forGrid, config, () => calls++)
    expect(calls).toBe(0)
  })

  it("range with n = 0 emits only the starting value, not NaN", () => {
    const s = new SolandraSvg(100, 100, 1)
    const inclusive: number[] = []
    s.range({ from: 2, to: 5, n: 0 }, (n) => inclusive.push(n))
    expect(inclusive).toEqual([2])

    const exclusive: number[] = []
    s.range({ from: 2, to: 5, n: 0, inclusive: false }, (n) => exclusive.push(n))
    expect(exclusive).toEqual([])
  })

  it("uniformRandomInt with an empty exclusive range always returns from", () => {
    const s = new SolandraSvg(100, 100, 1)
    for (let i = 0; i < 20; i++) {
      expect(s.uniformRandomInt({ from: 3, to: 3, inclusive: false })).toBe(3)
    }
  })

  it("proportionately rejects a zero or negative total", () => {
    const s = new SolandraSvg(100, 100, 1)
    expect(() => s.proportionately([])).toThrow("Must be positive total")
    expect(() => s.proportionately([[0, () => 1]])).toThrow("Must be positive total")
    expect(() => s.proportionately([[-1, () => 1]])).toThrow("Must be positive total")
  })
})
