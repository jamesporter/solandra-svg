import { expect, it, describe } from "vitest"
import { SolandraSvg } from "../svg"
import { Attributes } from "../attributes"

describe("A very simple SVG", () => {
  it("should be possible to instantiate and get meta", () => {
    const svg = new SolandraSvg(200, 100, 1)
    expect(svg.meta).toMatchInlineSnapshot(`
      {
        "aspectRatio": 2,
        "bottom": 0.5,
        "center": [
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
    expect(output).toMatchInlineSnapshot(`
      "<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 0.5" width="200" height="100">
        <path class="square" id="test-square" style="stroke:#0A47C2; opacity:0.9;" d="M 0.25 0 L 0.25 0.5 L 0.75 0.5 L 0.75 0 Z" />
      </svg>"
    `)
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
    expect(output).toMatchInlineSnapshot(`
      "<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" width="300" height="300">
        <path style="fill:none; stroke-width:0.005; stroke:#000000; stroke-opacity:1; stroke-linecap:round;" d="M 0.25 0.25 L 0.75 0.25 L 0.75 0.75 L 0.25 0.75 Z" />
      </svg>"
    `)
  })

  it("should be able to do a group", () => {
    const svg = new SolandraSvg(300, 300)
    svg.group(Attributes.stroked, () => {
      svg
        .path()
        .moveTo([0.25, 0.25])
        .lineTo([0.75, 0.25])
        .lineTo([0.75, 0.75])
        .lineTo([0.25, 0.75])
        .close()
    })
    const output = svg.image
    expect(output).toMatchInlineSnapshot(`
      "<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" width="300" height="300">
        <g style="fill:none; stroke-width:0.005; stroke:#000000;">
          <path d="M 0.25 0.25 L 0.75 0.25 L 0.75 0.75 L 0.25 0.75 Z" />
        </g>
      </svg>"
    `)
  })

  it("should be able to do nested groups", () => {
    const svg = new SolandraSvg(300, 300)
    svg.group(Attributes.stroked, () => {
      svg.group(Attributes.empty, () => {
        svg
          .path()
          .moveTo([0.25, 0.25])
          .lineTo([0.75, 0.25])
          .lineTo([0.75, 0.75])
          .lineTo([0.25, 0.75])
          .close()
      })
    })

    expect(svg.elements).toHaveLength(1)
    // @ts-ignore
    expect(svg.elements[0].children).toHaveLength(1)

    const output = svg.image
    expect(output).toMatchInlineSnapshot(`
      "<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" width="300" height="300">
        <g style="fill:none; stroke-width:0.005; stroke:#000000;">
          <g>
            <path d="M 0.25 0.25 L 0.75 0.25 L 0.75 0.75 L 0.25 0.75 Z" />
          </g>
        </g>
      </svg>"
    `)
  })

  it("should be able to do complicated nested groups and paths", () => {
    const svg = new SolandraSvg(300, 300)
    svg.path().rect([0, 0], 0.3, 0.4)
    svg.group(Attributes.stroked, () => {
      svg.path().rect([0, 0], 0.3, 0.4)
      svg.group(Attributes.empty, () => {
        svg
          .path()
          .moveTo([0.25, 0.25])
          .lineTo([0.75, 0.25])
          .lineTo([0.75, 0.75])
          .lineTo([0.25, 0.75])
          .close()
        svg.group(Attributes.stroked, () => {
          svg.path().rect([0, 0], 0.3, 0.4)
        })
        svg.path().rect([0, 0], 0.3, 0.4)
      })
    })

    expect(svg.image).toMatchInlineSnapshot(`
      "<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" width="300" height="300">
        <path d="M -0.15 -0.2 L 0.15 -0.2 L 0.15 0.2 L -0.15 0.2 L -0.15 -0.2" />
        <g style="fill:none; stroke-width:0.005; stroke:#000000;">
          <path d="M -0.15 -0.2 L 0.15 -0.2 L 0.15 0.2 L -0.15 0.2 L -0.15 -0.2" />
          <g>
            <path d="M 0.25 0.25 L 0.75 0.25 L 0.75 0.75 L 0.25 0.75 Z" />
            <g style="fill:none; stroke-width:0.005; stroke:#000000;">
              <path d="M -0.15 -0.2 L 0.15 -0.2 L 0.15 0.2 L -0.15 0.2 L -0.15 -0.2" />
            </g>
            <path d="M -0.15 -0.2 L 0.15 -0.2 L 0.15 0.2 L -0.15 0.2 L -0.15 -0.2" />
          </g>
        </g>
      </svg>"
    `)
  })
})
