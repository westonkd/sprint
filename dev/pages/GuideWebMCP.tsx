import {
  CodeBlock,
  Link,
  List,
  PageHeader,
  Panel,
  Stack,
  Table,
  Tag,
  Text,
} from "../../src/index.ts";

const IMPERATIVE = `const controller = new AbortController();

await document.modelContext.registerTool(
  {
    name: "submit-support-request",
    description: "Submit a support request and return its ticket number.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", enum: ["billing", "technical"] },
        message: { type: "string", description: "What went wrong." },
      },
      required: ["category", "message"],
    },
    execute: async (inputs, { signal }) => {
      const response = await fetch("/support", {
        method: "POST",
        body: JSON.stringify(inputs),
        signal,
      });
      const ticket = await response.json();
      return \`Submitted. Ticket \${ticket.id}, queued for \${inputs.category}.\`;
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
  },
  { signal: controller.signal },
);

controller.abort();`;

const DECLARATIVE = `<form
  toolname="submitSupportRequest"
  tooldescription="Submit a request for support."
  action="/support"
>
  <label for="message">What went wrong</label>
  <textarea id="message" name="message"></textarea>

  <select name="category" required
    toolparamdescription="Determines routing destination.">
    <option value="billing">Billing</option>
    <option value="technical">Technical</option>
  </select>

  <button type="submit">Submit</button>
</form>`;

const DERIVED = `{
  "name": "submitSupportRequest",
  "description": "Submit a request for support.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "message": { "type": "string" },
      "category": {
        "type": "string",
        "description": "Determines routing destination.",
        "enum": ["billing", "technical"]
      }
    }
  }
}`;

const DETECT = `if (document.modelContext) {
  register();
} else {
  // Every other browser. The page must still work.
}`;

const LOSSY = [
  {
    id: "vision",
    cells: {
      approach: "Screenshot and vision",
      why: "Slow, expensive, and blind to state the pixels do not show.",
    },
  },
  {
    id: "dom",
    cells: {
      approach: "Raw DOM",
      why: "Enormous, mostly irrelevant, and unstable across releases.",
    },
  },
  {
    id: "a11y",
    cells: {
      approach: "Accessibility tree",
      why: "Describes how to perceive a widget, not what it means in your app or what you can do with it.",
    },
  },
  {
    id: "bespoke",
    cells: {
      approach: "A bespoke agent API",
      why: "A second implementation of your surface that drifts from the UI.",
    },
  },
];

const LIMITS = [
  { id: "tool", cells: { limit: "Tool description", value: "500 characters" } },
  { id: "param", cells: { limit: "Parameter description", value: "150 characters" } },
  { id: "output", cells: { limit: "Tool output", value: "1,500 characters" } },
];

const ANNOTATIONS = [
  {
    id: "readOnlyHint",
    cells: {
      annotation: <code>readOnlyHint</code>,
      meaning:
        "True when calling the tool changes nothing. Lets an agent skip a confirmation it does not need.",
    },
  },
  {
    id: "untrustedContentHint",
    cells: {
      annotation: <code>untrustedContentHint</code>,
      meaning:
        "True when the output can contain content you did not author. Set it honestly; guessing low is the dangerous direction.",
    },
  },
];

const RULES = [
  <>
    <strong>One tool, one action.</strong> Overlapping tools make selection harder, and
    selection is where agents fail.
  </>,
  <>
    <strong>Let the verb carry the truth.</strong> <code>create-event</code> creates it;{" "}
    <code>start-event-creation</code> opens a form. Do not blur them.
  </>,
  <>
    <strong>Describe capability, not limitation.</strong> The description is the entire
    prompt the model gets about this tool.
  </>,
  <>
    <strong>Take values in the user's terms.</strong> <code>shipping: "Express"</code>,
    not <code>shippingMethodId: 4</code>. Never make the model compute an argument.
  </>,
  <>
    <strong>Validate strictly, schema loosely.</strong> A descriptive error the model
    can read beats a schema it cannot satisfy.
  </>,
  <>
    <strong>Register contextually.</strong> A tool that exists but always fails is worse
    than one that is absent.
  </>,
  <>
    <strong>Fewer tools is faster and more accurate.</strong> Every registered tool
    costs context and widens the choice.
  </>,
];

