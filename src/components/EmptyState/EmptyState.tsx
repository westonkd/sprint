import { type ComponentPropsWithRef, type MouseEvent, useId } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { Button } from "../Button/index.ts";
import { Link } from "../Link/index.ts";
import { emptyStateMeta } from "./meta.ts";
import "./EmptyState.css";

export type EmptyStateReason = "empty" | "filtered";

export interface EmptyStateAction {
  label: string;
  onSelect?: (event: MouseEvent<HTMLElement>) => void;
  href?: string;
}

export interface EmptyStateProps
  extends Omit<ComponentPropsWithRef<"div">, "children"> {
  label: string;
  description?: string;
  action?: EmptyStateAction;
  reason?: EmptyStateReason;
}

function ActionControl(props: { action: EmptyStateAction }) {
  const { action } = props;
  if (action.href !== undefined) {
    return (
      <Link href={action.href} onClick={action.onSelect}>
        {action.label}
      </Link>
    );
  }
  return <Button onClick={action.onSelect}>{action.label}</Button>;
}

export function EmptyState(props: EmptyStateProps) {
  const { label, description, action, reason = "empty", ...rest } = props;

  const view = useSprintView();
  const id = useId();

  const parts: AgentPart[] =
    description === undefined
      ? []
      : [{ part: "description", label: description, state: {} }];

  const node = buildAgentNode({
    component: emptyStateMeta.name,
    label,
    state: { empty: true, reason },
    parts,
  });

  const control = action === undefined ? null : <ActionControl action={action} />;

  if (view === "agent") return <AgentLine node={node}>{control}</AgentLine>;

  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  return (
    // biome-ignore lint/a11y/useSemanticElements: the suggested fieldset groups form controls; this groups a headline, its explanation, and a way out, and group is the ARIA role for exactly that
    <div
      {...rest}
      {...agentAttributesFor(node)}
      role="group"
      aria-labelledby={labelId}
      aria-describedby={description === undefined ? undefined : descriptionId}
    >
      <div>
        <p id={labelId}>{label}</p>
        {description === undefined ? null : (
          <p
            id={descriptionId}
            {...agentPartAttributesFor({ part: "description", state: {} })}
          >
            {description}
          </p>
        )}
        {control}
      </div>
    </div>
  );
}
