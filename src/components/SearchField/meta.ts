import { defineAgentMeta } from "@/agent/registry.ts";
import { SEARCH_TOOL } from "./tool.ts";

export const searchFieldMeta = defineAgentMeta({
  name: "SearchField",
  category: "input",
  summary:
    "A search box inside its own search landmark: a labelled query field with a clear control, Escape to clear, Enter to submit, and an optional page-wide key that focuses it. It registers one search tool that sets the query and submits it.",
  whenToUse:
    "Use it to filter or search a collection on the page, such as narrowing a users list by name. The landmark lets screen reader users jump straight to it, and the optional shortcut gives keyboard users the familiar slash-to-search.",
  whenNotToUse:
    "Do not use it for any other single-line value; a name, an email address, or an identifier is a TextInput. Do not use it to choose from a short known set, which is a Select or a SegmentedControl. Do not give two fields on one page the same shortcut.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What is being searched, as a noun phrase such as "Users". Names the landmark and the field, and derives the tool name, so "Users" becomes search-users.',
      required: true,
    },
    value: {
      kind: "string",
      description: "The current query. The field is fully controlled.",
      required: true,
    },
    onChange: {
      kind: "handler",
      description:
        "Called with the new query on every change, including the clear control, Escape, and the search tool.",
      required: true,
    },
    onSubmit: {
      kind: "handler",
      description:
        "Called with the query when Enter is pressed or the search tool runs. Leave it off for a live filter that reacts to onChange alone.",
    },
    placeholder: {
      kind: "string",
      description: 'Ghost text shown while the field is empty, e.g. "Name or email".',
    },
    hideLabel: {
      kind: "boolean",
      description:
        "Hide the label visually while keeping it for screen readers and agents. Pair it with a placeholder so sighted people still know what the field searches.",
      default: false,
    },
    shortcut: {
      kind: "string",
      description:
        'A single key that focuses the field from anywhere on the page, shown as a key chip while the field is empty and unfocused. Ignored while focus is in another editable element or a modifier is held. Pass "/" for the common convention; omit or pass false for none.',
    },
    name: {
      kind: "string",
      description: "The native form name of the query input.",
    },
    disabled: {
      kind: "boolean",
      description: "Disable the field, its shortcut, and its search tool.",
      default: false,
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the tool name, when two search fields on a page would otherwise collide.",
    },
    agentTool: {
      kind: "boolean",
      description: "Set false to render the field without registering a search tool.",
      default: true,
    },
  },
  state: {
    value: {
      description: "The current query, absent while the field is empty.",
      attribute: "data-sprint-value",
    },
    empty: {
      description: "Present while the field holds no query.",
      attribute: "data-sprint-empty",
    },
    shortcut: {
      description: "The key that focuses the field from anywhere on the page.",
      attribute: "data-sprint-shortcut",
    },
    disabled: {
      description: "Present when the field cannot be edited.",
      attribute: "data-sprint-disabled",
    },
  },
  tools: {
    search: SEARCH_TOOL,
  },
  agentView: {
    example: '- **SearchField** "Users" [empty, shortcut=/] → tool `search-users`',
  },
  examples: [
    {
      title: "Filtering a list",
      description:
        "A live filter: onChange narrows the list as the person types, so there is no onSubmit. The label is hidden and the placeholder says what can be matched.",
      code: '<SearchField\n  label="Users"\n  hideLabel\n  value={query}\n  onChange={setQuery}\n  placeholder="Name or email"\n/>',
    },
    {
      title: "A slash shortcut",
      description:
        "Pressing / anywhere on the page focuses the field unless focus is already in something editable. The key chip disappears once the field has focus or a query.",
      code: '<SearchField\n  label="Users"\n  value={query}\n  onChange={setQuery}\n  shortcut="/"\n  placeholder="Name or email"\n/>',
    },
    {
      title: "Submitting a query",
      description:
        "For a search that is too costly to run on every keystroke, onSubmit receives the query on Enter and when the search tool runs.",
      code: '<SearchField\n  label="Flight logs"\n  value={query}\n  onChange={setQuery}\n  onSubmit={runSearch}\n  placeholder="Callsign or tail number"\n/>',
    },
  ],
  a11y: {
    role: "search",
    keyboard: [
      "Enter submits the query",
      "Escape clears a non-empty query and keeps focus; on an empty field it passes through, so an enclosing dialog can close",
      "The shortcut key, when set, focuses the field from anywhere on the page",
    ],
    notes:
      "The root is a form with role search, labelled by the field's label, so it is listed as a search landmark. The input is type search and announces its shortcut with aria-keyshortcuts; the key chip itself is hidden from assistive technology. The clear control appears only while there is a query, and returns focus to the field.",
  },
  relatedComponents: ["TextInput"],
});
