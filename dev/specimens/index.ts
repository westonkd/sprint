import type { ReactNode } from "react";
import { alertGallery, alertSpecimens } from "./Alert.tsx";
import { breadcrumbSpecimens } from "./Breadcrumb.tsx";
import { buttonGallery, buttonSpecimens } from "./Button.tsx";
import { cardSpecimens } from "./Card.tsx";
import { changeListGallery, changeListSpecimens } from "./ChangeList.tsx";
import { checkboxSpecimens } from "./Checkbox.tsx";
import { choiceGridGallery, choiceGridSpecimens } from "./ChoiceGrid.tsx";
import { codeBlockSpecimens } from "./CodeBlock.tsx";
import { copyFieldSpecimens } from "./CopyField.tsx";
import { descriptionListSpecimens } from "./DescriptionList.tsx";
import { dialogSpecimens } from "./Dialog.tsx";
import { disclosureSpecimens } from "./Disclosure.tsx";
import { dividerGallery, dividerSpecimens } from "./Divider.tsx";
import { emptyStateSpecimens } from "./EmptyState.tsx";
import { entityRowSpecimens } from "./EntityRow.tsx";
import { headingGallery, headingSpecimens } from "./Heading.tsx";
import { imageGallery, imageSpecimens } from "./Image.tsx";
import { kbdSpecimens } from "./Kbd.tsx";
import { linkSpecimens } from "./Link.tsx";
import { listGallery, listSpecimens } from "./List.tsx";
import { menuSpecimens } from "./Menu.tsx";
import { metaLineSpecimens } from "./MetaLine.tsx";
import { navSpecimens } from "./Nav.tsx";
import { navGroupSpecimens } from "./NavGroup.tsx";
import { pageHeaderSpecimens } from "./PageHeader.tsx";
import { paginationSpecimens } from "./Pagination.tsx";
import { panelSpecimens } from "./Panel.tsx";
import { pendingSpecimens } from "./Pending.tsx";
import { progressGallery, progressSpecimens } from "./Progress.tsx";
import { searchFieldSpecimens } from "./SearchField.tsx";
import { secretFieldSpecimens } from "./SecretField.tsx";
import { segmentedControlSpecimens } from "./SegmentedControl.tsx";
import { selectSpecimens } from "./Select.tsx";
import { shellSpecimens } from "./Shell.tsx";
import { spinnerSpecimens } from "./Spinner.tsx";
import { stackSpecimens } from "./Stack.tsx";
import { stepsGallery, stepsSpecimens } from "./Steps.tsx";
import { switchSpecimens } from "./Switch.tsx";
import { tableGallery, tableSpecimens } from "./Table.tsx";
import { tagGallery, tagSpecimens } from "./Tag.tsx";
import { textGallery, textSpecimens } from "./Text.tsx";
import { textareaSpecimens } from "./Textarea.tsx";
import { textInputSpecimens } from "./TextInput.tsx";
import { tooltipSpecimens } from "./Tooltip.tsx";
import { visuallyHiddenSpecimens } from "./VisuallyHidden.tsx";

export interface Specimens {
  gallery?: ReactNode;
  byExample: Record<string, ReactNode>;
}

const registry: Record<string, Specimens> = {
  ChangeList: { gallery: changeListGallery, byExample: changeListSpecimens },
  ChoiceGrid: { gallery: choiceGridGallery, byExample: choiceGridSpecimens },
  CopyField: { byExample: copyFieldSpecimens },
  Disclosure: { byExample: disclosureSpecimens },
  EmptyState: { byExample: emptyStateSpecimens },
  EntityRow: { byExample: entityRowSpecimens },
  Pagination: { byExample: paginationSpecimens },
  SearchField: { byExample: searchFieldSpecimens },
  Steps: { gallery: stepsGallery, byExample: stepsSpecimens },
  Alert: { gallery: alertGallery, byExample: alertSpecimens },
  Breadcrumb: { byExample: breadcrumbSpecimens },
  Button: { gallery: buttonGallery, byExample: buttonSpecimens },
  Card: { byExample: cardSpecimens },
  Checkbox: { byExample: checkboxSpecimens },
  CodeBlock: { byExample: codeBlockSpecimens },
  DescriptionList: { byExample: descriptionListSpecimens },
  Dialog: { byExample: dialogSpecimens },
  Divider: { gallery: dividerGallery, byExample: dividerSpecimens },
  Heading: { gallery: headingGallery, byExample: headingSpecimens },
  Image: { gallery: imageGallery, byExample: imageSpecimens },
  Link: { byExample: linkSpecimens },
  List: { gallery: listGallery, byExample: listSpecimens },
  Menu: { byExample: menuSpecimens },
  MetaLine: { byExample: metaLineSpecimens },
  Nav: { byExample: navSpecimens },
  NavGroup: { byExample: navGroupSpecimens },
  PageHeader: { byExample: pageHeaderSpecimens },
  Panel: { byExample: panelSpecimens },
  Pending: { byExample: pendingSpecimens },
  Progress: { gallery: progressGallery, byExample: progressSpecimens },
  SecretField: { byExample: secretFieldSpecimens },
  SegmentedControl: { byExample: segmentedControlSpecimens },
  Select: { byExample: selectSpecimens },
  Tooltip: { byExample: tooltipSpecimens },
  Kbd: { byExample: kbdSpecimens },
  Spinner: { byExample: spinnerSpecimens },
  VisuallyHidden: { byExample: visuallyHiddenSpecimens },
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
