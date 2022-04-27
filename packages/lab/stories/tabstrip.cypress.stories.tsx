import { FC } from "react";
import { ComponentStory } from "@storybook/react";

import { Tabstrip, TabstripProps } from "@jpmorganchase/uitk-lab";

import { AdjustableFlexbox, FlexboxProps } from "./story-components";

export default {
  title: "Lab/Tabstrip/Cypress Test Fixtures",
  component: Tabstrip,
};

type TabstripStory = ComponentStory<FC<FlexboxProps & TabstripProps>>;

const tabsAsStrings = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

export const SimpleTabstrip: TabstripStory = ({
  width = 600,
  defaultSource = tabsAsStrings,
  ...tabstripProps
}: FlexboxProps & TabstripProps) => {
  return (
    <AdjustableFlexbox height={200} width={width}>
      <button data-testid="tabstop-1" />
      <Tabstrip {...tabstripProps} defaultSource={defaultSource} />
      <button data-testid="tabstop-2" />
    </AdjustableFlexbox>
  );
};
