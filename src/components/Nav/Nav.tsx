import type { ComponentPropsWithRef } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { navMeta } from "./meta.ts";
import "./Nav.css";

export interface NavProps extends ComponentPropsWithRef<"nav"> {
  label: string;
}

export function Nav(props: NavProps) {
  const { label, children, ...rest } = props;

  const view = useSprintView();

  const node = buildAgentNode({ component: navMeta.name, label, region: true });

  if (view === "agent") return <AgentLine node={node}>{children}</AgentLine>;

  return (
    <nav {...rest} {...agentAttributesFor(node)} aria-label={label}>
      {children}
    </nav>
  );
}
