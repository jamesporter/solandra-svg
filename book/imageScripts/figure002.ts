import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 1: Random arcs pattern
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image002.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Draw 50 random arcs
s.times(50, () => {
  s.strokedPath()
    .moveTo(s.randomPoint())
    .arcTo(s.randomPoint())
})
// Export as SVG

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
