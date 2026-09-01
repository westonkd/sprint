import { type ComponentPropsWithRef, useState } from "react";
import { AgentLine } from "@/agent/view/AgentText.tsx";
import { useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { imageMeta } from "./meta.ts";
import "./Image.css";

export type ImageRatio = "1:1" | "4:3" | "3:2" | "16:9" | "auto";
export type ImageFit = "cover" | "contain";
export type ImageStatus = "loading" | "ready" | "error";

export interface ImageProps extends Omit<ComponentPropsWithRef<"figure">, "children"> {
  src: string;
  alt: string;
  caption?: string;
  ratio?: ImageRatio;
  fit?: ImageFit;
}

export function Image(props: ImageProps) {
  const { src, alt, caption, ratio = "auto", fit = "cover", ...rest } = props;

  const view = useSprintView();
  const [status, setStatus] = useState<ImageStatus>("loading");

  const decorative = alt === "" && caption === undefined;

  const parts: AgentPart[] =
    caption === undefined ? [] : [{ part: "caption", label: caption, state: {} }];

  const node = buildAgentNode({
    component: imageMeta.name,
    label: alt === "" ? undefined : alt,
    state: {
      src,
      ratio,
      fit,
      decorative,
      status: view === "agent" ? undefined : status,
    },
    parts,
  });

  if (view === "agent") return decorative ? null : <AgentLine node={node} />;

  const band =
    status === "error" ? (alt === "" ? "Image unavailable" : alt) : "Loading";

  return (
    <figure
      {...rest}
      {...agentAttributesFor(node)}
      aria-label={alt === "" ? undefined : alt}
    >
      <div>
        <img
          src={src}
          alt={alt}
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
        />
        {status === "ready" ? null : (
          <span aria-hidden="true">
            <span>{band}</span>
          </span>
        )}
      </div>
      {caption === undefined ? null : (
        <figcaption {...agentPartAttributesFor({ part: "caption", state: {} })}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
