import {
  type ComponentPropsWithRef,
  Fragment,
  type MouseEvent,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useRef,
} from "react";
import { AgentControl, AgentLine } from "@/agent/view/AgentText.tsx";
import { useAgentControls, useAgentFormat, useSprintView } from "@/agent/view/mode.ts";
import type { AgentPart } from "@/agent/view/node.ts";
import {
  agentAttributesFor,
  agentPartAttributesFor,
  buildAgentNode,
} from "@/agent/view/project.ts";
import { afterCommit } from "@/agent/webmcp/afterCommit.ts";
import { useAgentTool } from "@/agent/webmcp/useAgentTool.ts";
import { Tag, type TagTone } from "../Tag/index.ts";
import { entityRowMeta } from "./meta.ts";
import { OPEN_ENTITY_ROW_TOOL } from "./tool.ts";
import "./EntityRow.css";

export interface EntityRowTag {
  label: string;
  tone?: TagTone;
}

export type EntityRowDetail = string | { term?: string; detail: string };

export interface EntityRowProps
  extends Omit<
    ComponentPropsWithRef<"button">,
    "ref" | "onSelect" | "children" | "title"
  > {
  title: string;
  href?: string;
  onSelect?: (event: MouseEvent<HTMLElement>) => void;
  tags?: readonly EntityRowTag[];
  meta?: readonly EntityRowDetail[];
  description?: string;
  disabled?: boolean;
  agentTool?: boolean;
  agentName?: string;
  ref?: Ref<HTMLButtonElement> | Ref<HTMLAnchorElement> | Ref<HTMLDivElement>;
}

const SEPARATOR = " · ";

function detailText(entry: EntityRowDetail): string {
  if (typeof entry === "string") return entry;
  return entry.term === undefined ? entry.detail : `${entry.term}: ${entry.detail}`;
}

function detailKey(entry: EntityRowDetail, index: number): string {
  return `${index}-${detailText(entry)}`;
}

export function EntityRow(props: EntityRowProps) {
  const {
    title,
    href,
    onSelect,
    tags = [],
    meta = [],
    description,
    disabled = false,
    agentTool,
    agentName,
    ref,
    ...rest
  } = props;

  const view = useSprintView();
  const controls = useAgentControls();
  const formatter = useAgentFormat();
  const id = useId();
  const navigates = href !== undefined;
  const acts = !navigates && onSelect !== undefined;
  const inert = acts && disabled;
  const element = useRef<HTMLElement | null>(null);

  const setRef = useCallback(
    (target: HTMLElement | null) => {
      element.current = target;
      if (typeof ref === "function") {
        (ref as (value: HTMLElement | null) => void)(target);
      } else if (ref !== null && ref !== undefined) {
        (ref as { current: HTMLElement | null }).current = target;
      }
    },
    [ref],
  );

  const formatRef = useRef(formatter);
  formatRef.current = formatter;
  const nodeRef = useRef(buildAgentNode({ component: entityRowMeta.name }));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    const target = element.current;
    if (target === null) return "This row renders no control in the current view.";

    target.click();
    await afterCommit();
    if (!mounted.current) return "Opening removed this row from the page.";
    return `Opened. The row is now:\n${formatRef.current([nodeRef.current])}`;
  }, []);

  const toolName = useAgentTool({
    spec: OPEN_ENTITY_ROW_TOOL,
    label: agentName ?? title,
    enabled: (agentTool ?? acts) && (navigates || acts) && !inert,
    execute,
  });

  const metaLine = meta.length === 0 ? undefined : meta.map(detailText).join(SEPARATOR);
  const parts: AgentPart[] = [
    { part: "title", label: title, state: {} },
    ...(metaLine === undefined ? [] : [{ part: "meta", label: metaLine, state: {} }]),
    ...(description === undefined
      ? []
      : [{ part: "description", label: description, state: {} }]),
  ];

  const node = buildAgentNode({
    component: entityRowMeta.name,
    label: title,
    tool: toolName,
    state: { href, disabled: inert },
    parts,
  });
  nodeRef.current = node;

  const chips = tags.map((tag, index) => (
    <Tag key={`${index}-${tag.label}`} tone={tag.tone ?? "neutral"}>
      {tag.label}
    </Tag>
  ));

  if (view === "agent") {
    if (!(navigates || acts) || inert || controls === "never") {
      return <AgentLine node={node}>{chips}</AgentLine>;
    }
    return (
      <AgentControl
        node={node}
        as={navigates ? "a" : "button"}
        href={href}
        ref={setRef}
        onClick={onSelect}
      >
        {chips}
      </AgentControl>
    );
  }

  const titleId = `${id}-title`;
  const tagsId = `${id}-tags`;
  const metaId = `${id}-meta`;
  const descriptionId = `${id}-description`;
  const describedBy = [
    tags.length === 0 ? undefined : tagsId,
    metaLine === undefined ? undefined : metaId,
    description === undefined ? undefined : descriptionId,
  ]
    .filter((value): value is string => value !== undefined)
    .join(" ");

  const naming = {
    "aria-labelledby": titleId,
    "aria-describedby": describedBy === "" ? undefined : describedBy,
  };

  const inner = (
    <>
      <span id={titleId} {...agentPartAttributesFor({ part: "title", state: {} })}>
        {title}
      </span>
      {tags.length === 0 ? null : <span id={tagsId}>{chips}</span>}
      {metaLine === undefined ? null : (
        <span id={metaId} {...agentPartAttributesFor({ part: "meta", state: {} })}>
          {meta.map((entry, index) => (
            <Fragment key={detailKey(entry, index)}>
              {index > 0 ? SEPARATOR : null}
              {typeof entry === "string" || entry.term === undefined ? (
                <span>{detailText(entry)}</span>
              ) : (
                <span>
                  <span>{entry.term}: </span>
                  <span>{entry.detail}</span>
                </span>
              )}
            </Fragment>
          ))}
        </span>
      )}
      {description === undefined ? null : (
        <span
          id={descriptionId}
          {...agentPartAttributesFor({ part: "description", state: {} })}
        >
          {description}
        </span>
      )}
    </>
  );

  if (navigates) {
    return (
      <a
        {...(rest as unknown as ComponentPropsWithRef<"a">)}
        {...agentAttributesFor(node)}
        {...naming}
        href={href}
        onClick={onSelect}
        ref={setRef as Ref<HTMLAnchorElement>}
      >
        {inner}
      </a>
    );
  }

  if (acts) {
    return (
      <button
        {...rest}
        {...agentAttributesFor(node)}
        {...naming}
        type="button"
        disabled={disabled}
        onClick={onSelect}
        ref={setRef as Ref<HTMLButtonElement>}
      >
        {inner}
      </button>
    );
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: the suggested fieldset groups form controls; this groups a record's title and context, and group is the ARIA role for exactly that
    <div
      {...(rest as unknown as ComponentPropsWithRef<"div">)}
      {...agentAttributesFor(node)}
      {...naming}
      role="group"
      ref={setRef as Ref<HTMLDivElement>}
    >
      {inner}
    </div>
  );
}
