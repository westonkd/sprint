import type { ComponentPropsWithRef } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { reactText } from "@/agent/view/text.ts";
import { headingMeta } from "./meta.ts";
import "./Heading.css";

export type HeadingLevel = 1 | 2 | 3 | 4;

export interface HeadingProps extends ComponentPropsWithRef<"h2"> {
  level?: HeadingLevel;
}

export function Heading(props: HeadingProps) {
  const { level = 2, children, ...rest } = props;

  const view = useSprintView();

  const node = buildAgentNode({
    component: headingMeta.name,
    label: reactText(children),
    state: { level: String(level) },
  });

  if (view === "agent") return <AgentLine node={node} />;

  const Element = `h${level}` as const;

  return (
    <Element {...rest} {...agentAttributesFor(node)}>
      {children}
    </Element>
  );
}
