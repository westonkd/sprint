import type { ComponentPropsWithRef } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { spinnerMeta } from "./meta.ts";
import "./Spinner.css";

export type SpinnerSize = "small" | "medium";

export interface SpinnerProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  label: string;
  size?: SpinnerSize;
  showLabel?: boolean;
}

export function Spinner(props: SpinnerProps) {
  const { label, size = "medium", showLabel = false, ...rest } = props;

  const view = useSprintView();

  const node = buildAgentNode({
    component: spinnerMeta.name,
    label,
    state: { loading: true, size: size === "medium" ? undefined : size },
  });

  if (view === "agent") return <AgentLine node={node} />;

  return (
    <span {...rest} {...agentAttributesFor(node)} role="status">
      <span aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span {...(showLabel ? {} : { "data-sprint-visually-hidden": "" })}>{label}</span>
    </span>
  );
}
