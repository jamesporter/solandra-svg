import Head from "next/head"
import { useState, useEffect } from "react"
import { SVGSketch } from "../src/components/SVGSketch"

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SVGSketch
        width={480}
        height={480}
        sketch={(s) => {
          const path = s
            .strokedPath((attr) =>
              attr.stroke(220, 90, 30, 0.9).fill(20, 90, 80, 0.2)
            )
            .moveTo(s.randomPoint())
          s.times(25, () => {
            path.lineTo(s.randomPoint())
          })
        }}
      />
    </div>
  )
}
