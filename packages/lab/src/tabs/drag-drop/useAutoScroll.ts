import { MutableRefObject, RefObject, useCallback, useRef } from "react";
import { ViewportRange } from "../../list/useScrollPosition";
import {
  getItemById,
  measureDropTargets,
  MeasuredDropTarget,
} from "./drag-utils";
import { DragSpacersHookResult } from "./useDragSpacers";

const getDragAdjustedViewportRange = (
  range?: ViewportRange,
  dragIndex?: number
): ViewportRange | undefined => {
  if (range && typeof dragIndex === "number") {
    const { from, to } = range;
    if (dragIndex < from) {
      return { from: from + 1, to: to + 1 };
    } else if (dragIndex <= to) {
      return { from, to: to + 1 };
    }
  }
  return range;
};

export interface AutoScrollingHookProps {
  containerRef: RefObject<HTMLElement>;
  draggedItemRef: RefObject<MeasuredDropTarget | undefined>;
  displaceItem: DragSpacersHookResult["displaceItem"];
  measuredDropTargets: MutableRefObject<MeasuredDropTarget[]>;
  orientation: "horizontal" | "vertical";
  itemQuery?: string;
  viewportRange?: ViewportRange;
}

export const useAutoScroll = ({
  displaceItem,
  containerRef,
  draggedItemRef,
  itemQuery,
  measuredDropTargets,
  orientation,
  viewportRange,
}: AutoScrollingHookProps) => {
  const scrollTimer = useRef<number | null>(null);
  const isScrolling = useRef(false);
  // Shouldn't need this - but viewportRange is always stale in stopScrolling. Checked all dependencies
  // look ok. Something to do with setTimeout / scrollHandler ?
  const rangeRef = useRef<ViewportRange>();
  const lastScrollDirectionRef = useRef<"fwd" | "bwd">("fwd");
  rangeRef.current = viewportRange;

  const stopScrolling = useCallback(() => {
    if (scrollTimer.current !== null) {
      clearTimeout(scrollTimer.current);
      scrollTimer.current = null;
    }

    isScrolling.current = false;

    const { current: container } = containerRef;
    let { current: dropTargets } = measuredDropTargets;
    let { current: draggedItem } = draggedItemRef;
    const { current: scrollDirection } = lastScrollDirectionRef;
    if (container && draggedItem) {
      const range = getDragAdjustedViewportRange(
        rangeRef.current,
        draggedItem.index
      );

      // The viewport range is computed based on itemHeight. It does not take into account
      // the fact that the dragged item now has zero height, we need to adjust for this.
      // need to restore displaced item,
      measuredDropTargets.current = dropTargets = measureDropTargets(
        container,
        orientation,
        itemQuery,
        range
      );

      // insert the dragged item if not present - i.e we have scrolled away from the
      // original viewport
      const newDraggedItem = getItemById(dropTargets, draggedItem.id);
      if (newDraggedItem === undefined) {
        if (scrollDirection === "fwd") {
          const lastIndex = dropTargets.length - 1;
          const lastItem = dropTargets[lastIndex];
          dropTargets.splice(lastIndex, 0, {
            ...draggedItem,
            currentIndex: lastItem.currentIndex,
          });
          lastItem.currentIndex += 1;
          displaceItem(
            lastItem,
            draggedItem.size,
            true,
            scrollDirection,
            orientation
          );
        }
      }
    }
  }, [containerRef, displaceItem, orientation, viewportRange]);

  const startScrolling = useCallback(
    (direction, scrollRate, scrollUnit = 30) => {
      const { current: container } = containerRef;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const maxScroll =
          direction === "fwd"
            ? scrollHeight - clientHeight - scrollTop
            : scrollTop;
        const nextScroll = Math.min(maxScroll, scrollUnit);

        if (direction === "fwd") {
          lastScrollDirectionRef.current = "fwd";
          container.scrollTop = scrollTop + nextScroll;
        } else {
          lastScrollDirectionRef.current = "bwd";
          container.scrollTop = scrollTop - nextScroll;
        }

        if (nextScroll === maxScroll) {
          stopScrolling();
        } else {
          isScrolling.current = true;
          scrollTimer.current = window.setTimeout(() => {
            startScrolling(direction, scrollRate, scrollUnit);
          }, 100);
        }
      }
    },
    [containerRef, stopScrolling]
  );

  return {
    isScrolling,
    startScrolling,
    stopScrolling,
  };
};
