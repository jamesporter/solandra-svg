import React from "react"
import { SolandraSvg } from "../lib/index"

export function SVGSketch({
  sketch,
  width,
  height,
  style = {},
  className,
}: {
  sketch: (sol: SolandraSvg) => void
  width: number
  height: number
  style?: any
  className?: string
}) {
  const svg = new SolandraSvg(width, height, 1)
  sketch(svg)
  const image = svg.image

  return (
    <img
      src={`data:image/svg+xml;utf8,${image}`}
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

export function A4ishSketch({
  sketch,
}: {
  sketch: (sol: SolandraSvg) => void
}) {
  return (
    <SVGSketch
      width={3508 / 4}
      height={2480 / 4}
      sketch={sketch}
      className="shadow"
    />
  )
}

export function A4InkscapeSketch({
  sketch,
}: {
  sketch: (sol: SolandraSvg) => void
}) {
  const svg = new SolandraSvg(297, 210, 1)
  sketch(svg)

  return (
    <img
      src={svg.UNSTABLE_imageSrcInkscapeReady}
      style={{
        width: 297 * 2,
        height: 210 * 2,
        maxWidth: "90%",
        display: "block",
        margin: "20px auto",
      }}
      className="shadow"
    />
  )
}
