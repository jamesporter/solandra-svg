import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Chaiken smoothing comparison
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image057.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const original = s.strokedPath()
  .moveTo([0.2, 0.2])
  .lineTo([0.8, 0.2])
  .lineTo([0.8, 0.8])
  .lineTo([0.2, 0.8])
  .close()
// Light smoothing (1 iteration)
s.strokedPath((attr) => attr.stroke(0, 70, 50))
  .moveTo([0.2, 0.2])
  .lineTo([0.8, 0.2])
  .lineTo([0.8, 0.8])
  .lineTo([0.2, 0.8])
  .close()
  .chaiken(1)
// Heavy smoothing (6 iterations)
s.strokedPath((attr) => attr.stroke(240, 70, 50))
  .moveTo([0.2, 0.2])
  .lineTo([0.8, 0.2])
  .lineTo([0.8, 0.8])
  .lineTo([0.2, 0.8])
  .close()
  .chaiken(6)

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
