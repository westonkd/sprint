import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { VisuallyHidden } from "./VisuallyHidden.tsx";

describe("VisuallyHidden", () => {
  it("keeps its text in the accessible content", () => {
    render(
      <a href="/x">
        Gospel Library<VisuallyHidden> (opens in a new tab)</VisuallyHidden>
      </a>,
    );
    expect(
      screen.getByRole("link", { name: "Gospel Library (opens in a new tab)" }),
    ).toBeInTheDocument();
  });

  it("marks a focusable wrapper", () => {
    render(
      <VisuallyHidden focusable>
        <a href="#main">Skip</a>
      </VisuallyHidden>,
    );
    expect(screen.getByRole("link").parentElement).toHaveAttribute(
      "data-sprint-focusable",
      "",
    );
  });

  it("reads as an ordinary line for agents", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <VisuallyHidden>Three unfilled callings</VisuallyHidden>
      </SprintProvider>,
    );
    expect(container.textContent).toContain(
      '- **VisuallyHidden** "Three unfilled callings"',
    );
  });
});
