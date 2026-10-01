import { type ReactNode, useState } from "react";
import { Pagination, type PaginationProps } from "../../src/index.ts";

type PagedProps = Omit<PaginationProps, "page" | "onPageChange"> & { start: number };

function Paged(props: PagedProps) {
  const { start, ...rest } = props;
  const [page, setPage] = useState(start);
  return <Pagination {...rest} page={page} onPageChange={setPage} />;
}

export const paginationSpecimens: Record<string, ReactNode> = {
  "Paging a table in place": (
    <Paged label="Users pages" start={2} pageSize={25} total={61} />
  ),
  "Pages as links": (
    <Pagination
      label="Changelog pages"
      page={2}
      pageSize={10}
      total={42}
      href={(page) => `#/changelog?page=${page}`}
    />
  ),
  "The last page, relabelled": (
    <Paged
      label="Activity pages"
      start={4}
      pageSize={8}
      total={31}
      previousLabel="Newer"
      nextLabel="Older"
    />
  ),
  "An empty set": (
    <Paged label="Search results pages" start={1} pageSize={20} total={0} />
  ),
};
