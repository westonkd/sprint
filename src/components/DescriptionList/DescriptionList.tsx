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
import { descriptionListMeta } from "./meta.ts";
import "./DescriptionList.css";

export interface DescriptionItem {
  term: ReactNode;
  description: ReactNode;
}

export interface DescriptionListProps extends ComponentPropsWithRef<"dl"> {
  label: string;
  items: readonly DescriptionItem[];
  emptyLabel?: string;
}

function pairText(item: DescriptionItem): string | undefined {
  const term = reactText(item.term);
  const description = reactText(item.description);
  if (term === undefined && description === undefined) return undefined;
  return `${term ?? ""}: ${description ?? ""}`;
}

export function DescriptionList(props: DescriptionListProps) {
  const { label, items, emptyLabel = "Empty", ...rest } = props;

  const view = useSprintView();
  const empty = items.length === 0;

  const parts: AgentPart[] = items.map((item, index) => {
    const text = pairText(item);
    return {
      part: "item",
      state: { index: String(index + 1) },
      ...(text === undefined ? {} : { label: text }),
    };
  });

  const node = buildAgentNode({
    component: descriptionListMeta.name,
    label,
    state: { items: String(items.length), empty },
    parts,
  });

  if (view === "agent") return <AgentLine node={node} />;

  return (
    <dl {...rest} {...agentAttributesFor(node)} aria-label={label}>
      {empty ? (
        <div>{emptyLabel}</div>
      ) : (
        items.map((item, index) => (
          <div
            key={`${index}-${String(reactText(item.term))}`}
            {...agentPartAttributesFor({
              part: "item",
              state: { index: String(index + 1) },
            })}
          >
            <dt>{item.term}</dt>
            <dd>{item.description}</dd>
          </div>
        ))
      )}
    </dl>
  );
}
