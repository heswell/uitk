import { Story } from "@storybook/react";
import {
  ColDefNext,
  DataGrid,
  DataGridModelOptions,
  DataGridNext,
  DataGridNextModel,
  DataSetColumnDefinition,
} from "../src";
import { Blotter, BlotterRecord, makeFakeBlotterRecord } from "./grid/blotter";
import { useEffect, useMemo, useRef } from "react";

export default {
  title: "Lab/Data Grid Next",
  component: DataGrid,
};

const blotter = new Blotter();

for (let i = 0; i < 100; ++i) {
  const record = makeFakeBlotterRecord();
  record.identifier = `${i}-${record.identifier}`;
  blotter.addRecord(record);
  // for (let j = 0; j < 2; ++j) {
  //   const subRecord = makeFakeBlotterRecord();
  //   blotter.addRecord(subRecord, record);
  //   for (let k = 0; k < 2; ++k) {
  //     const subSubRecord = makeFakeBlotterRecord();
  //     blotter.addRecord(subSubRecord, subRecord);
  //   }
  // }
}

const columnDefinitions: ColDefNext<BlotterRecord>[] = [
  {
    key: "identifier",
    type: "text",
    field: "identifier",
  },
  {
    key: "client",
    type: "text",
    field: "client",
  },
  {
    key: "side",
    type: "text",
    field: "side",
  },
  {
    key: "deskOwner",
    type: "text",
    field: "deskOwner",
  },
  {
    key: "quantity",
    type: "numeric",
    field: "quantity",
  },
  {
    key: "averagePx",
    type: "numeric",
    field: "averagePx",
  },
  {
    key: "price",
    type: "price",
    field: "price",
  },
];

const options: DataGridModelOptions<BlotterRecord> = {
  rowKeyGetter: (rowData) => rowData.key,
  data: [],
  columnDefinitions: columnDefinitions,
};

const DataGridNextStoryTemplate: Story<{}> = () => {
  const modelRef = useRef<DataGridNextModel>();

  const dataGridModel = useMemo(() => {
    const model = new DataGridNextModel(options);
    model.setRowData(blotter.visibleRecords);
    modelRef.current = model;
    return model;
  }, []);

  const updateRows = () => {
    setTimeout(() => {
      modelRef.current!.setRowData(blotter.visibleRecords);
      updateRows();
    }, 500);
  };

  useEffect(() => {
    updateRows();
  }, []);

  return <DataGridNext dataGridModel={dataGridModel} />;
};

export const DataGridNextExample = DataGridNextStoryTemplate.bind({});
