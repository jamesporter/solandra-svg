import { SolandraSvg, Attributes } from "../svg"

describe("A very simple SVG", () => {
  it("should be possible to instantiate and get meta", () => {
    const svg = new SolandraSvg(200, 100, 1)
    expect(svg.meta).toMatchInlineSnapshot(`
      Object {
        "aspectRatio": 2,
        "bottom": 0.5,
        "center": Array [
          0.5,
          0.25,
        ],
        "left": 0,
        "right": 1,
        "top": 0,
      }
    `)
  })

  it("Should be able to do a trivial SVG with a square", () => {
    const svg = new SolandraSvg(200, 100, 1)
    svg
      .path(
        new Attributes()
          .stroke(220, 90, 40)
          .opacity(0.9)
          .class("square")
          .id("test-square")
      )
      .moveTo([0.25, 0])
      .lineTo([0.25, 0.5])
      .lineTo([0.75, 0.5])
      .lineTo([0.75, 0])
      .close()
    const output = svg.image
    expect(output).toMatch(/.*svg.*/)
    expect(output).toMatch(/.*viewBox="0 0 1 0.5".*/)
    expect(output).toMatch(/.*0\.25 0.*/)
    expect(output).toMatchInlineSnapshot(
      `"<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 1 0.5\\" width=\\"200\\" height=\\"100\\"><path stroke=\\"hsla(220, 90%, 40%, 1)\\" opacity=\\"0.9\\" class=\\"square\\" id=\\"test-square\\" d=\\"M 0.25 0 L 0.25 0.5 L 0.75 0.5 L 0.75 0 Z\\" /></svg>"`
    )
  })

  it("Should be able to do a trivial SVG with a stroked square", () => {
    const svg = new SolandraSvg(300, 300)
    svg
      .strokedPath()
      .moveTo([0.25, 0.25])
      .lineTo([0.75, 0.25])
      .lineTo([0.75, 0.75])
      .lineTo([0.25, 0.75])
      .close()
    const output = svg.image
    expect(output).toMatch(/.*viewBox="0 0 1 1".*/)
    expect(output).toMatchInlineSnapshot(
      `"<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 1 1\\" width=\\"300\\" height=\\"300\\"><path fill=\\"none\\" stroke-width=\\"0.01\\" stroke=\\"hsla(0, 0%, 0%, 1)\\" d=\\"M 0.25 0.25 L 0.75 0.25 L 0.75 0.75 L 0.25 0.75 Z\\" /></svg>"`
    )
  })
})
