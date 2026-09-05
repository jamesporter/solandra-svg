/**
 * A strict parser for the `d` attribute of an SVG `<path>`, so tests can assert
 * on the shape of generated path data — and catch invalid commands, wrong
 * argument counts, or `NaN` coordinates — instead of comparing strings.
 */

import { Point2D } from "../../util/types.js"

/** One parsed path command with a single group of arguments. */
export type PathCommand = {
  /** The command letter, e.g. `"M"`, `"L"`, `"C"`, `"A"`, `"Z"`. */
  command: string
  /** The command's numeric arguments (empty for `Z`). */
  args: number[]
}

/** The number of arguments each SVG path command takes per group. */
const ARGUMENT_COUNTS: Record<string, number> = {
  M: 2,
  L: 2,
  H: 1,
  V: 1,
  C: 6,
  S: 4,
  Q: 4,
  T: 2,
  A: 7,
  Z: 0,
}

const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/

/**
 * Parses SVG path data into a flat list of commands.
 *
 * Repeated argument groups after one command letter are expanded into separate
 * commands (with implicit `M` -> `L` continuation, as the SVG spec requires).
 *
 * @param d - The `d` attribute value
 * @returns The parsed commands
 * @throws If the data contains an unknown command, the wrong number of
 *   arguments, a non-finite number, or an arc flag that is not `0` or `1`
 */
export function parsePathData(d: string): PathCommand[] {
  const commands: PathCommand[] = []
  let i = 0

  const fail = (message: string): never => {
    throw new Error(`Invalid path data: ${message} (offset ${i} of "${d}")`)
  }

  const skipSeparators = () => {
    while (i < d.length && /[\s,]/.test(d[i])) i++
  }

  const readNumber = (): number => {
    skipSeparators()
    const match = NUMBER.exec(d.slice(i))
    if (!match) fail("expected a number")
    i += match![0].length
    const value = Number(match![0])
    if (!Number.isFinite(value)) fail(`'${match![0]}' is not a finite number`)
    return value
  }

  skipSeparators()
  if (i >= d.length) fail("path data is empty")
  if (d[i]?.toUpperCase() !== "M") fail("path data must start with a moveto")

  while (true) {
    skipSeparators()
    if (i >= d.length) return commands

    const letter = d[i]
    if (!(letter.toUpperCase() in ARGUMENT_COUNTS)) {
      fail(`'${letter}' is not a path command`)
    }
    i++

    const arity = ARGUMENT_COUNTS[letter.toUpperCase()]
    if (arity === 0) {
      commands.push({ command: letter, args: [] })
      continue
    }

    // A command letter may be followed by several groups of arguments.
    let group = 0
    do {
      const args: number[] = []
      for (let k = 0; k < arity; k++) {
        const value = readNumber()
        // The arc large-arc-flag and sweep-flag are booleans on the wire.
        if (letter.toUpperCase() === "A" && (k === 3 || k === 4)) {
          if (value !== 0 && value !== 1) fail(`arc flag must be 0 or 1, got ${value}`)
        }
        args.push(value)
      }
      // Subsequent moveto argument groups are implicit linetos.
      const command =
        group > 0 && letter === "M" ? "L" : group > 0 && letter === "m" ? "l" : letter
      commands.push({ command, args })
      group++
      skipSeparators()
    } while (i < d.length && NUMBER.test(d.slice(i)))
  }
}

/**
 * Returns the on-path points a path visits, in order.
 *
 * Only absolute commands are supported, which is all this library emits.
 *
 * @param d - The `d` attribute value
 * @returns The endpoint of every drawing command
 * @throws If the data uses a relative command
 */
export function pathPoints(d: string): Point2D[] {
  const points: Point2D[] = []
  let current: Point2D = [0, 0]

  for (const { command, args } of parsePathData(d)) {
    if (command !== command.toUpperCase()) {
      throw new Error(`pathPoints only supports absolute commands, got '${command}'`)
    }
    switch (command) {
      case "Z":
        continue
      case "H":
        current = [args[0], current[1]]
        break
      case "V":
        current = [current[0], args[0]]
        break
      default:
        // Every other absolute command ends at its last coordinate pair.
        current = [args[args.length - 2], args[args.length - 1]]
    }
    points.push(current)
  }

  return points
}
