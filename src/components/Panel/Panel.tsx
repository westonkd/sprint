import { Children, type ComponentPropsWithRef, type ReactNode } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { panelMeta } from "./meta.ts";
import "./Panel.css";

export interface PanelProps extends ComponentPropsWithRef<"section"> {
  label: string;
  actions?: ReactNode;
  flush?: boolean;
  emptyLabel?: string;
}

export function Panel(props: PanelProps) {
  const {
    label,
    actions,
    flush = false,
    emptyLabel = "Empty",
    children,
    ...rest
  } = props;

  const view = useSprintView();
  const empty = Children.count(children) === 0;

  const node = buildAgentNode({
    component: panelMeta.name,
    label,
    state: { flush, empty },
  });

  if (view === "agent") {
    return (
      <AgentLine node={node}>
        {actions}
        {children}
      </AgentLine>
    );
  }

  return (
    <section {...rest} {...agentAttributesFor(node)} aria-label={label}>
      <header>
        <span>{label}</span>
        {actions === undefined ? null : <span>{actions}</span>}
      </header>
      <div>{empty ? <span>{emptyLabel}</span> : children}</div>
    </section>
  );
}
