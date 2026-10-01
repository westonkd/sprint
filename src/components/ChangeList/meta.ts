import { defineAgentMeta } from "@/agent/registry.ts";

export const changeListMeta = defineAgentMeta({
  name: "ChangeList",
  category: "display",
  summary:
    "A review of what will change or has changed: each row is marked added, removed or changed, and a changed row reads from → to. The kind of every row is a glyph, a tone and spoken text at once, and an agent reads it as state rather than from the glyph.",
  whenToUse:
    "Use it to show a diff before someone confirms it: a role change from Write to Maintain, members added to a team, settings a migration will drop. Pass the changes as data so each row is an addressable part carrying its kind, from and to. It registers no tool, because it only reports: the action is the Button that confirms the change, and the rows are already fully readable in the agent view.",
  whenNotToUse:
    "Do not use it for a list whose marks carry no meaning; that is List. Do not use it for a full record of fields; that is DescriptionList or Table. Do not put components in a change; label, from, to and detail are text.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        "What is changing. Names the list for a screen reader and for the agent view.",
      required: true,
    },
    changes: {
      kind: "array",
      description:
        'The rows in order, each { kind, label, from?, to?, detail? }. kind is "added", "removed" or "changed"; label is the thing that changed; from and to are its old and new values, usually on a changed row; detail is one short line of consequence beneath it.',
      required: true,
    },
    emptyLabel: {
      kind: "string",
      description: "What the list says when there is nothing to change.",
      default: "No changes",
    },
  },
  state: {
    changes: {
      description: "How many rows the list has.",
      attribute: "data-sprint-changes",
    },
    added: {
      description: "How many rows are additions. Absent when there are none.",
      attribute: "data-sprint-added",
    },
    removed: {
      description: "How many rows are removals. Absent when there are none.",
      attribute: "data-sprint-removed",
    },
    changed: {
      description: "How many rows are changes of value. Absent when there are none.",
      attribute: "data-sprint-changed",
    },
    empty: {
      description: "Present when there is nothing to change.",
      attribute: "data-sprint-empty",
    },
    kind: {
      description: "On a change: whether the row was added, removed or changed.",
      attribute: "data-sprint-kind",
      values: ["added", "removed", "changed"],
    },
    from: {
      description: "On a change: the old value, when it has one.",
      attribute: "data-sprint-from",
    },
    to: {
      description: "On a change: the new value, when it has one.",
      attribute: "data-sprint-to",
    },
  },
  agentView: {
    example:
      '- **ChangeList** "Role changes" [changed=1, changes=1]\n  - part `change` "Changed: Ada Lovelace, from Write to Maintain" [from=Write, kind=changed, to=Maintain]',
  },
  a11y: {
    role: "list",
    notes:
      "A ul named by its label, with an explicit list role. The +, − and → glyphs are aria-hidden; each row instead starts with visually hidden text naming its kind, and a changed row says from and to in words, so the kind never rests on the glyph or its color alone. Old values are a del and new values an ins.",
  },
  relatedComponents: ["List", "DescriptionList", "Dialog"],
  examples: [
    {
      title: "A role change",
      description:
        "The one row a permission review is about: what it was, and what it becomes.",
      code: '<ChangeList\n  label="Role changes"\n  changes={[{ kind: "changed", label: "Ada Lovelace", from: "Write", to: "Maintain" }]}\n/>',
    },
    {
      title: "A review before confirming",
      description:
        "Additions, removals and changes together, each with a line of consequence where one matters.",
      code: '<ChangeList\n  label="Team changes"\n  changes={[\n    { kind: "added", label: "Grace Hopper", detail: "Gets read access to every repository." },\n    { kind: "removed", label: "Alan Turing" },\n    { kind: "changed", label: "Ada Lovelace", from: "Write", to: "Maintain" },\n  ]}\n/>',
    },
    {
      title: "Nothing to change",
      description: "An empty review says so rather than rendering nothing.",
      code: '<ChangeList label="Role changes" changes={[]} emptyLabel="No role changes" />',
    },
  ],
});
