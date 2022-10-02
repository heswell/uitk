import { makePrefixer } from "@heswell/uitk-core";
import "../Slider.css";

export interface SliderRailProps {}

const withBaseName = makePrefixer("uitkSliderRail");

export function SliderRail(props: SliderRailProps) {
  return <div className={withBaseName()} />;
}
