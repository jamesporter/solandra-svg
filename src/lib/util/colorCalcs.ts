/**
 * Color conversion utilities for HSL to RGB conversion
 */
import { arrayOf } from "./collectionOps"

/**
 * Converts hue to RGB component value (internal helper)
 * @param p - Lower RGB component
 * @param q - Upper RGB component
 * @param t - Normalized hue position
 * @returns RGB component value (0-1)
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
 * Pads a number or string with leading zeros
 * @param n - The number or string to pad
 * @param digits - Target number of digits
 * @returns Zero-padded string
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
 * Converts a 0-1 color component to a 2-digit hex string
 * @param n - Color component (0-1)
 * @returns Two-digit uppercase hex string
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
 * Converts HSL color values to RGB hex color string
 * @param h - Hue (0-1, where 1 represents 360 degrees)
 * @param s - Saturation (0-1)
 * @param l - Lightness (0-1)
 * @returns Hex color string in format #RRGGBB
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
