import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentSelector } from "@/agent/attributes.ts";
import { serializeWithin } from "@/agent/view/serialize.ts";
import { __resetToolNames } from "@/agent/webmcp/scope.ts";
import { SprintProvider } from "@/provider/SprintProvider.tsx";
import { installMockModelContext, type MockModelContext } from "@/test/modelContext.ts";
import { Pagination, type PaginationProps } from "./Pagination.tsx";

let mock: MockModelContext;

beforeEach(() => {
  mock = installMockModelContext();
});

afterEach(() => {
  mock.uninstall();
  __resetToolNames();
  vi.restoreAllMocks();
});

function Harness(props: Partial<PaginationProps> & { start?: number }) {
  const { start = 2, ...rest } = props;
  const [page, setPage] = useState(start);
  return (
    <Pagination
      label="Users pages"
      page={page}
      pageSize={25}
      total={61}
      onPageChange={setPage}
      {...rest}
    />
  );
}

function root(): HTMLElement {
  const element = document.querySelector<HTMLElement>(agentSelector("Pagination"));
  if (element === null) throw new Error("no Pagination root found");
  return element;
}

function part(name: string): HTMLElement {
  const element = root().querySelector<HTMLElement>(`[data-sprint-part="${name}"]`);
  if (element === null) throw new Error(`no ${name} part found`);
  return element;
}

async function call(name: string, inputs: Record<string, unknown>) {
  let result: string | null = null;
  await act(async () => {
    result = await mock.call(name, inputs);
  });
  return result as string | null;
}

