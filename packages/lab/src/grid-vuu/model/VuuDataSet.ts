import { createHandler, createHook, Rng, RowKeyGetter } from "../../grid";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Subject,
  tap,
} from "rxjs";

// @ts-ignore
import { RemoteDataSource, Servers, useViewserver } from "@vuu-ui/data-remote";
import { ComponentType } from "react";

export type RawVuuRecord = any[]; // TODO add meta fields

export type VuuConfig = {
  table: string;
  module: string;
  columns: string[];
};

interface VuuMessage {
  type: string;
  size?: number;
  rows?: RawVuuRecord[];
}

export type VuuColumnType = "string" | "number" | "bidAsk";

export interface IVuuCellFactory {
  createCell: (record: RawVuuRecord, column: VuuColumnDefinition) => IVuuCell;
}

export type VuuValueGetter = (record: RawVuuRecord) => any;

export interface VuuColumnDefinition {
  key: string;
  type: VuuColumnType;
  // rawIndex: number;
  getValue: VuuValueGetter;
  header: string;
  cellFactory?: IVuuCellFactory;
}

const defaultTextCellFactory: IVuuCellFactory = {
  createCell: (record, column) => new VuuCell(column.getValue(record)),
};
const defaultNumericCellFactory: IVuuCellFactory = {
  createCell: (record, column) => new VuuNumericCell(column.getValue(record)),
};

const defaultCellFactoriesByColumnType = new Map<
  VuuColumnType,
  IVuuCellFactory
>([
  ["string", defaultTextCellFactory],
  ["number", defaultNumericCellFactory],
]);

const getCellFactoryForColumn = (column: VuuColumnDefinition) => {
  if (column.cellFactory) {
    return column.cellFactory;
  }
  const defaultFactory = defaultCellFactoriesByColumnType.get(column.type);
  if (!defaultFactory) {
    throw new Error(`Failed to get cell factory for column ${column.key}`);
  }
  return defaultFactory;
};

export class VuuColumn {
  public readonly definition: VuuColumnDefinition;
  public constructor(definition: VuuColumnDefinition) {
    this.definition = definition;
  }
}

export interface IVuuCell {
  update: (record: RawVuuRecord, column: VuuColumnDefinition) => void;
}

export class VuuCell<T = any> implements IVuuCell {
  private readonly _value$: BehaviorSubject<T>;
  public useValue: () => T;
  public setValue: (value: T) => void;

  public constructor(value: T) {
    this._value$ = new BehaviorSubject<T>(value);
    this.useValue = createHook(this._value$);
    this.setValue = createHandler(this._value$);
  }

  public update(record: RawVuuRecord, column: VuuColumnDefinition) {
    const cellValue = column.getValue(record);
    this.setValue(cellValue);
  }
}

export class VuuNumericCell implements IVuuCell {
  private readonly _value$: BehaviorSubject<number>;
  private readonly _lastChange$: BehaviorSubject<number>;

  public useValue: () => number;
  public useLastChange: () => number;

  public setValue: (value: number) => void;

  public constructor(value: number) {
    this._value$ = new BehaviorSubject<number>(value);
    this._lastChange$ = new BehaviorSubject<number>(0);

    this.useValue = createHook(this._value$);
    this.setValue = createHandler(this._value$);
    this.useLastChange = createHook(this._lastChange$);
  }

  public update(record: RawVuuRecord, column: VuuColumnDefinition) {
    const newValue = column.getValue(record);
    const oldValue = this._value$.getValue();
    if (oldValue === newValue) {
      return;
    }
    const change = newValue - oldValue;
    this._value$.next(newValue);
    this._lastChange$.next(change);
  }
}

export class VuuBidAskCell implements IVuuCell {
  private readonly _value$: BehaviorSubject<[number, number]>;

  public useValue: () => [number, number];

  public constructor(bid: number, ask: number) {
    this._value$ = new BehaviorSubject<[number, number]>([bid, ask]);

    this.useValue = createHook(this._value$);
  }

  public update(record: RawVuuRecord, column: VuuColumnDefinition) {
    const newValue = column.getValue(record) as [number, number];
    this._value$.next(newValue);
  }
}

export class VuuRow {
  public readonly cells: Map<string, IVuuCell>;
  public readonly key: string;

  public constructor(record: RawVuuRecord, columns: VuuColumnDefinition[]) {
    this.cells = new Map();
    this.key = record[6]; // TODO
    for (let column of columns) {
      const cell = getCellFactoryForColumn(column).createCell(record, column);
      this.cells.set(column.key, cell);
    }
  }

