import { Route, Routes } from "react-router"
import { Home } from "./Home"
import One from "./one"
import Two from "./two"
import Three from "./three"
import Four from "./four"
import Card from "./card"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/one" element={<One />} />
      <Route path="/two" element={<Two />} />
      <Route path="/three" element={<Three />} />
      <Route path="/four" element={<Four />} />
      <Route path="/card" element={<Card />} />
    </Routes>
  )
}
