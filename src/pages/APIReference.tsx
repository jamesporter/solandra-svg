import { PageLayout } from "@/components/PageLayout"
import Source from "@/components/Source"
import { SVGSketch } from "@/components/SVGSketch"

export default function APIReference() {
  return (
    <PageLayout>
      <h1>API Reference</h1>

      <h2>SVG</h2>

      <p>The starting point; create an instance of this class.</p>
      <Source
        code={`import { SolandraSvg } from "solandra-svg"
        
const svg = new SolandraSvg(width, height, 1)`}
      />

      <p>Do some drawing (see below), then export with</p>
      <ul className="list-disc list-inside">
        <li>
          <span className="font-mono">image</span>: a SVG string
        </li>
        <li>
          <span className="font-mono">imageSrc</span>: a data URL
        </li>
      </ul>
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

      <h2>Iteration (across 'canvas')</h2>
      <p>
        Solandra SVG offers a number of helpers to iterate over the 'canvas'; so
        adding a margin, or tiling becomes trivially simple rather than another
        verbose, repetitive bit of code.
      </p>
      <h3>forMargin</h3>
      <h3>forTiling</h3>
      <h3>forHorizontal</h3>
      <h3>forVertical</h3>
      <h3>forGrid</h3>
      <h3>build</h3>
      <h3>aroundCircle</h3>
      <h3>range</h3>

      <h2>(Pseudo)Randomness</h2>

      <p>
        Quite a lot of the API of SolandraSVG is for pseudo-randomness. The
        library allows for pseudo-random generation in a bunch of different ways
        with an internal seed. You can set this when constructing the main
        object.
      </p>

      <h3>withRandomOrder</h3>
      <h3>doProportion</h3>
      <h3>proportionately</h3>
      <h3>randomPoint</h3>
      <h3>random</h3>
      <h3>randomAngle</h3>
      <h3>uniformRandomInt</h3>
      <h3>uniformGridPoint</h3>
      <h3>randomPolarity</h3>
      <h3>sample</h3>
      <h3>samples</h3>
      <h3>shuffle</h3>
      <h3>perturb</h3>
      <h3>gaussian</h3>
      <h3>poisson</h3>

      <h2>Utilities</h2>

      <p>Various helpers with a concise import</p>
      <Source
        code={`import { v, c } from "solandra-svg"

c.pairWise(...)
c.tripleWise(...)
c.zip2(...)
c.sum(...)
c.arrayOf(...)          

v.add(...)
v.subtract(...)
v.magnitude(...)
v.rotate(...)
v.normalise(...)
v.scale(...)
v.polarToCartesian(...)
v.pointAlong(...)
v.dot(...)
v.distance(...)
          `}
      />
    </PageLayout>
  )
}
