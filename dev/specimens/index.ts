import type { ReactNode } from "react";
import { buttonGallery, buttonSpecimens } from "./Button.tsx";
import { cardSpecimens } from "./Card.tsx";
import { codeBlockSpecimens } from "./CodeBlock.tsx";
import { headingGallery, headingSpecimens } from "./Heading.tsx";
import { linkSpecimens } from "./Link.tsx";
import { listSpecimens } from "./List.tsx";
import { navSpecimens } from "./Nav.tsx";
import { navGroupSpecimens } from "./NavGroup.tsx";
import { pageHeaderSpecimens } from "./PageHeader.tsx";
import { panelSpecimens } from "./Panel.tsx";
import { segmentedControlSpecimens } from "./SegmentedControl.tsx";
import { shellSpecimens } from "./Shell.tsx";
import { stackSpecimens } from "./Stack.tsx";
import { tableGallery, tableSpecimens } from "./Table.tsx";
import { tagGallery, tagSpecimens } from "./Tag.tsx";
import { textGallery, textSpecimens } from "./Text.tsx";

export interface Specimens {
  gallery?: ReactNode;
  byExample: Record<string, ReactNode>;
}

const registry: Record<string, Specimens> = {
  Button: { gallery: buttonGallery, byExample: buttonSpecimens },
  Card: { byExample: cardSpecimens },
  CodeBlock: { byExample: codeBlockSpecimens },
  Heading: { gallery: headingGallery, byExample: headingSpecimens },
  Link: { byExample: linkSpecimens },
  List: { byExample: listSpecimens },
  Nav: { byExample: navSpecimens },
  NavGroup: { byExample: navGroupSpecimens },
  PageHeader: { byExample: pageHeaderSpecimens },
  Panel: { byExample: panelSpecimens },
  SegmentedControl: { byExample: segmentedControlSpecimens },
  Shell: { byExample: shellSpecimens },
  Stack: { byExample: stackSpecimens },
  Table: { gallery: tableGallery, byExample: tableSpecimens },
  Tag: { gallery: tagGallery, byExample: tagSpecimens },
  Text: { gallery: textGallery, byExample: textSpecimens },
};

export function specimensFor(component: string): Specimens {
  return registry[component] ?? { byExample: {} };
}
