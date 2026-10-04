import {
  type ComponentPropsWithRef,
  cloneElement,
  isValidElement,
  type ReactElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { TOOLTIP_ATTRIBUTE } from "@/agent/attributes.ts";
import { useSprintView } from "@/agent/view/mode.ts";
import { type FloatingSide, useFloating } from "@/floating/useFloating.ts";
import { tooltipMeta } from "./meta.ts";
import "./Tooltip.css";

const HOVER_DELAY_MS = 400;

type Describable = ReactElement<{ "aria-describedby"?: string }>;

export interface TooltipProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  label: string;
  children: ReactElement;
  side?: FloatingSide;
  describe?: boolean;
  disabled?: boolean;
}

function focusVisible(target: Element): boolean {
  try {
    return target.matches(":focus-visible");
  } catch {
    return true;
  }
}

function described(child: ReactElement, id: string): ReactElement {
  if (!isValidElement(child)) return child;
  const element = child as Describable;
  const existing = element.props["aria-describedby"];
  return cloneElement(element, {
    "aria-describedby": existing === undefined ? id : `${existing} ${id}`,
  });
}

export function Tooltip(props: TooltipProps) {
  const {
    label,
    children,
    side = "above",
    describe = true,
    disabled = false,
    ...rest
  } = props;

  const view = useSprintView();
  const id = useId();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLSpanElement | null>(null);
  const anchor = useRef<HTMLElement | null>(null);
  const bubble = useRef<HTMLSpanElement | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const cancel = useCallback(() => {
    if (timer.current !== undefined) window.clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  const hide = useCallback(() => {
    cancel();
    setOpen(false);
  }, [cancel]);

  const show = useCallback(() => {
    cancel();
    if (!disabled) setOpen(true);
  }, [cancel, disabled]);

  useLayoutEffect(() => {
    const first = wrapper.current?.firstElementChild;
    anchor.current = first instanceof HTMLElement ? first : null;
  });

  useEffect(() => cancel, [cancel]);

  useEffect(() => {
    if (disabled) hide();
  }, [disabled, hide]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, hide]);

  useFloating({
    open,
    anchor,
    floating: bubble,
    side,
    align: "center",
    onDismiss: hide,
  });

  if (view === "agent") return children;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the wrapper only observes hover and focus bubbling from the element it wraps, which is the interactive one
    <span
      {...rest}
      {...{ [TOOLTIP_ATTRIBUTE]: tooltipMeta.name }}
      ref={wrapper}
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return;
        cancel();
        timer.current = window.setTimeout(show, HOVER_DELAY_MS);
      }}
      onPointerLeave={hide}
      onFocus={(event) => {
        if (focusVisible(event.target)) show();
      }}
      onBlur={hide}
    >
      {describe ? described(children, id) : children}
      <span
        id={id}
        role="tooltip"
        {...{ [TOOLTIP_ATTRIBUTE]: "bubble" }}
        popover="manual"
        hidden={!open}
        ref={bubble}
      >
        {label}
      </span>
    </span>
  );
}