export function GuideWebMCP() {
  return (
    <article className="doc">
      <Stack gap="loose">
        <PageHeader label="WebMCP" tags={<Tag>background</Tag>}>
          <Text>
            A web platform API that lets a page hand an agent a set of callable tools,
            instead of making the agent guess at your DOM. This page is background on
            the platform itself. What Sprint does with it is on the next page.
          </Text>
        </PageHeader>

        <Panel headingLevel={2} label="The problem it solves">
          <Stack gap="tight">
            <Text>
              Agents operating web UIs today work from the wrong artifact. They get a
              DOM built for pixels: wrapper divs, hashed class names, and application
              state encoded as visual affordances. So they scrape, guess, and break on
              your next refactor. Every workaround is lossy.
            </Text>
            <Table
              label="Lossy workarounds"
              columns={[
                { key: "approach", header: "Approach", width: "14rem" },
                { key: "why", header: "Why it falls short" },
              ]}
              rows={LOSSY}
            />
            <Text>
              WebMCP's bet is that the person who knows what a control means is the
              person who wrote it, and that knowledge belongs in the page.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Not the same as an MCP server">
          <Text>
            MCP servers run outside the browser and speak to a backend. WebMCP tools run{" "}
            <em>in the page</em>, in the user's own session, with their cookies, their
            permissions, and whatever state the app has in memory. There is no separate
            service to deploy and no second auth story. The tradeoff is that a tool only
            exists while the tab is open.
          </Text>
        </Panel>

        <Panel headingLevel={2} label="The imperative API">
          <Stack gap="tight">
            <Text>
              The entry point is <code>document.modelContext</code>. A tool is a
              descriptor with a name, a description, a JSON Schema for its inputs, and
              an <code>execute</code> function. Unregistration goes through an{" "}
              <code>AbortController</code>, which maps cleanly onto a framework's
              teardown.
            </Text>
            <CodeBlock code={IMPERATIVE} />
            <Text tone="muted" size="small">
              <code>execute</code> returns a string. That string is what the model
              reads, so it should describe the outcome, not just report success. Also
              available: <code>getTools()</code>, <code>executeTool()</code>, and a{" "}
              <code>toolchange</code> event.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="The declarative API">
          <Stack gap="tight">
            <Text>
              For forms, the browser can derive the whole schema from the markup. Four
              attributes, no JavaScript.
            </Text>
            <CodeBlock caption="html" language="text" code={DECLARATIVE} />
            <Text tone="muted" size="small">
              The browser turns that into:
            </Text>
            <CodeBlock caption="json" language="json" code={DERIVED} />
            <Text tone="muted" size="small">
              Note that <code>enum</code> came from the <code>&lt;option&gt;</code>{" "}
              values for free. <code>toolautosubmit</code> additionally lets the agent
              submit without a human pressing the button.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Availability, and why you must degrade">
          <Stack gap="tight">
            <Text>
              Chrome 149 and later, behind an origin trial or{" "}
              <code>chrome://flags/#enable-webmcp-testing</code> locally. It requires an
              origin-isolated document and is gated by the <code>tools</code>{" "}
              permissions policy, which defaults to <code>self</code>.
            </Text>
            <Text>
              That is a narrow slice of the web. Treat WebMCP as an enhancement on top
              of a page that already works, never as the mechanism that makes it work.
            </Text>
            <CodeBlock code={DETECT} />
            <Text tone="muted" size="small">
              It is also an origin trial, not a shipped standard. The shape above can
              change.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Hard limits">
          <Stack gap="tight">
            <Table
              label="Platform limits"
              columns={[
                { key: "limit", header: "Limit", width: "14rem" },
                { key: "value", header: "Value" },
              ]}
              rows={LIMITS}
            />
            <Text tone="muted" size="small">
              These exist so a tool cannot bury instructions in a wall of text and talk
              its way past an agent's guardrails. Design for them: paginate long reads
              rather than truncating mid-structure.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Security worth internalising">
          <Stack gap="tight">
            <Text>
              A tool's output becomes model input. If it can contain user-generated or
              third-party content, that content can carry instructions, and models are
              susceptible to indirect prompt injection. Two annotations exist to help an
              agent decide how much to trust a result and whether to confirm before
              acting.
            </Text>
            <Table
              label="Trust annotations"
              columns={[
                { key: "annotation", header: "Annotation", width: "14rem" },
                { key: "meaning", header: "What it means" },
              ]}
              rows={ANNOTATIONS}
            />
            <Text tone="muted" size="small">
              <code>exposedTo</code> can expose a tool to other origins. Only ever list
              origins you actually trust.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Writing tools an agent can actually use">
          <List label="Rules for writing tools" items={RULES} />
        </Panel>

        <Panel headingLevel={2} label="Further reading">
          <List
            label="Further reading"
            items={[
              <Link href="https://developer.chrome.com/docs/ai/webmcp" external>
                Chrome documentation
              </Link>,
              <Link href="https://github.com/webmachinelearning/webmcp" external>
                Specification and explainer
              </Link>,
            ]}
          />
        </Panel>
      </Stack>
    </article>
  );
}
