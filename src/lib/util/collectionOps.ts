/**
 * Creates pairs of consecutive elements from an array
 * @param items - The array to process
 * @returns Array of [element, next element] tuples
 * @example pairWise([1, 2, 3]) // [[1, 2], [2, 3]]
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
 * Creates triples of consecutive elements from an array
 * @param items - The array to process
 * @param looped - Whether to wrap around at the end (default: false)
 * @returns Array of [element, next, next+1] tuples
 * @example tripleWise([1, 2, 3, 4]) // [[1, 2, 3], [2, 3, 4]]
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
 * Zips two arrays together into pairs
 * @param items - First array
 * @param other - Second array
 * @returns Array of [T, S] tuples up to the length of the shorter array
 * @example zip2([1, 2], ['a', 'b']) // [[1, 'a'], [2, 'b']]
 */
export function zip2<T, S>(items: T[], other: S[]): [T, S][] {
  const res: [T, S][] = []
  for (let i = 0; i < items.length && i < other.length; i++) {
    res.push([items[i], other[i]])
  }
  return res
}

/**
 * Sums all numbers in an array
 * @param numbers - Array of numbers to sum
 * @returns The sum of all numbers
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0)
}

/**
 * Creates an array of size n by calling an initializer function n times
 * @param n - Size of the array to create
 * @param init - Function that returns a new value for each element
 * @returns Array of n elements
 * @example arrayOf(3, () => Math.random()) // [0.1, 0.5, 0.9]
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
