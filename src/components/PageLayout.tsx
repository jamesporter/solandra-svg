import { NavMenu } from "./NavMenu"

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavMenu />
      <div className="container mx-auto px-4 py-8 max-w-[800px]">
        {children}
      </div>
    </>
  )
}
