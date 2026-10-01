import { type ComponentPropsWithRef, useId } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { stepsMeta } from "./meta.ts";
import "./Steps.css";

export type StepState = "done" | "current";

export interface Step {
  title: string;
  body?: string;
  state?: StepState;
}

export interface StepsProps extends Omit<ComponentPropsWithRef<"ol">, "children"> {
  label: string;
  steps: readonly Step[];
  doneLabel?: string;
  emptyLabel?: string;
}

const SAFARI_LIST_SEMANTICS = { role: "list" } as const;

function stepText(step: Step): string {
  return step.body === undefined || step.body === ""
    ? step.title
    : `${step.title}: ${step.body}`;
}

function stepPart(step: Step, index: number): AgentPart {
  return {
    part: "step",
    label: stepText(step),
    state: {
      index: String(index + 1),
      ...(step.state === "done" ? { done: true as const } : {}),
      ...(step.state === "current" ? { current: true as const } : {}),
    },
  };
}

export function Steps(props: StepsProps) {
  const { label, steps, doneLabel = "Done", emptyLabel = "No steps", ...rest } = props;

  const view = useSprintView();
  const id = useId();

  const empty = steps.length === 0;
  const parts = steps.map(stepPart);
  const complete = !empty && steps.every((step) => step.state === "done");

  const node = buildAgentNode({
    component: stepsMeta.name,
    label,
    state: { steps: String(steps.length), complete, empty },
    parts,
  });

  if (view === "agent") return <AgentLine node={node} />;

  return (
    <ol
      {...rest}
      {...agentAttributesFor(node)}
      {...SAFARI_LIST_SEMANTICS}
      aria-label={label}
    >
      {empty ? <li>{emptyLabel}</li> : null}
      {steps.map((step, index) => {
        const part = parts[index] ?? stepPart(step, index);
        const done = step.state === "done";
        const descriptionId = `${id}-${index}-done`;
        return (
          <li
            key={`${index}-${step.title}`}
            {...agentPartAttributesFor(part)}
            aria-current={step.state === "current" ? "step" : undefined}
            aria-describedby={done ? descriptionId : undefined}
          >
            <span aria-hidden="true">{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              {step.body === undefined || step.body === "" ? null : (
                <>
                  <span>: </span>
                  <p>{step.body}</p>
                </>
              )}
            </div>
            {done ? (
              <span id={descriptionId} hidden>
                {doneLabel}
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
