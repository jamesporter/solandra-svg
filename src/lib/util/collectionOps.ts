/**
 * Generates consecutive pairs from an array.
 *
 * @param items - The source array
 * @returns An array of `[items[i], items[i+1]]` pairs. Returns an empty array if fewer than 2 items.
 *
 * @example
 * ```ts
 * pairWise([1, 2, 3, 4]) // [[1, 2], [2, 3], [3, 4]]
 * ```
 */
export function pairWise<T>(items: T[]): [T, T][] {
  if (items.length < 2) return []
  const res: [T, T][] = []
  for (let i = 0; i < items.length - 1; i++) {
    res.push([items[i], items[i + 1]])
  }
  return res
}

/**
 * Generates consecutive triplets from an array.
 *
 * When `looped` is `true`, additional triplets wrap around the array boundaries
 * to cover the start and end elements.
 *
 * @param items - The source array
 * @param looped - If `true`, adds wrap-around triplets at the boundaries
 * @returns An array of `[items[i], items[i+1], items[i+2]]` triplets. Returns an empty array if fewer than 3 items.
 */
export function tripleWise<T>(items: T[], looped?: boolean): [T, T, T][] {
  if (items.length < 3) return []
  const res: [T, T, T][] = []

  if (looped) res.push([items[items.length - 2], items[0], items[1]])
  for (let i = 0; i < items.length - 2; i++) {
    res.push([items[i], items[i + 1], items[i + 2]])
  }
  if (looped)
    res.push([items[items.length - 2], items[items.length - 1], items[1]])
  return res
}

/**
 * Zips two arrays together into pairs, stopping at the shorter array's length.
 *
 * @param items - The first array
 * @param other - The second array
 * @returns An array of `[items[i], other[i]]` pairs
 *
 * @example
 * ```ts
 * zip2([1, 2, 3], ["a", "b"]) // [[1, "a"], [2, "b"]]
 * ```
 */
export function zip2<T, S>(items: T[], other: S[]): [T, S][] {
  const res: [T, S][] = []
  for (let i = 0; i < items.length && i < other.length; i++) {
    res.push([items[i], other[i]])
  }
  return res
}

/**
 * Sums an array of numbers.
 *
 * @param numbers - The numbers to sum
 * @returns The total sum, or `0` for an empty array
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0)
}

/**
 * Creates an array of `n` elements, each initialized by calling `init`.
 *
 * @param n - The number of elements to create
 * @param init - A factory function called for each element
 * @returns An array of `n` elements produced by `init`
 *
 * @example
 * ```ts
 * arrayOf(3, () => Math.random()) // [0.123, 0.456, 0.789]
 * ```
 */
export function arrayOf<T>(n: number, init: () => T): T[] {
  return Array.from({ length: n }, (_) => init())
}

export default {
  pairWise,
  tripleWise,
  zip2,
  sum,
  arrayOf,
}
