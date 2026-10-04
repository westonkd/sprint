import type { ReactNode } from "react";

function Grid(props: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {props.children}
    </svg>
  );
}

export function SidebarIcon() {
  return (
    <Grid>
      <rect x="1" y="2" width="14" height="2" />
      <rect x="1" y="12" width="14" height="2" />
      <rect x="1" y="2" width="2" height="12" />
      <rect x="13" y="2" width="2" height="12" />
      <rect x="5" y="2" width="2" height="12" />
    </Grid>
  );
}

export function PlusIcon() {
  return (
    <Grid>
      <rect x="7" y="2" width="2" height="12" />
      <rect x="2" y="7" width="12" height="2" />
    </Grid>
  );
}

export function MoreIcon() {
  return (
    <Grid>
      <rect x="2" y="7" width="2" height="2" />
      <rect x="7" y="7" width="2" height="2" />
      <rect x="12" y="7" width="2" height="2" />
    </Grid>
  );
}

export function ChevronDownIcon() {
  return (
    <Grid>
      <rect x="3" y="5" width="2" height="2" />
      <rect x="5" y="7" width="2" height="2" />
      <rect x="7" y="9" width="2" height="2" />
      <rect x="9" y="7" width="2" height="2" />
      <rect x="11" y="5" width="2" height="2" />
    </Grid>
  );
}

export function SearchIcon() {
  return (
    <Grid>
      <rect x="2" y="2" width="8" height="2" />
      <rect x="2" y="9" width="8" height="2" />
      <rect x="2" y="2" width="2" height="9" />
      <rect x="8" y="2" width="2" height="9" />
      <rect x="10" y="10" width="2" height="2" />
      <rect x="12" y="12" width="2" height="2" />
    </Grid>
  );
}

export function CloseIcon() {
  return (
    <Grid>
      <rect x="3" y="3" width="2" height="2" />
      <rect x="5" y="5" width="2" height="2" />
      <rect x="7" y="7" width="2" height="2" />
      <rect x="9" y="9" width="2" height="2" />
      <rect x="11" y="11" width="2" height="2" />
      <rect x="11" y="3" width="2" height="2" />
      <rect x="9" y="5" width="2" height="2" />
      <rect x="5" y="9" width="2" height="2" />
      <rect x="3" y="11" width="2" height="2" />
    </Grid>
  );
}
