import { PageLayout } from "@/components/PageLayout"
import Source from "@/components/Source"
import { SVGSketch } from "@/components/SVGSketch"

export default function APIReference() {
  return (
    <PageLayout>
      <h1>API Reference</h1>
      <h2>Path</h2>
      <h3>Rectangles</h3>
      <Source
        code={`s.filledPath((a) => a.fill(210, 80, 50)).rect(s.meta.center, 0.5, 0.2)`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.filledPath((a) => a.fill(210, 80, 50)).rect(s.meta.center, 0.5, 0.2)
        }}
        className="bg-zinc-100"
      />
      <h3>Regular Polygon</h3>
      <Source code={`s.strokedPath().regularPolygon(s.meta.center, 5, 100)`} />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.strokedPath().regularPolygon(s.meta.center, 8, 0.2)
        }}
        className="bg-zinc-100"
      />
      <h3>Spiral</h3>
      <Source code={`s.strokedPath().spiral(s.meta.center, 0.1, 50)`} />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.strokedPath().spiral(s.meta.center, 0.1, 50)
        }}
        className="bg-zinc-100"
      />

      <h3>Chaiken</h3>
      <p>Cuts corners to smooth out (note does not apply to start point).</p>
      <Source
        code={`s.filledPath((a) => a.fill(210, 80, 50))
    .rect(s.meta.center, 0.5, 0.2)
    .chaiken(2)`}
      />
      <SVGSketch
        width={320}
        height={320}
        sketch={(s) => {
          s.filledPath((a) => a.fill(210, 80, 50))
            .rect(s.meta.center, 0.5, 0.2)
            .chaiken(2)
        }}
        className="bg-zinc-100"
      />
      <h2>Attributes</h2>
      <h2>Transforms</h2>
      <h2>(Pseudo)Randomness</h2>
    </PageLayout>
  )
}
