import { CellValueProps } from "../grid";
import { VuuBidAskCell, VuuCell, VuuNumericCell, VuuRow } from "./model";
import "./columns.css";
import { ReactNode, useEffect, useRef } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "../../../icons";

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

export const BidAskCellValueVuu = function BidAskCellValueVuu(
  props: CellValueProps<VuuRow>
) {
  const cell = props.value as VuuBidAskCell;
  if (!cell) {
    return <>Loading...</>;
  }
  const value = cell.useValue() as [number, number];
  const [bid, ask] = value;

  const text = [
    bid != null ? bid.toFixed(2) : "-",
    ask != null ? ask.toFixed(2) : "-",
  ].join(" / ");
  return <>{text}</>;
};

export const NumericCellValueVuu = function NumericCellValueVuu(
  props: CellValueProps<VuuRow>
) {
  const cell = props.value as VuuNumericCell;
  if (!cell) {
    return <>Loading...</>;
  }
  const value = cell.useValue();
  const change = cell.useLastChange();
  const precision = 2; // TODO

  const valueText =
    value !== undefined && value.toFixed ? value.toFixed(precision) : "";

  const changeStyle = [
    "uitkGridVuuNumericCell",
    change > 0 ? "changeUp" : "changeDown",
  ].join("-");

  const changeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (change !== 0) {
      const el = changeRef.current;
      if (el) {
        el.classList.remove("uitkGridVuuNumericCell-runAnimation");
        el.offsetWidth;
        el.classList.add("uitkGridVuuNumericCell-runAnimation");
      }
    }
  }, [value, change]);

  let icon: ReactNode = null;
  let changeText: string = "";

  if (change > 0) {
    icon = <ArrowUpIcon />;
    changeText = ["+", change.toFixed(precision)].join("");
  } else if (change < 0) {
    changeText = change.toFixed(precision);
    icon = <ArrowDownIcon />;
  }

  return (
    <div className={"uitkGridVuuNumericCell"}>
      <span ref={changeRef} className={changeStyle}>
        {icon}
        {changeText}
      </span>
      <span style={{}} className={"uitkGridVuuNumericCell-value"}>
        {valueText}
      </span>
    </div>
  );
};
