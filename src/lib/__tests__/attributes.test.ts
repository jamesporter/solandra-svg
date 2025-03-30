import { expect, it, describe } from "vitest"

import { Attributes } from "../attributes"

describe("Attributes", () => {
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
