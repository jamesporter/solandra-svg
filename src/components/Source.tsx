import SyntaxHighlighter from "react-syntax-highlighter"

export default function Source({ code }: { code: string }) {
  return (
    <div className="sourceContainer">
      <SyntaxHighlighter language="typescript" useInlineStyles={false}>
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
