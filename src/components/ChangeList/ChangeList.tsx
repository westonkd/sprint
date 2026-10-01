import type { ComponentPropsWithRef } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart, AgentStateValue } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { changeListMeta } from "./meta.ts";
import "./ChangeList.css";

export type ChangeKind = "added" | "removed" | "changed";

export interface Change {
  kind: ChangeKind;
  label: string;
  from?: string;
  to?: string;
  detail?: string;
}

export interface ChangeListProps extends Omit<ComponentPropsWithRef<"ul">, "children"> {
  label: string;
  changes: readonly Change[];
  emptyLabel?: string;
}

const SAFARI_LIST_SEMANTICS = { role: "list" } as const;

const KINDS: readonly ChangeKind[] = ["added", "removed", "changed"];

const MARKS: Record<ChangeKind, string> = {
  added: "+",
  removed: "−",
  changed: "→",
};

const WORDS: Record<ChangeKind, string> = {
  added: "Added",
  removed: "Removed",
  changed: "Changed",
};

function present(value: string | undefined): value is string {
  return value !== undefined && value !== "";
}

function transitionText(change: Change): string {
  const from = present(change.from) ? ` from ${change.from}` : "";
  const to = present(change.to) ? ` to ${change.to}` : "";
  return from === "" && to === "" ? "" : `,${from}${to}`;
}

function changeText(change: Change): string {
  const detail = present(change.detail) ? `. ${change.detail}` : "";
  return `${WORDS[change.kind]}: ${change.label}${transitionText(change)}${detail}`;
}

function changeState(change: Change): Record<string, AgentStateValue> {
  return {
    kind: change.kind,
    ...(present(change.from) ? { from: change.from } : {}),
    ...(present(change.to) ? { to: change.to } : {}),
  };
}

function counts(changes: readonly Change[]): Record<string, string | undefined> {
  const tally: Record<string, string | undefined> = {};
  for (const kind of KINDS) {
    const total = changes.filter((change) => change.kind === kind).length;
    tally[kind] = total === 0 ? undefined : String(total);
  }
  return tally;
}

function Transition({ change }: { change: Change }) {
  const from = present(change.from) ? change.from : undefined;
  const to = present(change.to) ? change.to : undefined;
  if (from === undefined && to === undefined) return null;
  return (
    <>
      <span>,</span>
      {from === undefined ? null : (
        <>
          <span> from </span>
          <del>{from}</del>
        </>
      )}
      <span aria-hidden="true">{MARKS.changed}</span>
      {to === undefined ? null : (
        <>
          <span> to </span>
          <ins>{to}</ins>
        </>
      )}
    </>
  );
}

function Row({ change }: { change: Change }) {
  return (
    <li {...agentPartAttributesFor({ part: "change", state: changeState(change) })}>
      <span aria-hidden="true">{MARKS[change.kind]}</span>
      <p>
        <span>{WORDS[change.kind]}: </span>
        <strong>{change.label}</strong>
        <Transition change={change} />
        {present(change.detail) ? (
          <>
            <span>. </span>
            <small>{change.detail}</small>
          </>
        ) : null}
      </p>
    </li>
  );
}

export function ChangeList(props: ChangeListProps) {
  const { label, changes, emptyLabel = "No changes", ...rest } = props;

  const view = useSprintView();
  const empty = changes.length === 0;

  const parts: AgentPart[] = changes.map((change) => ({
    part: "change",
    label: changeText(change),
    state: changeState(change),
  }));

  const node = buildAgentNode({
    component: changeListMeta.name,
    label,
    state: { changes: String(changes.length), ...counts(changes), empty },
    parts,
  });

  if (view === "agent") return <AgentLine node={node} />;

  return (
    <ul
      {...rest}
      {...agentAttributesFor(node)}
      {...SAFARI_LIST_SEMANTICS}
      aria-label={label}
    >
      {empty ? (
        <li>{emptyLabel}</li>
      ) : (
        changes.map((change, index) => (
          <Row key={`${index}-${change.kind}-${change.label}`} change={change} />
        ))
      )}
    </ul>
  );
}
