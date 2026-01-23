import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Displacement with map()
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image062.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

s.strokedPath()
  .rect([0.2, 0.2], [0.8, 0.8])
  .map((segment) => {
    // Displace each point randomly
    return {
      ...segment,
      to: s.perturb(segment.to, 0.05)
    }
  })

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
