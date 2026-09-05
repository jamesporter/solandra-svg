import { describe, expect, it } from "vitest"
import { SolandraSvg } from "../svg"
import { RNG } from "../rng"

// The existing randomness tests check ranges, determinism and rough means.
// These check the shape of the distributions themselves: a generator that
// returned a constant, or one that was subtly biased towards one end of its
// range, would pass the former and fail here.
//
// Every sample below comes from a fixed seed, so the thresholds are checked
// against one specific sequence and cannot flake.

const SEED = 20260905
const SAMPLES = 20000

/** Asserts an observed proportion is within `tolerance` of the expected one. */
const expectProportion = (observed: number, expected: number, tolerance = 0.015) => {
  expect(
    Math.abs(observed - expected),
    `expected ${observed.toFixed(4)} to be within ${tolerance} of ${expected.toFixed(4)}`,
  ).toBeLessThan(tolerance)
}

/** Pearson's chi-squared statistic for observed counts against a uniform expectation. */
const chiSquared = (counts: number[]): number => {
  const expected = counts.reduce((a, b) => a + b, 0) / counts.length
  return counts.reduce((total, n) => total + (n - expected) ** 2 / expected, 0)
}

const drawing = () => new SolandraSvg(100, 100, SEED)

describe("uniform generators are unbiased", () => {
  it("random() fills all ten deciles evenly", () => {
    const s = drawing()
    const counts = new Array(10).fill(0)
    for (let i = 0; i < SAMPLES; i++) counts[Math.floor(s.random() * 10)]++

    // 9 degrees of freedom; the 0.999 critical value is 27.88.
    expect(chiSquared(counts)).toBeLessThan(27.88)
    expect(Math.min(...counts)).toBeGreaterThan(0)
  })

  it("uniformRandomInt covers its inclusive range evenly", () => {
    const s = drawing()
    const counts = new Array(6).fill(0)
    for (let i = 0; i < SAMPLES; i++) counts[s.uniformRandomInt({ from: 0, to: 5 })]++

    // 5 degrees of freedom; the 0.999 critical value is 20.52.
    expect(chiSquared(counts)).toBeLessThan(20.52)
  })

  it("randomAngle is spread around the whole circle", () => {
    const s = drawing()
    const counts = new Array(8).fill(0)
    for (let i = 0; i < SAMPLES; i++) {
      counts[Math.floor((s.randomAngle() / (Math.PI * 2)) * 8)]++
    }

    // 7 degrees of freedom; the 0.999 critical value is 24.32.
    expect(chiSquared(counts)).toBeLessThan(24.32)
  })

  it("randomPolarity is a fair coin", () => {
    const s = drawing()
    let positive = 0
    for (let i = 0; i < SAMPLES; i++) if (s.randomPolarity() === 1) positive++

    expectProportion(positive / SAMPLES, 0.5, 0.02)
  })

  it("randomPoint covers all four quadrants of a non-square drawing", () => {
    const s = new SolandraSvg(200, 100, SEED)
    const counts = new Array(4).fill(0)
    for (let i = 0; i < SAMPLES; i++) {
      const [x, y] = s.randomPoint()
      counts[(x > 0.5 ? 1 : 0) + (y > 0.25 ? 2 : 0)]++
    }

    expect(chiSquared(counts)).toBeLessThan(16.27) // 3 df, 0.999
  })
})

describe("gaussian follows the normal distribution", () => {
  const sample = (config?: { mean?: number; sd?: number }) => {
    const s = drawing()
    return Array.from({ length: SAMPLES }, () => s.gaussian(config))
  }

  it("puts the expected share of values within one, two and three sd", () => {
    const values = sample()
    const within = (k: number) => values.filter((n) => Math.abs(n) < k).length / SAMPLES

    expectProportion(within(1), 0.6827, 0.02)
    expectProportion(within(2), 0.9545, 0.01)
    expectProportion(within(3), 0.9973, 0.005)
  })

  it("is symmetric about its mean", () => {
    const values = sample({ mean: 5, sd: 2 })
    const above = values.filter((n) => n > 5).length / SAMPLES
    expectProportion(above, 0.5, 0.02)
  })

  it("scales its spread with sd and shifts with mean", () => {
    const spread = (config: { mean: number; sd: number }) => {
      const values = sample(config)
      const mean = values.reduce((a, b) => a + b, 0) / SAMPLES
      const variance =
        values.reduce((total, n) => total + (n - mean) ** 2, 0) / (SAMPLES - 1)
      return { mean, sd: Math.sqrt(variance) }
    }

    const narrow = spread({ mean: 0, sd: 1 })
    const wide = spread({ mean: 10, sd: 4 })

    expect(narrow.sd).toBeCloseTo(1, 1)
    expect(wide.sd).toBeCloseTo(4, 0)
    expect(wide.mean).toBeCloseTo(10, 1)
  })
})

