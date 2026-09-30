import { createContext, useContext } from "react";

const NonceContext = createContext<string | undefined>(undefined);

export const StyleNonceProvider = NonceContext.Provider;

export function useStyleNonce(): string | undefined {
  return useContext(NonceContext);
}

const UNSAFE_CSS = /[;{}<>"'\\]/;

export function cssValue(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === "" || UNSAFE_CSS.test(trimmed)) return undefined;
  return trimmed;
}

export interface StyleRuleProps {
  selector: string;
  declarations: Readonly<Record<string, string>>;
}

export function StyleRule(props: StyleRuleProps) {
  const { selector, declarations } = props;
  const nonce = useStyleNonce();
  const body = Object.entries(declarations)
    .map(([property, value]) => `${property}:${value}`)
    .join(";");
  return <style nonce={nonce}>{`${selector}{${body}}`}</style>;
}
