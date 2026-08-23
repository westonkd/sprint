import { useEffect, useState } from "react";
import { tokenize } from "../lib/highlight.ts";

export interface CodeBlockProps {
  code: string;
  caption?: string;
}

export function CodeBlock(props: CodeBlockProps) {
  const { code, caption } = props;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    void navigator.clipboard.writeText(code).then(() => setCopied(true));
  };

  return (
    <figure className="code">
      <div className="code-bar">
        <span className="code-caption">{caption ?? "tsx"}</span>
        <button type="button" className="code-copy" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>
          {tokenize(code).map((token, index) => (
            <span
              key={index}
              className={token.kind === "plain" ? undefined : `tok-${token.kind}`}
            >
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
