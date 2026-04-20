import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 2: Chained arcs
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image006.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Simple arc
s.strokedPath()
  .moveTo([0.1, 0.5])
  .arcTo([0.9, 0.5])  // Creates a smooth curve
// Chain multiple arcs
s.strokedPath()
  .moveTo([0.1, 0.1])
  .arcTo([0.5, 0.3])
  .arcTo([0.9, 0.1])
  .arcTo([0.5, 0.5])

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
