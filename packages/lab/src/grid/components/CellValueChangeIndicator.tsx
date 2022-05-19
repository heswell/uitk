import { makePrefixer } from "@jpmorganchase/uitk-core";
import "./CellValueChangeIndicator.css";

export interface CellValueChangeIndicatorProps {}

const withBaseName = makePrefixer("uitkGridCellValueChangeIndicator");

export const CellValueChangeIndicator = function CellValueChangeIndicator(
  props: CellValueChangeIndicatorProps
) {
  return <div className={withBaseName()}>^</div>;
};