describe("poisson follows the Poisson distribution", () => {
  it("has variance equal to its mean", () => {
    const s = drawing()
    const lambda = 4
    const values = Array.from({ length: SAMPLES }, () => s.poisson(lambda))
    const mean = values.reduce((a, b) => a + b, 0) / SAMPLES
    const variance =
      values.reduce((total, n) => total + (n - mean) ** 2, 0) / (SAMPLES - 1)

    expect(mean).toBeCloseTo(lambda, 1)
    // For a Poisson distribution the variance is also lambda.
    expect(variance).toBeGreaterThan(lambda * 0.9)
    expect(variance).toBeLessThan(lambda * 1.1)
  })

  it("matches the analytic probability of each small count", () => {
    const s = drawing()
    const lambda = 2
    const counts = new Array(6).fill(0)
    for (let i = 0; i < SAMPLES; i++) {
      const n = s.poisson(lambda)
      if (n < counts.length) counts[n]++
    }

    const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1))
    counts.forEach((count, k) => {
      const expected = (Math.exp(-lambda) * lambda ** k) / factorial(k)
      expectProportion(count / SAMPLES, expected)
    })
  })

  it("returns only non-negative integers", () => {
    const s = drawing()
    for (let i = 0; i < 1000; i++) {
      const n = s.poisson(3)
      expect(Number.isInteger(n)).toBe(true)
      expect(n).toBeGreaterThanOrEqual(0)
    }
  })
})

describe("shuffle and sample are unbiased", () => {
  it("shuffle reaches every permutation of a three-element array with roughly equal frequency", () => {
    const s = drawing()
    const counts: Record<string, number> = {}
    for (let i = 0; i < SAMPLES; i++) {
      const key = s.shuffle([0, 1, 2]).join("")
      counts[key] = (counts[key] ?? 0) + 1
    }

    expect(Object.keys(counts).sort()).toEqual([
      "012",
      "021",
      "102",
      "120",
      "201",
      "210",
    ])
    // 5 degrees of freedom; the 0.999 critical value is 20.52.
    expect(chiSquared(Object.values(counts))).toBeLessThan(20.52)
  })

  it("shuffle does not favour leaving elements in place", () => {
    const s = drawing()
    const size = 8
    let fixedPoints = 0
    for (let i = 0; i < SAMPLES; i++) {
      const shuffled = s.shuffle(Array.from({ length: size }, (_, k) => k))
      fixedPoints += shuffled.filter((value, index) => value === index).length
    }

    // A uniform permutation has exactly one fixed point on average.
    expect(fixedPoints / SAMPLES).toBeGreaterThan(0.9)
    expect(fixedPoints / SAMPLES).toBeLessThan(1.1)
  })

  it("sample picks each element about equally often", () => {
    const s = drawing()
    const source = ["a", "b", "c", "d", "e"]
    const counts: Record<string, number> = Object.fromEntries(source.map((k) => [k, 0]))
    for (let i = 0; i < SAMPLES; i++) counts[s.sample(source)]++

    expect(chiSquared(Object.values(counts))).toBeLessThan(18.47) // 4 df, 0.999
  })

  it("samples draws with replacement, so repeats are common", () => {
    const s = drawing()
    const drawn = s.samples(200, [0, 1, 2])
    expect(drawn).toHaveLength(200)
    expect(new Set(drawn).size).toBe(3)
  })
})

describe("perturb is an unbiased jitter", () => {
  it("has zero mean offset and stays within half the magnitude", () => {
    const s = drawing()
    const magnitude = 0.4
    let sumX = 0
    let sumY = 0

    for (let i = 0; i < SAMPLES; i++) {
      const [x, y] = s.perturb({ at: [0, 0], magnitude })
      expect(Math.abs(x)).toBeLessThanOrEqual(magnitude / 2)
      expect(Math.abs(y)).toBeLessThanOrEqual(magnitude / 2)
      sumX += x
      sumY += y
    }

    expect(Math.abs(sumX / SAMPLES)).toBeLessThan(0.005)
    expect(Math.abs(sumY / SAMPLES)).toBeLessThan(0.005)
  })
})

describe("doProportion fires at the requested rate", () => {
  it.each([0.1, 0.25, 0.5, 0.9])("runs about %d of the time", (p) => {
    const s = drawing()
    let runs = 0
    for (let i = 0; i < SAMPLES; i++) s.doProportion(p, () => runs++)

    expectProportion(runs / SAMPLES, p, 0.02)
  })
})

describe("proportionately respects its weights", () => {
  it("selects cases in proportion to their weight", () => {
    const s = drawing()
    const counts = { a: 0, b: 0, c: 0 }
    for (let i = 0; i < SAMPLES; i++) {
      s.proportionately<void>([
        [1, () => void counts.a++],
        [3, () => void counts.b++],
        [6, () => void counts.c++],
      ])
    }

    expectProportion(counts.a / SAMPLES, 0.1)
    expectProportion(counts.b / SAMPLES, 0.3)
    expectProportion(counts.c / SAMPLES, 0.6)
  })
})

describe("the underlying RNG has no short-range structure", () => {
  it("shows no correlation between consecutive values", () => {
    const rng = new RNG(SEED)
    const values = Array.from({ length: SAMPLES }, () => rng.number())

    let sum = 0
    for (let i = 1; i < values.length; i++) {
      sum += (values[i - 1] - 0.5) * (values[i] - 0.5)
    }
    // For independent uniforms this covariance tends to zero.
    expect(Math.abs(sum / (values.length - 1))).toBeLessThan(0.005)
  })

  it("does not repeat a value within a long run", () => {
    const rng = new RNG(SEED)
    const values = new Set<number>()
    for (let i = 0; i < SAMPLES; i++) values.add(rng.number())
    expect(values.size).toBe(SAMPLES)
  })
})
