import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 2: Zigzag line
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image004.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Simple diagonal line
s.strokedPath()
  .moveTo([0.1, 0.1])
  .lineTo([0.9, 0.9])
// Multi-segment line (zigzag)
s.strokedPath()
  .moveTo([0.1, 0.5])
  .lineTo([0.3, 0.3])
  .lineTo([0.5, 0.7])
  .lineTo([0.7, 0.3])
  .lineTo([0.9, 0.5])

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
