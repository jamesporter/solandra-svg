import Head from "next/head"
import { useState, useEffect } from "react"

export default function Home() {
  const [time, setTime] = useState(0)
  useEffect(() => {
    let i = 0
    const iv = setInterval(() => {
      setTime(i++)
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <img
        src={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='200' height='200'><rect x='${time}' y='${time}' width='10' height='10' /></svg>`}
      />
    </div>
  )
}
