/**
 * Converts a hue component to an RGB channel value.
 *
 * @param p - The first intermediate value from HSL conversion
 * @param q - The second intermediate value from HSL conversion
 * @param t - The hue offset (wrapped into the `[0, 1)` range)
 * @returns The RGB channel value in the range `[0, 1]`
 * @internal
 */
function hue2rgb(p: number, q: number, t: number): number {
  // hue is cyclic, so wrap any offset back into [0, 1)
  t -= Math.floor(t)
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

/**
 * Converts a floating-point color channel value `[0, 1]` to a two-character uppercase hex string.
 *
 * Values outside `[0, 1]` are clamped so the result is always valid hex.
 *
 * @param n - The channel value in the range `[0, 1]`
 * @returns A two-character hex string (e.g. `"FF"`)
 * @internal
 */
function toHexPart(n: number): string {
  const byte = Math.min(255, Math.max(0, Math.round(n * 255)))
  return byte.toString(16).toUpperCase().padStart(2, "0")
}

/**
 * Converts an HSL color to an RGB hex string.
 *
 * All input values should be normalised to the range `[0, 1]`. Hues outside that
 * range wrap around; saturation and lightness are clamped.
 *
 * @param h - Hue in `[0, 1]`
 * @param s - Saturation in `[0, 1]`
 * @param l - Lightness in `[0, 1]`
 * @returns An RGB hex string (e.g. `"#FF8800"`)
 */
export function hslToRgb(h: number, s: number, l: number): string {
  let r: number
  let g: number
  let b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return `#${toHexPart(r)}${toHexPart(g)}${toHexPart(b)}`
}
