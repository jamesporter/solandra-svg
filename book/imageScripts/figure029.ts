import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 4: Grid with random rotations
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image029.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const gridSize = 5
const spacing = 1 / gridSize
for (let x = 0; x < gridSize; x++) {
  for (let y = 0; y < gridSize; y++) {
    const posX = x * spacing + spacing / 2
    const posY = y * spacing + spacing / 2
    const rotation = s.random() * Math.PI * 2
    s.group((t) =>
      t
        .translate([posX, posY])
        .rotate(rotation),
      () => {
        s.strokedPath((attr) =>
          attr.fill((x + y) * 20, 70, 50)
        )
          .rect([-spacing * 0.3, -spacing * 0.3],
                [spacing * 0.3, spacing * 0.3])
      }
    )
  }
}

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
