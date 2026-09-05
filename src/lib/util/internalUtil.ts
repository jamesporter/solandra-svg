/**
 * Indents a line of text with spaces (2 spaces per indentation level).
 *
 * @param line - The text to indent
 * @param amount - The number of indentation levels
 * @returns The indented text string
 * @internal
 */
export function indent(line: string, amount: number) {
  return "  ".repeat(amount) + line
}

/**
 * Escapes a value for use inside a double-quoted XML attribute.
 *
 * Without this, a user-supplied `id` or `class` containing a quote or an
 * ampersand would produce markup no SVG renderer can parse.
 *
 * @param value - The raw attribute value
 * @returns The value with `&`, `<`, `>` and `"` replaced by entity references
 * @internal
 */
export function escapeAttribute(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
