import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 3: Dashed lines
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image018.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Dashed line: 0.02 dash, 0.01 gap
s.strokedPath((attr) => attr.strokeDasharray([0.02, 0.01]))
  .moveTo([0.1, 0.3]).lineTo([0.9, 0.3])
// Dotted line
s.strokedPath((attr) => attr.strokeDasharray([0.005, 0.005]))
  .moveTo([0.1, 0.5]).lineTo([0.9, 0.5])
// Complex pattern: long dash, short gap, short dash, short gap
s.strokedPath((attr) => attr.strokeDasharray([0.04, 0.01, 0.01, 0.01]))
  .moveTo([0.1, 0.7]).lineTo([0.9, 0.7])

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
