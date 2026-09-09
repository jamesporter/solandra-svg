import { describe, expect, it } from "vitest"
import { Path } from "../path"
import { Attributes } from "../attributes"
import { SolandraSvg } from "../svg"
import { parsePathData } from "./helpers/pathData"
import { findAll, parseXml } from "./helpers/xml"

// The explicit-control-point curves and the Catmull-Rom spline built on them.
// The interesting property of `smoothLine` is that, unlike `chaikin`, the curve
// it produces passes exactly through every point it was given, so that is what
// these tests check rather than the control points it happened to pick.

const points = (path: Path) =>
  path.segments.flatMap((s) => (s.kind === "close" ? [] : [s.to]))

describe("cubicTo", () => {
  it("adds a bezier segment with the given control points", () => {
    const path = new Path(Attributes.empty)
      .moveTo([0, 0])
      .cubicTo([0.2, 0.4], [0.6, 0.1], [1, 0.5])

    expect(path.segments[1]).toEqual({
      kind: "bezier",
      to: [1, 0.5],
      control1: [0.2, 0.4],
      control2: [0.6, 0.1],
    })
  })

  it("renders as an SVG C command using those control points", () => {
    const path = new Path(Attributes.empty)
      .moveTo([0, 0])
      .cubicTo([0.2, 0.4], [0.6, 0.1], [1, 0.5])

    expect(path.string(0)).toContain("C 0.2 0.4, 0.6 0.1, 1 0.5")
    expect(parsePathData(path.string(0).match(/d="([^"]+)"/)![1])).toEqual([
      { command: "M", args: [0, 0] },
      { command: "C", args: [0.2, 0.4, 0.6, 0.1, 1, 0.5] },
    ])
  })

  it("is chainable", () => {
    const path = new Path(Attributes.empty).moveTo([0, 0])
    expect(path.cubicTo([0, 0], [1, 1], [1, 0])).toBe(path)
  })
})

describe("quadraticTo", () => {
  it("adds a quadratic segment with the given control point", () => {
    const path = new Path(Attributes.empty)
      .moveTo([0, 0])
      .quadraticTo([0.5, 0.9], [1, 0])

    expect(path.segments[1]).toEqual({
      kind: "quadratic",
      to: [1, 0],
      control: [0.5, 0.9],
    })
  })

  it("renders as an SVG Q command", () => {
    const path = new Path(Attributes.empty)
      .moveTo([0, 0])
      .quadraticTo([0.5, 0.9], [1, 0])

    expect(parsePathData(path.string(0).match(/d="([^"]+)"/)![1])).toEqual([
      { command: "M", args: [0, 0] },
      { command: "Q", args: [0.5, 0.9, 1, 0] },
    ])
  })

  it("is chainable", () => {
    const path = new Path(Attributes.empty).moveTo([0, 0])
    expect(path.quadraticTo([0, 1], [1, 0])).toBe(path)
  })
})

describe("smoothLine", () => {
  const through: [number, number][] = [
    [0.1, 0.5],
    [0.4, 0.2],
    [0.7, 0.7],
    [0.9, 0.4],
  ]

  it("passes exactly through every point it is given", () => {
    const path = new Path(Attributes.empty).smoothLine(through)

    expect(path.segments[0]).toEqual({ kind: "move", to: through[0] })
    expect(points(path)).toEqual(through)
  })

  it("emits one curve per gap between points", () => {
    const path = new Path(Attributes.empty).smoothLine(through)

    expect(path.segments.map((s) => s.kind)).toEqual([
      "move",
      "bezier",
      "bezier",
      "bezier",
    ])
  })

  it("keeps the end control points inside the curve for an open line", () => {
    // With the endpoints repeated (rather than wrapped) the first control point
    // sits between the first two points, so the curve does not curl away.
    const [, first] = new Path(Attributes.empty).smoothLine(through).segments
    if (first.kind !== "bezier") throw new Error("expected a bezier")

    expect(first.control1[0]).toBeGreaterThan(through[0][0])
    expect(first.control1[0]).toBeLessThan(through[1][0])
  })

  it("wraps around and closes the path when closed", () => {
    const path = new Path(Attributes.empty).smoothLine(through, {
      closed: true,
    })

    expect(path.segments.map((s) => s.kind)).toEqual([
      "move",
      "bezier",
      "bezier",
      "bezier",
      "bezier",
      "close",
    ])
    // The extra curve returns to where the path started.
    expect(points(path)).toEqual([...through, through[0]])
  })

  it("draws straight lines at zero tension", () => {
    const [, first] = new Path(Attributes.empty).smoothLine(through, {
      tension: 0,
    }).segments
    if (first.kind !== "bezier") throw new Error("expected a bezier")

    expect(first.control1).toEqual(through[0])
    expect(first.control2).toEqual(through[1])
  })

  it("bulges further from the line the higher the tension", () => {
    const controlOf = (tension: number) => {
      const [, segment] = new Path(Attributes.empty).smoothLine(through, {
        tension,
      }).segments
      if (segment.kind !== "bezier") throw new Error("expected a bezier")
      return segment.control1
    }

    expect(controlOf(2)[0] - through[0][0]).toBeGreaterThan(
      controlOf(1)[0] - through[0][0],
    )
  })

  it("handles the two point case as a single curve", () => {
    const path = new Path(Attributes.empty).smoothLine([
      [0, 0],
      [1, 1],
    ])

    expect(path.segments.map((s) => s.kind)).toEqual(["move", "bezier"])
  })

  it("rejects fewer than two points", () => {
    expect(() => new Path(Attributes.empty).smoothLine([[0, 0]])).toThrow(
      /at least two points/,
    )
  })

  it("is chainable", () => {
    const path = new Path(Attributes.empty)
    expect(
      path.smoothLine([
        [0, 0],
        [1, 1],
      ]),
    ).toBe(path)
  })

  it("renders as valid SVG path data", () => {
    const s = new SolandraSvg(400, 400)
    s.strokedPath().smoothLine(through)
    s.strokedPath().smoothLine(through, { closed: true })

    for (const path of findAll(parseXml(s.image), "path")) {
      const commands = parsePathData(path.attributes.d)
      expect(commands[0].command).toBe("M")
      for (const { args } of commands) {
        for (const arg of args) expect(Number.isFinite(arg)).toBe(true)
      }
    }
  })
})

describe("cloning a path with explicit curves", () => {
  it("deep copies bezier and quadratic segments", () => {
    const path = new Path(Attributes.empty)
      .moveTo([0, 0])
      .cubicTo([0.1, 0.1], [0.2, 0.2], [0.3, 0.3])
      .quadraticTo([0.4, 0.4], [0.5, 0.5])

    const clone = path.clone()

    expect(clone.segments).toEqual(path.segments)
    for (let i = 0; i < path.segments.length; i++) {
      expect(clone.segments[i]).not.toBe(path.segments[i])
    }
  })
})
