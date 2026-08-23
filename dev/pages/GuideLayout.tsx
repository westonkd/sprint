import {
  Button,
  Card,
  CodeBlock,
  Heading,
  Link,
  Nav,
  NavGroup,
  PageHeader,
  Panel,
  Shell,
  Stack,
  Table,
  Tag,
  Text,
  useSprintViewControl,
} from "../../src/index.ts";
import { AgentPreview, ViewSwitch } from "../ui/AgentPreview.tsx";

const SKELETON = `<Shell
  bar={<Link href="#/">ACME</Link>}
  side={
    <Nav label="Main">
      <NavGroup label="Fleet">
        <Link href="#/launches" active>Launches</Link>
        <Link href="#/crews">Crews</Link>
      </NavGroup>
    </Nav>
  }
>
  <Stack gap="loose">
    <PageHeader label="Launches" tags={<Tag>live</Tag>}>
      <Text>Every mission on the board, current first.</Text>
    </PageHeader>

    <Panel label="Upcoming" headingLevel={2} flush>
      <Table label="Upcoming launches" columns={columns} rows={rows} />
    </Panel>

    <Panel label="Recent" headingLevel={2} emptyLabel="No launches this week" />
  </Stack>
</Shell>`;

const OUTLINE = `h1  Launches      <- PageHeader label
h2  Upcoming      <- Panel headingLevel={2}
h2  Recent        <- Panel headingLevel={2}`;

const ARRANGE = `<Stack direction="row" gap="tight" wrap>
  <Button>Cancel</Button>
  <Button tone="action">Confirm</Button>
</Stack>

<Stack direction="grid" min="16rem">
  <Card label="Button" href="#/Button">One action.</Card>
  <Card label="Table" href="#/Table">Rows and columns.</Card>
  <Card label="List" href="#/List">Points in order.</Card>
</Stack>

<Stack direction="row" justify="between" align="center" collapse>
  <Heading level={2}>Loadout</Heading>
  <Tag tone="warning">draft</Tag>
</Stack>`;

const AGENT = `- **Link** "ACME" [href=#/]
- **Nav** "Main"
  - **NavGroup** "Fleet"
    - **Link** "Launches" [active, href=#/launches]
    - **Link** "Crews" [href=#/crews]
- **PageHeader** "Launches"
  - **Tag** "live" [tone=neutral]
  - **Text** "Every mission on the board, current first." [size=normal, tone=default]
- **Panel** "Upcoming" [flush]
  - **Table** "Upcoming launches" [columns=3, rows=2]
    - part \`cell\` "Artemis relay" [column=mission, row=relay]
    - part \`cell\` "Mon 04:00" [column=window, row=relay]
    - part \`cell\` "GO" [column=status, row=relay]
    - part \`cell\` "Crater survey" [column=mission, row=survey]
    - part \`cell\` "Tue 11:30" [column=window, row=survey]
    - part \`cell\` "HOLD" [column=status, row=survey]
- **Panel** "Recent" [empty]`;

const LAUNCH_COLUMNS = [
  { key: "mission", header: "Mission" },
  { key: "window", header: "Window" },
  { key: "status", header: "Status" },
];

const LAUNCH_ROWS = [
  {
    id: "relay",
    cells: { mission: "Artemis relay", window: "Mon 04:00", status: "GO" },
  },
  {
    id: "survey",
    cells: { mission: "Crater survey", window: "Tue 11:30", status: "HOLD" },
  },
];

function SkeletonExample() {
  return (
    <Shell
      style={{ minHeight: "24rem" }}
      bar={<Link href="#/">ACME</Link>}
      side={
        <Nav label="Main">
          <NavGroup label="Fleet">
            <Link href="#/launches" active>
              Launches
            </Link>
            <Link href="#/crews">Crews</Link>
          </NavGroup>
        </Nav>
      }
    >
      <Stack gap="loose">
        <PageHeader label="Launches" tags={<Tag>live</Tag>}>
          <Text>Every mission on the board, current first.</Text>
        </PageHeader>

        <Panel label="Upcoming" headingLevel={2} flush>
          <Table
            label="Upcoming launches"
            columns={LAUNCH_COLUMNS}
            rows={LAUNCH_ROWS}
          />
        </Panel>

        <Panel label="Recent" headingLevel={2} emptyLabel="No launches this week" />
      </Stack>
    </Shell>
  );
}

