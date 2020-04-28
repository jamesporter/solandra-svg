import App from "next/app"
import "../src/styles.css"
import { AnimatePresence } from "framer-motion"

export default class CustomApp extends App {
  render() {
    const { Component, pageProps, router } = this.props

    return (
      <AnimatePresence exitBeforeEnter>
        <Component {...pageProps} key={router.route} />
      </AnimatePresence>
    )
  }
}
