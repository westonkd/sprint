import {
  AgentRegion,
  Link,
  listAgentMeta,
  PageHeader,
  Panel,
  SprintProvider,
  Stack,
  Tag,
  Text,
  useSprintViewControl,
} from "../../src/index.ts";
import { specimensFor } from "../specimens/index.ts";
import { ViewSwitch } from "../ui/AgentPreview.tsx";

export function Everything() {
  const components = listAgentMeta();
  const { view: pageView, setView: setPageView } = useSprintViewControl();

  return (
    <article className="doc">
      <Stack gap="loose">
        <PageHeader
          label="Every component"
          tags={<Tag>{components.length} components</Tag>}
          actions={
            <ViewSwitch view={pageView} onChange={setPageView} label="Whole page" />
          }
        >
          <Text>
            The whole catalog on one page, straight from the registry. New components
            appear here on their own, so this page is the place to eyeball the impact of
            a change to tokens, keylines, or the agent contract before it ships.
          </Text>
        </PageHeader>

        {components.map((meta) => {
          const specimens = specimensFor(meta.name);
          const entries =
            specimens.gallery === undefined
              ? meta.examples
                  .map((example) => ({
                    title: example.title,
                    node: specimens.byExample[example.title],
                  }))
                  .filter((entry) => entry.node !== undefined)
              : [{ title: "Every variant", node: specimens.gallery }];

          return (
            <Panel
              key={meta.name}
              headingLevel={2}
              label={meta.name}
              actions={<Link href={`#/${meta.name}`}>Docs</Link>}
            >
              <Stack gap="tight">
                <Text tone="muted" size="small">
                  {meta.summary}
                </Text>
                {entries.map((entry, index) => (
                  <div
                    key={entry.title}
                    className={pageView === "agent" ? "stage as-text" : "stage"}
                  >
                    <AgentRegion label={`${meta.name}-${index + 1}`}>
                      <SprintProvider view={pageView} pageTools={false}>
                        {entry.node}
                      </SprintProvider>
                    </AgentRegion>
                  </div>
                ))}
              </Stack>
            </Panel>
          );
        })}
      </Stack>
    </article>
  );
}
