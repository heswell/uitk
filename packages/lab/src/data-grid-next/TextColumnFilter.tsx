import { Dropdown } from "../dropdown";
import "./TextColumnFilter.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { Input } from "../input";
import { FlexLayout } from "../layout";
import { FormField } from "../form-field";
import { TextColumnFilterModel } from "./TextColumnFilterModel";

const withBaseName = makePrefixer("uitkDataGridTextColumnFilter");

export interface TextColumnFilterProps {
  model: TextColumnFilterModel;
}

export const TextColumnFilter = function TextColumnFilter(
  props: TextColumnFilterProps
) {
  const { model } = props;
  const operations = model.operations;
  const selectedOperation = model.useOperation();
  const onOperationChange = (event: any, item: string | null) => {
    if (item) {
      model.setOperation(item);
    }
  };
  const query = model.useQuery();
  const onQueryChange = (event: any, value: string) => {
    model.setQuery(value);
  };
  return (
    <div className={withBaseName()}>
      <FlexLayout direction={"column"}>
        <Dropdown
          source={operations}
          onChange={onOperationChange}
          selectedItem={selectedOperation}
          WindowProps={{
            className: withBaseName("window"),
          }}
        />
        <FormField>
          <Input
            placeholder="Filter query"
            value={query}
            onChange={onQueryChange}
          />
        </FormField>
        {/*<RadioButtonGroup row={true} defaultValue="and">*/}
        {/*  <RadioButton key="and" label="And" value="and" />*/}
        {/*  <RadioButton key="or" label="Or" value="or" />*/}
        {/*</RadioButtonGroup>*/}
      </FlexLayout>
    </div>
  );
};
