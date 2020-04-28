import React from "react"
import { motion } from "framer-motion"

export default function PageWithTransition({ children }: any) {
  return (
    <motion.div
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ height: "100vh", width: "100vw", overflow: "auto" }}
    >
      <div className="container">{children}</div>
    </motion.div>
  )
}
