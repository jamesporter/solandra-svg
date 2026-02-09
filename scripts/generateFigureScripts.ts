import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { figureMapping } from './figureMapping.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = join(__dirname, '..')
const bookDir = join(projectRoot, 'book')
const imageScriptsDir = join(bookDir, 'imageScripts')

// Ensure the imageScripts directory exists
if (!existsSync(imageScriptsDir)) {
  mkdirSync(imageScriptsDir, { recursive: true })
}

interface CodeExtraction {
  code: string
  needsPerlin2: boolean
  needsV: boolean
  needsC: boolean
  needsPoint2D: boolean
}

/**
 * Extract all TypeScript code blocks from a chapter markdown file
 */
function extractAllCodeBlocks(chapter: number): string[] {
  const chapterFile = join(
    bookDir,
    `Chapter${String(chapter).padStart(3, '0')}.md`
  )

  if (!existsSync(chapterFile)) {
    throw new Error(`Chapter file not found: ${chapterFile}`)
  }

  const content = readFileSync(chapterFile, 'utf8')
  const codeBlockRegex = /```typescript\n([\s\S]*?)```/g
  const blocks: string[] = []
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push(match[1].trim())
  }

  return blocks
}

/**
 * Transform code by removing setup/export lines and detecting imports
 */
function transformCode(code: string): CodeExtraction {
  const lines = code.split('\n')
  const transformedLines: string[] = []

  // Patterns to remove
  const removePatterns = [
    /^import\s+.*from\s+['"]solandra-svg['"]/,
    /^import\s+.*from\s+['"]fs['"]/,
    /^import\s+.*from\s+['"]path['"]/,
    /^const\s+s\s*=\s*new\s+SolandraSvg\s*\(/,
    /^const\s+svg\s*=\s*s\.image/,
    /^console\.log\(svg\)/,
    /^console\.log\(s\.image\)/,
  ]

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Skip empty lines and lines matching remove patterns
    if (!trimmedLine) continue

    let shouldRemove = false
    for (const pattern of removePatterns) {
      if (pattern.test(trimmedLine)) {
        shouldRemove = true
        break
      }
    }

    if (!shouldRemove) {
      transformedLines.push(line)
    }
  }

  const transformedCode = transformedLines.join('\n').trim()

  // Detect needed imports
  const needsPerlin2 = /perlin2\(/.test(transformedCode)
  const needsV = /\bv\./.test(transformedCode)
  const needsC = /\bc\./.test(transformedCode)
  const needsPoint2D = /Point2D/.test(transformedCode)

  return {
    code: transformedCode,
    needsPerlin2,
    needsV,
    needsC,
    needsPoint2D,
  }
}

/**
 * Generate imports based on code requirements
 */
function generateImports(extraction: CodeExtraction): string {
  const imports: string[] = []

  // Base imports always needed
  imports.push(`import { writeFileSync } from 'fs'`)
  imports.push(`import { join, dirname } from 'path'`)
  imports.push(`import { fileURLToPath } from 'url'`)

  // SolandraSvg and additional utilities
  // Import from local source (../../src/lib/index.js for ESM)
  const solandraImports: string[] = ['SolandraSvg']

  if (extraction.needsPerlin2) solandraImports.push('perlin2')
  if (extraction.needsV) solandraImports.push('v')
  if (extraction.needsC) solandraImports.push('c')

  imports.push(`import { ${solandraImports.join(', ')} } from '../../src/lib/index.js'`)

  // Type imports if needed
  if (extraction.needsPoint2D) {
    imports.push(`import type { Point2D } from '../../src/lib/index.js'`)
  }

  return imports.join('\n')
}

/**
 * Generate a complete figure script
 */
function generateScript(
  figureNum: string,
  chapter: number,
  description: string,
  code: string
): string {
  const extraction = transformCode(code)
  const imports = generateImports(extraction)

  const script = `${imports}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter ${chapter}: ${description}
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image${figureNum}.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

${extraction.code}

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(\`✓ Generated: \${OUTPUT_NAME}\`)
`

  return script
}

/**
 * Main generation function
 */
function generateAllFigureScripts() {
  console.log('🎨 Generating book figure scripts...\n')

  let successCount = 0
  let errorCount = 0
  const errors: Array<{ figure: string; error: string }> = []

  for (const mapping of figureMapping) {
    try {
      // Extract all code blocks from the chapter
      const codeBlocks = extractAllCodeBlocks(mapping.chapter)

      if (codeBlocks.length === 0) {
        throw new Error('No TypeScript code blocks found in chapter')
      }

      if (mapping.codeBlockIndex >= codeBlocks.length) {
        throw new Error(
          `Code block index ${mapping.codeBlockIndex} out of range (chapter has ${codeBlocks.length} blocks)`
        )
      }

      // Get the specific code block by index
      const code = codeBlocks[mapping.codeBlockIndex]

      // Generate the complete script
      const script = generateScript(
        mapping.figure,
        mapping.chapter,
        mapping.description,
        code
      )

      // Write to file
      const outputPath = join(imageScriptsDir, `figure${mapping.figure}.ts`)
      writeFileSync(outputPath, script, 'utf8')

      console.log(
        `✓ [${successCount + 1}/${figureMapping.length}] figure${mapping.figure}.ts - ${mapping.description}`
      )
      successCount++
    } catch (error) {
      errorCount++
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      errors.push({ figure: mapping.figure, error: errorMessage })
      console.error(
        `✗ [${successCount + errorCount}/${figureMapping.length}] figure${mapping.figure}.ts - ${errorMessage}`
      )
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`)
  console.log(`📊 Generation Summary:`)
  console.log(`   ✓ Success: ${successCount}`)
  console.log(`   ✗ Errors:  ${errorCount}`)
  console.log(`${'='.repeat(60)}`)

  if (errors.length > 0) {
    console.log('\n❌ Failed figures:')
    errors.forEach(({ figure, error }) => {
      console.log(`   - figure${figure}.ts: ${error}`)
    })
    process.exit(1)
  } else {
    console.log('\n✅ All figure scripts generated successfully!')
    process.exit(0)
  }
}

// Run the generator
generateAllFigureScripts()
