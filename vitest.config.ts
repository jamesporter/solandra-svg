import { defineConfig } from "vitest/config"
import path from "path"

// Library tests are plain TypeScript and need none of the app's Vite plugins
// (React, Tailwind), so they get their own config rather than inheriting
// vite.config.ts. That keeps the suite fast and independent of app tooling.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // The library is what ships; the demo app around it is not under test.
      include: ["src/lib/**"],
      exclude: [
        "src/lib/__tests__/**",
        // shadcn/ui class-name helper used by the demo app, not the library
        "src/lib/utils.ts",
      ],
      reporter: ["text", "html", "lcov"],
      // The library is fully covered; anything genuinely unreachable carries a
      // `v8 ignore` comment explaining why. A drop here means new code arrived
      // without tests.
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