describe("Pagination rendering", () => {
  it("is a navigation landmark named by its label", () => {
    render(<Harness />);
    expect(screen.getByRole("navigation", { name: "Users pages" })).toBe(root());
  });

  it("reads out the page and the range of items showing", () => {
    render(<Harness />);
    expect(root()).toHaveTextContent("Showing 26–50 of 61");
    expect(root()).toHaveTextContent("Page 2 of 3");
    expect(root()).toHaveAttribute("data-sprint-page", "2");
    expect(root()).toHaveAttribute("data-sprint-pages", "3");
    expect(root()).toHaveAttribute("data-sprint-total", "61");
    expect(root()).toHaveAttribute("data-sprint-first", "26");
    expect(root()).toHaveAttribute("data-sprint-last", "50");
  });

  it("disables Previous on the first page", () => {
    render(<Harness start={1} />);
    expect(part("previous")).toBeDisabled();
    expect(part("previous")).toHaveAttribute("data-sprint-disabled", "");
    expect(part("next")).toBeEnabled();
  });

  it("disables Next on the last page and shows the short final range", () => {
    render(<Harness start={3} />);
    expect(part("next")).toBeDisabled();
    expect(part("previous")).toBeEnabled();
    expect(root()).toHaveTextContent("Showing 51–61 of 61");
  });

  it("shows an empty set as one empty page", () => {
    render(<Harness start={1} total={0} />);
    expect(root()).toHaveTextContent("Showing 0 of 0");
    expect(root()).toHaveTextContent("Page 1 of 1");
    expect(root()).toHaveAttribute("data-sprint-first", "0");
    expect(root()).toHaveAttribute("data-sprint-last", "0");
    expect(part("previous")).toBeDisabled();
    expect(part("next")).toBeDisabled();
  });

  it("clamps a page outside the set into it", () => {
    const { rerender } = render(
      <Pagination label="Users pages" page={9} pageSize={25} total={61} />,
    );
    expect(root()).toHaveAttribute("data-sprint-page", "3");
    rerender(<Pagination label="Users pages" page={0} pageSize={25} total={61} />);
    expect(root()).toHaveAttribute("data-sprint-page", "1");
    expect(root()).toHaveTextContent("Showing 1–25 of 61");
  });

  it("turns the page on click", () => {
    render(<Harness />);
    fireEvent.click(part("next"));
    expect(root()).toHaveAttribute("data-sprint-page", "3");
    fireEvent.click(part("previous"));
    fireEvent.click(part("previous"));
    expect(root()).toHaveAttribute("data-sprint-page", "1");
  });

  it("takes overriding labels", () => {
    render(<Harness previousLabel="Newer" nextLabel="Older" />);
    expect(part("previous")).toHaveTextContent("Newer");
    expect(part("next")).toHaveTextContent("Older");
  });

  it("renders links that publish where they go when given href", () => {
    render(
      <Pagination
        label="Changelog pages"
        page={1}
        pageSize={10}
        total={42}
        href={(page) => `#/changelog?page=${page}`}
      />,
    );
    expect(part("next").tagName).toBe("A");
    expect(part("next")).toHaveAttribute("href", "#/changelog?page=2");
    expect(part("next")).toHaveAttribute("data-sprint-href", "#/changelog?page=2");
    expect(part("previous")).not.toHaveAttribute("href");
    expect(part("previous")).toHaveAttribute("aria-disabled", "true");
    expect(part("previous")).toHaveAttribute("data-sprint-disabled", "");
  });

  it("calls onPageChange alongside a link", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        label="Changelog pages"
        page={1}
        pageSize={10}
        total={42}
        href={(page) => `#/changelog?page=${page}`}
        onPageChange={onPageChange}
      />,
    );
    fireEvent.click(part("next"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("disables both controls when there is no way to turn the page", () => {
    render(<Pagination label="Users pages" page={2} pageSize={25} total={61} />);
    expect(part("previous")).toBeDisabled();
    expect(part("next")).toBeDisabled();
  });
});

describe("Pagination agent tool", () => {
  it("registers one turn tool named from its label", () => {
    render(<Harness />);
    expect(mock.names()).toEqual(["turn-users-pages"]);
  });

  it("states the page count in the registered schema", () => {
    render(<Harness />);
    const page = mock.find("turn-users-pages")?.descriptor.inputSchema.properties.page;
    expect(page?.type).toBe("integer");
    expect(page?.minimum).toBe(1);
    expect(page?.description).toContain("1 to 3");
  });

  it("goes to the next page through the real control", async () => {
    render(<Harness />);
    const result = await call("turn-users-pages", { page: 3 });
    expect(root()).toHaveAttribute("data-sprint-page", "3");
    expect(result).toContain("page=3");
    expect(result).toContain("first=51");
  });

  it("jumps straight to a page that is not a neighbour", async () => {
    render(<Harness start={3} />);
    const result = await call("turn-users-pages", { page: 1 });
    expect(root()).toHaveAttribute("data-sprint-page", "1");
    expect(result).toContain("last=25");
  });

  it("refuses a page outside the set", async () => {
    render(<Harness />);
    expect(await call("turn-users-pages", { page: 4 })).toBe(
      'Parameter "page" must be at most 3, received 4.',
    );
    expect(await call("turn-users-pages", { page: 1.5 })).toContain("whole number");
    expect(root()).toHaveAttribute("data-sprint-page", "2");
  });

  it("says so when already on the requested page", async () => {
    render(<Harness />);
    expect(await call("turn-users-pages", { page: 2 })).toContain("Already on page 2");
  });

  it("re-registers when the page count changes and unregisters at one page", () => {
    const { rerender } = render(
      <Pagination
        label="Users pages"
        page={1}
        pageSize={25}
        total={61}
        onPageChange={() => {}}
      />,
    );
    rerender(
      <Pagination
        label="Users pages"
        page={1}
        pageSize={25}
        total={80}
        onPageChange={() => {}}
      />,
    );
    expect(
      mock.find("turn-users-pages")?.descriptor.inputSchema.properties.page
        ?.description,
    ).toContain("1 to 4");
    rerender(
      <Pagination
        label="Users pages"
        page={1}
        pageSize={25}
        total={20}
        onPageChange={() => {}}
      />,
    );
    expect(mock.names()).toEqual([]);
  });

  it("registers nothing when pages are links", () => {
    render(<Harness href={(page) => `#/users?page=${page}`} />);
    expect(mock.names()).toEqual([]);
  });

  it("registers nothing when asked not to", () => {
    render(<Harness agentTool={false} />);
    expect(mock.names()).toEqual([]);
  });

  it("takes its tool name from agentName", () => {
    render(<Harness agentName="Members" />);
    expect(mock.names()).toEqual(["turn-members"]);
  });

  it("unregisters on unmount", () => {
    const { unmount } = render(<Harness />);
    unmount();
    expect(mock.names()).toEqual([]);
  });
});

describe("Pagination agent view", () => {
  it("renders one control per direction it can go", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );

    expect(container.querySelectorAll("[data-sprint-view] button")).toHaveLength(2);
    expect(container.textContent).toContain(
      '- **Pagination** "Users pages" [first=26, last=50, page=2, pages=3, total=61] → tool `turn-users-pages`',
    );
    expect(container.textContent).toContain('- part `previous` "Previous"');
    expect(container.textContent).toContain('- part `next` "Next"');
  });

  it("turns the page when one of those controls is clicked", () => {
    render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /`next`/ }));
    expect(screen.getByText(/page=3, pages=3/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /`next`/ })).toBeNull();
    expect(screen.getByRole("button", { name: /`previous`/ })).toBeInTheDocument();
  });

  it("drives onPageChange through the tool in agent view", async () => {
    render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness />
      </SprintProvider>,
    );

    const result = await call("turn-users-pages", { page: 1 });
    expect(result).toContain("page=1");
  });

  it("renders text only when there is nowhere to go", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false}>
        <Harness start={1} total={0} />
      </SprintProvider>,
    );

    expect(container.querySelector("[data-sprint-view] button")).toBeNull();
    expect(container.textContent).toContain(
      '- **Pagination** "Users pages" [first=0, last=0, page=1, pages=1, total=0]',
    );
    expect(container.textContent).toContain('- part `next` "Next" [disabled]');
  });

  it("renders text only when controls are turned off", () => {
    const { container } = render(
      <SprintProvider view="agent" pageTools={false} agentControls="never">
        <Harness />
      </SprintProvider>,
    );

    expect(container.querySelector("[data-sprint-view] button")).toBeNull();
    expect(container.textContent).toContain("page=2");
  });

  it("agrees with the projection of its own human rendering", () => {
    const { container } = render(<Harness start={1} />);

    const [node] = serializeWithin(container);
    expect(node?.label).toBe("Users pages");
    expect(node?.tool).toBe("turn-users-pages");
    expect(node?.state).toEqual({
      page: "1",
      pages: "3",
      total: "61",
      first: "1",
      last: "25",
    });
    expect(node?.parts).toEqual([
      { part: "previous", label: "Previous", state: { disabled: true } },
      { part: "next", label: "Next", state: {} },
    ]);
  });

  it("agrees with the projection when pages are links", () => {
    const { container } = render(
      <Pagination
        label="Changelog pages"
        page={2}
        pageSize={10}
        total={42}
        href={(page) => `#/changelog?page=${page}`}
      />,
    );

    const [node] = serializeWithin(container);
    expect(node?.tool).toBeUndefined();
    expect(node?.parts).toEqual([
      { part: "previous", label: "Previous", state: { href: "#/changelog?page=1" } },
      { part: "next", label: "Next", state: { href: "#/changelog?page=3" } },
    ]);
  });
});
