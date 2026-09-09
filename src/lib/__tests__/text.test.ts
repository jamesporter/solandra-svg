import { describe, expect, it } from "vitest"
import { SolandraSvg } from "../svg"
import { Attributes } from "../attributes"
import { Text } from "../text"
import { findAll, parseXml } from "./helpers/xml"

describe("text", () => {
  it("renders a <text> element at the given point", () => {
    const s = new SolandraSvg(400, 400)
    s.text("hello", [0.25, 0.5])

    const [text] = findAll(parseXml(s.image), "text")
    expect(text.attributes.x).toBe("0.25")
    expect(text.attributes.y).toBe("0.5")
    expect(text.text).toBe("hello")
  })

  it("returns the element, which can be reconfigured afterwards", () => {
    const s = new SolandraSvg(400, 400)
    const element = s.text("hello", [0, 0])
    expect(element).toBeInstanceOf(Text)

    element.configureAttributes((a) => a.fill(0, 0, 0).fontSize(0.2))
    element.content = "goodbye"

    const [text] = findAll(parseXml(s.image), "text")
    expect(text.text).toBe("goodbye")
    expect(text.attributes.style).toContain("font-size:0.2")
  })

  it("applies typography attributes", () => {
    const s = new SolandraSvg(400, 400)
    s.text(
      "styled",
      s.meta.center,
      s.A.fontSize(0.1)
        .fontFamily("Helvetica, sans-serif")
        .fontWeight(700)
        .fontStyle("italic")
        .textAnchor("middle")
        .dominantBaseline("middle")
        .letterSpacing(0.01),
    )

    const [text] = findAll(parseXml(s.image), "text")
    expect(text.attributes.style).toBe(
      "font-size:0.1; font-family:Helvetica, sans-serif; font-weight:700; " +
        "font-style:italic; text-anchor:middle; dominant-baseline:middle; " +
        "letter-spacing:0.01;",
    )
  })

  it("escapes characters that would otherwise break the markup", () => {
    const s = new SolandraSvg(400, 400)
    s.text("Bill & Ben <3", [0, 0])

    expect(s.image).toContain("Bill &amp; Ben &lt;3")
    // The strict parser rejects a bare & or <, so this also proves it parses;
    // it keeps entity references as written, hence the escaped form here.
    expect(findAll(parseXml(s.image), "text")[0].text).toBe(
      "Bill &amp; Ben &lt;3",
    )
  })

  it("nests inside groups like any other element", () => {
    const s = new SolandraSvg(400, 400)
    s.groupWithId("label", () => {
      s.text("inside", [0.1, 0.1])
    })

    const [group] = findAll(parseXml(s.image), "g")
    expect(group.children.map((c) => c.tag)).toEqual(["text"])
  })

  it("survives a data URI round trip", () => {
    const s = new SolandraSvg(400, 400)
    s.text("round & trip", s.meta.center, s.A.fontSize(0.1))

    const prefix = "data:image/svg+xml;utf8,"
    expect(decodeURIComponent(s.imageSrc().slice(prefix.length))).toBe(s.image)
  })
})

describe("cloning text", () => {
  it("copies content, position and attributes", () => {
    const original = new Text("hello", [0.2, 0.3], new Attributes().id("one"))
    const clone = original.clone()

    expect(clone.content).toBe("hello")
    expect(clone.at).toEqual([0.2, 0.3])
    expect(clone.at).not.toBe(original.at)
    expect(clone.string(0)).toBe(original.string(0))
  })

  it("can be given replacement attributes", () => {
    const original = new Text("hello", [0, 0], new Attributes().id("one"))
    const clone = original.clone(new Attributes().id("two"))

    expect(clone.string(0)).toContain('id="two"')
    expect(original.string(0)).toContain('id="one"')
  })
})
