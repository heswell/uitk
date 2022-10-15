import { ViewportRange } from "../../list/useScrollPosition";
import { orientationType } from "../../responsive";
import { Direction, FWD } from "./dragDropTypes";

const LEFT_RIGHT = ["left", "right"];
const TOP_BOTTOM = ["top", "bottom"];
// duplicated in repsonsive

export type MeasuredDropTarget = {
  currentIndex: number;
  dataIndex?: number;
  element: HTMLElement;
  id: string;
  index: number;
  isLast?: boolean;
  isOverflowIndicator?: boolean;
  start: number;
  end: number;
  mid: number;
  size: number;
};

export type targetType = {
  element: HTMLElement | null;
  index: number;
  isLast?: boolean;
};

type MousePosKey = keyof Pick<MouseEvent, "clientX" | "clientY">;
type DOMRectKey = keyof Omit<DOMRect, "toJSON">;
type DOMRectDimensionKey = keyof Pick<DOMRect, "width" | "height">;
type Dimension = keyof Pick<DOMRect, "width" | "height">;
type ElementDimension = keyof Pick<
  HTMLElement,
  | "scrollHeight"
  | "scrollWidth"
  | "clientHeight"
  | "clientWidth"
  | "scrollTop"
  | "scrollLeft"
>;

export const measureElementSizeAndPosition = (
  element: HTMLElement,
  dimension: Dimension = "width",
  includeAutoMargin = false
) => {
  const pos = dimension === "width" ? "left" : "top";
  const { [dimension]: size, [pos]: position } =
    element.getBoundingClientRect();
  const { padEnd = false, padStart = false } = element.dataset;
  const style = getComputedStyle(element);
  const [start, end] = dimension === "width" ? LEFT_RIGHT : TOP_BOTTOM;
  const marginStart =
    padStart && !includeAutoMargin
      ? 0
      : parseInt(style.getPropertyValue(`margin-${start}`), 10);
  const marginEnd =
    padEnd && !includeAutoMargin
      ? 0
      : parseInt(style.getPropertyValue(`margin-${end}`), 10);

  let minWidth = size;
  const flexShrink = parseInt(style.getPropertyValue("flex-shrink"), 10);
  if (flexShrink > 0) {
    const flexBasis = parseInt(style.getPropertyValue("flex-basis"), 10);
    if (!isNaN(flexBasis) && flexBasis > 0) {
      minWidth = flexBasis;
    }
  }
  return [position, marginStart + minWidth + marginEnd];
};

const DIMENSIONS = {
  horizontal: {
    CLIENT_SIZE: "clientWidth" as ElementDimension,
    CONTRA: "top" as DOMRectKey,
    CONTRA_POS: "clientY" as MousePosKey,
    DIMENSION: "width" as DOMRectDimensionKey,
    END: "right" as DOMRectKey,
    POS: "clientX" as MousePosKey,
    SCROLL_POS: "scrollLeft" as ElementDimension,
    SCROLL_SIZE: "scrollWidth" as ElementDimension,
    START: "left" as DOMRectKey,
  },
  vertical: {
    CLIENT_SIZE: "clientHeight" as ElementDimension,
    CONTRA: "left" as DOMRectKey,
    CONTRA_POS: "clientX" as MousePosKey,
    DIMENSION: "height" as DOMRectDimensionKey,
    END: "bottom" as DOMRectKey,
    POS: "clientY" as MousePosKey,
    SCROLL_POS: "scrollTop" as ElementDimension,
    SCROLL_SIZE: "scrollHeight" as ElementDimension,
    START: "top" as DOMRectKey,
  },
};
export const dimensions = (orientation: orientationType) =>
  DIMENSIONS[orientation];

export const getItemById = (
  measuredItems: MeasuredDropTarget[],
  id: string
) => {
  const result = measuredItems.find((item) => item.id === id);
  if (result) {
    return result;
  }
  // else {
  //   throw Error(`measuredItems do not contain an item with id #${id}`);
  // }
};

export const moveDragItem = (
  measuredItems: MeasuredDropTarget[],
  dropTarget: MeasuredDropTarget,
  draggedItem: MeasuredDropTarget
): MeasuredDropTarget[] => {
  const items: MeasuredDropTarget[] = measuredItems.slice();
  const draggedIndex = items.findIndex((item) => item.id === draggedItem.id);
  const targetIndex = items.findIndex((item) => item.id === dropTarget.id);
  const firstPos = Math.min(draggedIndex, targetIndex);
  const lastPos = Math.max(draggedIndex, targetIndex);
  let { start } = items[firstPos];

  let currentIndex = items[firstPos].currentIndex;

  items[draggedIndex] = { ...dropTarget };
  items[targetIndex] = { ...draggedItem };

  for (let i = firstPos; i <= lastPos; i++) {
    const item = items[i];
    item.currentIndex = currentIndex;
    item.start = start;
    item.end = start + item.size;
    item.mid = start + item.size / 2;
    start = item.end;
    currentIndex += 1;
  }

  return items;
};

export const measureDropTargets = (
  container: HTMLElement,
  orientation: orientationType,
  itemQuery?: string,
  viewportRange?: ViewportRange
) => {
  const dragThresholds: MeasuredDropTarget[] = [];
  const { DIMENSION, START, END } = dimensions(orientation);
  const { [START]: containerStart, [END]: containerEnd } =
    container.getBoundingClientRect();
  // TODO need to make sure we're including only the children we should
  const children = Array.from(
    itemQuery ? container.querySelectorAll(itemQuery) : container.children
  );

  let previousThreshold = null;
  const itemCount = children.length;
  const start = viewportRange?.from ?? 0;
  const end = viewportRange?.to ?? itemCount - 1;
  for (let index = start; index <= end; index++) {
    const element = children[index] as HTMLElement;
    let [start, size] = measureElementSizeAndPosition(element, DIMENSION);
    const isLast = index === itemCount - 1;

    dragThresholds.push(
      (previousThreshold = {
        currentIndex: index,
        dataIndex: parseInt(element.dataset.idx ?? "-1"),
        id: element.id,
        index,
        isLast,
        isOverflowIndicator: element.dataset.overflowIndicator === "true",
        element: element as HTMLElement,
        start,
        end: start + size,
        size,
        mid: start + size / 2,
      })
    );
  }
  return dragThresholds;
};

export const getNextDropTarget = (
  dropTargets: MeasuredDropTarget[],
  draggedItem: MeasuredDropTarget,
  pos: number,
  direction: Direction
) => {
  const len = dropTargets.length;
  if (direction === FWD) {
    for (let index = 0; index < len; index++) {
      let dropTarget = dropTargets[index];
      const { start, mid, end } = dropTarget;
      if (pos > end) {
        continue;
      } else if (pos > mid) {
        return dropTarget.id === draggedItem.id ? null : dropTarget;
      } else if (pos > start) {
        dropTarget = dropTargets[index - 1];
        return dropTarget.id === draggedItem.id ? null : dropTarget;
      }
    }
  } else {
    for (let index = len - 1; index >= 0; index--) {
      let dropTarget = dropTargets[index];
      const { start, mid, end } = dropTarget;
      if (pos < start) {
        continue;
      } else if (pos < mid) {
        return dropTarget.id === draggedItem.id ? null : dropTarget;
      } else if (pos < end) {
        dropTarget = dropTargets[Math.min(len - 1, index + 1)];
        return dropTarget.id === draggedItem.id ? null : dropTarget;
      }
    }
  }
  return null;
};
