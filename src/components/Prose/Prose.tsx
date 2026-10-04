import type { ComponentPropsWithRef } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { reactText } from "@/agent/view/text.ts";
import { proseMeta } from "./meta.ts";
import "./Prose.css";

export type ProseSize = "small" | "normal";

export interface ProseProps extends ComponentPropsWithRef<"div"> {
  label?: string;
  source?: string;
  size?: ProseSize;
}

export function Prose(props: ProseProps) {
  const { label, source, size = "normal", children, ...rest } = props;

  const view = useSprintView();
  const content = source ?? reactText(children);

  const node = buildAgentNode({
    component: proseMeta.name,
    label,
    state: { size: size === "normal" ? undefined : size },
    parts:
      content === undefined ? [] : [{ part: "content", label: content, state: {} }],
  });

  if (view === "agent") return <AgentLine node={node} />;

  return (
    <div
      {...rest}
      {...agentAttributesFor(node)}
      {...(label === undefined ? {} : { role: "region", "aria-label": label })}
    >
      <div {...agentPartAttributesFor({ part: "content", state: {} })}>{children}</div>
    </div>
  );
}
