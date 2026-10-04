import { type ComponentPropsWithRef, useEffect, useState } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { avatarMeta } from "./meta.ts";
import "./Avatar.css";

export type AvatarSize = "small" | "medium" | "large";

export interface AvatarProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  name: string;
  src?: string;
  size?: AvatarSize;
  decorative?: boolean;
}

export function initialsOf(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .split(/\s+/)
    .filter((word) => word !== "");
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

export function Avatar(props: AvatarProps) {
  const { name, src, size = "medium", decorative = false, ...rest } = props;

  const view = useSprintView();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const photo = src !== undefined && !failed;

  const node = buildAgentNode({
    component: avatarMeta.name,
    label: name,
    state: { photo, size: size === "medium" ? undefined : size },
  });

  if (view === "agent") return decorative ? null : <AgentLine node={node} />;

  return (
    <span
      {...rest}
      {...agentAttributesFor(node)}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": name })}
    >
      {photo ? (
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
    </span>
  );
}
