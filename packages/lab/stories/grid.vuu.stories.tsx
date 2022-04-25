import { useCallback, useEffect, useMemo, useState } from "react";
import { Story } from "@storybook/react";
// @ts-ignore
import { RemoteDataSource, Servers, useViewserver } from "@vuu-ui/data-remote";

import { Blotter, BlotterRecord, makeFakeBlotterRecord } from "./grid/blotter";
import {
  ColumnDefinition,
  ColumnGroupDefinition,
  createNumericColumn,
  createTextColumn,
  DataGrid,
  DataSetColumnDefinition,
  Grid,
} from "@brandname/lab";

export default {
  title: "Lab/Grid/Vuu Data",
  component: Grid,
};

const vuuTableMeta = {
  instruments: {
    columns: [
      "bbg",
      "currency",
      "description",
      "exchange",
      "isin",
      "lotSize",
      "ric",
    ],
    dataTypes: [
      "string",
      "string",
      "string",
      "string",
      "string",
      "int",
      "string",
    ],
    key: "ric",
  },
};

type RowData = {
  key: string;
  bbg: string;
  currency: string;
  description: string;
  exchange: string;
  isin: string;
  lotSize: number;
  ric: string;
};

const getKey = (record: RowData | undefined, index: number) =>
  record ? record.key : String(index);

const columnDefinitions: ColumnDefinition<RowData>[] = [
  createTextColumn("bbg", "BBG", "bbg", 100),
  createTextColumn("currency", "Currency", "currency", 100),
  createTextColumn("description", "Description", "description", 200),
  createTextColumn("exchange", "Exchange", "exchange", 100),
  createTextColumn("isin", "ISIN", "isin", 100),
  createNumericColumn("lotSize", "Lot Size", "lotSize", 100),
  createTextColumn("ric", "RIC", "ric", 100),
];

export const DefaultGridWithVuuData = () => {
  const { columns, dataTypes } = vuuTableMeta.instruments;
  const [data, setData] = useState<RowData[]>([]);
  const [subscribedRange, setSubscribedRange] = useState<[number, number]>([
    0, 30,
  ]);

  const [dataConfig, dataSource] = useMemo(() => {
    const dataConfig = {
      bufferSize: 100,
      columns,
      serverName: Servers.Vuu,
      tableName: { table: "instruments", module: "SIMUL" },
      serverUrl: "127.0.0.1:8090/websocket",
    };
    return [dataConfig, new RemoteDataSource(dataConfig)];
  }, []);

  const viewportUpdateHandler = (
    size: number | undefined,
    rows: any[][] | undefined
  ) => {
    const newData: RowData[] = [];

    if (size !== undefined) {
      console.log(`data length updated to ${size}`);
      newData.length = size;
    } else {
      newData.length = data.length;
    }
    if (rows !== undefined) {
      console.log(`rows updated ${rows.length}`);
      for (let row of rows) {
        const index = row[0] as number;
        const key = row[6];

        const bbg = row[8];
        const currency = row[9];
        const description = row[10];
        const exchange = row[11];
        const isin = row[12];
        const lotSize = row[13] as number;
        const ric = row[14];
        newData[index] = {
          key,
          bbg,
          currency,
          description,
          exchange,
          isin,
          lotSize,
          ric,
        };
      }
    }
    setData(newData);
  };

  const datasourceMessageHandler = useCallback(
    (message) => {
      const { type, ...msg } = message;
      console.log(`message from viewport ${type}`);
      switch (type) {
        case "subscribed":
          console.log(`Subscribed to Vuu`);
          break;
        case "VIEW_PORT_MENUS_RESP":
          console.log(`Received viewport menus`);
          break;
        case "viewport-update":
          console.log(`Received viewport update`);
          viewportUpdateHandler(msg.size, msg.rows);
          break;
      }
    },
    [dataSource]
  );

  const onVisibleRowRangeChanged = (range: [number, number]) => {
    const [start, end] = range;
    console.log(`visible range changed [${start}, ${end}]`);
    setSubscribedRange([start, end]);
  };

  useEffect(() => {
    console.log(`subscribing to range ${subscribedRange}`);
    dataSource.subscribe(
      {
        range: { lo: subscribedRange[0], hi: subscribedRange[1] },
      },
      datasourceMessageHandler
    );
  }, [dataSource, datasourceMessageHandler, subscribedRange]);

  return (
    <Grid
      data={data}
      columnDefinitions={columnDefinitions}
      rowSelectionMode={"single"}
      showCheckboxes={true}
      getKey={getKey}
      isZebra={true}
      onVisibleRowRangeChanged={onVisibleRowRangeChanged}
    />
  );
};
