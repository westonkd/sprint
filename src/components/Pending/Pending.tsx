import { Children, type ComponentPropsWithRef } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { pendingMeta } from "./meta.ts";
import "./Pending.css";

export interface PendingProps extends ComponentPropsWithRef<"div"> {
  loading: boolean;
  label: string;
}

export function Pending(props: PendingProps) {
  const { loading, label, children, ...rest } = props;

  const view = useSprintView();
  const empty = Children.toArray(children).length === 0;

  const node = buildAgentNode({
    component: pendingMeta.name,
    label,
    state: { loading: true, empty },
  });

  if (view === "agent") {
    return (
      <AgentLine node={node} silent={!loading}>
        {children}
      </AgentLine>
    );
  }

  const busy = loading
    ? {
        ...agentAttributesFor(node),
        role: "group",
        "aria-label": label,
        "aria-busy": true,
      }
    : {};

  return (
    <div {...rest} {...busy}>
      {loading && empty ? <span>{label}</span> : null}
      {children}
    </div>
  );
}
