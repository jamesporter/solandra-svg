import { useIsDark } from "@/hooks/useIsDark"
import { SolandraSvg } from "../lib/index"

/**
 * Sketches are rendered to an image at render time, so CSS can't restyle them
 * for dark mode: instead the current theme is passed in and the sketch can pick
 * its own colours.
 */
export type Sketch = (sol: SolandraSvg, isDark: boolean) => void

export function SVGSketch({
  sketch,
  width,
  height,
  style = {},
  className,
}: {
  sketch: Sketch
  width: number
  height: number
  style?: any
  className?: string
}) {
  const isDark = useIsDark()
  const svg = new SolandraSvg(width, height, 1)
  sketch(svg, isDark)
  return (
    <img
      src={svg.imageSrc(false)}
      style={{
        width,
        height,
        maxWidth: "90%",
        display: "block",
        margin: "20px auto",
        ...style,
      }}
      className={className}
    />
  )
}

export function A4ishSketch({ sketch }: { sketch: Sketch }) {
  return (
    <SVGSketch
      width={3508 / 4}
      height={2480 / 4}
      sketch={sketch}
      className="bg-white shadow"
    />
  )
}

export function A4InkscapeSketch({
  sketch,
  seed = 1,
}: {
  sketch: Sketch
  seed?: number
}) {
  const isDark = useIsDark()
  const svg = new SolandraSvg(297, 210, seed)
  sketch(svg, isDark)

  return (
    <img
      src={svg.UNSTABLE_imageSrcInkscapeReady()}
      style={{
        width: 297 * 2,
        height: 210 * 2,
        maxWidth: "90%",
        display: "block",
        margin: "20px auto",
      }}
      className="bg-white shadow"
    />
  )
}
