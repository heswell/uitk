import { CellValueProps } from "../grid";
import { VuuCell, VuuRow } from "./model/VuuDataSet";

export const TextCellValueVuu = function TextCellValueVuu(
  props: CellValueProps<VuuRow>
) {
  const cell = props.value as VuuCell;
  if (!cell) {
    return <>Loading...</>;
  }
  const text = cell.useValue() as string;
  return <>{text}</>;
};

export const NumericCellValueVuu = function NumericCellValueVuu(
  props: CellValueProps<VuuRow>
) {
  const cell = props.value as VuuCell;
  if (!cell) {
    return <>Loading...</>;
  }
  const value = cell.useValue() as number | undefined;
  const precision = 2; // TODO
  return (
    <>{value !== undefined && value.toFixed ? value.toFixed(precision) : ""}</>
  );
};
