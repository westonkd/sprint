import { type ComponentPropsWithRef, useId } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { progressMeta } from "./meta.ts";
import "./Progress.css";

export type ProgressTone = "info" | "action" | "warning" | "danger";

export interface ProgressProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  label: string;
  value?: number;
  max?: number;
  tone?: ProgressTone;
  hideLabel?: boolean;
}

function percentOf(value: number, max: number): number {
  if (max <= 0) return 100;
  return Math.round((Math.min(Math.max(value, 0), max) / max) * 100);
}

export function Progress(props: ProgressProps) {
  const { label, value, max = 100, tone = "info", hideLabel = false, ...rest } = props;

  const view = useSprintView();
  const labelId = useId();

  const determinate = value !== undefined && Number.isFinite(value);
  const percent = determinate ? percentOf(value, max) : undefined;

  const node = buildAgentNode({
    component: progressMeta.name,
    label,
    state: {
      loading: percent === undefined || percent < 100,
      value: percent === undefined ? undefined : `${percent}%`,
      tone: tone === "info" ? undefined : tone,
    },
  });

  if (view === "agent") return <AgentLine node={node} />;

  return (
    <div {...rest} {...agentAttributesFor(node)}>
      <span id={labelId} {...(hideLabel ? { "data-sprint-visually-hidden": "" } : {})}>
        {label}
      </span>
      {percent === undefined || hideLabel ? null : (
        <span aria-hidden="true">{percent}%</span>
      )}
      <progress
        aria-labelledby={labelId}
        {...(percent === undefined ? {} : { value: percent, max: 100 })}
      />
    </div>
  );
}
