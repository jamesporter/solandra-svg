export function FooterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 bg-gradient-to-r from-amber-100 to-rose-300">
      <div className="container mx-auto px-4 py-8 max-w-[800px]">
        {children}
      </div>
    </div>
  )
}
