import { HeaderValueProps } from "../grid";
import { DataGridColumn } from "./DataGridNextModel";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import "./ColumnHeaderValueNext.css";
import { ColumnMenu } from "./ColumnMenu";

const withBasename = makePrefixer("uitkColumnHeaderValueNext");

export const ColumnHeaderValueNext = function ColumHeaderValueNext<TRowData>(
  props: HeaderValueProps<TRowData, any, DataGridColumn<TRowData>>
) {
  const { column } = props;
  const title = column.useTitle();

  // const dataGridColumn = column.useData();
  // const title = dataGridColumn?.definition.title || "";
  return (
    <span className={withBasename()}>
      {title}
      <ColumnMenu />
    </span>
  );
};
