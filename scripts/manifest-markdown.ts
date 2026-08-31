import type {
  AgentComponentMeta,
  AgentManifest,
  AgentToolSpec,
} from "../src/agent/types.ts";

function cell(text: string): string {
  return text
    .replace(/\|/g, "\\|")
    .replace(/\s*\n\s*/g, " ")
    .trim();
}

function pipeTable(
  headers: readonly string[],
  rows: readonly (readonly string[])[],
): string[] {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ];
}

function toolDescriptor(tool: AgentToolSpec): string {
  return JSON.stringify(
    {
      name: `<scope>-${tool.verb}-<label>`,
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: {
        readOnlyHint: tool.readOnly,
        untrustedContentHint: tool.untrustedContent,
      },
    },
    null,
    2,
  );
}

export function componentMarkdown(meta: AgentComponentMeta): string {
  const lines: string[] = [
    `# ${meta.name}`,
    "",
    `> ${meta.summary}`,
    "",
    `- Category: ${meta.category}`,
    `- Status: ${meta.status}`,
    "",
    "## When to use",
    "",
    meta.whenToUse,
  ];

  if (meta.whenNotToUse !== undefined) {
    lines.push("", "### When not to", "", meta.whenNotToUse);
  }

  lines.push(
    "",
    "## Install",
    "",
    "```tsx",
    `import { ${meta.name} } from "@westonkd/sprint";`,
    `import "@westonkd/sprint/styles.css";`,
    "```",
  );

  if (meta.examples.length > 0) {
    lines.push("", "## Examples");
    for (const example of meta.examples) {
      lines.push("", `### ${example.title}`);
      if (example.description !== undefined) {
        lines.push("", example.description);
      }
      lines.push("", "```tsx", example.code, "```");
    }
  }

  const props = Object.entries(meta.props);
  if (props.length > 0) {
    lines.push(
      "",
      "## Props",
      "",
      ...pipeTable(
        ["Prop", "Kind", "Default", "Description"],
        props.map(([name, spec]) => [
          `\`${name}\``,
          [
            spec.kind,
            spec.required === true ? "(required)" : "",
            spec.values === undefined ? "" : `${spec.values.join(" \\| ")}`,
          ]
            .filter((part) => part !== "")
            .join(" "),
          spec.default === undefined ? "—" : `\`${JSON.stringify(spec.default)}\``,
          spec.description,
        ]),
      ),
    );
  }

  const state = Object.entries(meta.state ?? {});
  if (state.length > 0) {
    lines.push(
      "",
      "## State attributes",
      "",
      "Public API: agents write selectors against these.",
      "",
      ...pipeTable(
        ["Attribute", "Values", "Description"],
        state.map(([, spec]) => [
          `\`${spec.attribute}\``,
          spec.values === undefined ? "present or absent" : spec.values.join(" \\| "),
          spec.description,
        ]),
      ),
    );
  }

  const tools = Object.entries(meta.tools ?? {});
  if (tools.length > 0) {
    lines.push("", "## WebMCP tools");
    for (const [, tool] of tools) {
      lines.push(
        "",
        `### \`<scope>-${tool.verb}-<label>\``,
        "",
        tool.description,
        "",
        `- Read-only: ${tool.readOnly ? "yes" : "no"}`,
        `- Registered when: ${tool.registeredWhen}`,
      );
      if (tool.unregisteredWhen !== undefined) {
        lines.push(`- Unregistered when: ${tool.unregisteredWhen}`);
      }
      lines.push("", "```json", toolDescriptor(tool), "```");
    }
  }

  if (meta.agentView !== undefined) {
    lines.push(
      "",
      "## Agent view",
      "",
      "In agent view the component renders as this Markdown line, projected from the same props and state as the human rendering:",
      "",
      "```",
      meta.agentView.example,
      "```",
    );
  }

  if (meta.a11y !== undefined) {
    lines.push("", "## Accessibility", "");
    if (meta.a11y.role !== undefined) lines.push(`- Role: \`${meta.a11y.role}\``);
    if (meta.a11y.keyboard !== undefined) {
      lines.push(`- Keyboard: ${meta.a11y.keyboard.join(", ")}`);
    }
    if (meta.a11y.notes !== undefined) lines.push(`- Notes: ${meta.a11y.notes}`);
  }

  return `${lines.join("\n")}\n`;
}

export function llmsText(manifest: AgentManifest): string {
  const lines: string[] = [
    "# Sprint",
    "",
    "> An agent-forward React component library. Every component renders a styled human view and projects a plain-Markdown agent view from the same definition, and registers its actions as WebMCP tools (document.modelContext, Chrome 149+).",
    "",
    `Component roots carry \`${manifest.conventions.componentAttribute}="<ComponentName>"\`, addressable parts carry \`${manifest.conventions.partAttribute}\`, and runtime state is reflected as \`${manifest.conventions.stateAttributePrefix}<state>\` attributes. WebMCP tool names follow \`${manifest.conventions.toolNaming}\`.`,
    "",
    "## Components",
    "",
    ...manifest.components.map(
      (component) =>
        `- [${component.name}](/components/${component.name}.md): ${cell(component.summary)}`,
    ),
    "",
    "## Reference",
    "",
    "- [agent-manifest.json](/agent-manifest.json): the machine-readable catalogue of every component, prop, state attribute, example, and WebMCP tool descriptor",
    "",
  ];
  return lines.join("\n");
}
