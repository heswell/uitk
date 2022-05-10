import { CellValueProps } from "../../grid";
import { VuuChartCell, VuuRow } from "../model";
import { useGridContext } from "../../grid/GridContext";
import "./ChartCellValueVuu.css";

export const ChartCellValueVuu = function ChartCellValueVuu(
  props: CellValueProps<VuuRow>
) {
  const cell = props.value as VuuChartCell;
  if (!cell) {
    return <>Loading...</>;
  }
  const value = cell.useValue();
  const rowHeight = useGridContext().model.useRowHeight();

  const maxItem = value.reduce((p, c) => Math.max(p, c));
  const minItem = value.reduce((p, c) => Math.min(p, c));
  const range = maxItem - minItem;
  const points = value.map((item) => {
    return ((item - minItem) * rowHeight) / range;
  });

  return (
    <div className={"uitkGridVuuChartCell"}>
      {points.map((item, index) => {
        const style = {
          height: `${item}px`,
        };
        return (
          <div
            className={"uitkGridVuuChartCell-bar"}
            key={index}
            style={style}
          />
        );
      })}
    </div>
  );
};
