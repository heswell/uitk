// @ts-ignore
import { RemoteDataSource, Servers, useViewserver } from "@vuu-ui/data-remote";
import {
  ColumnDefinition,
  createHandler,
  createHook,
  createNumericColumn,
  createTextColumn,
  Grid,
} from "@brandname/lab";
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  throttleTime,
} from "rxjs";
import { useEffect } from "react";

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
  instrumentPrices: {
    table: "instrumentPrices",
    columns: [
      {
        name: "ask",
        type: {
          name: "number",
          renderer: {
            name: "background",
            flashStyle: "arrow-bg",
          },
          formatting: {
            decimals: 2,
            zeroPad: true,
          },
        },
        aggregate: "avg",
        serverDataType: "double",
      },
      {
        name: "askSize",
        serverDataType: "int",
      },
      {
        name: "bbg",
        serverDataType: "string",
      },
      {
        name: "bid",
        type: {
          name: "number",
          renderer: {
            name: "background",
            flashStyle: "arrow-bg",
          },
          formatting: {
            decimals: 2,
            zeroPad: true,
          },
        },
        aggregate: "avg",
        serverDataType: "double",
      },
      {
        name: "bidSize",
        serverDataType: "int",
      },
      {
        name: "close",
        serverDataType: "double",
      },
      {
        name: "currency",
        label: "ccy",
        width: 60,
        serverDataType: "string",
      },
      {
        name: "description",
        serverDataType: "string",
      },
      {
        name: "exchange",
        serverDataType: "string",
      },
      {
        name: "isin",
        serverDataType: "string",
      },
      {
        name: "last",
        serverDataType: "double",
      },
      {
        name: "lotSize",
        width: 80,
        type: {
          name: "number",
        },
        serverDataType: "int",
      },
      {
        name: "open",
        serverDataType: "double",
      },
      {
        name: "phase",
        serverDataType: "string",
      },
      {
        name: "ric",
        serverDataType: "string",
      },
      {
        name: "scenario",
        serverDataType: "string",
      },
    ],
  },
  prices: {
    table: "prices",
    columns: [
      {
        name: "ask",
        type: {
          name: "number",
          renderer: {
            name: "background",
            flashStyle: "arrow-bg",
          },
          formatting: {
            decimals: 2,
            zeroPad: true,
          },
        },
        aggregate: "avg",
        serverDataType: "double",
      },
      {
        name: "askSize",
        serverDataType: "int",
      },
      {
        name: "bid",
        type: {
          name: "number",
          renderer: {
            name: "background",
            flashStyle: "arrow-bg",
          },
          formatting: {
            decimals: 2,
            zeroPad: true,
          },
        },
        aggregate: "avg",
        serverDataType: "double",
      },
      {
        name: "bidSize",
        serverDataType: "int",
      },
      {
        name: "close",
        serverDataType: "double",
      },
      {
        name: "last",
        serverDataType: "double",
      },
      {
        name: "open",
        serverDataType: "double",
      },
      {
        name: "phase",
        serverDataType: "string",
      },
      {
        name: "ric",
        serverDataType: "string",
      },
      {
        name: "scenario",
        serverDataType: "string",
      },
    ],
  },
};

type InstrumentsRowData = {
  key: string;
  test: string;
  bbg: string;
  currency: string;
  description: string;
  exchange: string;
  isin: string;
  lotSize: number;
  ric: string;
};

const createInstrumentRowData = (row: any[]): InstrumentsRowData => {
  const index = row[0] as number;
  const key = row[6];

  const bbg = row[8];
  const currency = row[9];
  const description = row[10];
  const exchange = row[11];
  const isin = row[12];
  const lotSize = row[13] as number;
  const ric = row[14];
  return {
    key,
    test: `R${index}`,
    bbg,
    currency,
    description,
    exchange,
    isin,
    lotSize,
    ric,
  };
};

type InstrumentPricesRowData = {
  key: string;
  ask: number;
  askSize: number;
  bbg: string;
  bid: number;
  bidSize: number;
  close: number;
  currency: string;
  description: string;
  exchange: string;
  isin: string;
  last: number;
  lotSize: number;
  open: number;
  phase: string;
  ric: string;
  scenario: string;
};

const createInstrumentPriceRowData = (row: any[]): InstrumentPricesRowData => {
  const index = row[0] as number;
  const key = row[6];

  const ask = row[8];
  const askSize = row[9];
  const bbg = row[10];
  const bid = row[11];
  const bidSize = row[12];
  const close = row[13];
  const currency = row[14];
  const description = row[15];
  const exchange = row[16];
  const isin = row[17];
  const last = row[18];
  const lotSize = row[19];
  const open = row[20];
  const phase = row[21];
  const ric = row[22];
  const scenario = row[23];

  return {
    key,
    ask,
    askSize,
    bbg,
    bid,
    bidSize,
    close,
    currency,
    description,
    exchange,
    isin,
    last,
    lotSize,
    open,
    phase,
    ric,
    scenario,
  };
};

