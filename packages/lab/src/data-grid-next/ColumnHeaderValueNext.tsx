import { HeaderValueProps } from "../grid";
import { DataGridColumn } from "./DataGridNextModel";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import "./ColumnHeaderValueNext.css";
import { ColumnMenu } from "./ColumnMenu";
import { FilterIcon } from "../../../icons";

const withBasename = makePrefixer("uitkColumnHeaderValueNext");

export const ColumnHeaderValueNext = function ColumHeaderValueNext<TRowData>(
  props: HeaderValueProps<TRowData, any, DataGridColumn<TRowData>>
) {
  const { column } = props;
  const title = column.useTitle();

  const dataGridColumn = column.useData();
  if (!dataGridColumn) {
    throw new Error(`DataGrid column not found.`);
  }
  const menuModel = dataGridColumn.menu;
  const isFilterApplied = menuModel.filter.useIsFilterApplied();
  // const title = dataGridColumn?.definition.title || "";
  return (
    <span className={withBasename()}>
      {title}
      {isFilterApplied ? <FilterIcon /> : null}
      <ColumnMenu model={menuModel} />
    </span>
  );
};
