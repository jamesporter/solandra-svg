import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"
import { Link } from "react-router"

const examples: { title: string; to: string; description: string }[] = [
  {
    to: "/one",
    title: "First Set for Plotter",
    description: "First set of prints for the plotter",
  },
  {
    to: "/two",
    title: "Second Set for Plotter",
    description: "Second set of prints for the plotter",
  },
  {
    to: "/three",
    title: "Third Set for Plotter",
    description: "Third set of prints for the plotter",
  },
  {
    to: "/four",
    title: "Fourth Set for Plotter",
    description: "Fourth set of prints for the plotter",
  },
  {
    to: "/card",
    title: "Card",
    description: "Seasonal card example",
  },
]

export function NavMenu() {
  return (
    <div className="p-4 bg-gradient-to-r from-rose-100 to-rose-300">
      <NavigationMenu>
        <NavigationMenuList>
          <div className="font-semibold mr-4 text-rose-600">Solandra-SVG</div>
          <NavigationMenuItem>
            <Link to="/">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Introduction
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Examples</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {examples.map((item) => (
                  <ListItem key={item.title} title={item.title} to={item.to}>
                    {item.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem className="hidden md:block">
            <a
              href="https://github.com/jamesporter/solandra-svg"
              target="_blank"
            >
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                GitHub
              </NavigationMenuLink>
            </a>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

const ListItem = forwardRef(
  (
    {
      className,
      title,
      to,
      children,
      ...props
    }: { className?: string; title: string; children: string; to: string },
    ref
  ) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref as any}
            to={to}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none text-rose-700">
              {title}
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </Link>
        </NavigationMenuLink>
      </li>
    )
  }
)
ListItem.displayName = "ListItem"
