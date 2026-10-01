import { defineAgentMeta } from "@/agent/registry.ts";

export const stepsMeta = defineAgentMeta({
  name: "Steps",
  category: "display",
  summary:
    "An ordered set of numbered steps a person works through: each one a number badge, a short title and an optional body, with a rule between them. A step can be marked done or current, so the list doubles as a record of how far someone has got.",
  whenToUse:
    "Use it when the order is the instruction: a handful of things to do one after another, each worth a title of its own, like the two things to send someone or the stages of a setup. Mark the step in progress as current and the finished ones as done when the page knows; leave every state off when the steps are simply instructions. Each step is an addressable part carrying its position and state, so an agent can say which step is next without counting lines.",
  whenNotToUse:
    "Do not use it for a plain numbered list of short points with no titles or progress; that is List with ordered. Do not use it as a wizard that moves between screens: Steps only displays where someone is, it has no actions and registers no WebMCP tool, because there is nothing to press and an agent reads every step and its state from the agent view. Pair it with a Button when the page itself advances. Do not put components or links in a step; title and body are plain strings.",
  status: "experimental",
  props: {
    label: {
      kind: "string",
      description:
        'What the steps achieve, as a short phrase like "Send Tess two things". Names the list for a screen reader and for the agent view.',
      required: true,
    },
    steps: {
      kind: "array",
      description:
        'The steps in order, each { title: string; body?: string; state?: "done" | "current" }. Title is the instruction in a few words; body is an optional sentence of detail. A step with no state is upcoming. Mark at most one step current.',
      required: true,
    },
    doneLabel: {
      kind: "string",
      description:
        "What a screen reader hears as the description of a finished step, since the done mark is drawn rather than written.",
      default: "Done",
    },
    emptyLabel: {
      kind: "string",
      description: "What the list says when it has no steps.",
      default: "No steps",
    },
  },
  state: {
    steps: {
      description: "How many steps there are.",
      attribute: "data-sprint-steps",
    },
    complete: {
      description: "Present when every step is done.",
      attribute: "data-sprint-complete",
    },
    empty: {
      description: "Present when there are no steps.",
      attribute: "data-sprint-empty",
    },
    index: {
      description:
        "On a step: its 1-based position, which is also the number in its badge.",
      attribute: "data-sprint-index",
    },
    done: {
      description: "On a step: present once the step is finished.",
      attribute: "data-sprint-done",
    },
    current: {
      description: "On a step: present on the step in progress.",
      attribute: "data-sprint-current",
    },
  },
  agentView: {
    example:
      '- **Steps** "Send Tess two things" [steps=2]\n  - part `step` "Copy the link" [index=1]\n  - part `step` "Pass on the emoji" [index=2]',
  },
  a11y: {
    role: "list",
    notes:
      'A real ol named by its label, with an explicit list role because the drawn badges require list-style none and Safari would otherwise drop the list semantics, so the position of each step is announced. The badge number is aria-hidden for the same reason. The current step carries aria-current="step", and a done step is described by doneLabel. Title and body are read as one item, separated by a colon that is hidden visually.',
  },
  relatedComponents: ["List", "Progress", "Panel"],
  examples: [
    {
      title: "Send Tess two things",
      description:
        "The plainest case: two instructions in order, with no progress to report.",
      code: '<Steps\n  label="Send Tess two things"\n  steps={[{ title: "Copy the link" }, { title: "Pass on the emoji" }]}\n/>',
    },
    {
      title: "Partway through",
      description:
        "A finished step, the one in progress, and one still to come, each with a line of detail.",
      code: '<Steps\n  label="Connect a tool"\n  steps={[\n    {\n      title: "Register the tool",\n      body: "Give it a name and an input schema.",\n      state: "done",\n    },\n    {\n      title: "Drive the DOM",\n      body: "Click the real element rather than calling a prop.",\n      state: "current",\n    },\n    { title: "Return the new state", body: "Read it back from the page." },\n  ]}\n/>',
    },
    {
      title: "Every step done",
      description: "When all steps are done the list publishes that it is complete.",
      code: '<Steps\n  label="Send Tess two things"\n  steps={[\n    { title: "Copy the link", state: "done" },\n    { title: "Pass on the emoji", state: "done" },\n  ]}\n/>',
    },
  ],
});
