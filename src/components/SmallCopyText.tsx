import { CopyIcon } from "lucide-react"
import { toast } from "sonner"

export function SmallCopyText({ text }: { text: string }) {
  return (
    <div className="flex flex-row gap-4 items-center bg-sky-200 p-2 rounded justify-between">
      <span className="font-mono text-sm text-zinc-700">{text}</span>
      <button
        onClick={() => {
          void navigator.clipboard.writeText(text)
          toast.success("Copied to clipboard")
        }}
        className="text-sky-600 hover:text-sky-700 cursor-pointer"
      >
        <CopyIcon />
      </button>
    </div>
  )
}
