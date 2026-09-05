/**
 * A dependency-free XML parser used to check that the SVG this library emits is
 * actually well-formed, rather than merely containing the substrings a test
 * expected. It is deliberately strict: anything a conforming XML parser would
 * reject (unbalanced or mis-nested tags, unquoted attribute values, a bare `<`
 * or `&` in text) throws here too.
 *
 * It supports the subset of XML the library can produce — elements, attributes,
 * text, comments and self-closing tags — and rejects everything else.
 */

/** A parsed XML element. */
export type XmlElement = {
  /** The element's tag name. */
  tag: string
  /** The element's attributes, in document order. */
  attributes: Record<string, string>
  /** Child elements (text is not represented as a node). */
  children: XmlElement[]
  /** The concatenated text content directly inside this element, trimmed. */
  text: string
}

const NAME_START = /[A-Za-z_:]/
const NAME_CHAR = /[A-Za-z0-9_:.-]/
const ENTITY = /^&(?:#[0-9]+|#x[0-9A-Fa-f]+|amp|lt|gt|quot|apos);/

class XmlParseError extends Error {
  constructor(message: string, source: string, at: number) {
    const line = source.slice(0, at).split("\n").length
    super(`${message} (at line ${line}, offset ${at})`)
    this.name = "XmlParseError"
  }
}

/**
 * Parses XML into a tree, throwing on anything malformed.
 *
 * @param source - The XML document
 * @returns The root element
 * @throws If the document is not well-formed, or has anything but one root element
 */
export function parseXml(source: string): XmlElement {
  let i = 0

  const fail = (message: string): never => {
    throw new XmlParseError(message, source, i)
  }

  const readName = (): string => {
    const start = i
    if (!NAME_START.test(source[i] ?? "")) fail("expected a tag or attribute name")
    while (i < source.length && NAME_CHAR.test(source[i])) i++
    return source.slice(start, i)
  }

  const skipWhitespace = () => {
    while (i < source.length && /\s/.test(source[i])) i++
  }

  /** Checks that free text (or an attribute value) only escapes what it must. */
  const checkCharacterData = (text: string, offset: number, context: string) => {
    for (let k = 0; k < text.length; k++) {
      if (text[k] === "<") {
        i = offset + k
        fail(`unescaped '<' in ${context} (use &lt;)`)
      }
      if (text[k] === "&" && !ENTITY.test(text.slice(k))) {
        i = offset + k
        fail(`unescaped or unknown entity in ${context} (use &amp;)`)
      }
    }
  }

  const readAttributes = (tag: string): Record<string, string> => {
    const attributes: Record<string, string> = {}
    while (true) {
      skipWhitespace()
      if (source[i] === ">" || source.startsWith("/>", i)) return attributes

      const name = readName()
      if (name in attributes) fail(`duplicate attribute '${name}' on <${tag}>`)
      if (source[i] !== "=") fail(`attribute '${name}' on <${tag}> has no value`)
      i++

      const quote = source[i]
      if (quote !== '"' && quote !== "'") {
        fail(`value of '${name}' on <${tag}> is not quoted`)
      }
      i++
      const valueStart = i
      const end = source.indexOf(quote, i)
      if (end === -1) fail(`unterminated value for '${name}' on <${tag}>`)
      const value = source.slice(valueStart, end)
      checkCharacterData(value, valueStart, `attribute '${name}' on <${tag}>`)
      i = end + 1
      attributes[name] = value
    }
  }

  const parseElement = (): XmlElement => {
    i++ // consume '<'
    const tag = readName()
    const attributes = readAttributes(tag)

    if (source.startsWith("/>", i)) {
      i += 2
      return { tag, attributes, children: [], text: "" }
    }
    if (source[i] !== ">") fail(`malformed opening tag <${tag}>`)
    i++

    const children: XmlElement[] = []
    let text = ""

    while (true) {
      if (i >= source.length) fail(`unclosed element <${tag}>`)

      if (source.startsWith("</", i)) {
        i += 2
        const closing = readName()
        if (closing !== tag) fail(`</${closing}> closes <${tag}>`)
        skipWhitespace()
        if (source[i] !== ">") fail(`malformed closing tag </${closing}>`)
        i++
        return { tag, attributes, children, text: text.trim() }
      }

      if (source.startsWith("<!--", i)) {
        const end = source.indexOf("-->", i + 4)
        if (end === -1) fail("unterminated comment")
        i = end + 3
        continue
      }

      if (source[i] === "<") {
        children.push(parseElement())
        continue
      }

      const next = source.indexOf("<", i)
      const chunk = source.slice(i, next === -1 ? source.length : next)
      checkCharacterData(chunk, i, `text content of <${tag}>`)
      text += chunk
      i += chunk.length
    }
  }

  skipWhitespace()
  if (source.startsWith("<?xml", i)) {
    const end = source.indexOf("?>", i)
    if (end === -1) fail("unterminated XML declaration")
    i = end + 2
    skipWhitespace()
  }
  if (source[i] !== "<") fail("expected a root element")

  const root = parseElement()

  skipWhitespace()
  if (i !== source.length) fail("unexpected content after the root element")

  return root
}

/**
 * Collects every element in the tree with the given tag name, depth first.
 *
 * @param element - The element to search (included in the results if it matches)
 * @param tag - The tag name to look for
 */
export function findAll(element: XmlElement, tag: string): XmlElement[] {
  const found = element.tag === tag ? [element] : []
  return found.concat(element.children.flatMap((c) => findAll(c, tag)))
}
