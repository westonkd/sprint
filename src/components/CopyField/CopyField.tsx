import { type ComponentPropsWithRef, useEffect, useId, useRef, useState } from "react";
import { AgentControlGroup, AgentLine } from "@/agent/view/AgentText.tsx";
import { useAgentControls, useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { copyFieldMeta } from "./meta.ts";
import "./CopyField.css";

export const COPIED_FOR = 2000;

type CopyStatus = "idle" | "copied" | "failed";

export interface CopyFieldProps
  extends Omit<ComponentPropsWithRef<"fieldset">, "children" | "onCopy"> {
  label: string;
  value: string;
  copyLabel?: string;
  copiedLabel?: string;
  onCopy?: (value: string) => void;
}

function selectContents(element: HTMLElement | null): void {
  if (element === null) return;
  const selection = element.ownerDocument.getSelection();
  if (selection === null) return;
  selection.selectAllChildren(element);
}

export function CopyField(props: CopyFieldProps) {
  const {
    label,
    value,
    copyLabel = "Copy",
    copiedLabel = "Copied",
    onCopy,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const id = useId();
  const [status, setStatus] = useState<CopyStatus>("idle");
  const valueElement = useRef<HTMLSpanElement | null>(null);
  const onCopyRef = useRef(onCopy);
  onCopyRef.current = onCopy;

  useEffect(() => {
    if (status !== "copied") return;
    const timer = setTimeout(() => setStatus("idle"), COPIED_FOR);
    return () => clearTimeout(timer);
  }, [status]);

  const fail = () => {
    setStatus("failed");
    selectContents(valueElement.current);
  };

  const copy = () => {
    const clipboard = navigator.clipboard;
    if (clipboard === undefined) {
      fail();
      return;
    }
    clipboard.writeText(value).then(() => {
      setStatus("copied");
      onCopyRef.current?.(value);
    }, fail);
  };

  const copied = status === "copied";
  const control = copied ? copiedLabel : copyLabel;

  const parts: AgentPart[] = [
    { part: "value", ...(value === "" ? {} : { label: value }), state: {} },
    { part: "copy", label: control, state: {} },
  ];

  const node = buildAgentNode({
    component: copyFieldMeta.name,
    label,
    state: { copied, "copy-failed": status === "failed" },
    parts,
  });

  if (view === "agent") {
    if (controls === "never") return <AgentLine node={node} />;
    return (
      <AgentControlGroup
        node={node}
        isActionable={(part) => part.part === "copy"}
        onActivate={copy}
      />
    );
  }

  const labelId = `${id}-label`;

  return (
    <fieldset {...rest} {...agentAttributesFor(node)} aria-labelledby={labelId}>
      <legend id={labelId}>{label}</legend>
      <div>
        <span
          {...agentPartAttributesFor({ part: "value", state: {} })}
          ref={valueElement}
          title={value}
        >
          {value}
        </span>
        <button
          {...agentPartAttributesFor({ part: "copy", state: {} })}
          type="button"
          aria-live="polite"
          onClick={copy}
        >
          {control}
        </button>
      </div>
    </fieldset>
  );
}
