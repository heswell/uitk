import { BehaviorSubject, combineLatest, map, switchMap } from "rxjs";
import {
  ColumnDefinition,
  createHandler,
  createHook,
  GridModel,
  RowKeyGetter,
} from "../grid";
import React from "react";
import { TextCellValueNext } from "./TextCellValueNext";
import { ColumnHeaderValueNext } from "./ColumnHeaderValueNext";
import { ColumnMenuModel } from "./ColumnMenuModel";

export type ValueGetterFn<TRowData, TCellValue> = (
  rowNode: RowNode<TRowData>
) => TCellValue;
export type RowKeyGetterFn<TRowData> = (rowData: TRowData) => string;
export type HeaderValueGetterFn<TColumnData, THeaderValue = any> = (
  column: ColDefNext<TColumnData>
) => THeaderValue;

export type ColFilterFn<TRowData> = (rowData: TRowData) => boolean;

export interface ColDefNext<
  TRowData = any,
  TColumnData = any,
  THeaderValue = TColumnData,
  TCellValue = any
> {
  key: string;
  field: string;
  type: string;
  width?: number;
  title?: string;
  data?: TColumnData;
  headerValueGetter?: HeaderValueGetterFn<TColumnData, THeaderValue>;
  headerComponent?: React.ComponentType<THeaderValue>;
  pinned?: "left" | "right";
  cellValueGetter?: ValueGetterFn<TRowData, TCellValue>;
  cellComponent?: React.ComponentType<TCellValue>;
}

export class RowNode<TRowData = any> {
  public readonly data$: BehaviorSubject<TRowData>;
  public readonly key: string;
  public readonly useData: () => TRowData;

  public constructor(key: string, data: TRowData) {
    this.key = key;
    this.data$ = new BehaviorSubject<TRowData>(data);
    this.useData = createHook(this.data$);
  }
}

export class DataGridColumn<
  TRowData = any,
  TColumnData = any,
  THeaderValue = TColumnData,
  TCellValue = any
> {
  public readonly definition: ColDefNext<
    TRowData,
    TColumnData,
    THeaderValue,
    TCellValue
  >;
  public readonly menu: ColumnMenuModel;

  public constructor(
    definition: ColDefNext<TRowData, TColumnData, THeaderValue, TCellValue>
  ) {
    this.definition = definition;
    this.menu = new ColumnMenuModel();
  }
}

export interface DataGridModelEvents<TRowData> {
  columnVisible?: () => void;
  columnPinned?: () => void;
  columnResized?: (column: DataGridColumn) => void;
  columnMoved?: (column: DataGridColumn) => void;
  columnsChanged?: (columns: DataGridColumn[]) => void;
  visibleColumnsChanged?: (columns: DataGridColumn[]) => void;
  cellKeyDown?: () => void;
  cellKeyPress?: () => void;
  scroll?: () => void;
  rowDataChanged?: (rowNode: RowNode<TRowData>) => void;
  cellClicked?: () => void;
  cellDoubleClicked?: () => void;
  cellFocused?: () => void;
  cellMouseOver?: () => void;
  cellMouseDown?: () => void;
  rowClicked?: (rowNode: RowNode<TRowData>) => void;
  rowDoubleClicked?: (rowNode: RowNode<TRowData>) => void;
  rowSelected?: (rowNode: RowNode<TRowData>) => void;
  selectionChanged?: () => void;
  rangeSelectionChanged?: () => void;
}

export interface DataGridModelOptions<TRowData> {
  rowKeyGetter: RowKeyGetterFn<TRowData>;
  data?: TRowData[];
  columnDefinitions?: ColDefNext<TRowData>[];
  events?: DataGridModelEvents<TRowData>;
}

export type FilterFn<TRowData> = (rowData: TRowData) => boolean;

export class DataGridNextModel<TRowData = any> {
  private readonly rowKeyGetter: RowKeyGetterFn<TRowData>;
  private readonly data$: BehaviorSubject<TRowData[]>;
  private readonly columnDefinitions$: BehaviorSubject<ColDefNext<TRowData>[]>;
  private readonly rows$: BehaviorSubject<RowNode<TRowData>[]>;
  private readonly filteredRows$: BehaviorSubject<RowNode<TRowData>[]>;
  private readonly columns$: BehaviorSubject<DataGridColumn[]>;

