/**
 * A tiny, dependency-free property-testing harness.
 *
 * Cases are drawn from the library's own seeded {@link RNG}, so every run is
 * reproducible: a failure reports the exact input, and re-running the suite
 * reproduces it without a recorded seed.
 */

import { RNG } from "../../rng.js"
import { Point2D } from "../../util/types.js"

/** The default seed for property runs. Fixed so the suite never flakes. */
export const DEFAULT_SEED = 20260905

/**
 * Checks that a property holds for many generated inputs.
 *
 * @param generate - Produces one input from the supplied generator
 * @param property - Asserts the property; throwing (or a failed expect) fails the run
 * @param options - Number of runs (default `200`) and the seed (default {@link DEFAULT_SEED})
 * @throws An error naming the run index and the offending input
 */
export function forAll<T>(
  generate: (rng: RNG) => T,
  property: (value: T) => void,
  options: { runs?: number; seed?: number } = {},
): void {
  const { runs = 200, seed = DEFAULT_SEED } = options
  const rng = new RNG(seed)

  for (let run = 0; run < runs; run++) {
    const value = generate(rng)
    try {
      property(value)
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : String(cause)
      throw new Error(
        `Property failed on run ${run} (seed ${seed}) with input ` +
          `${JSON.stringify(value)}:\n${reason}`,
      )
    }
  }
}

/** Draws a number uniformly from `[from, to)`. */
export const aNumber = (rng: RNG, from = -1000, to = 1000): number =>
  from + rng.number() * (to - from)

/** Draws a number uniformly from `[from, to)`, never within `epsilon` of zero. */
export const aNonZeroNumber = (rng: RNG, from = -1000, to = 1000): number => {
  const n = aNumber(rng, from, to)
  return Math.abs(n) < 1e-6 ? 1 : n
}

/** Draws an integer uniformly from `[from, to]`. */
export const anInteger = (rng: RNG, from: number, to: number): number =>
  from + rng.integer(to - from + 1)

/** Draws an angle uniformly from `[0, 2pi)`. */
export const anAngle = (rng: RNG): number => rng.number() * Math.PI * 2

/** Draws a point with both components uniformly from `[from, to)`. */
export const aPoint = (rng: RNG, from = -100, to = 100): Point2D => [
  aNumber(rng, from, to),
  aNumber(rng, from, to),
]

/** Draws a point that is not the origin, so it has a well-defined direction. */
export const aNonZeroPoint = (rng: RNG, from = -100, to = 100): Point2D => {
  const p = aPoint(rng, from, to)
  return Math.hypot(p[0], p[1]) < 1e-6 ? [1, 0] : p
}
