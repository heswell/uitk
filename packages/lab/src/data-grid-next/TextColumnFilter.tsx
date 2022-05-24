import { BehaviorSubject } from "rxjs";
import { Dropdown } from "../dropdown";
import { createHandler, createHook } from "../grid";
import "./TextColumnFilter.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { Input } from "../input";
import { FlexLayout } from "../layout";
import { RadioButton, RadioButtonGroup } from "../radio-button";

const withBaseName = makePrefixer("uitkDataGridTextColumnFilter");

export class TextColumnFilterModel {
  public readonly operations: string[] = [
    "Contains",
    "Not Contains",
    "Equals",
    "Not Equal",
    "Starts With",
    "Ends With",
    "Blank",
    "Not Blank",
  ];

  public readonly operation$: BehaviorSubject<string>;
  public readonly useOperation: () => string;
  public readonly setOperation: (operation: string) => void;

  public readonly query$: BehaviorSubject<string>;
  public readonly useQuery: () => string;
  public readonly setQuery: (query: string) => void;

  constructor() {
    this.operation$ = new BehaviorSubject("Contains");
    this.useOperation = createHook(this.operation$);
    this.setOperation = createHandler(this.operation$);

    this.query$ = new BehaviorSubject("");
    this.useQuery = createHook(this.query$);
    this.setQuery = createHandler(this.query$);
  }
}

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
          // isOpen={true}
          // ListProps={{ className: withBaseName("list") }}
        />
        <Input
          placeholder="Filter query"
          value={query}
          onChange={onQueryChange}
        />
        {/*<RadioButtonGroup row={true} defaultValue="and">*/}
        {/*  <RadioButton key="and" label="And" value="and" />*/}
        {/*  <RadioButton key="or" label="Or" value="or" />*/}
        {/*</RadioButtonGroup>*/}
      </FlexLayout>
    </div>
  );
};
