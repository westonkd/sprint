import { createContext, useContext } from "react";

export const MAX_NAME_LENGTH = 48;

export function slug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toolName(
  scope: readonly string[],
  verb: string,
  label: string,
): string | null {
  const tail = slug(label);
  if (tail === "") return null;

  const core = [slug(verb), tail].filter((part) => part !== "").join("-");
  const segments = scope.map(slug).filter((part) => part !== "");

  while (
    segments.length > 0 &&
    [...segments, core].join("-").length > MAX_NAME_LENGTH
  ) {
    segments.shift();
  }

  const name = [...segments, core].join("-");
  if (name.length <= MAX_NAME_LENGTH) return name;

  const cut = name.slice(0, MAX_NAME_LENGTH);
  const boundary = cut.lastIndexOf("-");
  return boundary > 0 ? cut.slice(0, boundary) : cut;
}

export type ClaimListener = () => void;

interface Claim {
  holders: Set<symbol>;
  listeners: Map<symbol, ClaimListener>;
}

const claims = new Map<string, Claim>();

function claimFor(name: string): Claim {
  const existing = claims.get(name);
  if (existing !== undefined) return existing;
  const created: Claim = { holders: new Set(), listeners: new Map() };
  claims.set(name, created);
  return created;
}

export function claimToolName(
  name: string,
  holder: symbol,
  onChange: ClaimListener,
): () => void {
  const claim = claimFor(name);
  claim.holders.add(holder);
  claim.listeners.set(holder, onChange);

  for (const [id, listener] of claim.listeners) {
    if (id !== holder) listener();
  }

  return () => {
    claim.holders.delete(holder);
    claim.listeners.delete(holder);
    if (claim.holders.size === 0) {
      claims.delete(name);
      return;
    }
    for (const listener of claim.listeners.values()) listener();
  };
}

export function holdsToolName(name: string, holder: symbol): boolean {
  const claim = claims.get(name);
  if (claim === undefined) return false;
  return claim.holders.size === 1 && claim.holders.has(holder);
}

export function toolNameHolderCount(name: string): number {
  return claims.get(name)?.holders.size ?? 0;
}

export function __resetToolNames(): void {
  claims.clear();
}

export interface AgentScopeValue {
  path: readonly string[];
}

const AgentScopeContext = createContext<AgentScopeValue>({ path: [] });

export const AgentScopeProvider = AgentScopeContext.Provider;

export function useAgentScope(): readonly string[] {
  return useContext(AgentScopeContext).path;
}