function ArrangeExample() {
  return (
    <Stack gap="loose">
      <Stack direction="row" gap="tight" wrap>
        <Button>Cancel</Button>
        <Button tone="action">Confirm</Button>
      </Stack>

      <Stack direction="grid" min="16rem">
        <Card label="Button" href="#/Button">
          One action.
        </Card>
        <Card label="Table" href="#/Table">
          Rows and columns.
        </Card>
        <Card label="List" href="#/List">
          Points in order.
        </Card>
      </Stack>

      <Stack direction="row" justify="between" align="center" collapse>
        <Heading level={2}>Loadout</Heading>
        <Tag tone="warning">draft</Tag>
      </Stack>
    </Stack>
  );
}

export function GuideLayout() {
  const { view: pageView, setView: setPageView } = useSprintViewControl();

  return (
    <article className="doc">
      <Stack gap="loose">
        <PageHeader
          label="Composing a page"
          tags={<Tag>composition</Tag>}
          actions={
            <ViewSwitch view={pageView} onChange={setPageView} label="Whole page" />
          }
        >
          <Text>
            Every Sprint page is the same four layers: one Shell around the app, one
            PageHeader per page, a Panel for every region, and Stack for arrangement
            inside them. This page walks the skeleton top down.
          </Text>
        </PageHeader>

        <Panel headingLevel={2} label="One Shell, at the root">
          <Stack gap="tight">
            <Text>
              Shell is the frame: brand in <code>bar</code>, a Nav in <code>side</code>,
              the page in <code>children</code>. It renders the main and complementary
              landmarks, the skip-to-content control, and the mobile drawer, so none of
              that is rebuilt per app.
            </Text>
            <AgentPreview pageView={pageView}>
              <SkeletonExample />
            </AgentPreview>
            <CodeBlock code={SKELETON} />
            <Text tone="muted" size="small">
              Shell never appears below the top of the page. A region within a page is a
              Panel, and two columns next to each other is a Stack.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="One PageHeader, then Panels">
          <Stack gap="tight">
            <Text>
              PageHeader renders the page's only h1, with Tag chips on the title line
              and the lede beneath it. Every distinct region after it is a Panel, and
              the Panel's <code>label</code> is the one name a person, a screen reader,
              and an agent all use for that region.
            </Text>
            <Text>
              Set <code>headingLevel</code> on every panelled section so the label joins
              the document outline. The outline of the skeleton above:
            </Text>
            <CodeBlock language="text" code={OUTLINE} />
            <Text tone="muted" size="small">
              Keep panels at most two deep, or the keylines stop meaning anything. Set{" "}
              <code>flush</code> when the content draws its own edges, as a Table or
              CodeBlock does. An empty panel keeps its border and says it is empty; give
              it an <code>emptyLabel</code> that says so in the page's own words.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="Stack arranges, and says nothing">
          <Stack gap="tight">
            <Text>
              Inside a Panel, Stack is the only layout you need: a row for a toolbar, a
              column for a form, a grid for a catalogue. Spacing comes from the scale
              via <code>gap</code>, so nothing is eyeballed.
            </Text>
            <AgentPreview pageView={pageView}>
              <ArrangeExample />
            </AgentPreview>
            <CodeBlock code={ARRANGE} />
            <Text tone="muted" size="small">
              The narrow screen is handled where the row is declared: <code>wrap</code>{" "}
              lets a toolbar break onto more lines, <code>collapse</code> stacks a row
              into a column, and <code>direction="grid"</code> refills its columns
              against <code>min</code>. No media queries of your own.
            </Text>
          </Stack>
        </Panel>

        <Panel headingLevel={2} label="What the same page reads as">
          <Stack gap="tight">
            <Text>
              Flip either preview above to its agent view and the frame disappears. The
              skeleton reads as:
            </Text>
            <CodeBlock language="text" code={AGENT} />
            <Text>
              Shell and Stack are gone. They arrange regions but mean nothing, so they
              emit nothing. What survives is exactly the layer of names you chose: the
              Nav's label, the PageHeader's title, each Panel's label. Compose the page
              so that reading those names alone tells an agent what the page is, because
              that is precisely what an agent gets.
            </Text>
            <Text tone="muted" size="small">
              The corollary: if a region's meaning lives in its position, its size, or
              its ordering rather than in a label, an agent cannot see it. Put the
              meaning in the label.
            </Text>
          </Stack>
        </Panel>
      </Stack>
    </article>
  );
}
