import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"
import { Link } from "react-router"

const examples: {
  title: string
  to: string
  description: string
  new?: boolean
}[] = [
  {
    to: "/cut-and-fold",
    title: "Cut and Fold",
    description: "Building cut and fold desings",
    new: true,
  },
  {
    to: "/favicon",
    title: "Favicon",
    description: "A favicon for Solandra-SVG",
    new: true,
  },
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
    title: "Multi coloured plots",
    description: "Plots designed to use more than one colour",
  },
  {
    to: "/card",
    title: "Card",
    description: "Seasonal card example",
  },
]

export function NavMenu() {
  return (
    <div className="p-4 bg-gradient-to-r from-amber-100 to-rose-300">
      <NavigationMenu>
        <NavigationMenuList>
          <div>
            <Link
              to="/"
              className="font-semibold mr-4 text-rose-600 text-lg lg:text-xl"
            >
              Solandra-SVG
            </Link>
          </div>
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
                  <ListItem
                    key={item.title}
                    title={item.title}
                    to={item.to}
                    isNew={item.new}
                  >
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
      isNew,
      ...props
    }: {
      className?: string
      title: string
      children: string
      to: string
      isNew?: boolean
    },
    ref
  ) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref as any}
            to={to}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground relative",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none text-rose-700">
              {title}
              {isNew && (
                <div className="absolute top-2 right-2 bg-amber-600 text-amber-50 py-1 px-2 rounded-full">
                  New
                </div>
              )}
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
