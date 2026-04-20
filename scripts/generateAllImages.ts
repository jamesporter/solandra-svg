import { exec } from 'child_process'
import { promisify } from 'util'
import { readdirSync, existsSync, statSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = join(__dirname, '..')
const imageScriptsDir = join(projectRoot, 'book', 'imageScripts')
const imagesDir = join(projectRoot, 'book', 'images')

// Ensure images directory exists
if (!existsSync(imagesDir)) {
  mkdirSync(imagesDir, { recursive: true })
}

interface ExecutionResult {
  figure: string
  success: boolean
  error?: string
  duration?: number
}

/**
 * Execute a single figure script
 */
async function executeFigureScript(
  scriptPath: string,
  figureNum: string
): Promise<ExecutionResult> {
  const startTime = Date.now()

  try {
    await execAsync(`tsx "${scriptPath}"`, {
      cwd: projectRoot,
      timeout: 30000, // 30 second timeout per script
    })

    const duration = Date.now() - startTime

    return {
      figure: figureNum,
      success: true,
      duration,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    return {
      figure: figureNum,
      success: false,
      error: errorMessage,
      duration,
    }
  }
}

/**
 * Execute scripts in parallel batches
 */
async function executeBatch(
  scripts: Array<{ path: string; figure: string }>,
  batchSize: number = 10
): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = []

  for (let i = 0; i < scripts.length; i += batchSize) {
    const batch = scripts.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(scripts.length / batchSize)

    console.log(
      `\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} scripts)...`
    )

    const batchResults = await Promise.allSettled(
      batch.map(({ path, figure }) => executeFigureScript(path, figure))
    )

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j]
      const { figure } = batch[j]
      const overallIndex = i + j + 1

      if (result.status === 'fulfilled') {
        const execResult = result.value
        if (execResult.success) {
          console.log(
            `  ✓ [${overallIndex}/${scripts.length}] image${figure}.svg (${execResult.duration}ms)`
          )
        } else {
          console.error(
            `  ✗ [${overallIndex}/${scripts.length}] image${figure}.svg - ${execResult.error}`
          )
        }
        results.push(execResult)
      } else {
        console.error(
          `  ✗ [${overallIndex}/${scripts.length}] image${figure}.svg - Promise rejected: ${result.reason}`
        )
        results.push({
          figure,
          success: false,
          error: String(result.reason),
        })
      }
    }
  }

  return results
}

/**
 * Validate generated SVG files
 */
function validateGeneratedImages(results: ExecutionResult[]): {
  missingFiles: string[]
  invalidFiles: string[]
  validFiles: string[]
} {
  const missingFiles: string[] = []
  const invalidFiles: string[] = []
  const validFiles: string[] = []

  for (const result of results) {
    if (!result.success) continue

    const imagePath = join(imagesDir, `image${result.figure}.svg`)

    if (!existsSync(imagePath)) {
      missingFiles.push(result.figure)
      continue
    }

    const stats = statSync(imagePath)

    // Check file size is reasonable (100 bytes - 5MB)
    if (stats.size < 100) {
      invalidFiles.push(`${result.figure} (too small: ${stats.size} bytes)`)
      continue
    }

    if (stats.size > 5_000_000) {
      invalidFiles.push(
        `${result.figure} (too large: ${Math.round(stats.size / 1024)}KB)`
      )
      continue
    }

    validFiles.push(result.figure)
  }

  return { missingFiles, invalidFiles, validFiles }
}

/**
 * Main build function
 */
async function buildAllImages() {
  console.log('🎨 Building book images...\n')

  // Get all figure scripts
  if (!existsSync(imageScriptsDir)) {
    console.error(`❌ Error: imageScripts directory not found: ${imageScriptsDir}`)
    console.error(
      '\nPlease run: pnpm book:generate-scripts (or npm run book:generate-scripts)'
    )
    process.exit(1)
  }

  const allFiles = readdirSync(imageScriptsDir)
  const figureScripts = allFiles
    .filter((file) => file.startsWith('figure') && file.endsWith('.ts'))
    .sort()

  if (figureScripts.length === 0) {
    console.error(`❌ Error: No figure scripts found in ${imageScriptsDir}`)
    console.error(
      '\nPlease run: pnpm book:generate-scripts (or npm run book:generate-scripts)'
    )
    process.exit(1)
  }

  console.log(`📁 Found ${figureScripts.length} figure scripts`)

  // Prepare script list
  const scripts = figureScripts.map((file) => {
    const figure = file.replace('figure', '').replace('.ts', '')
    return {
      path: join(imageScriptsDir, file),
      figure,
    }
  })

  // Execute in batches
  const startTime = Date.now()
  const results = await executeBatch(scripts, 10)
  const totalDuration = Date.now() - startTime

  // Count successes and failures
  const successCount = results.filter((r) => r.success).length
  const errorCount = results.filter((r) => !r.success).length

  console.log(`\n${'='.repeat(60)}`)
  console.log(`📊 Execution Summary:`)
  console.log(`   ✓ Success: ${successCount}`)
  console.log(`   ✗ Errors:  ${errorCount}`)
  console.log(`   ⏱  Duration: ${(totalDuration / 1000).toFixed(2)}s`)
  console.log(`${'='.repeat(60)}`)

  // Validate generated files
  console.log('\n🔍 Validating generated SVG files...')
  const validation = validateGeneratedImages(results)

  if (validation.validFiles.length > 0) {
    console.log(`   ✓ Valid files: ${validation.validFiles.length}`)
  }

  if (validation.missingFiles.length > 0) {
    console.error(`   ⚠ Missing files: ${validation.missingFiles.length}`)
    console.error(`     - ${validation.missingFiles.join(', ')}`)
  }

  if (validation.invalidFiles.length > 0) {
    console.error(`   ⚠ Invalid files: ${validation.invalidFiles.length}`)
    validation.invalidFiles.forEach((file) => {
      console.error(`     - ${file}`)
    })
  }

  // Final result
  const hasErrors =
    errorCount > 0 ||
    validation.missingFiles.length > 0 ||
    validation.invalidFiles.length > 0

  if (hasErrors) {
    console.log('\n❌ Build completed with errors')
    const errors = results.filter((r) => !r.success)
    if (errors.length > 0) {
      console.log('\n📋 Error details:')
      errors.forEach(({ figure, error }) => {
        console.log(`   - figure${figure}.ts: ${error}`)
      })
    }
    process.exit(1)
  } else {
    console.log('\n✅ All images generated successfully!')
    process.exit(0)
  }
}

// Run the build
buildAllImages()
