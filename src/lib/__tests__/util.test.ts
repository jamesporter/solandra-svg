import { describe, expect, it } from "vitest"

import { hslToRgb } from "../util/colorCalcs"
import {
  centroid,
  clamp,
  hexTransform,
  isoTransform,
  scaler,
  scaler2d,
  triTransform,
} from "../util/util"
import { indent } from "../util/internalUtil"

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

describe("Scalar utilities", () => {
  it("should clamp values to the provided range", () => {
    expect(clamp({ from: 0, to: 10 }, -5)).toBe(0)
    expect(clamp({ from: 0, to: 10 }, 20)).toBe(10)
    expect(clamp({ from: 0, to: 10 }, 5)).toBe(5)
  })

  it("should scale 1d values", () => {
    const scale = scaler({
      minDomain: 0,
      maxDomain: 10,
      minRange: 0,
      maxRange: 100,
    })

    expect(scale(5)).toBe(50)
  })

  it("should scale 2d points", () => {
    const scalePoint = scaler2d(
      { minDomain: 0, maxDomain: 10, minRange: 0, maxRange: 1 },
      { minDomain: -1, maxDomain: 1, minRange: -10, maxRange: 10 }
    )

    expect(scalePoint([5, 0])).toEqual([0.5, 0])
  })
})

describe("Geometric helpers", () => {
  it("should transform points into isometric space", () => {
    const iso = isoTransform(2)
    const [x, y] = iso([1, 0, 0])
    expect(x).toBeCloseTo(Math.sqrt(3), 10)
    expect(y).toBe(-1)
  })

  it("should compute centroids", () => {
    expect(() => centroid([])).toThrow("centroid must have at least one point")
    expect(centroid([[1, 2]])).toEqual([1, 2])

    const triangleCentroid = centroid([
      [0, 0],
      [2, 0],
      [1, 2],
    ])
    expect(triangleCentroid[0]).toBeCloseTo(1, 10)
    expect(triangleCentroid[1]).toBeCloseTo(2 / 3, 10)

    const closedSquare = centroid([
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 0],
    ])
    expect(closedSquare[0]).toBeCloseTo(4 / 3, 10)
    expect(closedSquare[1]).toBeCloseTo(2 / 3, 10)
  })

  it("should provide axial hex grid transforms", () => {
    const vertical = hexTransform({ r: 2 })
    expect(vertical([1, 0])[0]).toBeCloseTo(2 * Math.sqrt(3), 10)
    const [oddX, oddY] = vertical([1, 1])
    expect(oddX).toBeCloseTo(Math.sqrt(3), 10)
    expect(oddY).toBe(3)

    const horizontal = hexTransform({ r: 2, vertical: false })
    const [evenHX, evenHY] = horizontal([2, 1])
    expect(evenHX).toBe(6)
    expect(evenHY).toBeCloseTo(2 * Math.sqrt(3), 10)
    expect(horizontal([1, 1])[1]).toBeCloseTo(Math.sqrt(3), 10)
  })

  it("should provide triangular grid transforms", () => {
    const transform = triTransform({ s: 2 })

    const upright = transform([0, 0])
    expect(upright.at).toEqual([0, 0])
    expect(upright.flipped).toBe(false)

    const inverted = transform([1, 0])
    expect(inverted.flipped).toBe(true)
    expect(inverted.at[0]).toBe(1)
    expect(inverted.at[1]).toBeCloseTo(-Math.sqrt(3) / 3, 10)
  })
})

describe("Internal helpers", () => {
  it("should indent text using two spaces per level", () => {
    expect(indent("line", 2)).toBe("    line")
  })
})