type PricesRowData = {
  key: string;
  ask: number;
  askSize: number;
  bid: number;
  bidSize: number;
  close: number;
  last: number;
  open: number;
  phase: string;
  ric: string;
  scenario: string;
};

const createPriceRowData = (row: any[]): PricesRowData => {
  const index = row[0] as number;
  const key = row[6];

  const ask = row[8];
  const askSize = row[9];
  const bid = row[10];
  const bidSize = row[11];
  const close = row[12];
  const last = row[13];
  const open = row[14];
  const phase = row[15];
  const ric = row[16];
  const scenario = row[17];

  return {
    key,
    ask,
    askSize,
    bid,
    bidSize,
    close,
    last,
    open,
    phase,
    ric,
    scenario,
  };
};

const getInstrumentKey = (
  record: InstrumentsRowData | undefined,
  index: number
) => (record ? record.key : String(index));

const getInstrumentPriceKey = (
  record: InstrumentPricesRowData | undefined,
  index: number
) => (record ? record.key : String(index));

const getPriceKey = (record: PricesRowData | undefined, index: number) =>
  record ? record.key : String(index);

const instrumentColumnDefinitions: ColumnDefinition<InstrumentsRowData>[] = [
  createTextColumn("test", "Test", "test", 80, "left"),
  createTextColumn("bbg", "BBG", "bbg", 100),
  createTextColumn("currency", "Currency", "currency", 100),
  createTextColumn("description", "Description", "description", 200),
  createTextColumn("exchange", "Exchange", "exchange", 100),
  createTextColumn("isin", "ISIN", "isin", 100),
  createNumericColumn("lotSize", "Lot Size", "lotSize", 100),
  createTextColumn("ric", "RIC", "ric", 100),
];

const instrumentPriceColumnDefinitions: ColumnDefinition<InstrumentPricesRowData>[] =
  [
    createNumericColumn("ask", "Ask", "ask", 100),
    createNumericColumn("askSize", "Ask Size", "askSize", 100),
    createTextColumn("bbg", "BBG", "bbg", 100),
    createNumericColumn("bid", "Bid", "bid", 100),
    createNumericColumn("bidSize", "Bid Size", "bidSize", 100),
    createNumericColumn("close", "Close", "close", 100),
    createTextColumn("currency", "Currency", "currency", 100),
    createTextColumn("description", "Description", "description", 100),
    createTextColumn("exchange", "Exchange", "exchange", 100),
    createTextColumn("isin", "ISIN", "isin", 100),
    createNumericColumn("last", "Last", "last", 100),
    createNumericColumn("lotSize", "Lot Size", "lotSize", 100),
    createNumericColumn("open", "Open", "open", 100),
    createTextColumn("phase", "Phase", "phase", 100),
    createTextColumn("ric", "RIC", "ric", 100),
    createTextColumn("scenario", "Scenario", "scenario", 100),
  ];

const priceColumnDefinitions: ColumnDefinition<PricesRowData>[] = [
  createNumericColumn("ask", "Ask", "ask", 100),
  createNumericColumn("askSize", "Ask Size", "askSize", 100),
  createNumericColumn("bid", "Bid", "bid", 100),
  createNumericColumn("bidSize", "Bid Size", "bidSize", 100),
  createNumericColumn("close", "Close", "close", 100),
  createNumericColumn("last", "Last", "last", 100),
  createNumericColumn("open", "Open", "open", 100),
  createTextColumn("phase", "Phase", "phase", 100),
  createTextColumn("ric", "RIC", "ric", 100),
  createTextColumn("scenario", "Scenario", "scenario", 100),
];

class VuuGridModel<T> {
  public readonly data$ = new BehaviorSubject<T[]>([]);
  public readonly dataLength$ = new BehaviorSubject<number>(0);
  public readonly visibleRange$ = new BehaviorSubject<[number, number]>([
    0, 30,
  ]);
  public readonly subscribedRange$ = new BehaviorSubject<[number, number]>([
    0, 0,
  ]);
  private rowParser: (data: any[]) => T;

  public dataSource: RemoteDataSource;
  public setRange: (range: [number, number]) => void;
  public useData: () => T[];

  constructor(
    table: string = "instruments",
    module: string = "SIMUL",
    columns: string[] = vuuTableMeta.instruments.columns,
    rowParser: (data: any[]) => T
  ) {
    this.rowParser = rowParser;
    // const { columns, dataTypes } = vuuTableMeta.instruments;
    const dataConfig = {
      bufferSize: 100,
      columns,
      serverName: Servers.Vuu,
      tableName: { table, module },
      serverUrl: "127.0.0.1:8090/websocket",
    };
    this.dataSource = new RemoteDataSource(dataConfig);
    this.setRange = createHandler(this.visibleRange$);
    this.useData = createHook(this.data$);

    this.data$
      .pipe(
        map((data) => data.length),
        distinctUntilChanged()
      )
      .subscribe(this.dataLength$);

    combineLatest([this.visibleRange$, this.dataLength$]).subscribe(
      ([visibleRange, dataLength]) => {
        this.subscribedRange$.next([
          visibleRange[0],
          Math.min(visibleRange[1], dataLength),
        ]);
      }
    );

    this.subscribedRange$.pipe(debounceTime(20)).subscribe((range) => {
      const [start, end] = range;
      // console.log(`subscribedRange$: [${start}, ${end}]`);
      this.dataSource.setRange(start, end);
    });
  }

