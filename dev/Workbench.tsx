import { listAgentMeta, version } from "../src/index.ts";
import "../src/components/index.ts";

export function Workbench() {
  const components = listAgentMeta();

  return (
    <main className="workbench">
      <header>
        <h1>Sprint workbench</h1>
        <p>
          v{version} &middot; {components.length} registered component
          {components.length === 1 ? "" : "s"}
        </p>
      </header>

      {components.length === 0 ? (
        <p className="empty">
          No components yet. Add one under <code>src/components</code>, register its
          metadata with <code>defineAgentMeta</code>, and re-export it from{" "}
          <code>src/components/index.ts</code>.
        </p>
      ) : (
        <ul className="catalog">
          {components.map((meta) => (
            <li key={meta.name}>
              <h2>{meta.name}</h2>
              <p>{meta.summary}</p>
              <span className={`status status-${meta.status}`}>{meta.status}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
