import type { ComponentPropsWithRef } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { reactText } from "@/agent/view/text.ts";
import { tagMeta } from "./meta.ts";
import "./Tag.css";

export type TagTone = "neutral" | "action" | "danger" | "info" | "warning" | "inert";

export interface TagProps extends ComponentPropsWithRef<"span"> {
  tone?: TagTone;
  filled?: boolean;
}

export function Tag(props: TagProps) {
  const { tone = "neutral", filled = false, children, ...rest } = props;

  const view = useSprintView();

  const node = buildAgentNode({
    component: tagMeta.name,
    label: reactText(children),
    state: { tone, filled },
  });

  if (view === "agent") return <AgentLine node={node} />;

  return (
    <span {...rest} {...agentAttributesFor(node)}>
      {children}
    </span>
  );
}
