import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 3: Line cap styles
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image016.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Butt (default) - flat end
s.strokedPath((attr) => attr.strokeWidth(0.02).strokeLinecap('butt'))
  .moveTo([0.2, 0.3]).lineTo([0.8, 0.3])
// Round - rounded end
s.strokedPath((attr) => attr.strokeWidth(0.02).strokeLinecap('round'))
  .moveTo([0.2, 0.5]).lineTo([0.8, 0.5])
// Square - extended flat end
s.strokedPath((attr) => attr.strokeWidth(0.02).strokeLinecap('square'))
  .moveTo([0.2, 0.7]).lineTo([0.8, 0.7])

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
