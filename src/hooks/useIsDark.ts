import { useSyncExternalStore } from "react"

/**
 * Whether dark mode is currently active, tracked from the `dark` class that the
 * theme provider (and the inline script in index.html, which runs before first
 * paint) puts on the document element.
 *
 * Sketches are rendered to an image, so CSS can't restyle them: they need the
 * value to pick their own colours.
 */
export function useIsDark(): boolean {
  return useSyncExternalStore(subscribe, isDarkNow, () => false)
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
  return () => observer.disconnect()
}

function isDarkNow(): boolean {
  return document.documentElement.classList.contains("dark")
}
