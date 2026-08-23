import type { ComponentPropsWithRef, ReactNode } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { reactText } from "@/agent/view/text.ts";
import { listMeta } from "./meta.ts";
import "./List.css";

export interface ListProps extends ComponentPropsWithRef<"ul"> {
  label: string;
  items: readonly ReactNode[];
  ordered?: boolean;
  emptyLabel?: string;
}

export function List(props: ListProps) {
  const { label, items, ordered = false, emptyLabel = "Empty", ...rest } = props;

  const view = useSprintView();
  const empty = items.length === 0;

  const parts: AgentPart[] = items.map((item, index) => {
    const text = reactText(item);
    return {
      part: "item",
      state: { index: String(index + 1) },
      ...(text === undefined ? {} : { label: text }),
    };
  });

  const node = buildAgentNode({
    component: listMeta.name,
    label,
    state: { items: String(items.length), ordered, empty },
    parts,
  });

  if (view === "agent") return <AgentLine node={node} />;

  const Element = ordered ? "ol" : "ul";

  return (
    <Element
      {...(rest as ComponentPropsWithRef<"ol">)}
      {...agentAttributesFor(node)}
      aria-label={label}
    >
      {empty ? (
        <li>{emptyLabel}</li>
      ) : (
        items.map((item, index) => (
          <li
            key={`${index}-${String(reactText(item))}`}
            {...agentPartAttributesFor({
              part: "item",
              state: { index: String(index + 1) },
            })}
          >
            {item}
          </li>
        ))
      )}
    </Element>
  );
}
