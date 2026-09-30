import { type ComponentPropsWithRef, Fragment } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { metaLineMeta } from "./meta.ts";
import "./MetaLine.css";

export interface MetaLineEntry {
  term: string;
  detail: string;
}

export interface MetaLineProps extends ComponentPropsWithRef<"p"> {
  entries: readonly MetaLineEntry[];
  wrap?: boolean;
}

export function MetaLine(props: MetaLineProps) {
  const { entries, wrap = false, ...rest } = props;

  const view = useSprintView();

  if (entries.length === 0) return null;

  const line = entries.map((entry) => `${entry.term}: ${entry.detail}`).join(" / ");

  const node = buildAgentNode({
    component: metaLineMeta.name,
    label: line,
    state: { entries: String(entries.length), wrap },
  });

  if (view === "agent") return <AgentLine node={node} />;

  return (
    <p {...rest} {...agentAttributesFor(node)}>
      {entries.map((entry, index) => (
        <Fragment key={`${entry.term}-${index}`}>
          {index > 0 ? " / " : null}
          <span>
            <span>{entry.term}: </span>
            <span>{entry.detail}</span>
          </span>
        </Fragment>
      ))}
    </p>
  );
}