  private viewportUpdateHandler = (size: number | undefined, rows: any[][]) => {
    const oldData = this.data$.getValue();
    const range = this.subscribedRange$.getValue();
    let newData: T[] = [];

    if (size !== undefined) {
      // console.log(`data length updated to ${size}`);
      newData.length = size;
    } else {
      newData.length = oldData.length;
    }

    for (let i = range[0]; i < range[1]; ++i) {
      newData[i] = oldData[i];
    }

    if (rows !== undefined) {
      // console.log(`rows updated ${rows.length}`);
      for (let row of rows) {
        const index = row[0] as number;
        newData[index] = this.rowParser(row);
      }
    }
    this.data$.next(newData);
  };

  private dataSourceMessageHandler = (message: any) => {
    const { type, ...msg } = message;
    // console.log(`message from viewport ${type}`);
    switch (type) {
      case "subscribed":
        // console.log(`Subscribed to Vuu`);
        break;
      case "VIEW_PORT_MENUS_RESP":
        // console.log(`Received viewport menus`);
        break;
      case "viewport-update":
        // console.log(`Received viewport update`);
        this.viewportUpdateHandler(msg.size, msg.rows);
        break;
    }
  };

  public subscribe() {
    const subscribedRange = this.subscribedRange$.getValue();
    this.dataSource.subscribe(
      {
        range: { lo: subscribedRange[0], hi: subscribedRange[1] },
      },
      this.dataSourceMessageHandler
    );
  }

  public unsubscribe() {
    this.dataSource.unsubscribe();
  }
}

const instrumentGridModel = new VuuGridModel(
  "instruments",
  "SIMUL",
  vuuTableMeta.instruments.columns,
  createInstrumentRowData
);
// instrumentGridModel.subscribe();

const instrumentPriceGridModel = new VuuGridModel(
  "instrumentPrices",
  "SIMUL",
  vuuTableMeta.instrumentPrices.columns.map((c) => c.name),
  createInstrumentPriceRowData
);
// instrumentPriceGridModel.subscribe();

const priceGridModel = new VuuGridModel(
  "prices",
  "SIMUL",
  vuuTableMeta.prices.columns.map((c) => c.name),
  createPriceRowData
);
// priceGridModel.subscribe();

export const DefaultGridWithVuuData = () => {
  const data = instrumentGridModel.useData();

  const onVisibleRowRangeChanged = (range: [number, number]) => {
    instrumentGridModel.setRange(range);
  };

  useEffect(() => {
    console.log(`Subscribing to instrumentGridModel`);
    instrumentGridModel.subscribe();
    return () => {
      console.log(`Unsubscribing from instrumentGridModel`);
      instrumentGridModel.unsubscribe();
    };
  }, []);

  return (
    <Grid
      data={data}
      columnDefinitions={instrumentColumnDefinitions}
      rowSelectionMode={"single"}
      showCheckboxes={true}
      getKey={getInstrumentKey}
      isZebra={true}
      onVisibleRowRangeChanged={onVisibleRowRangeChanged}
    />
  );
};

export const VuuInstrumentPricesGrid = () => {
  const data = instrumentPriceGridModel.useData();

  const onVisibleRowRangeChanged = (range: [number, number]) => {
    instrumentPriceGridModel.setRange(range);
  };

  useEffect(() => {
    console.log(`Subscribing to instrumentPriceGridModel`);
    instrumentPriceGridModel.subscribe();
    return () => {
      console.log(`Unsubscribing from instrumentPriceGridModel`);
      instrumentPriceGridModel.unsubscribe();
    };
  }, []);

  return (
    <Grid
      data={data}
      columnDefinitions={instrumentPriceColumnDefinitions}
      rowSelectionMode={"single"}
      showCheckboxes={true}
      getKey={getInstrumentPriceKey}
      isZebra={true}
      onVisibleRowRangeChanged={onVisibleRowRangeChanged}
    />
  );
};

export const VuuPricesGrid = () => {
  const data = priceGridModel.useData();

  const onVisibleRowRangeChanged = (range: [number, number]) => {
    priceGridModel.setRange(range);
  };

  useEffect(() => {
    console.log(`Subscribing to priceGridModel`);
    priceGridModel.subscribe();
    return () => {
      console.log(`Unsubscribing from priceGridModel`);
      priceGridModel.unsubscribe();
    };
  }, []);

  return (
    <Grid
      data={data}
      columnDefinitions={priceColumnDefinitions}
      rowSelectionMode={"single"}
      showCheckboxes={true}
      getKey={getPriceKey}
      isZebra={true}
      onVisibleRowRangeChanged={onVisibleRowRangeChanged}
    />
  );
};
