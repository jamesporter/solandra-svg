import { arrayOf } from "./collectionOps"

/**
 * Indent some text (2 spaces per level)
 *
 * @param line text
 * @param amount indentation depth
 */
export function indent(line: string, amount: number) {
  const padding = arrayOf(amount, () => "  ").join("")
  return padding + line
}
