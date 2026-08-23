import { describe, expect, it } from "vitest";
import { listAgentMeta } from "../../src/index.ts";
import { specimensFor } from "./index.ts";

const catalog = listAgentMeta();

describe("specimen coverage", () => {
  it("has a catalog to check", () => {
    expect(catalog.length).toBeGreaterThan(0);
  });

  it.each(catalog.map((meta) => [meta.name, meta] as const))(
    "%s has a live specimen for every example",
    (name, meta) => {
      const specimens = specimensFor(name);
      for (const example of meta.examples) {
        expect(
          specimens.byExample[example.title],
          `${name} example "${example.title}" has no entry in dev/specimens/${name}.tsx`,
        ).toBeDefined();
      }
    },
  );

  it.each(catalog.map((meta) => [meta.name, meta] as const))(
    "%s registers no specimen for an example that does not exist",
    (name, meta) => {
      const titles = new Set(meta.examples.map((example) => example.title));
      for (const title of Object.keys(specimensFor(name).byExample)) {
        expect(
          titles.has(title),
          `specimen "${title}" matches no example in ${name}'s meta.ts, so nothing renders it`,
        ).toBe(true);
      }
    },
  );
});
