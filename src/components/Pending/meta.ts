import { defineAgentMeta } from "@/agent/registry.ts";

export const pendingMeta = defineAgentMeta({
  name: "Pending",
  category: "feedback",
  summary:
    "Marks a region whose data is being fetched. Keeps stale content visible and readable while it refreshes, and holds a labelled pending field when there is nothing to show yet.",
  whenToUse:
    "Wrap a region you build yourself while its data loads: a profile card, a chart, a custom summary. Pass the children only once data exists, so the first load shows the pending field and a refetch keeps the old content under a busy bar. Table, List, DescriptionList and Panel take a loading prop of their own, so reach for that first.",
  whenNotToUse:
    "Do not wrap a Table, List, DescriptionList or Panel; use its loading prop, which keeps the region's own label and frame. Do not use for a long job with a countable amount of work; that is a Progress. Do not use for a busy action; that is Button's loading prop.",
  status: "experimental",
  props: {
    loading: {
      kind: "boolean",
      description:
        "Whether the region's data is being fetched. While false the wrapper adds nothing to the agent view.",
      required: true,
    },
    label: {
      kind: "string",
      description:
        'What is loading, as a phrase a person can read in the empty field, such as "Loading profile".',
      required: true,
    },
    children: {
      kind: "node",
      description:
        "The region's content. Omit it until data exists; while loading with children they stay visible as stale content.",
    },
  },
  state: {
    loading: {
      description: "Present while the region's data is being fetched.",
      attribute: "data-sprint-loading",
    },
    empty: {
      description:
        "Present while loading with no content yet, so nothing on screen is data.",
      attribute: "data-sprint-empty",
    },
  },
  agentView: {
    example: '- **Pending** "Loading profile" [empty, loading]',
  },
  examples: [
    {
      title: "First load",
      description: "No data yet, so the region holds a labelled pending field.",
      code: '<Pending loading={isLoading} label="Loading profile">\n  {profile && <ProfileSummary profile={profile} />}\n</Pending>',
    },
    {
      title: "Refetching stale content",
      description:
        "Content already on screen stays readable under a busy bar, and an agent reads it nested under a loading line.",
      code: '<Pending loading={isFetching} label="Refreshing pilot">\n  <Stack gap="tight">\n    <Heading level={3}>{pilot.callsign}</Heading>\n    <Text tone="muted">{pilot.status}</Text>\n  </Stack>\n</Pending>',
    },
  ],
  a11y: {
    role: "group",
    notes:
      "While loading the wrapper is a group named by its label with aria-busy set, so assistive technology knows the content may change. Idle, it is a plain element with no role.",
  },
});
