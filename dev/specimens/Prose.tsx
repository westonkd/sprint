import type { ReactNode } from "react";
import { Prose } from "../../src/index.ts";

const NOTES = `## Background

Moved in from the **Riverside** ward in March.

- Plays the organ
- Asked to help with the youth program

> Prefers to be contacted by text after six.

Call \`555-0142\` or see the [directory](#/Prose).`;

export const proseSpecimens: Record<string, ReactNode> = {
  "Rendered Markdown": (
    <Prose label="Member notes" source={NOTES}>
      <h2>Background</h2>
      <p>
        Moved in from the <strong>Riverside</strong> ward in March.
      </p>
      <ul>
        <li>Plays the organ</li>
        <li>Asked to help with the youth program</li>
      </ul>
      <blockquote>
        <p>Prefers to be contacted by text after six.</p>
      </blockquote>
      <p>
        Call <code>555-0142</code> or see the <a href="#/Prose">directory</a>.
      </p>
    </Prose>
  ),
  "Compact notes": (
    <Prose size="small">
      <p>
        Prefers <strong>text</strong> after six.
      </p>
      <ul>
        <li>Organ</li>
        <li>Youth program</li>
      </ul>
    </Prose>
  ),
};
