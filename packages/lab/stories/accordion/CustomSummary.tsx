import { FC } from "react";

import "./CustomSummary.css";
import { useAccordionSectionContext } from "@heswell/uitk-lab";
import { ChevronDownIcon, ChevronUpIcon } from "@heswell/uitk-icons";

export const CustomSummary: FC = ({ children }) => {
  const { isDisabled, isExpanded, onToggle } = useAccordionSectionContext();

  return (
    <div
      className="custom-accordion-summary"
      onClick={isDisabled ? undefined : onToggle}
      tabIndex={0}
    >
      <div className={"content"}>{children}</div>
      {isExpanded ? (
        <ChevronUpIcon className="custom-accordion-summary-icon" />
      ) : (
        <ChevronDownIcon className="custom-accordion-summary-icon" />
      )}
    </div>
  );
};
