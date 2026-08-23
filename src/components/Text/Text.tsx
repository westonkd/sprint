import type { ComponentPropsWithRef } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { reactText } from "@/agent/view/text.ts";
import { textMeta } from "./meta.ts";
import "./Text.css";

export type TextTone = "default" | "muted" | "action" | "info" | "warning" | "danger";

export type TextSize = "small" | "normal";

export interface TextProps extends ComponentPropsWithRef<"p"> {
  tone?: TextTone;
  size?: TextSize;
  as?: "p" | "span" | "div";
}

export function Text(props: TextProps) {
  const { tone = "default", size = "normal", as = "p", children, ...rest } = props;

  const view = useSprintView();

  const node = buildAgentNode({
    component: textMeta.name,
    label: reactText(children),
    state: { tone, size },
  });

  if (view === "agent") return <AgentLine node={node} />;

  const Element = as;

  return (
    <Element {...rest} {...agentAttributesFor(node)}>
      {children}
    </Element>
  );
}
