import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 4: Grid with translation
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image024.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

for (let x = 0; x < 5; x++) {
  for (let y = 0; y < 5; y++) {
    s.group((t) => t.translate([x * 0.2, y * 0.2]), () => {
      s.strokedPath((attr) => attr.fill((x + y) * 20, 70, 50))
        .ellipse([0.1, 0.1], 0.08)
    })
  }
}

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
