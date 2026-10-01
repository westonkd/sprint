import { defineAgentMeta } from "@/agent/registry.ts";
import { CHOOSE_TOOL } from "./tool.ts";

export const choiceGridMeta = defineAgentMeta({
  name: "ChoiceGrid",
  category: "input",
  summary:
    "A question answered by pressing one of several large, equal-sized tiles, each a glyph such as an emoji over a text label. It works in two modes: submit mode, where every tile is a real submit button carrying its value, and select mode, where the tiles are a radio group driven by value and onChange.",
  whenToUse:
    'Use it when one tap should answer a question and the options are few enough to show at once, ideally six to twelve: an emoji verification step at sign-in ("pick the emoji you were sent"), a reaction, a mood, or a category picked by icon. Submit mode needs no client state, so it suits a server-rendered form page: give it a name and no onChange, and the pressed tile submits its form with name=value. Use select mode, by passing value and onChange, when the answer is one field among several and the form is submitted by something else. A verification challenge meant for a human, such as the emoji check, should pass agentTool={false} so the page does not offer an agent a one-call way through it.',
  whenNotToUse:
    "Do not use it for two to four short text options, which is a SegmentedControl, for long lists, which are a Select, or for choosing several at once, which is a set of Checkboxes. Do not put components in an option: label and glyph are strings, and the label is the tile's accessible name because an emoji on its own is not one.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'The question the tiles answer. Rendered as the legend of the grid\'s fieldset and used to derive the tool name, so write it as a person would read it, such as "Which emoji were you sent?".',
      required: true,
    },
    options: {
      kind: "array",
      description:
        "The tiles in display order: { value, label, glyph? }. value is what the form receives, label is what a person reads and what the choose tool accepts, and glyph is a short string such as an emoji drawn large above the label and hidden from assistive technology.",
      required: true,
    },
    columns: {
      kind: "enum",
      values: ["2", "3", "4"],
      description:
        "How many columns the grid has at 40rem and wider. Narrower screens always get two, so every tile stays large enough to press.",
      default: 3,
    },
    name: {
      kind: "string",
      description:
        "The form field name. In submit mode each tile is a submit button with this name and its option's value; in select mode a hidden input carries the selected value under this name.",
    },
    value: {
      kind: "string",
      description:
        "Select mode only: the value of the selected option. Ignored in submit mode, where nothing stays selected.",
    },
    onChange: {
      kind: "handler",
      description:
        "Passing it switches the grid to select mode. Called with the chosen value; the choose tool drives a real click, so it runs for agent choices too.",
    },
    disabled: {
      kind: "boolean",
      description: "Disable every tile and unregister the choose tool.",
      default: false,
    },
    agentName: {
      kind: "string",
      description:
        "Override the label used to derive the tool name, when the question is long or two grids on a page would collide.",
    },
    agentTool: {
      kind: "boolean",
      description:
        "Set false to render the grid without registering a choose tool. Pass false for any challenge that exists to prove a human is present.",
      default: true,
    },
  },
  state: {
    mode: {
      description:
        "submit when pressing a tile submits the form, select when it changes a selection.",
      attribute: "data-sprint-mode",
      values: ["submit", "select"],
    },
    value: {
      description: "Select mode: the value of the option currently selected.",
      attribute: "data-sprint-value",
    },
    columns: {
      description: "The column count at 40rem and wider.",
      attribute: "data-sprint-columns",
      values: ["2", "3", "4"],
    },
    disabled: {
      description: "Present when no tile can be pressed.",
      attribute: "data-sprint-disabled",
    },
  },
  tools: {
    choose: CHOOSE_TOOL,
  },
  agentView: {
    example:
      '- **ChoiceGrid** "Pick a reaction" [columns=4, mode=select, value=fire] → tool `choose-pick-a-reaction`\n  - part `choice` "Thumbs up" [value=up]\n  - part `choice` "Fire" [checked, value=fire]\n  - part `choice` "Laughing" [value=laugh]\n  - part `choice` "Sad" [value=sad]',
  },
  examples: [
    {
      title: "An emoji verification check",
      description:
        "Submit mode in a plain form: each tile is a submit button named emoji, so the form posts emoji=fox with no client state. agentTool is false because the check exists to prove a person is present.",
      code: '<form method="post" action="verify">\n  <ChoiceGrid\n    label="Which emoji were you sent?"\n    name="emoji"\n    agentTool={false}\n    options={[\n      { value: "fox", label: "Fox", glyph: "🦊" },\n      { value: "rocket", label: "Rocket", glyph: "🚀" },\n      { value: "cactus", label: "Cactus", glyph: "🌵" },\n      { value: "anchor", label: "Anchor", glyph: "⚓" },\n      { value: "pizza", label: "Pizza", glyph: "🍕" },\n      { value: "comet", label: "Comet", glyph: "☄️" },\n    ]}\n  />\n</form>',
    },
    {
      title: "Picking one with state",
      description:
        "Select mode with four columns: the tiles are a radio group, and in agent view each one renders as its own control so an agent can choose without WebMCP.",
      code: '<ChoiceGrid\n  label="Pick a reaction"\n  columns={4}\n  name="reaction"\n  value={reaction}\n  onChange={setReaction}\n  options={[\n    { value: "up", label: "Thumbs up", glyph: "👍" },\n    { value: "fire", label: "Fire", glyph: "🔥" },\n    { value: "laugh", label: "Laughing", glyph: "😂" },\n    { value: "sad", label: "Sad", glyph: "😢" },\n  ]}\n/>',
    },
    {
      title: "A disabled grid",
      description:
        "Disabled unregisters the tool and renders the agent view as text only, so an agent cannot press a tile a person could not.",
      code: '<ChoiceGrid\n  label="Delivery window"\n  columns={2}\n  disabled\n  value="morning"\n  onChange={setWindow}\n  options={[\n    { value: "morning", label: "Morning", glyph: "☀" },\n    { value: "evening", label: "Evening", glyph: "☾" },\n  ]}\n/>',
    },
  ],
  a11y: {
    role: "group, or radiogroup in select mode",
    keyboard: [
      "Tab reaches every tile in submit mode, and the group once in select mode",
      "Arrow keys move to the next or previous tile; in select mode they also select it",
      "Home and End move to the first and last tile",
      "Enter or Space presses the focused tile",
    ],
    notes:
      "The root is a fieldset labelled by its legend. A glyph is aria-hidden and the label is always visible text, so each tile's accessible name is its label. In select mode, selection follows focus with a roving tabindex. In agent view a hidden input stays in the form so a choice made there submits the same field a person's would.",
  },
  relatedComponents: ["SegmentedControl", "Select", "Button"],
});
