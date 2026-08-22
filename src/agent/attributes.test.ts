import { describe, expect, it } from "vitest";
import { agentAttributes, agentSelector } from "./attributes.ts";

describe("agentAttributes", () => {
  it("tags the component root", () => {
    expect(agentAttributes("Button")).toEqual({ "data-sprint": "Button" });
  });

  it("tags a named part", () => {
    expect(agentAttributes("Dialog", { part: "close" })).toEqual({
      "data-sprint": "Dialog",
      "data-sprint-part": "close",
    });
  });

  it("renders boolean state as a valueless attribute", () => {
    expect(agentAttributes("Button", { state: { loading: true } })).toEqual({
      "data-sprint": "Button",
      "data-sprint-loading": "",
    });
  });

  it("omits false and nullish state", () => {
    expect(
      agentAttributes("Button", {
        state: { loading: false, tone: undefined, size: null },
      }),
    ).toEqual({ "data-sprint": "Button" });
  });

  it("stringifies scalar state", () => {
    expect(agentAttributes("Field", { state: { count: 3, tone: "danger" } })).toEqual({
      "data-sprint": "Field",
      "data-sprint-count": "3",
      "data-sprint-tone": "danger",
    });
  });
});

describe("agentSelector", () => {
  it("targets a component root", () => {
    expect(agentSelector("Button")).toBe('[data-sprint="Button"]');
  });

  it("targets a part within a component", () => {
    expect(agentSelector("Dialog", "close")).toBe(
      '[data-sprint="Dialog"] [data-sprint-part="close"]',
    );
  });
});
