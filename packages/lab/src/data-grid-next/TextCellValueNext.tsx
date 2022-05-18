import { DataGridColumn, RowNode } from "./DataGridNextModel";
import { CellValueProps } from "../grid";

export const TextCellValueNext = function TextCellValueNext<
  TRowData,
  TColumnData
>(
  props: CellValueProps<
    RowNode<TRowData>,
    any,
    DataGridColumn<TRowData, TColumnData>
  >
) {
  const { row, column } = props;
  const rowNode: RowNode<TRowData> = row.useData();
  const rowData: TRowData = rowNode.useData();
  const dataGridColumn = column.useData();
  if (!dataGridColumn) {
    return <>{`ERROR: Column "${column.key}" has no data`}</>;
  }
  const field = dataGridColumn.definition.field;
  const value = rowData[field as keyof TRowData];
  return <>{value}</>;
};
