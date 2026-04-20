import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 2: Triangle
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image005.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Triangle
s.strokedPath()
  .moveTo([0.5, 0.2])
  .lineTo([0.8, 0.8])
  .lineTo([0.2, 0.8])
  .close()  // Completes the triangle

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
