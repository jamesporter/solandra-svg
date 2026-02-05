import { arrayOf } from "./collectionOps"

/**
 * Indents a line of text with spaces (2 spaces per indentation level).
 *
 * @param line - The text to indent
 * @param amount - The number of indentation levels
 * @returns The indented text string
 * @internal
 */
export function indent(line: string, amount: number) {
  const padding = arrayOf(amount, () => "  ").join("")
  return padding + line
}
