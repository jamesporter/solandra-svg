import { createRoot } from "react-dom/client"
import "./index.css"
import { BrowserRouter } from "react-router"
import { App } from "./pages/Routes"
import { Toaster } from "./components/ui/sonner"

createRoot(document.getElementById("root")!).render(
  <>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Toaster />
  </>
)
