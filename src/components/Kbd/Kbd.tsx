import { type ComponentPropsWithRef, Fragment } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { kbdMeta } from "./meta.ts";
import "./Kbd.css";

export interface KbdProps extends Omit<ComponentPropsWithRef<"kbd">, "children"> {
  children: string;
}

export function keysOf(combination: string): string[] {
  const keys: string[] = [];
  let current = "";
  for (const character of combination) {
    if (character === "+" && current !== "") {
      keys.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  if (current !== "") keys.push(current.trim());
  return keys.filter((key) => key !== "");
}

export function Kbd(props: KbdProps) {
  const { children, ...rest } = props;

  const view = useSprintView();
  const keys = keysOf(children);

  const node = buildAgentNode({
    component: kbdMeta.name,
    label: keys.join("+"),
  });

  if (view === "agent") return <AgentLine node={node} />;

  return (
    <kbd {...rest} {...agentAttributesFor(node)}>
      {keys.map((key, index) => (
        <Fragment key={`${key}-${index}`}>
          {index === 0 ? null : <span aria-hidden="true">+</span>}
          <kbd>{key}</kbd>
        </Fragment>
      ))}
    </kbd>
  );
}
