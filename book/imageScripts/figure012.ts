import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SolandraSvg } from '../../src/lib/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chapter 2: Spiral
const WIDTH = 800
const HEIGHT = 800
const SEED = 42
const OUTPUT_NAME = 'image012.svg'

const s = new SolandraSvg(WIDTH, HEIGHT, SEED)

const center = [0.5, 0.5]
const path = s.strokedPath()
const turns = 5
const steps = 200
path.moveTo(center)
for (let i = 0; i <= steps; i++) {
  const t = i / steps
  const angle = t * turns * Math.PI * 2
  const radius = t * 0.4
  const x = center[0] + Math.cos(angle) * radius
  const y = center[1] + Math.sin(angle) * radius
  path.lineTo([x, y])
}

const outputPath = join(__dirname, '../images', OUTPUT_NAME)
writeFileSync(outputPath, s.image, 'utf8')
console.log(`✓ Generated: ${OUTPUT_NAME}`)
