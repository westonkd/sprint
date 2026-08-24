import { type ComponentPropsWithRef, useEffect, useState } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { secretFieldMeta } from "./meta.ts";
import "./SecretField.css";

const MASK = "••••••••••••";
const COPIED_FOR = 1200;

export interface SecretFieldProps extends ComponentPropsWithRef<"div"> {
  label: string;
  value: string;
  hint?: string;
  defaultRevealed?: boolean;
}

export function SecretField(props: SecretFieldProps) {
  const { label, value, hint, defaultRevealed = false, ...rest } = props;

  const view = useSprintView();
  const [revealed, setRevealed] = useState(defaultRevealed);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_FOR);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    const clipboard = navigator.clipboard;
    if (clipboard === undefined) return;
    clipboard.writeText(value).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  const filled = value !== "";

  const parts: AgentPart[] =
    hint === undefined ? [] : [{ part: "hint", label: hint, state: {} }];

  const node = buildAgentNode({
    component: secretFieldMeta.name,
    label,
    state: { filled, revealed },
    parts,
  });

  if (view === "agent") return <AgentLine node={node} />;

  return (
    <div {...rest} {...agentAttributesFor(node)}>
      <span {...agentPartAttributesFor({ part: "label", state: {} })}>{label}</span>
      <div {...agentPartAttributesFor({ part: "control", state: {} })}>
        <output
          {...agentPartAttributesFor({ part: "value", state: {} })}
          aria-label={revealed ? undefined : "Hidden secret"}
        >
          {revealed ? value : MASK}
        </output>
        <button
          {...agentPartAttributesFor({ part: "reveal", state: {} })}
          type="button"
          aria-pressed={revealed}
          onClick={() => setRevealed((current) => !current)}
        >
          {revealed ? "Hide" : "Reveal"}
        </button>
        <button
          {...agentPartAttributesFor({
            part: "copy",
            state: copied ? { copied: true } : {},
          })}
          type="button"
          onClick={copy}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {hint === undefined ? null : (
        <p {...agentPartAttributesFor({ part: "hint", state: {} })}>{hint}</p>
      )}
    </div>
  );
}
