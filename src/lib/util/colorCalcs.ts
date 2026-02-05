import { arrayOf } from "./collectionOps"

/**
 * Converts a hue component to an RGB channel value.
 *
 * @param p - The first intermediate value from HSL conversion
 * @param q - The second intermediate value from HSL conversion
 * @param t - The hue offset (adjusted to `[0, 1]` range)
 * @returns The RGB channel value in the range `[0, 1]`
 * @internal
 */
function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

/**
 * Left-pads a string with zeros to reach the desired number of digits.
 *
 * @param n - The value to pad
 * @param digits - The minimum number of digits
 * @returns The zero-padded string
 * @internal
 */
function padZeros(n: string | number, digits: number): string {
  const nAsString = n.toString()
  if (nAsString.length < digits) {
    const padding = arrayOf(digits - nAsString.length, () => "0").join()
    return padding + nAsString
  } else {
    return nAsString
  }
}

/**
 * Converts a floating-point color channel value `[0, 1]` to a two-character uppercase hex string.
 *
 * @param n - The channel value in the range `[0, 1]`
 * @returns A two-character hex string (e.g. `"FF"`)
 * @internal
 */
function toHexPart(n: number): string {
  return padZeros(
    Math.round(n * 255)
      .toString(16)
      .toUpperCase(),
    2
  )
}

/**
 * Converts an HSL color to an RGB hex string.
 *
 * All input values should be normalised to the range `[0, 1]`.
 *
 * @param h - Hue in `[0, 1]`
 * @param s - Saturation in `[0, 1]`
 * @param l - Lightness in `[0, 1]`
 * @returns An RGB hex string (e.g. `"#FF8800"`)
 */
export function hslToRgb(h: number, s: number, l: number): string {
  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s
    var p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return `#${toHexPart(r)}${toHexPart(g)}${toHexPart(b)}`
}
