import { cn } from "@/lib/utils"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

const options = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
] as const

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="flex flex-row items-center gap-0.5 rounded-full bg-background/70 p-0.5 shadow-sm"
    >
      {options.map(({ value, label, Icon }) => {
        const selected = theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={`${label} theme`}
            onClick={() => setTheme(value)}
            className={cn(
              "rounded-full p-1.5 cursor-pointer transition-colors",
              "text-muted-foreground hover:text-foreground hover:bg-accent",
              "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              selected &&
                "bg-sky-600 text-sky-50 hover:bg-sky-600 hover:text-sky-50 dark:bg-sky-500 dark:text-sky-950"
            )}
          >
            <Icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}