  public update(record: RawVuuRecord, columns: VuuColumnDefinition[]) {
    for (let column of columns) {
      const cell = this.cells.get(column.key)!;
      cell.update(record, column);
    }
  }
}

export class VuuDataSet {
  private readonly _getKey: RowKeyGetter<VuuRow>;
  private readonly _rangeToSubscribe$ = new BehaviorSubject<Rng>(Rng.empty);
  private readonly _subscribedRange$ = new BehaviorSubject<Rng>(Rng.empty);
  private readonly _columnDefinitions: VuuColumnDefinition[];
  public readonly columns$ = new BehaviorSubject<VuuColumn[]>([]);
  public readonly rows$ = new BehaviorSubject<VuuRow[]>([]);
  private readonly _messages$ = new Subject<VuuMessage>();
  private readonly _size$ = new BehaviorSubject<number>(0);
  private readonly _isSubscribed$ = new BehaviorSubject<boolean>(false);

  private _dataSource: RemoteDataSource;
  private _config: VuuConfig;
  public readonly visibleRange$ = new BehaviorSubject<Rng>(Rng.empty);

  constructor(
    columns: VuuColumnDefinition[],
    config: VuuConfig,
    getKey: RowKeyGetter<VuuRow>
  ) {
    this._columnDefinitions = columns;
    this._config = config;
    this._getKey = getKey;

    this.columns$.next(
      this._columnDefinitions.map((columnDefinition) => {
        return new VuuColumn(columnDefinition);
      })
    );

    combineLatest([this.visibleRange$, this._size$, this._isSubscribed$])
      .pipe(
        tap(([visibleRange, size, isSubscribed]) => {
          console.log(
            `Latest visibleRange: ${visibleRange}, size: ${size}, isSubscribed: ${isSubscribed}`
          );
        }),
        map(([visibleRange, size, isSubscribed]) => {
          if (isSubscribed) {
            return new Rng(
              visibleRange.start,
              Math.min(visibleRange.end, size)
            );
          } else {
            return Rng.empty;
          }
        }),
        distinctUntilChanged()
      )
      .subscribe((range) => {
        // console.log(`Updating range to subscribe: ${range.toString()}`);
        this._rangeToSubscribe$.next(range);
      });

    // Updating subscribed range
    this._rangeToSubscribe$.subscribe((range) => {
      if (this._dataSource) {
        // console.log(`Updating subscribed range: ${range.toString()}`);
        this._dataSource.setRange(range.start, range.end);
        this._subscribedRange$.next(range);
      }
    });

    // Viewport updates
    this._messages$
      .pipe(
        tap((message) => {
          // console.log(`Message ${message.type}`);
        }),
        filter((message) => message.type === "viewport-update")
      )
      .subscribe((message) => {
        const { type, ...msg } = message;
        const { size, rows } = msg;
        // console.log(
        //   `Processing viewport update. size: ${
        //     size !== undefined ? size : "–"
        //   }, rows: ${rows ? rows.length : "–"}`
        // );

        const range = this._subscribedRange$.getValue();
        const oldRows = this.rows$.getValue();
        const newRows: VuuRow[] = [];
        for (let i = range.start; i < range.end; ++i) {
          newRows[i] = oldRows[i];
        }

        if (size !== undefined) {
          this._size$.next(size);
          newRows.length = size;
        } else {
          newRows.length = oldRows.length;
        }
        if (rows !== undefined) {
          for (let record of rows) {
            const index = record[0] as number;
            let row = oldRows[index];
            if (row) {
              row.update(record, this._columnDefinitions);
            } else {
              row = new VuuRow(record, this._columnDefinitions);
            }
            newRows[index] = row;
          }
        }
        this.rows$.next(newRows);
      });
  }

  private _messageHandler = (message: any) => {
    this._messages$.next(message);
  };

  public subscribe() {
    // console.log(`VuuDataSet: subscribing`);
    const remoteDataSourceConfig = {
      bufferSize: 100,
      columns: this._config.columns,
      serverName: Servers.Vuu,
      tableName: { table: this._config.table, module: this._config.module },
      serverUrl: "127.0.0.1:8090/websocket",
    };
    this._dataSource = new RemoteDataSource(remoteDataSourceConfig);
    this._dataSource.subscribe(
      {
        range: { lo: 0, hi: 0 },
      },
      this._messageHandler
    );
    this._isSubscribed$.next(true);
  }

  public unsubscribe() {
    if (this._dataSource) {
      // console.log(`VuuDataSet: unsubscribing`);
      this._dataSource.unsubscribe();
      this._dataSource = undefined;
      this._isSubscribed$.next(false);
    }
  }
}