  private readonly filterFn$: BehaviorSubject<FilterFn<TRowData> | undefined>;

  public readonly gridModel: GridModel<RowNode<TRowData>>;
  public readonly setRowData: (data: TRowData[]) => void;
  public readonly setColumnDefs: (columnDefs: ColDefNext<TRowData>[]) => void;

  public constructor(options: DataGridModelOptions<TRowData>) {
    this.rowKeyGetter = options.rowKeyGetter;
    this.data$ = new BehaviorSubject<TRowData[]>(options.data || []);
    this.setRowData = createHandler(this.data$);
    this.columnDefinitions$ = new BehaviorSubject<ColDefNext<TRowData>[]>(
      options.columnDefinitions || []
    );
    this.setColumnDefs = createHandler(this.columnDefinitions$);
    this.rows$ = new BehaviorSubject<RowNode<TRowData>[]>([]); // TODO init
    this.filteredRows$ = new BehaviorSubject<RowNode<TRowData>[]>([]);
    this.columns$ = new BehaviorSubject<DataGridColumn[]>([]); // TODO

    const getRowKey: RowKeyGetter<RowNode<TRowData>> = (row, index) => {
      return row ? row.key : `row_${index}`;
    };

    this.gridModel = new GridModel<RowNode<TRowData>>(getRowKey);

    this.columnDefinitions$.subscribe((columnDefinitions) => {
      const columns = columnDefinitions.map((colDef, index) => {
        return new DataGridColumn(colDef);
      });
      this.columns$.next(columns);
    });

    this.columns$.subscribe((columns) => {
      const gridColumnDefinitions = columns.map((column) => {
        const columnDefinition: ColumnDefinition<RowNode<TRowData>> = {
          key: column.definition.key,
          title: column.definition.field,
          cellValueComponent:
            column.definition.cellComponent || TextCellValueNext,
          data: column,
          headerValueComponent:
            column.definition.headerComponent || ColumnHeaderValueNext,
        };
        return columnDefinition;
      });
      this.gridModel.setColumnDefinitions(gridColumnDefinitions);
    });

    this.filterFn$ = new BehaviorSubject<FilterFn<TRowData> | undefined>(
      undefined
    );

    this.columns$
      .pipe(
        map((columns) => {
          const filterStreams = columns.map((column) =>
            column.menu.filter.filterFn$.pipe(
              map((fn) => {
                if (fn === undefined) {
                  return undefined;
                }
                return (rowData: TRowData) => {
                  const cellValue = String(
                    rowData[column.definition.field as keyof TRowData]
                  );
                  return fn(cellValue);
                };
              })
            )
          );
          return combineLatest(filterStreams);
        }),
        switchMap((filters) => filters),
        map((filters) => {
          const columnFilters: FilterFn<TRowData>[] = filters.filter(
            (x) => x != undefined
          ) as FilterFn<TRowData>[];

          if (columnFilters.length < 1) {
            return undefined;
          }

          return (rowData: TRowData) => {
            return columnFilters.every((f) => f!(rowData));
          };
        })
      )
      .subscribe(this.filterFn$);

    this.data$.subscribe((data) => {
      const rows = data.map((rowData, index) => {
        const key = this.rowKeyGetter(rowData);
        return new RowNode(key, rowData);
      });
      const filterFn = this.filterFn$.getValue();
      const filteredRows =
        filterFn != undefined
          ? rows.filter((rowNode) => {
              return filterFn(rowNode.data$.getValue());
            })
          : rows;

      this.rows$.next(rows);
      this.filteredRows$.next(filteredRows);
    });

    this.filterFn$.subscribe((filterFn) => {
      const rows = this.rows$.getValue();
      const filteredRows =
        filterFn != undefined
          ? rows.filter((rowNode) => {
              return filterFn(rowNode.data$.getValue());
            })
          : rows;
      this.filteredRows$.next(filteredRows);
    });

    // this.rows$.subscribe((rows) => {
    //   this.gridModel.setData(rows);
    // });

    this.filteredRows$.subscribe((filteredRows) => {
      this.gridModel.setData(filteredRows);
    });
  }
}
