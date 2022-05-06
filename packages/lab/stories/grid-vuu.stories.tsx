import {
  GridVuu,
  RowKeyGetter,
  VuuColumnDefinition,
  VuuConfig,
  VuuRow,
} from "@brandname/lab";

export default {
  title: "Lab/Grid/Vuu Next",
  component: GridVuu,
};

const getKey: RowKeyGetter<VuuRow> = (row, index) => {
  if (row) {
    return row.key;
  }
  return `R${index}`;
};

const columnDefinitions: VuuColumnDefinition[] = [
  {
    key: "ask",
    type: "number",
    header: "Ask",
    rawIndex: 8,
  },
  {
    key: "askSize",
    type: "number",
    header: "Ask Size",
    rawIndex: 9,
  },
  {
    key: "bbg",
    type: "string",
    header: "BBG",
    rawIndex: 10,
  },
  {
    key: "bid",
    type: "number",
    header: "Bid",
    rawIndex: 11,
  },
  {
    key: "bidSize",
    type: "number",
    header: "Bid Size",
    rawIndex: 12,
  },
  {
    key: "close",
    type: "number",
    header: "Close",
    rawIndex: 13,
  },
  {
    key: "currency",
    type: "string",
    header: "Currency",
    rawIndex: 14,
  },
  {
    key: "description",
    type: "string",
    header: "Description",
    rawIndex: 15,
  },
];

const vuuConfig: VuuConfig = {
  module: "SIMUL",
  table: "instrumentPrices",
  columns: [
    "ask",
    "askSize",
    "bbg",
    "bid",
    "bidSize",
    "close",
    "currency",
    "description",
    "exchange",
    "isin",
    "last",
    "lotSize",
    "open",
    "phase",
    "ric",
    "scenario",
  ],
};

export const GridVuuExample = () => {
  return (
    <GridVuu
      getKey={getKey}
      columnDefinitions={columnDefinitions}
      vuuConfig={vuuConfig}
    />
  );
};
