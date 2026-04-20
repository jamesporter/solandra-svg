import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 7: Iterative smoothing
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image067.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

// Create base angular shape
let currentPath = s.strokedPath((attr) =>
  attr.noFill().stroke(0, 0, 0, 1).strokeWidth(0.002)
)
  .moveTo([0.2, 0.2])
  .lineTo([0.8, 0.2])
  .lineTo([0.8, 0.8])
  .lineTo([0.2, 0.8])
  .close()
// Show progressive smoothing
s.times(6, (i) => {
  const smoothed = currentPath.chaiken(1)
  smoothed.clone((attr) =>
    attr.stroke(i * 60, 70, 50, 0.7 - i * 0.1).strokeWidth(0.001)
  )
  currentPath = smoothed
})

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
