import { describe, expect, it } from "vitest"
import { SolandraSvg } from "../svg"
import { findAll, parseXml } from "./helpers/xml"

describe("gradients", () => {
  it("are not rendered at all when a drawing defines none", () => {
    const s = new SolandraSvg(400, 400)
    s.strokedPath().rect(s.meta.center, 0.5, 0.5)

    expect(s.image).not.toContain("<defs>")
  })

  it("render a linear gradient into the drawing's defs", () => {
    const s = new SolandraSvg(400, 400)
    s.linearGradient("sky").stop(0, 210, 80, 60).stop(1, 340, 80, 60)

    const [defs] = findAll(parseXml(s.image), "defs")
    const [gradient] = findAll(defs, "linearGradient")

    expect(gradient.attributes).toEqual({
      id: "sky",
      x1: "0",
      y1: "0",
      x2: "1",
      y2: "0",
      gradientUnits: "objectBoundingBox",
    })
    expect(gradient.children.map((stop) => stop.attributes)).toEqual([
      { offset: "0", style: "stop-color:#4799EB;" },
      { offset: "1", style: "stop-color:#EB477E;" },
    ])
  })

  it("take a direction, and coordinates in drawing space if asked", () => {
    const s = new SolandraSvg(400, 400)
    s.linearGradient("down", {
      from: [0, 0],
      to: [0.5, 1],
      units: "userSpaceOnUse",
    }).stop(0, 0, 0, 0)

    const [gradient] = findAll(parseXml(s.image), "linearGradient")
    expect(gradient.attributes.x2).toBe("0.5")
    expect(gradient.attributes.y2).toBe("1")
    expect(gradient.attributes.gradientUnits).toBe("userSpaceOnUse")
  })

  it("render a radial gradient, with a focus only when given one", () => {
    const s = new SolandraSvg(400, 400)
    s.radialGradient("plain").stop(0, 0, 0, 100)
    s.radialGradient("offset", {
      at: [0.4, 0.6],
      r: 0.7,
      focus: [0.2, 0.3],
      units: "userSpaceOnUse",
    }).stop(0, 0, 0, 100)

    const [plain, offset] = findAll(parseXml(s.image), "radialGradient")

    expect(plain.attributes).toEqual({
      id: "plain",
      cx: "0.5",
      cy: "0.5",
      r: "0.5",
      gradientUnits: "objectBoundingBox",
    })
    expect(offset.attributes).toEqual({
      id: "offset",
      cx: "0.4",
      cy: "0.6",
      r: "0.7",
      fx: "0.2",
      fy: "0.3",
      gradientUnits: "userSpaceOnUse",
    })
  })

  it("give stops an opacity only when one is set", () => {
    const s = new SolandraSvg(400, 400)
    s.linearGradient("fade").stop(0, 200, 80, 50, 0.25).stop(1, 200, 80, 50)

    const [gradient] = findAll(parseXml(s.image), "linearGradient")
    expect(gradient.children[0].attributes.style).toBe(
      "stop-color:#19A1E6; stop-opacity:0.25;",
    )
    expect(gradient.children[1].attributes.style).toBe("stop-color:#19A1E6;")
  })

  it("can be referenced as a fill or a stroke", () => {
    const s = new SolandraSvg(400, 400)
    s.linearGradient("sky").stop(0, 210, 80, 60).stop(1, 340, 80, 60)
    s.path(s.A.fillGradient("sky")).rect(s.meta.center, 0.5, 0.5)
    s.path(s.A.strokeGradient("sky").strokeWidth(0.01)).ellipse(
      s.meta.center,
      0.3,
      0.3,
    )
    s.text("gradient", s.meta.center, s.A.fillGradient("sky"))

    const root = parseXml(s.image)
    const [filled, stroked] = findAll(root, "path")
    expect(filled.attributes.style).toContain("fill:url(#sky);")
    expect(stroked.attributes.style).toContain("stroke:url(#sky);")
    expect(findAll(root, "text")[0].attributes.style).toContain(
      "fill:url(#sky);",
    )
  })

  it("appear before the elements that use them", () => {
    const s = new SolandraSvg(400, 400)
    s.path(s.A.fillGradient("sky")).rect(s.meta.center, 0.5, 0.5)
    s.linearGradient("sky").stop(0, 210, 80, 60)

    expect(s.image.indexOf("<defs>")).toBeLessThan(s.image.indexOf("<path"))
  })

  it("are chainable, returning the gradient from stop", () => {
    const s = new SolandraSvg(400, 400)
    const gradient = s.linearGradient("sky")
    expect(gradient.stop(0, 0, 0, 0)).toBe(gradient)
    expect(gradient.id).toBe("sky")
    expect(gradient.stops).toHaveLength(1)
  })

  it("escape an id that would otherwise break the markup", () => {
    const s = new SolandraSvg(400, 400)
    s.linearGradient('a"&b').stop(0, 0, 0, 0)

    // The parser keeps entity references as written, so this is the escaped
    // form; the point is that it parses at all.
    const [gradient] = findAll(parseXml(s.image), "linearGradient")
    expect(gradient.attributes.id).toBe("a&quot;&amp;b")
  })
})
