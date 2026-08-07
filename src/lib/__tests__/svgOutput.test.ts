import { describe, expect, it } from "vitest"
import { SolandraSvg } from "../svg"
import { Attributes } from "../attributes"

const square = (s: SolandraSvg) =>
  s.path(new Attributes().fill(0, 100, 50)).rect([0.5, 0.5], 0.5, 0.5)

describe("imageSrc", () => {
  it("URI-encodes the SVG by default", () => {
    const s = new SolandraSvg(100, 100, 1)
    square(s)

    const src = s.imageSrc()
    expect(src.startsWith("data:image/svg+xml;utf8,")).toBe(true)
    expect(
      decodeURIComponent(src.slice("data:image/svg+xml;utf8,".length)),
    ).toBe(s.image)
  })

  it("only escapes hashes when encode is false", () => {
    const s = new SolandraSvg(100, 100, 1)
    square(s)

    const src = s.imageSrc(false)
    // The fill is a hex colour, so the '#' must be escaped to stay a valid URI.
    expect(src).not.toContain("#")
    expect(src).toContain("%23FF0000")
    expect(src).toContain("<svg")
  })
})

describe("UNSTABLE_imageInkscapeReady", () => {
  it("renders the same body as image, with mm dimensions", () => {
    const s = new SolandraSvg(210, 297, 1)
    square(s)

    expect(s.UNSTABLE_imageInkscapeReady).toContain(`width="210mm"`)
    expect(s.UNSTABLE_imageInkscapeReady).toContain(`height="297mm"`)
    expect(s.image).toContain(`width="210"`)

    // Only the width/height attributes differ between the two renderings.
    expect(s.UNSTABLE_imageInkscapeReady.replace(/(\d)mm"/g, '$1"')).toBe(
      s.image,
    )
  })

  it("has a data URI variant matching the encode flag", () => {
    const s = new SolandraSvg(210, 297, 1)
    square(s)

    const encoded = s.UNSTABLE_imageSrcInkscapeReady()
    expect(
      decodeURIComponent(encoded.slice("data:image/svg+xml;utf8,".length)),
    ).toBe(s.UNSTABLE_imageInkscapeReady)

    const raw = s.UNSTABLE_imageSrcInkscapeReady(false)
    expect(raw).not.toContain("#")
    expect(raw).toContain("mm")
  })
})

describe("groupWithId", () => {
  it("wraps its contents in a g element with the given id", () => {
    const s = new SolandraSvg(100, 100, 1)
    s.groupWithId("layer-1", () => {
      s.path().moveTo([0, 0]).lineTo([1, 1])
    })

    expect(s.image).toMatchInlineSnapshot(`
      "<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" width="100" height="100">
        <g id="layer-1">
          <path d="M 0 0 L 1 1" />
        </g>
      </svg>"
    `)
  })

  it("nests paths created inside it, not at the top level", () => {
    const s = new SolandraSvg(100, 100, 1)
    s.groupWithId("a", () => {
      s.path().moveTo([0, 0]).lineTo([1, 1])
    })
    s.path().moveTo([0, 1]).lineTo([1, 0])

    expect(s.elements).toHaveLength(2)
  })
})

describe("clonePath", () => {
  it("adds an independent copy to the drawing", () => {
    const s = new SolandraSvg(100, 100, 1)
    const original = s.path().moveTo([0, 0]).lineTo([0.5, 0.5])
    const copy = s.clonePath(original)

    expect(s.elements).toHaveLength(2)
    expect(copy).not.toBe(original)
    expect(copy.string(0)).toBe(original.string(0))

    copy.lineTo([1, 1])
    expect(original.segments).toHaveLength(2)
    expect(copy.segments).toHaveLength(3)
  })

  it("can replace the attributes on the copy", () => {
    const s = new SolandraSvg(100, 100, 1)
    const original = s
      .path(new Attributes().id("original"))
      .moveTo([0, 0])
      .lineTo([1, 1])
    const copy = s.clonePath(original, new Attributes().id("copy"))

    expect(copy.string(0)).toContain(`id="copy"`)
    expect(original.string(0)).toContain(`id="original"`)
  })

  it("clones into the current group", () => {
    const s = new SolandraSvg(100, 100, 1)
    const original = s.path().moveTo([0, 0]).lineTo([1, 1])
    s.groupWithId("g", () => {
      s.clonePath(original)
    })

    expect(s.elements).toHaveLength(2)
    expect(s.image).toContain('<g id="g">')
  })
})

describe("path presets", () => {
  it("filledPath defaults to opaque black fill", () => {
    const s = new SolandraSvg(100, 100, 1)
    s.filledPath().moveTo([0, 0]).lineTo([1, 1])

    expect(s.image).toContain(`style="fill:#000000; fill-opacity:1;"`)
  })

  it("cutPath and creasePath differ only in stroke lightness", () => {
    const cut = new SolandraSvg(100, 100, 1)
    cut.cutPath().moveTo([0, 0]).lineTo([1, 1])

    const crease = new SolandraSvg(100, 100, 1)
    crease.creasePath().moveTo([0, 0]).lineTo([1, 1])

    expect(cut.image).toContain("stroke:#999999")
    expect(crease.image).toContain("stroke:#E6E6E6")
    expect(cut.image.replace("#999999", "#E6E6E6")).toBe(crease.image)
  })

  it("both presets round their caps and joins and accept overrides", () => {
    const s = new SolandraSvg(100, 100, 1)
    s.cutPath((a) => a.strokeWidth(0.01))
      .moveTo([0, 0])
      .lineTo([1, 1])

    const out = s.image
    expect(out).toContain("stroke-linecap:round")
    expect(out).toContain("stroke-linejoin:round")
    expect(out).toContain("stroke-width:0.01")
    expect(out).not.toContain("stroke-width:0.005")
  })

  it("presets are added to the current group", () => {
    const s = new SolandraSvg(100, 100, 1)
    s.groupWithId("cuts", () => {
      s.cutPath().moveTo([0, 0]).lineTo([1, 1])
      s.creasePath().moveTo([0, 1]).lineTo([1, 0])
    })

    expect(s.elements).toHaveLength(1)
    expect(s.image.match(/<path/g)).toHaveLength(2)
  })
})
