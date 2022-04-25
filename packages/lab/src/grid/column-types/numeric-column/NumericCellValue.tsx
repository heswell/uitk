import { CellValueProps } from "../../model";
import { memo } from "react";

export const NumericCellValue = memo(function NumericCellValue<T>(
  props: CellValueProps<T, number>
) {
  const { value } = props;
  return <>{value != null ? value.toFixed(2) : ""}</>;
});
