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
  draggedItem: MeasuredDropTarget,
  direction: "fwd" | "bwd"
): MeasuredDropTarget[] => {
  console.log(`moveDragItem ${direction}`);
  const items: MeasuredDropTarget[] = measuredItems.slice();
  const draggedIndex = items.findIndex((item) => item.id === draggedItem.id);
  const targetIndex = items.findIndex((item) => item.id === dropTarget.id);
  const firstPos = Math.min(draggedIndex, targetIndex);
  const lastPos = Math.max(draggedIndex, targetIndex);

  if (!items[firstPos]) {
    console.log(
      `moveDragItem, no draggable item ${items.map(
        (d, i) => `\n[${i}] @ ${d.currentIndex} ${d.element.textContent} `
      )}`
    );
  }
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

  // console.table(items.map((i) => ({ ...i, element: i.element.textContent })));
  return items;
};

export const measureDropTargets = (
  container: HTMLElement,
  orientation: orientationType,
  itemQuery?: string,
  viewportRange?: ViewportRange
) => {
  const dragThresholds: MeasuredDropTarget[] = [];
  const { DIMENSION } = dimensions(orientation);
  const children = Array.from(
    itemQuery ? container.querySelectorAll(itemQuery) : container.children
  );

  const itemCount = children.length;
  // const start = viewportRange?.from ?? 0;
  const start =
    typeof viewportRange?.from === "number"
      ? viewportRange.atEnd
        ? Math.max(0, viewportRange.from - 1)
        : viewportRange.from
      : 0;
  const end =
    typeof viewportRange?.to === "number"
      ? Math.min(viewportRange.to + 1, itemCount - 1)
      : itemCount - 1;
  for (let index = start; index <= end; index++) {
    const element = children[index] as HTMLElement;
    const [start, size] = measureElementSizeAndPosition(element, DIMENSION);
    const isLast = index === itemCount - 1;

    dragThresholds.push({
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
    });
  }
  return dragThresholds;
};

export const getNextDropTarget = (
  dropTargets: MeasuredDropTarget[],
  draggedItem: MeasuredDropTarget,
  pos: number,
  direction: Direction | "static"
) => {
  const len = dropTargets.length;
  const { size } = draggedItem;

  if (direction === "static") {
    console.log(`find static dropTarget`);
    // pos is the midpos of our draggeditem
    const startPos = pos - size / 2;
    const endPos = pos + size / 2;
    for (let index = 0; index < len; index++) {
      const dropTarget = dropTargets[index];
      const { start, mid, end } = dropTarget;
      if (startPos > end) {
        // we haven't reached target yet
        continue;
      } else if (endPos < start) {
        // somethings gone wrong, we ve passed the target
        throw Error("Failed to identify next drop target");
      } else if (startPos < mid) {
        console.log(`static dropTarget is ${dropTarget.element.textContent}`);
        return dropTarget;
      } /*else if (pos > start) {
        const previousDropTarget = dropTargets[index - 1];
        const trailingEdge = pos - size;
        if (trailingEdge < previousDropTarget.end) {
          return previousDropTarget;
        } else {
          // draggedItem is over spacer gap
        }
      } */
    }
  } else if (direction === FWD) {
    // pos is the end of our draggeditem
    for (let index = 0; index < len; index++) {
      const dropTarget = dropTargets[index];
      const { start, mid, end } = dropTarget;
      if (pos > end) {
        continue;
      } else if (pos > mid) {
        return dropTarget;
      } else if (pos > start) {
        const previousDropTarget = dropTargets[index - 1];
        const trailingEdge = pos - size;
        if (trailingEdge < previousDropTarget.end) {
          return previousDropTarget;
        } else {
          // draggedItem is over spacer gap
        }
      }
    }
  } else {
    // pos is the start of our draggeditem
    for (let index = len - 1; index >= 0; index--) {
      const dropTarget = dropTargets[index];
      const { start, mid } = dropTarget;
      if (pos < start) {
        continue;
      } else if (pos < mid) {
        return dropTarget;
      } /* else if (pos < end) {
        dropTarget = dropTargets[Math.min(len - 1, index + 1)];
        return dropTarget;
      }*/
    }
  }
  return null;
};
