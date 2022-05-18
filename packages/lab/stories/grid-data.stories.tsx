import { Story } from "@storybook/react";
import { DataGrid, DataSetColumnDefinition, Grid } from "../src";
import { Blotter, BlotterRecord, makeFakeBlotterRecord } from "./grid/blotter";

export default {
  title: "Lab/Data Grid",
  component: DataGrid,
};

const getKey = (record: BlotterRecord | undefined, index: number) =>
  record ? record.key : String(index);

const blotter = new Blotter();

for (let i = 0; i < 100; ++i) {
  const record = makeFakeBlotterRecord();
  record.identifier = `${i}-${record.identifier}`;
  blotter.addRecord(record);
  for (let j = 0; j < 2; ++j) {
    const subRecord = makeFakeBlotterRecord();
    blotter.addRecord(subRecord, record);
    for (let k = 0; k < 2; ++k) {
      const subSubRecord = makeFakeBlotterRecord();
      blotter.addRecord(subSubRecord, subRecord);
    }
  }
}

const dataSetColumnDefinitions: DataSetColumnDefinition[] = [
  {
    key: "identifier",
    type: "tree",
    field: "identifier",
    title: "Identifier",
    pinned: "left",
  },
  {
    type: "text",
    key: "client",
    title: "Client",
    field: "client",
  },
  {
    type: "text",
    key: "side",
    title: "Side",
    field: "side",
  },
  {
    type: "text",
    key: "deskOwner",
    title: "Desk Owner",
    field: "deskOwner",
  },
  {
    type: "numeric",
    key: "quantity",
    title: "Quantity",
    field: "quantity",
  },
  {
    type: "numeric",
    key: "averagePx",
    title: "Average Px",
    field: "averagePx",
    precision: 6,
  },
  {
    type: "price",
    key: "price",
    title: "Price",
    currencyField: "currency",
    amountField: "averagePx",
    precision: 2,
    pinned: "right",
  },
];

const DataSetStoryTemplate: Story<{}> = () => {
  return (
    <DataGrid
      getKey={getKey}
      childrenPropName={"records"}
      columnDefinitions={dataSetColumnDefinitions}
      data={blotter.visibleRecords}
    />
  );
};

export const DataGridExample = DataSetStoryTemplate.bind({});
