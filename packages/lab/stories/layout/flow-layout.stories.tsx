import { ChangeEvent, useState } from "react";
import cx from "classnames";
import {
  FLEX_ALIGNMENT_BASE,
  FlexItem,
  FlowLayout,
  StackLayout,
  FormField,
  Input,
  Dropdown,
  Accordion,
  AccordionSection,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FlexLayout,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContent } from "./flex-item.stories";
import { SearchIcon } from "@jpmorganchase/uitk-icons";

export default {
  title: "Layout/FlowLayout",
  component: FlowLayout,
  argTypes: {
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
  },
} as ComponentMeta<typeof FlowLayout>;

const DefaultFlowLayoutStory: ComponentStory<typeof FlowLayout> = (args) => {
  return (
    <FlowLayout {...args}>
      {Array.from({ length: 4 }, (_, index) => (
        <FlexItem key={index}>
          <FlexContent />
        </FlexItem>
      ))}
      <FlexContent>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
      </FlexContent>
    </FlowLayout>
  );
};
export const DefaultFlowLayout = DefaultFlowLayoutStory.bind({});
DefaultFlowLayout.args = {};

const Responsive: ComponentStory<typeof FlowLayout> = (args) => {
  return (
    <FlowLayout {...args}>
      {Array.from({ length: 6 }, (_, index) => (
        <FlexItem grow={1} key={index}>
          <FlexContent />
        </FlexItem>
      ))}
    </FlowLayout>
  );
};
export const ToolkitFlowLayoutResponsive = Responsive.bind({});
ToolkitFlowLayoutResponsive.args = {};

const FormStep = () => (
  <StackLayout>
    <p className="form-step-label">Label</p>
    <h1>Value detail</h1>
  </StackLayout>
);

const FlowLayoutStorySimpleUsage: ComponentStory<typeof FlowLayout> = (
  args
) => {
  return (
    <div className="uitkEmphasisHigh flow-layout-container">
      <FlowLayout gap={4} {...args}>
        {Array.from({ length: 6 }, (_, index) => (
          <FormStep key={index} />
        ))}
      </FlowLayout>
    </div>
  );
};

export const FlowLayoutSimpleUsage = FlowLayoutStorySimpleUsage.bind({});

const dropdownExampleData = ["No", "Yes"];

const RightForm = () => (
  <Accordion>
    {Array.from({ length: 6 }, (_, index) => (
      <AccordionSection key={index} defaultExpanded={index === 0}>
        <AccordionSummary>Expandable and collapsible section</AccordionSummary>
        <AccordionDetails>
          <StackLayout>
            {Array.from({ length: 2 }, (_, index) => (
              <FormField
                labelPlacement="left"
                label="Quis qui nisi"
                key={index}
                className="uitkEmphasisHigh"
              >
                <Input defaultValue="Lorem ipsum" />
              </FormField>
            ))}
            <FormField labelPlacement="left" label="Consectetur sint">
              <Input defaultValue="Nulla id Lorem Lorem" />
            </FormField>
            <FormField
              labelPlacement="left"
              label="Quis qui nisi"
              className="uitkEmphasisHigh"
            >
              <Input defaultValue="Lorem ipsum" />
            </FormField>
            <FormField labelPlacement="left" label="Quis qui nisi">
              <Input defaultValue="Lorem ipsum" />
            </FormField>
          </StackLayout>
        </AccordionDetails>
      </AccordionSection>
    ))}
  </Accordion>
);

const leftFormContent = (
  <>
    <FlexItem>
      <StackLayout align="center" gap={2}>
        <FormField labelPlacement="left" label="Lorem ipsum">
          <Input defaultValue="Culpa nisi exercitation laborum exercitation" />
        </FormField>

        <FormField labelPlacement="left" label="Cupidatat minim deserunt">
          <Input defaultValue="Sunt exercitation" />
        </FormField>
        <FormField labelPlacement="left" label="Ullamco sunt sit occaecat">
          <Input defaultValue="Pariatur occaecat ipsum" />
        </FormField>
        <FormField
          label="Aperiam"
          className="uitkEmphasisHigh"
          labelPlacement="left"
          LabelProps={{
            displayedNecessity: "optional",
          }}
        >
          <Dropdown
            initialSelectedItem={dropdownExampleData[0]}
            source={dropdownExampleData}
          />
        </FormField>
      </StackLayout>
    </FlexItem>
    <FlexItem>
      <StackLayout align="center" gap={2}>
        <FormField
          labelPlacement="left"
          label="Neque porro quisquam"
          className="uitkEmphasisHigh"
        >
          <Input defaultValue="Duis aute irure" endAdornment={<SearchIcon />} />
        </FormField>
        {Array.from({ length: 2 }, (_, index) => (
          <FormField labelPlacement="left" label="Quis qui nisi" key={index}>
            <Input defaultValue="Lorem ipsum" />
          </FormField>
        ))}
      </StackLayout>
    </FlexItem>
    <FlexItem>
      <StackLayout align="center" gap={2}>
        <FormField labelPlacement="left" label="Anim do consequat nostru">
          <Input defaultValue="091839182893812893" />
        </FormField>

        <FormField labelPlacement="left" label="Dolore proident">
          <Input defaultValue="Id aute sit" />
        </FormField>
      </StackLayout>
    </FlexItem>
    <FlexItem>
      <StackLayout align="center" gap={2}>
        <FormField labelPlacement="left" label="Quis qui nisi">
          <Input defaultValue="Lorem ipsum" />
        </FormField>
        <FormField
          labelPlacement="left"
          label="Exercitation veniam tempor"
          className="uitkEmphasisHigh"
        >
          <Input defaultValue="e.g. Esse velit sunt do adipisicing" />
        </FormField>
        {Array.from({ length: 2 }, (_, index) => (
          <FormField labelPlacement="left" label="Quis qui nisi" key={index}>
            <Input defaultValue="Lorem ipsum" />
          </FormField>
        ))}
      </StackLayout>
    </FlexItem>
  </>
);

const LeftForm = () => (
  <>
    {leftFormContent}
    {leftFormContent}
    {leftFormContent}
  </>
);

const Form: ComponentStory<typeof FlowLayout> = (args) => {
  const [checked, setChecked] = useState(true);

  const handleChange = (
    _: ChangeEvent<HTMLInputElement>,
    isChecked: boolean
  ) => {
    setChecked(isChecked);
  };

  return (
    <div className="flow-layout-form-container">
      <FlexLayout justify="end" className="border-layout-switch-container">
        <Switch
          checked={checked}
          onChange={handleChange}
          label={`Custom styles ${checked ? "on" : "off"}`}
        />
      </FlexLayout>
      <form>
        <FlowLayout {...args}>
          <FlexItem grow={1}>
            <StackLayout
              gap={2}
              separators
              className={cx({
                "flow-layout-custom-form": checked,
              })}
            >
              <LeftForm />
            </StackLayout>
          </FlexItem>
          <FlexItem grow={1}>
            <StackLayout
              className={cx({
                "flow-layout-custom-form": checked,
              })}
            >
              <RightForm />
            </StackLayout>
          </FlexItem>
        </FlowLayout>
      </form>
    </div>
  );
};
export const FlowLayoutComposite = Form.bind({});

FlowLayoutComposite.args = {
  separators: true,
  gap: 3,
};
