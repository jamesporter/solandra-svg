import Head from "next/head"
import { A4ishSketch } from "../src/components/SVGSketch"
import { v, Point2D } from "../src/lib"
import Link from "next/link"
import PageWithTransition from "../src/components/PageWithTransition"

function One({ scale }: { scale: number }) {
  return (
    <A4ishSketch
      sketch={(s) => {
        const pts: Point2D[] = []

        const isTooClose = (pt: Point2D) => {
          for (let i = 0; i < pts.length; i++) {
            if (v.distance(pts[i], pt) < 0.22) return true
          }
          return false
        }

        s.times(12, (i) => {
          let pt = s.randomPoint()
          while (isTooClose(pt)) {
            pt = s.randomPoint()
          }
          pts.push(pt)

          const n = s.uniformRandomInt({ from: 6, to: 18 })
          const dA = (Math.PI * 2) / n
          const r = s.gaussian({ mean: 0.1, sd: 0.025 }) * scale

          const path = s.strokedPath((attr) => attr.lineCap("round"))

          path.moveTo(v.add(pt, [Math.cos(0) * r, Math.sin(0) * r]))
          for (let i = 1; i < n; i++) {
            const rA = r * s.gaussian({ mean: 1, sd: 0.2 })
            const a = dA * i
            path.lineTo(v.add(pt, [Math.cos(a) * rA, Math.sin(a) * rA]))
          }
          path.lineTo(v.add(pt, [Math.cos(0) * r, Math.sin(0) * r]))
          path.close()
        })
      }}
    />
  )
}

export default function Cutouts() {
  return (
    <PageWithTransition>
      <Head>
        <title>Cutouts</title>
      </Head>

      <h2>One</h2>
      <One scale={1} />
      <One scale={0.6} />
    </PageWithTransition>
  )
}
