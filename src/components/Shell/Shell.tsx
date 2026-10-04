import {
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";
import { useSprintView } from "@/agent/view/mode.ts";
import { agentAttributesFor, buildAgentNode } from "@/agent/view/project.ts";
import { Button } from "../Button/index.ts";
import { shellMeta } from "./meta.ts";
import "./Shell.css";

export interface ShellProps extends ComponentPropsWithRef<"div"> {
  side?: ReactNode;
  bar?: ReactNode;
  sideLabel?: string;
  skipLabel?: string;
  menuLabel?: string;
  closeLabel?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  drawerOpen?: boolean;
  onDrawerOpenChange?: (open: boolean) => void;
  hideLabel?: string;
  showLabel?: string;
}

export function Shell(props: ShellProps) {
  const {
    side,
    bar,
    sideLabel = "Sidebar",
    skipLabel = "Skip to content",
    menuLabel = "Menu",
    closeLabel = "Close",
    collapsible = false,
    collapsed: controlled,
    defaultCollapsed = false,
    onCollapsedChange,
    drawerOpen,
    onDrawerOpenChange,
    hideLabel = "Hide menu",
    showLabel = "Show menu",
    children,
    ...rest
  } = props;

  const view = useSprintView();
  const [heldOpen, setHeldOpen] = useState(false);
  const open = drawerOpen ?? heldOpen;
  const notifyOpen = useRef(onDrawerOpenChange);
  notifyOpen.current = onDrawerOpenChange;
  const setOpen = useCallback((next: boolean) => {
    setHeldOpen(next);
    notifyOpen.current?.(next);
  }, []);
  const [held, setHeld] = useState(defaultCollapsed);
  const collapsed = collapsible && (controlled ?? held);
  const drawerId = useId();
  const main = useRef<HTMLElement | null>(null);

  const closeOnNavigate = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target;
      if (target instanceof Element && target.closest("a") !== null) setOpen(false);
    },
    [setOpen],
  );

  const node = buildAgentNode({
    component: shellMeta.name,
    region: true,
    state: { open, collapsed },
  });

  if (view === "agent") {
    return (
      <>
        {bar}
        {side}
        {children}
      </>
    );
  }

  return (
    <div {...rest} {...agentAttributesFor(node)}>
      <button type="button" onClick={() => main.current?.focus()}>
        {skipLabel}
      </button>
      <aside aria-label={sideLabel}>
        <div>
          {bar}
          <span>
            <Button
              agentTool={false}
              aria-expanded={open}
              aria-controls={drawerId}
              onClick={() => setOpen(!open)}
            >
              {open ? closeLabel : menuLabel}
            </Button>
            {collapsible ? (
              <Button
                agentTool={false}
                aria-expanded={!collapsed}
                aria-controls={drawerId}
                onClick={() => {
                  setHeld(!collapsed);
                  onCollapsedChange?.(!collapsed);
                }}
              >
                {collapsed ? showLabel : hideLabel}
              </Button>
            ) : null}
          </span>
        </div>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: closing the drawer after a click on a link inside it; the links handle their own keyboard interaction */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: same delegation, the div itself is not a control */}
        <div id={drawerId} onClick={closeOnNavigate}>
          {side}
        </div>
      </aside>
      <main ref={main} tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
