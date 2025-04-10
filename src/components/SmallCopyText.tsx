import { CopyIcon } from "lucide-react"
import { toast } from "sonner"

export function SmallCopyText({ text }: { text: string }) {
  return (
    <div className="flex flex-row gap-4 items-center bg-rose-200 p-2 rounded justify-between">
      <span className="font-mono text-sm text-zinc-700">{text}</span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(text)
          toast.success("Copied to clipboard")
        }}
        className="text-rose-600 hover:text-rose-700 cursor-pointer"
      >
        <CopyIcon />
      </button>
    </div>
  )
}
