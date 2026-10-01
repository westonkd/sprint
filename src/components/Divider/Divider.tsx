import type { ComponentPropsWithRef } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { dividerMeta } from "./meta.ts";
import "./Divider.css";

export type DividerWeight = "hairline" | "heavy" | "band";

export interface DividerProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  label?: string;
  weight?: DividerWeight;
}

export function Divider(props: DividerProps) {
  const { label, weight = "hairline", ...rest } = props;

  const view = useSprintView();

  const node = buildAgentNode({
    component: dividerMeta.name,
    label,
    state: { weight },
  });

  if (view === "agent") return label === undefined ? null : <AgentLine node={node} />;

  return (
    <div {...rest} {...agentAttributesFor(node)}>
      {label === undefined ? null : <span>{label}</span>}
      <hr />
    </div>
  );
}
