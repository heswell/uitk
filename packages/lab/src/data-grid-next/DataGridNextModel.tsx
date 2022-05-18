import { BehaviorSubject } from "rxjs";
import { ColumnDefinition, createHook, GridModel, RowKeyGetter } from "../grid";
import React from "react";
import { TextCellValueNext } from "./TextCellValueNext";

export type ValueGetterFn<TRowData, TCellValue> = (
  rowNode: RowNode<TRowData>
) => TCellValue;
export type RowKeyGetterFn<TRowData> = (rowData: TRowData) => string;
export type HeaderValueGetterFn<TColumnData, THeaderValue = any> = (
  column: ColDefNext<TColumnData>
) => THeaderValue;

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

  public constructor(
    definition: ColDefNext<TRowData, TColumnData, THeaderValue, TCellValue>
  ) {
    this.definition = definition;
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

export class DataGridNextModel<TRowData = any> {
  private readonly rowKeyGetter: RowKeyGetterFn<TRowData>;
  private readonly data$: BehaviorSubject<TRowData[]>;
  private readonly columnDefinitions$: BehaviorSubject<ColDefNext<TRowData>[]>;
  private readonly rows$: BehaviorSubject<RowNode<TRowData>[]>;
  private readonly columns$: BehaviorSubject<DataGridColumn[]>;
  public readonly gridModel: GridModel<RowNode<TRowData>>;

  public constructor(options: DataGridModelOptions<TRowData>) {
    this.rowKeyGetter = options.rowKeyGetter;
    this.data$ = new BehaviorSubject<TRowData[]>(options.data || []);
    this.columnDefinitions$ = new BehaviorSubject<ColDefNext<TRowData>[]>(
      options.columnDefinitions || []
    );
    this.rows$ = new BehaviorSubject<RowNode<TRowData>[]>([]); // TODO init
    this.columns$ = new BehaviorSubject<DataGridColumn[]>([]); // TODO

    // TODO
    const getRowKey: RowKeyGetter<RowNode<TRowData>> = (row, index) => {
      return row ? row.key : `row_${index}`;
    };

    this.gridModel = new GridModel<RowNode<TRowData>>(getRowKey);

    this.columnDefinitions$.subscribe((columnDefinitions) => {
      const columns = columnDefinitions.map((colDef, index) => {
        const column = new DataGridColumn(colDef);
        return column;
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
        };
        return columnDefinition;
      });
      this.gridModel.setColumnDefinitions(gridColumnDefinitions);
    });

    this.data$.subscribe((data) => {
      const rows = data.map((rowData, index) => {
        const key = this.rowKeyGetter(rowData);
        const row = new RowNode(key, rowData);
        return row;
      });
      this.rows$.next(rows);
    });

    this.rows$.subscribe((rows) => {
      this.gridModel.setData(rows);
    });
  }

  // Mimicking ag-grid api
  public getColumnDefs() {
    return this.columnDefinitions$.getValue();
  }

  public setColumnDefs(columnDefs: ColDefNext<TRowData>[]) {
    this.columnDefinitions$.next(columnDefs);
  }

  public setAutoGroupColumnDef() {
    // TODO
  }

  public setDefaultColDef(colDef: ColDefNext<TRowData>) {
    // TODO
  }

  public sizeColumnsToFit() {
    // TODO
  }

  public getRowNode(key: string) {
    // TODO
  }

  public forEachNode(fn: (node: RowNode<TRowData>, index: number) => void) {
    // TODO
  }

  public forEachNodeAfterFilter() {
    // TODO
  }

  public forEachNodeAfterFilterAndSort() {
    // TODO
  }

  public forEachLeafNode() {
    // TODO
  }

  public setRowData(rowData: TRowData[]) {
    this.data$.next(rowData);
  }

  public ensureIndexVisible(index: number) {
    // TODO
  }

  public ensureNodeVisible(key: string) {
    // TODO
  }

  public ensureColumnVisible(key: string) {
    // TODO
  }

  public selectAll() {
    // TODO
  }

  public deselectAll() {
    // TODO
  }

  public getSelectedRows() {
    // TODO
  }

  public getSelectedNodes() {
    // TODO
  }
}
