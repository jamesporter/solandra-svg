import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = join(__dirname, '..')
const bookDir = join(projectRoot, 'book')

function extractAllCodeBlocks(chapter: number): Array<{ index: number; code: string; preview: string }> {
  const chapterFile = join(
    bookDir,
    `Chapter${String(chapter).padStart(3, '0')}.md`
  )

  if (!existsSync(chapterFile)) {
    return []
  }

  const content = readFileSync(chapterFile, 'utf8')
  const codeBlockRegex = /```typescript\n([\s\S]*?)```/g
  const blocks: Array<{ index: number; code: string; preview: string }> = []
  let match
  let index = 0

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const code = match[1].trim()
    const lines = code.split('\n')
    const preview = lines.slice(0, 3).join('\n')
    blocks.push({ index, code, preview: preview + (lines.length > 3 ? '\n...' : '') })
    index++
  }

  return blocks
}

// List code blocks for chapters 1-8
for (let chapter = 1; chapter <= 8; chapter++) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`CHAPTER ${chapter}`)
  console.log('='.repeat(70))

  const blocks = extractAllCodeBlocks(chapter)

  console.log(`Total code blocks: ${blocks.length}\n`)

  blocks.forEach(({ index, preview }) => {
    console.log(`[${index}]:\n${preview}\n`)
  })
}
