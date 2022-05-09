import { FormField, Input } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./form-field.qa.stories.css";

export default {
  title: "Lab/Form Field/QA",
  component: FormField,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as ComponentMeta<typeof FormField>;

export const AllExamplesGrid: ComponentStory<typeof FormField> = (props) => {
  return (
    <AllRenderer>
      <div
        style={{
          background: "inherit",
          display: "inline-grid",
          gridTemplate: "auto / repeat(4,auto)",
          gap: "4px",
        }}
      >
        <div
          style={{
            background: "inherit",
            display: "inline-grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "4px",
          }}
        >
          <FormField label="Default Form Field description label">
            <Input value="Value" />
          </FormField>

          <FormField
            label="Default Form Field description label"
            emphasis="high"
          >
            <Input value="Value" />
          </FormField>
          <FormField label="Label aligned left" labelPlacement="left">
            <Input value="Value" />
          </FormField>
          <FormField
            helperText="Warning helper text"
            label="Warning Form Field"
            validationState="warning"
          >
            <Input />
          </FormField>
          <FormField
            helperText="Warning helper text"
            label="Warning Form Field"
            validationState="warning"
            emphasis="high"
          >
            <Input />
          </FormField>
          <FormField
            hasStatusIndicator
            helperText="Warning helper text"
            label="Warning Form Field"
            validationState="warning"
            emphasis="low"
          >
            <Input />
          </FormField>
          <FormField
            helperText="Warning helper text"
            label="Warning Form Field"
            validationState="error"
          >
            <Input />
          </FormField>
          <FormField
            helperText="Warning helper text"
            label="Warning Form Field"
            validationState="error"
            emphasis="high"
          >
            <Input />
          </FormField>
          <FormField
            hasStatusIndicator
            helperText="Warning helper text"
            label="Warning Form Field"
            validationState="error"
            emphasis="low"
          >
            <Input />
          </FormField>
        </div>
      </div>
    </AllRenderer>
  );
};

export const CompareWithOriginalToolkit: ComponentStory<typeof FormField> = (
  props
) => {
  return (
    <QAContainer
      width={1272}
      height={894}
      className="uitkFormFieldQA"
      imgSrc="/visual-regression-screenshots/FormField-vr-snapshot.png"
    >
      <AllExamplesGrid />
    </QAContainer>
  );
};
