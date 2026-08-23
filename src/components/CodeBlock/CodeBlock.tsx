import { type ComponentPropsWithRef, useEffect, useState } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { tokenize } from "./highlight.ts";
import { codeBlockMeta } from "./meta.ts";
import "./CodeBlock.css";

const COPIED_FOR = 1200;

export type CodeLanguage = "tsx" | "json" | "bash" | "text";

export interface CodeBlockProps extends ComponentPropsWithRef<"figure"> {
  code: string;
  caption?: string;
  language?: CodeLanguage;
  copyLabel?: string;
}

export function CodeBlock(props: CodeBlockProps) {
  const { code, caption, language = "tsx", copyLabel = "Copy", ...rest } = props;

  const view = useSprintView();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_FOR);
    return () => clearTimeout(timer);
  }, [copied]);

  const label = caption ?? language;
  const control = copied ? "Copied" : copyLabel;

  const node = buildAgentNode({
    component: codeBlockMeta.name,
    label,
    state: {
      language,
      lines: String(code.split("\n").length),
      copied,
    },
    parts: [
      { part: "copy", label: control, state: {} },
      { part: "code", label: code, state: {} },
    ],
  });

  if (view === "agent") return <AgentLine node={node} />;

  const copy = () => {
    const clipboard = navigator.clipboard;
    if (clipboard === undefined) return;
    clipboard.writeText(code).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  return (
    <figure {...rest} {...agentAttributesFor(node)} aria-label={label}>
      <header>
        <span>{label}</span>
        <button
          type="button"
          aria-live="polite"
          {...agentPartAttributesFor({ part: "copy", state: {} })}
          onClick={copy}
        >
          {control}
        </button>
      </header>
      <pre {...agentPartAttributesFor({ part: "code", state: {} })}>
        <code>
          {tokenize(code).map((token, index) => (
            <span
              key={`${index}-${token.text}`}
              data-sprint-token={token.kind === "plain" ? undefined : token.kind}
            >
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
