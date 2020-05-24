import Head from "next/head"
import { A4ishSketch, A4InkscapeSketch } from "../src/components/SVGSketch"
import { v, Point2D } from "../src/lib"
import Link from "next/link"
import PageWithTransition from "../src/components/PageWithTransition"
import { perlin2 } from "../src/lib/util/noise"
import { useState } from "react"

export default function Three() {
  return (
    <PageWithTransition>
      <Head>
        <title>Even more plots</title>
      </Head>
      <h1>Even more plots</h1>
      <p>
        <Link href="/">
          <a>Home</a>
        </Link>
      </p>

      <A4InkscapeSketch
        sketch={(s) => {
          const { bottom } = s.meta
        }}
      />
    </PageWithTransition>
  )
}
