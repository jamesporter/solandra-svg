import { arrayOf } from "./collectionOps"

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

function padZeros(n: string | number, digits: number): string {
  const nAsString = n.toString()
  if (nAsString.length < digits) {
    const padding = arrayOf(digits - nAsString.length, () => "0").join()
    return padding + nAsString
  } else {
    return nAsString
  }
}

function toHexPart(n: number): string {
  return padZeros(
    Math.round(n * 255)
      .toString(16)
      .toUpperCase(),
    2
  )
}

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
