import type { ComponentPropsWithRef } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { reactText } from "@/agent/view/text.ts";
import { visuallyHiddenMeta } from "./meta.ts";
import "./VisuallyHidden.css";

export interface VisuallyHiddenProps extends ComponentPropsWithRef<"span"> {
  focusable?: boolean;
}

export function VisuallyHidden(props: VisuallyHiddenProps) {
  const { focusable = false, children, ...rest } = props;

  const view = useSprintView();

  const node = buildAgentNode({
    component: visuallyHiddenMeta.name,
    label: reactText(children),
    state: { focusable },
  });

  if (view === "agent") return <AgentLine node={node} />;

  return (
    <span {...rest} {...agentAttributesFor(node)}>
      {children}
    </span>
  );
}
