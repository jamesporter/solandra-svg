import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 4: Transform order comparison
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image026.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Translate then rotate
s.group((t) => t.translate([0.3, 0]).rotate(Math.PI / 4), () => {
  s.strokedPath((attr) => attr.fill(0, 70, 50))
    .rect([0.2, 0.2], [0.4, 0.4])
})
// Rotate then translate (different result!)
s.group((t) => t.rotate(Math.PI / 4).translate([0.3, 0]), () => {
  s.strokedPath((attr) => attr.fill(240, 70, 50))
    .rect([0.2, 0.2], [0.4, 0.4])
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
