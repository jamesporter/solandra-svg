import { hslToRgb } from "../util/colorCalcs"

describe("Colour calc", () => {
  it("should be able to do an hsl to rgb conversion", () => {
    expect(hslToRgb(0, 0, 0)).toBe("#000000")

    // R, G, B
    expect(hslToRgb(0, 1, 0.5)).toBe("#FF0000")
    expect(hslToRgb(0.3333, 1, 0.5)).toBe("#00FF00")
    expect(hslToRgb(0.66667, 1, 0.5)).toBe("#0000FF")

    expect(hslToRgb(0, 0, 1)).toBe("#FFFFFF")
  })
})
