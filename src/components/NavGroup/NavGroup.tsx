import type { ComponentPropsWithRef } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { navGroupMeta } from "./meta.ts";
import "./NavGroup.css";

export interface NavGroupProps extends ComponentPropsWithRef<"div"> {
  label: string;
}

export function NavGroup(props: NavGroupProps) {
  const { label, children, ...rest } = props;

  const view = useSprintView();

  const node = buildAgentNode({ component: navGroupMeta.name, label });

  if (view === "agent") return <AgentLine node={node}>{children}</AgentLine>;

  return (
    // biome-ignore lint/a11y/useSemanticElements: the suggested fieldset groups form controls; this groups links, and group is the ARIA role for exactly that
    <div {...rest} {...agentAttributesFor(node)} role="group" aria-label={label}>
      <span>{label}</span>
      {children}
    </div>
  );
}
