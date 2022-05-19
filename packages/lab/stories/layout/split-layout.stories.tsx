import { Button } from "@jpmorganchase/uitk-core";
import {
  FLEX_ALIGNMENT_BASE,
  FlowLayout,
  SplitLayout,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContent } from "./flex-item.stories";
import { useMemo } from "react";

export default {
  title: "Layout/SplitLayout",
  component: SplitLayout,
  argTypes: {
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
    gap: {
      type: "number",
    },
    separators: {
      options: ["start", "center", "end", true],
      control: { type: "select" },
    },
    wrap: {
      type: "boolean",
    },
  },
} as ComponentMeta<typeof SplitLayout>;

const leftItem = (
  <FlowLayout>
    {Array.from({ length: 3 }, (_, index) => (
      <FlexContent key={index}>{`item ${index + 1}`}</FlexContent>
    ))}
  </FlowLayout>
);

const rightItem = (
  <FlowLayout>
    <FlexContent>item 4</FlexContent>
    <FlexContent>
      Item
      <br />5
    </FlexContent>
  </FlowLayout>
);

const DefaultSplitLayoutStory: ComponentStory<typeof SplitLayout> = (args) => {
  return (
    <div style={{ minWidth: 850 }}>
      <SplitLayout {...args} />
    </div>
  );
};
export const DefaultSplitLayout = DefaultSplitLayoutStory.bind({});

DefaultSplitLayout.args = {
  leftSplitItem: leftItem,
  rightSplitItem: rightItem,
};

const leftButtons = (
  <FlowLayout>
    <Button variant="cta">Submit</Button>
    <Button variant="primary">Save as draft</Button>
  </FlowLayout>
);

const rightButton = <Button variant="secondary">Cancel</Button>;

const FormButtonBar: ComponentStory<typeof SplitLayout> = (args) => {
  return (
    <SplitLayout
      {...args}
      leftSplitItem={leftButtons}
      rightSplitItem={rightButton}
    />
  );
};
export const SplitLayoutSimpleUsage = FormButtonBar.bind({});
