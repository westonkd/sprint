import { type ReactNode, useCallback, useMemo, useState } from "react";
import { THEME_ATTRIBUTE, VIEW_ATTRIBUTE } from "@/agent/attributes.ts";
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

  return (
    <SprintViewProvider value={viewValue}>
      <AgentScopeProvider value={scopeValue}>
        <div
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
