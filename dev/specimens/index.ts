import type { ReactNode } from "react";
import { buttonGallery, buttonSpecimens } from "./Button.tsx";
import { cardSpecimens } from "./Card.tsx";
import { checkboxSpecimens } from "./Checkbox.tsx";
import { codeBlockSpecimens } from "./CodeBlock.tsx";
import { headingGallery, headingSpecimens } from "./Heading.tsx";
import { linkSpecimens } from "./Link.tsx";
import { listSpecimens } from "./List.tsx";
import { navSpecimens } from "./Nav.tsx";
import { navGroupSpecimens } from "./NavGroup.tsx";
import { pageHeaderSpecimens } from "./PageHeader.tsx";
import { panelSpecimens } from "./Panel.tsx";
import { segmentedControlSpecimens } from "./SegmentedControl.tsx";
import { selectSpecimens } from "./Select.tsx";
import { shellSpecimens } from "./Shell.tsx";
import { stackSpecimens } from "./Stack.tsx";
import { switchSpecimens } from "./Switch.tsx";
import { tableGallery, tableSpecimens } from "./Table.tsx";
import { tagGallery, tagSpecimens } from "./Tag.tsx";
import { textGallery, textSpecimens } from "./Text.tsx";
import { textareaSpecimens } from "./Textarea.tsx";
import { textInputSpecimens } from "./TextInput.tsx";

export interface Specimens {
  gallery?: ReactNode;
  byExample: Record<string, ReactNode>;
}

const registry: Record<string, Specimens> = {
  Button: { gallery: buttonGallery, byExample: buttonSpecimens },
  Card: { byExample: cardSpecimens },
  Checkbox: { byExample: checkboxSpecimens },
  CodeBlock: { byExample: codeBlockSpecimens },
  Heading: { gallery: headingGallery, byExample: headingSpecimens },
  Link: { byExample: linkSpecimens },
  List: { byExample: listSpecimens },
  Nav: { byExample: navSpecimens },
  NavGroup: { byExample: navGroupSpecimens },
  PageHeader: { byExample: pageHeaderSpecimens },
  Panel: { byExample: panelSpecimens },
  SegmentedControl: { byExample: segmentedControlSpecimens },
  Select: { byExample: selectSpecimens },
  Shell: { byExample: shellSpecimens },
  Stack: { byExample: stackSpecimens },
  Switch: { byExample: switchSpecimens },
  Table: { gallery: tableGallery, byExample: tableSpecimens },
  Tag: { gallery: tagGallery, byExample: tagSpecimens },
  Text: { gallery: textGallery, byExample: textSpecimens },
  Textarea: { byExample: textareaSpecimens },
  TextInput: { byExample: textInputSpecimens },
};

export function specimensFor(component: string): Specimens {
  return registry[component] ?? { byExample: {} };
}
