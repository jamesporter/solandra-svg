import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 1: Simple diagonal line
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image001.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Create a canvas: width, height, optional seed for randomness
// Draw a simple line
s.strokedPath()
  .moveTo([0.1, 0.1])  // Start position [x, y]
  .lineTo([0.9, 0.9])  // End position
// Get the SVG output

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
