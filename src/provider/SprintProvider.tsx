import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  THEME_ATTRIBUTE,
  VIEW_ATTRIBUTE,
  VIEW_COPY_ATTRIBUTE,
} from "@/agent/attributes.ts";
import {
  defaultAgentFormat,
  type SprintAgentControls,
  type SprintView,
  SprintViewProvider,
  useSprintViewControl,
} from "@/agent/view/mode.ts";
import type { AgentFormatter } from "@/agent/view/node.ts";
import { AgentScopeProvider, useAgentScope } from "@/agent/webmcp/scope.ts";
import { usePageTools } from "./pageTools.ts";
import "./SprintProvider.css";

const COPIED_FOR = 1200;

export type SprintTheme = "dark" | "light";

export interface SprintProviderProps {
  children: ReactNode;
  label?: string;
  format?: AgentFormatter;
  pageTools?: boolean;
  view?: SprintView;
  defaultView?: SprintView;
  onViewChange?: (view: SprintView) => void;
  agentControls?: SprintAgentControls;
  theme?: SprintTheme;
}

export function SprintProvider(props: SprintProviderProps) {
  const {
    children,
    label,
    format,
    pageTools = true,
    view,
    defaultView,
    onViewChange,
    agentControls,
    theme,
  } = props;

  const parentScope = useAgentScope();
  const inherited = useSprintViewControl();
  const root = !inherited.owned;

  const [ownView, setOwnView] = useState<SprintView>(defaultView ?? "human");

  const controlled = view !== undefined;
  const owns = controlled || root || defaultView !== undefined;
  const effective = controlled ? view : owns ? ownView : inherited.view;

  const setView = useCallback(
    (next: SprintView) => {
      if (!owns) {
        inherited.setView(next);
        return;
      }
      if (!controlled) setOwnView(next);
      onViewChange?.(next);
    },
    [owns, controlled, inherited, onViewChange],
  );

  const controls = agentControls ?? inherited.controls;
  const formatter = format ?? inherited.format ?? defaultAgentFormat;

  const viewValue = useMemo(
    () => ({ view: effective, setView, controls, format: formatter, owned: owns }),
    [effective, setView, controls, formatter, owns],
  );

  const scopeValue = useMemo(
    () => ({ path: label === undefined ? parentScope : [...parentScope, label] }),
    [parentScope, label],
  );

  usePageTools({
    enabled: root && pageTools,
    format: formatter,
    view: effective,
    setView,
  });

  const surface = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_FOR);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    const clipboard = navigator.clipboard;
    if (clipboard === undefined) return;
    const text = (surface.current?.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
    clipboard.writeText(text).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  const copyControl = owns && effective === "agent" && controls !== "never";

  return (
    <SprintViewProvider value={viewValue}>
      <AgentScopeProvider value={scopeValue}>
        {copyControl ? (
          <button
            type="button"
            aria-label={copied ? "Copied" : "Copy agent view"}
            {...{ [VIEW_COPY_ATTRIBUTE]: "" }}
            {...(copied ? { "data-sprint-copied": "" } : {})}
            onClick={copy}
          />
        ) : null}
        <div
          ref={surface}
          {...{ [VIEW_ATTRIBUTE]: effective }}
          {...(theme === undefined ? {} : { [THEME_ATTRIBUTE]: theme })}
        >
          {children}
        </div>
      </AgentScopeProvider>
    </SprintViewProvider>
  );
}

export interface AgentRegionProps {
  children: ReactNode;
  label: string;
}

export function AgentRegion(props: AgentRegionProps) {
  const { children, label } = props;
  const parent = useAgentScope();
  const value = useMemo(() => ({ path: [...parent, label] }), [parent, label]);

  return <AgentScopeProvider value={value}>{children}</AgentScopeProvider>;
}
