import { describe, expect, it } from "vitest"
import { findAll, parseXml } from "./helpers/xml"
import { parsePathData, pathPoints } from "./helpers/pathData"
import { aNumber, forAll } from "./helpers/property"

// The helpers below are the yardstick the SVG output tests measure against, so
// they get their own tests: a lenient parser would quietly pass broken markup.

describe("parseXml", () => {
  it("parses elements, attributes, text and self-closing tags", () => {
    const root = parseXml(
      `<svg width="10"><g id="a"><path d="M 0 0" /></g>text</svg>`,
    )

    expect(root.tag).toBe("svg")
    expect(root.attributes).toEqual({ width: "10" })
    expect(root.text).toBe("text")
    expect(root.children).toHaveLength(1)
    expect(root.children[0].children[0]).toEqual({
      tag: "path",
      attributes: { d: "M 0 0" },
      children: [],
      text: "",
    })
  })

  it("accepts an XML declaration, comments and single-quoted values", () => {
    const root = parseXml(`<?xml version="1.0"?><svg a='1'><!-- note --></svg>`)
    expect(root.attributes).toEqual({ a: "1" })
    expect(root.children).toEqual([])
  })

  it("accepts escaped markup characters in text and attributes", () => {
    const root = parseXml(`<a title="1 &lt; 2 &amp; 3">&#60;&gt;</a>`)
    expect(root.attributes.title).toBe("1 &lt; 2 &amp; 3")
    expect(root.text).toBe("&#60;&gt;")
  })

  it.each([
    ["mis-nested tags", `<a><b></a></b>`],
    ["an unclosed element", `<a><b></b>`],
    ["an unquoted attribute value", `<a b=1></a>`],
    ["a valueless attribute", `<a b></a>`],
    ["a duplicate attribute", `<a b="1" b="2"></a>`],
    ["a bare < in text", `<a>1 < 2</a>`],
    ["a bare & in text", `<a>Tom & Jerry</a>`],
    ["a bare & in an attribute", `<a b="Tom & Jerry"></a>`],
    ["an unknown entity", `<a>&nbsp;</a>`],
    ["content after the root", `<a></a><b></b>`],
    ["no root element", `just text`],
    ["an unterminated comment", `<a><!-- oops</a>`],
  ])("rejects %s", (_, malformed) => {
    expect(() => parseXml(malformed)).toThrow()
  })

  it("finds elements by tag at any depth", () => {
    const root = parseXml(`<svg><g><path/><g><path/></g></g><path/></svg>`)
    expect(findAll(root, "path")).toHaveLength(3)
    expect(findAll(root, "g")).toHaveLength(2)
    expect(findAll(root, "svg")).toHaveLength(1)
  })
})

describe("parsePathData", () => {
  it("splits commands and their arguments", () => {
    expect(parsePathData("M 0 0 L 1 1 Z")).toEqual([
      { command: "M", args: [0, 0] },
      { command: "L", args: [1, 1] },
      { command: "Z", args: [] },
    ])
  })

  it("expands repeated argument groups, with implicit linetos after a moveto", () => {
    expect(parsePathData("M 0 0 1 1 2 2")).toEqual([
      { command: "M", args: [0, 0] },
      { command: "L", args: [1, 1] },
      { command: "L", args: [2, 2] },
    ])
  })

  it("handles comma separators, signs and exponents", () => {
    expect(parsePathData("M0,0L-1.5,2e-3")).toEqual([
      { command: "M", args: [0, 0] },
      { command: "L", args: [-1.5, 0.002] },
    ])
  })

  it.each([
    ["an unknown command", "M 0 0 X 1 1"],
    ["a truncated argument group", "M 0 0 Q 1 1 1"],
    ["a missing argument", "M 0 0 L 1"],
    ["a path not starting with a moveto", "L 1 1"],
    ["empty data", "   "],
    ["a NaN coordinate", "M 0 0 L NaN 1"],
    ["a non-boolean arc flag", "M 0 0 A 1 1 0 2 0 1 1"],
  ])("rejects %s", (_, invalid) => {
    expect(() => parsePathData(invalid)).toThrow(/Invalid path data|not a path command/)
  })

  it("accepts a valid arc, including both flags", () => {
    expect(parsePathData("M 0 0 A 1 2 30 1 0 3 4")).toEqual([
      { command: "M", args: [0, 0] },
      { command: "A", args: [1, 2, 30, 1, 0, 3, 4] },
    ])
  })
})

describe("pathPoints", () => {
  it("returns the endpoint of each drawing command", () => {
    expect(pathPoints("M 0 0 L 1 2 C 3 3, 4 4, 5 6 A 1 1 0 0 0 7 8 Z")).toEqual([
      [0, 0],
      [1, 2],
      [5, 6],
      [7, 8],
    ])
  })

  it("tracks horizontal and vertical linetos", () => {
    expect(pathPoints("M 1 1 H 5 V 9")).toEqual([
      [1, 1],
      [5, 1],
      [5, 9],
    ])
  })

  it("rejects relative commands, which this library never emits", () => {
    expect(() => pathPoints("M 0 0 l 1 1")).toThrow(/absolute/)
  })
})

describe("forAll", () => {
  it("runs the property once per run", () => {
    let runs = 0
    forAll((rng) => rng.number(), () => void runs++, { runs: 12 })
    expect(runs).toBe(12)
  })

  it("is reproducible for a given seed", () => {
    const collect = () => {
      const seen: number[] = []
      forAll((rng) => aNumber(rng, 0, 1), (n) => void seen.push(n), { runs: 8 })
      return seen
    }
    expect(collect()).toEqual(collect())
  })

  it("reports the failing run and its input", () => {
    expect(() =>
      forAll(
        () => 42,
        (n) => expect(n).toBe(0),
        { runs: 3 },
      ),
    ).toThrow(/Property failed on run 0 .*with input 42/s)
  })
})
