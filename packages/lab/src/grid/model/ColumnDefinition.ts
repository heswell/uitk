import { ComponentType } from "react";
import {
  CellProps,
  CellValueProps,
  EditorProps,
  KeyOfType,
  HeaderValueProps,
} from "./GridModel";
import { HeaderCellProps } from "../components";

export type ColumnPinType = "left" | "right" | null;

export type CellValueGetter<TRowData, TCellValue> = (
  rowData: TRowData
) => TCellValue;

// External representation of a column.
// There are two ways to customize cells:
// 1) cellComponent - renders a complete cell (<td> and everything).
// 2) cellValueComponent - renders the content of the cell. Doesn't include <td>
//    wrapped by BaseCell that takes care of selection, hover over etc.
//    Should be sufficient in most cases. Use cellComponent only when
//    cellComponentValue is not flexible enough.
export interface ColumnDefinition<
  TRowData = any,
  TCellValue = any,
  TColumnData = any
> {
  key: string;
  field?: KeyOfType<TRowData, TCellValue>; // TODO remove
  cellValueGetter?: CellValueGetter<TRowData, TCellValue>;
  title?: string;
  pinned?: ColumnPinType;
  isEditable?: boolean;
  width?: number;
  cellComponent?: ComponentType<CellProps<TRowData, TCellValue>>;
  cellValueComponent?: ComponentType<CellValueProps<TRowData, TCellValue>>;
  editorComponent?: ComponentType<EditorProps<TRowData, TCellValue>>;
  headerComponent?: ComponentType<HeaderCellProps<TRowData>>;
  headerValueComponent?: ComponentType<HeaderValueProps<TRowData, TCellValue>>;
  toolbarComponent?: ComponentType<{}>;
  data?: TColumnData;
}
