import { createRoot } from "react-dom/client"
import "./index.css"
import { BrowserRouter } from "react-router"
import { ThemeProvider } from "next-themes"
import { App } from "./pages/Routes"
import { Toaster } from "./components/ui/sonner"

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    storageKey="solandra-theme"
    disableTransitionOnChange
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Toaster />
  </ThemeProvider>
)
