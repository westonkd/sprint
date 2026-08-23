import { CodeBlock } from "../ui/CodeBlock.tsx";

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

export function GuideWebMCP() {
  return (
    <article className="doc">
      <header className="doc-head">
        <div className="doc-title">
          <h1>WebMCP</h1>
          <span className="chip">background</span>
        </div>
        <p className="lede">
          A web platform API that lets a page hand an agent a set of callable tools,
          instead of making the agent guess at your DOM. This page is background on the
          platform itself. What Sprint does with it is on the next page.
        </p>
      </header>

      <section className="pane">
        <h2>The problem it solves</h2>
        <p>
          Agents operating web UIs today work from the wrong artifact. They get a DOM
          built for pixels: wrapper divs, hashed class names, and application state
          encoded as visual affordances. So they scrape, guess, and break on your next
          refactor. Every workaround is lossy.
        </p>
        <table className="grid">
          <thead>
            <tr>
              <th>Approach</th>
              <th>Why it falls short</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Screenshot and vision</td>
              <td>Slow, expensive, and blind to state the pixels do not show.</td>
            </tr>
            <tr>
              <td>Raw DOM</td>
              <td>Enormous, mostly irrelevant, and unstable across releases.</td>
            </tr>
            <tr>
              <td>Accessibility tree</td>
              <td>
                Describes how to <em>perceive</em> a widget, not what it means in your
                app or what you can do with it.
              </td>
            </tr>
            <tr>
              <td>A bespoke agent API</td>
              <td>A second implementation of your surface that drifts from the UI.</td>
            </tr>
          </tbody>
        </table>
        <p>
          WebMCP's bet is that the person who knows what a control means is the person
          who wrote it, and that knowledge belongs in the page.
        </p>
      </section>

      <section className="pane">
        <h2>Not the same as an MCP server</h2>
        <p>
          MCP servers run outside the browser and speak to a backend. WebMCP tools run{" "}
          <em>in the page</em>, in the user's own session, with their cookies, their
          permissions, and whatever state the app has in memory. There is no separate
          service to deploy and no second auth story. The tradeoff is that a tool only
          exists while the tab is open.
        </p>
      </section>

      <section className="pane">
        <h2>The imperative API</h2>
        <p>
          The entry point is <code>document.modelContext</code>. A tool is a descriptor
          with a name, a description, a JSON Schema for its inputs, and an{" "}
          <code>execute</code> function. Unregistration goes through an{" "}
          <code>AbortController</code>, which maps cleanly onto a framework's teardown.
        </p>
        <CodeBlock code={IMPERATIVE} />
        <p className="note">
          <code>execute</code> returns a string. That string is what the model reads, so
          it should describe the outcome, not just report success. Also available:{" "}
          <code>getTools()</code>, <code>executeTool()</code>, and a{" "}
          <code>toolchange</code> event.
        </p>
      </section>

      <section className="pane">
        <h2>The declarative API</h2>
        <p>
          For forms, the browser can derive the whole schema from the markup. Four
          attributes, no JavaScript.
        </p>
        <CodeBlock caption="html" code={DECLARATIVE} />
        <p className="note">The browser turns that into:</p>
        <CodeBlock caption="json" code={DERIVED} />
        <p className="note">
          Note that <code>enum</code> came from the <code>&lt;option&gt;</code> values
          for free. <code>toolautosubmit</code> additionally lets the agent submit
          without a human pressing the button.
        </p>
      </section>

      <section className="pane">
        <h2>Availability, and why you must degrade</h2>
        <p>
          Chrome 149 and later, behind an origin trial or{" "}
          <code>chrome://flags/#enable-webmcp-testing</code> locally. It requires an
          origin-isolated document and is gated by the <code>tools</code> permissions
          policy, which defaults to <code>self</code>.
        </p>
        <p>
          That is a narrow slice of the web. Treat WebMCP as an enhancement on top of a
          page that already works, never as the mechanism that makes it work.
        </p>
        <CodeBlock code={DETECT} />
        <p className="note">
          It is also an origin trial, not a shipped standard. The shape below can
          change.
        </p>
      </section>

      <section className="pane">
        <h2>Hard limits</h2>
        <table className="grid">
          <tbody>
            <tr>
              <th>Tool description</th>
              <td>500 characters</td>
            </tr>
            <tr>
              <th>Parameter description</th>
              <td>150 characters</td>
            </tr>
            <tr>
              <th>Tool output</th>
              <td>1,500 characters</td>
            </tr>
          </tbody>
        </table>
        <p className="note">
          These exist so a tool cannot bury instructions in a wall of text and talk its
          way past an agent's guardrails. Design for them: paginate long reads rather
          than truncating mid-structure.
        </p>
      </section>

      <section className="pane">
        <h2>Security worth internalising</h2>
        <p>
          A tool's output becomes model input. If it can contain user-generated or
          third-party content, that content can carry instructions, and models are
          susceptible to indirect prompt injection. Two annotations exist to help an
          agent decide how much to trust a result and whether to confirm before acting.
        </p>
        <table className="grid">
          <tbody>
            <tr>
              <th>
                <code>readOnlyHint</code>
              </th>
              <td>
                True when calling the tool changes nothing. Lets an agent skip a
                confirmation it does not need.
              </td>
            </tr>
            <tr>
              <th>
                <code>untrustedContentHint</code>
              </th>
              <td>
                True when the output can contain content you did not author. Set it
                honestly; guessing low is the dangerous direction.
              </td>
            </tr>
          </tbody>
        </table>
        <p className="note">
          <code>exposedTo</code> can expose a tool to other origins. Only ever list
          origins you actually trust.
        </p>
      </section>

      <section className="pane">
        <h2>Writing tools an agent can actually use</h2>
        <ul className="bullets">
          <li>
            <strong>One tool, one action.</strong> Overlapping tools make selection
            harder, and selection is where agents fail.
          </li>
          <li>
            <strong>Let the verb carry the truth.</strong> <code>create-event</code>{" "}
            creates it; <code>start-event-creation</code> opens a form. Do not blur
            them.
          </li>
          <li>
            <strong>Describe capability, not limitation.</strong> The description is the
            entire prompt the model gets about this tool.
          </li>
          <li>
            <strong>Take values in the user's terms.</strong>{" "}
            <code>shipping: "Express"</code>, not <code>shippingMethodId: 4</code>.
            Never make the model compute an argument.
          </li>
          <li>
            <strong>Validate strictly, schema loosely.</strong> A descriptive error the
            model can read beats a schema it cannot satisfy.
          </li>
          <li>
            <strong>Register contextually.</strong> A tool that exists but always fails
            is worse than one that is absent.
          </li>
          <li>
            <strong>Fewer tools is faster and more accurate.</strong> Every registered
            tool costs context and widens the choice.
          </li>
        </ul>
      </section>

      <section className="pane">
        <h2>Further reading</h2>
        <ul className="bullets">
          <li>
            <a href="https://developer.chrome.com/docs/ai/webmcp" rel="noreferrer">
              Chrome documentation ↗
            </a>
          </li>
          <li>
            <a href="https://github.com/webmachinelearning/webmcp" rel="noreferrer">
              Specification and explainer ↗
            </a>
          </li>
        </ul>
      </section>
    </article>
  );
}
