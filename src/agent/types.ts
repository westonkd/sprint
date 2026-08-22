export type AgentPropKind =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "node"
  | "handler"
  | "object"
  | "array";

export interface AgentPropSpec {
  kind: AgentPropKind;
  description: string;
  required?: boolean;
  default?: unknown;
  values?: readonly string[];
  deprecated?: string;
}

export interface AgentActionSpec {
  description: string;
  selector: string;
  params?: Record<string, AgentPropSpec>;
  idempotent?: boolean;
}

export interface AgentStateSpec {
  description: string;
  attribute: string;
  values?: readonly string[];
}

export interface AgentExample {
  title: string;
  description?: string;
  code: string;
}

export interface AgentComponentMeta {
  name: string;
  category: string;
  summary: string;
  whenToUse: string;
  whenNotToUse?: string;
  status: "experimental" | "stable" | "deprecated";
  props: Record<string, AgentPropSpec>;
  actions?: Record<string, AgentActionSpec>;
  state?: Record<string, AgentStateSpec>;
  examples: readonly AgentExample[];
  a11y?: {
    role?: string;
    keyboard?: readonly string[];
    notes?: string;
  };
  relatedComponents?: readonly string[];
}

export interface AgentManifest {
  library: string;
  version: string;
  conventions: {
    componentAttribute: string;
    partAttribute: string;
    stateAttributePrefix: string;
  };
  components: readonly AgentComponentMeta[];
}
