import { Children, type ComponentPropsWithRef, type ReactNode } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { panelMeta } from "./meta.ts";
import "./Panel.css";

export type PanelHeadingLevel = 2 | 3 | 4;

export interface PanelProps extends ComponentPropsWithRef<"section"> {
  label: string;
  headingLevel?: PanelHeadingLevel;
  actions?: ReactNode;
  flush?: boolean;
  emptyLabel?: string;
}

export function Panel(props: PanelProps) {
  const {
    label,
    headingLevel,
    actions,
    flush = false,
    emptyLabel = "Empty",
    children,
    ...rest
  } = props;

  const view = useSprintView();
  const empty = Children.toArray(children).length === 0;

  const node = buildAgentNode({
    component: panelMeta.name,
    label,
    region: true,
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

  const Label = headingLevel === undefined ? "span" : (`h${headingLevel}` as const);

  return (
    <section {...rest} {...agentAttributesFor(node)} aria-label={label}>
      <header>
        <Label>{label}</Label>
        {actions === undefined ? null : <span>{actions}</span>}
      </header>
      <div>{empty ? <span>{emptyLabel}</span> : children}</div>
    </section>
  );
}
