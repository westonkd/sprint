import { Children, type ComponentPropsWithRef, type ReactNode } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { pageHeaderMeta } from "./meta.ts";
import "./PageHeader.css";

export interface PageHeaderProps extends ComponentPropsWithRef<"header"> {
  label: string;
  tags?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader(props: PageHeaderProps) {
  const { label, tags, actions, children, ...rest } = props;

  const view = useSprintView();

  const node = buildAgentNode({
    component: pageHeaderMeta.name,
    label,
    region: true,
  });

  if (view === "agent") {
    return (
      <AgentLine node={node}>
        {tags}
        {actions}
        {children}
      </AgentLine>
    );
  }

  const lede = Children.toArray(children).length > 0;

  return (
    <header {...rest} {...agentAttributesFor(node)}>
      <div>
        <div>
          <h1>{label}</h1>
          {tags === undefined ? null : <span>{tags}</span>}
        </div>
        {actions === undefined ? null : <span>{actions}</span>}
      </div>
      {lede ? <div>{children}</div> : null}
    </header>
  );
}
