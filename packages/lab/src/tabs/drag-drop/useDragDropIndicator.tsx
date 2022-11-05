import { MouseEventHandler, useCallback, useRef, useState } from "react";

import { DragDropHook, Direction, Rect } from "./dragDropTypes";
import { SPACER_SIZE, useDragDisplacers } from "./useDragIndicator";

import { useListViz } from "../../../../../../packages/showcase/src/examples/uitk/ListVisualizer";

import {
  dimensions,
  getItemById,
  MeasuredDropTarget,
  measureDropTargets,
  getNextDropTarget,
} from "./drag-utils";

import { createDropIndicator, Draggable } from "./Draggable";
import { useAutoScroll } from "./useAutoScroll";
import { ViewportRange } from "../../list/useScrollPosition";

const dragThreshold = 3;
const NOT_OVERFLOWED = ':not([data-overflowed="true"])';
const NOT_HIDDEN = ':not([aria-hidden="true"])';

export const useDragDropIndicator: DragDropHook = ({
  draggableClassName,
  onDragStart,
  onDrop,
  orientation = "horizontal",
  containerRef,
  itemQuery = "*",
  selected,
  viewportRange,
}) => {
  const dragDirectionRef = useRef<Direction | undefined>();
  const draggableRef = useRef<HTMLDivElement>(null);
  const dropIndicatorRef = useRef<HTMLDivElement>(null);
  const dragLimits = useRef({ start: 0, end: 0 });
  const dropTargetRef = useRef<MeasuredDropTarget | null>(null);
  const isScrollable = useRef(false);
  /** Distance between start (top | left) of dragged element and point where user pressed to drag */
  const mouseOffset = useRef(0);
  const mousePos = useRef(0);
  const mouseDownTimer = useRef<number | null>(null);
  const measuredDropTargets = useRef<MeasuredDropTarget[]>([]);
  const overflowMenuShowingRef = useRef(false);
  const startPos = useRef(0);

  const [showOverflow, setShowOverflow] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPortal, setDragPortal] = useState<JSX.Element | null>(null);

  const { clearDisplacedItem, clearSpacers, displaceItem, displaceLastItem } =
    useDragDisplacers();

  const draggedItemRef = useRef<MeasuredDropTarget>();
  const fullItemQuery = `:is(${itemQuery}${NOT_OVERFLOWED}${NOT_HIDDEN},[data-overflow-indicator])`;

  const { setMeasurements: setVizData } = useListViz();

  const indexOf = (dropTarget: MeasuredDropTarget) =>
    measuredDropTargets.current.findIndex((d) => d.id === dropTarget.id);

  const reposition = (
    dropTarget: MeasuredDropTarget,
    distance: number,
    indexShift?: number
  ) => {
    dropTarget.start += distance;
    dropTarget.mid += distance;
    dropTarget.end += distance;
    if (typeof indexShift === "number") {
      dropTarget.currentIndex += indexShift;
    }
  };

  // Shouldn't need this - but viewportRange is always stale in stopScrolling. Checked all dependencies
  // look ok. Something to do with setTimeout / scrollHandler ?
  const rangeRef = useRef<ViewportRange>();
  rangeRef.current = viewportRange;

  const handleScrollingStopped = useCallback(
    (scrollDirection: "fwd" | "bwd", _scrollPos: number, atEnd: boolean) => {
      const { current: container } = containerRef;
      const { current: draggedItem } = draggedItemRef;
      if (container && draggedItem) {
        measuredDropTargets.current = measureDropTargets(
          container,
          orientation,
          fullItemQuery,
          rangeRef.current
        );
        setVizData(measuredDropTargets.current);

        const { size } = draggedItem;
        const dragPos = mousePos.current - mouseOffset.current;
        const midPos = dragPos + size / 2;
        const { current: dropTargets } = measuredDropTargets;
        const nextDropTarget = getNextDropTarget(
          dropTargets,
          draggedItem,
          midPos,
          "static"
        );
        if (nextDropTarget) {
          const targetIndex = indexOf(nextDropTarget);
          if (atEnd && scrollDirection === "fwd") {
            displaceLastItem(
              dropTargets[dropTargets.length - 1],
              size,
              false,
              "static",
              orientation
            );
          } else {
            displaceItem(nextDropTarget, size, true, "static", orientation);
            for (let i = targetIndex; i < dropTargets.length; i++) {
              reposition(dropTargets[i], SPACER_SIZE ?? size);
            }
          }
        }

        setVizData(measuredDropTargets.current);
      }
    },
    [containerRef, displaceItem, displaceLastItem, fullItemQuery, orientation]
  );

  const { isScrolling, startScrolling, stopScrolling } = useAutoScroll({
    containerRef,
    onScrollingStopped: handleScrollingStopped,
  });

  const getScrollDirection = useCallback(
    (mousePos) => {
      if (containerRef.current) {
        const { SCROLL_POS, SCROLL_SIZE, CLIENT_SIZE } =
          dimensions(orientation);
        const {
          [SCROLL_POS]: scrollPos,
          [SCROLL_SIZE]: scrollSize,
          [CLIENT_SIZE]: clientSize,
        } = containerRef.current;
        const maxScroll = scrollSize - clientSize;
        const canScrollFwd = scrollPos < maxScroll;
        const viewportEnd = dragLimits.current.end;
        const bwd =
          scrollPos > 0 &&
          mousePos - mouseOffset.current <= dragLimits.current.start;
        const fwd =
          canScrollFwd && mousePos - mouseOffset.current >= viewportEnd;
        return bwd ? "bwd" : fwd ? "fwd" : "";
      }
    },
    [containerRef, orientation]
  );

  const dragMouseMoveHandler = useCallback(
    (evt: MouseEvent) => {
      const { POS } = dimensions(orientation);
      const { [POS]: clientPos } = evt;
      const { current: lastClientPos } = mousePos;
      const { current: currentDropTarget } = dropTargetRef;
      const { current: draggedItem } = draggedItemRef;

      if (draggedItem && Math.abs(lastClientPos - clientPos) > 0) {
        mousePos.current = clientPos;
        const mouseMoveDirection = lastClientPos < clientPos ? "fwd" : "bwd";
        const scrollDirection = getScrollDirection(clientPos);
        const dragPos = mousePos.current - mouseOffset.current;

        if (scrollDirection && isScrollable.current && !isScrolling.current) {
          clearDisplacedItem();
          startScrolling(scrollDirection, 1);
        } else if (!scrollDirection && isScrolling.current) {
          stopScrolling();
        }

        if (
          !isScrolling.current &&
          draggableRef.current &&
          containerRef.current
        ) {
          const START = orientation === "horizontal" ? "left" : "top";
          const renderDragPos = Math.max(
            dragLimits.current.start,
            Math.min(dragLimits.current.end, dragPos)
          );
          draggableRef.current.style[START] = `${renderDragPos}px`;
          const leadingEdge =
            mouseMoveDirection === "fwd" ? dragPos + draggedItem.size : dragPos;

          const { current: dropTargets } = measuredDropTargets;
          const nextDropTarget = getNextDropTarget(
            dropTargets,
            draggedItem,
            leadingEdge,
            mouseMoveDirection
          );

          if (
            nextDropTarget &&
            (nextDropTarget.index !== currentDropTarget?.index ||
              mouseMoveDirection !== dragDirectionRef.current)
          ) {
            if (nextDropTarget.isOverflowIndicator) {
              // Does this belong in here or can we abstract it out
              setShowOverflow((overflowMenuShowingRef.current = true));
            } else {
              const { size } = draggedItem;
              const targetIndex = indexOf(nextDropTarget);
              if (targetIndex === dropTargets.length - 1) {
                // because we maintain at least one out-of-viewport row in
                // the dropTargets, this means we are at the very last item.
                const dropTarget = dropTargets[dropTargets.length - 1];
                const displacedSize = SPACER_SIZE ?? size;
                displaceLastItem(
                  dropTarget,
                  size,
                  true,
                  mouseMoveDirection,
                  orientation
                );
                reposition(
                  dropTarget,
                  mouseMoveDirection === "fwd" ? -displacedSize : displacedSize
                );
              } else {
                const dropIndicatorPosition = displaceItem(
                  nextDropTarget,
                  size,
                  true,
                  mouseMoveDirection,
                  orientation
                ) as unknown as HTMLElement;
                const restoredSize =
                  mouseMoveDirection === "fwd" ? -size : size;
                reposition(nextDropTarget, SPACER_SIZE ?? restoredSize);
                const dropIndicatorRect =
                  dropIndicatorPosition.getBoundingClientRect();
                dropIndicatorRef.current.style[
                  START
                ] = `${dropIndicatorRect.top}px`;
              }
              setVizData(dropTargets);

              setShowOverflow((overflowMenuShowingRef.current = false));
            }

            dropTargetRef.current = nextDropTarget;
            dragDirectionRef.current = mouseMoveDirection;
          }
        }
      }
    },
    [
      clearDisplacedItem,
      containerRef,
      displaceItem,
      displaceLastItem,
      getScrollDirection,
      isScrolling,
      orientation,
      setVizData,
      startScrolling,
      stopScrolling,
    ]
  );

  const dragMouseUpHandler = useCallback(() => {
    document.removeEventListener("mousemove", dragMouseMoveHandler, false);
    document.removeEventListener("mouseup", dragMouseUpHandler, false);
    clearSpacers();
    const { current: draggedItem } = draggedItemRef;
    const { current: dropTarget } = dropTargetRef;
    const { current: range } = rangeRef;
    let dropLastItem = false;
    if (draggedItem && range) {
      const { index: fromIndex } = draggedItem;
      const { index: originalDropTargetIndex, currentIndex: toIndex } =
        dropTarget === null
          ? { index: range.to + 1, currentIndex: range.to + 1 }
          : dropTarget;

      dropTargetRef.current = null;
      dragDirectionRef.current = undefined;

      setDragPortal(null);

      if (toIndex === 49) {
        dropLastItem = true;
      }

      if (overflowMenuShowingRef.current) {
        onDrop(fromIndex, -1);
        // } else if (fromIndex !== toIndex) {
      } else {
        if (fromIndex < originalDropTargetIndex) {
          onDrop(fromIndex, toIndex);
        } else {
          onDrop(fromIndex, toIndex);
        }
      }
    }
    setShowOverflow(false);

    if (containerRef.current) {
      // TODO we're not catching every scenario where we need to control
      // the final scroll position here.
      const scrollTop = containerRef.current?.scrollTop;
      setIsDragging(false);

      console.log({ range: rangeRef.current });

      if (dropLastItem) {
        const scrollingContainer = containerRef.current.querySelector(
          ".uitkList-scrollingContentContainer"
        );
        containerRef.current.scrollTop =
          scrollingContainer.clientHeight - containerRef.current.clientHeight;
      } else if (!dropTarget?.isLast) {
        containerRef.current.scrollTop = scrollTop;
      } else {
        console.log(`last drop target`);
      }
    }
  }, [clearSpacers, containerRef, dragMouseMoveHandler, onDrop]);

  const enterDraggingState = useCallback(
    (evt: MouseEvent) => {
      const evtTarget = evt.target as HTMLElement;
      const dragElement = evtTarget.closest(itemQuery) as HTMLElement;
      if (
        dragElement.ariaSelected &&
        Array.isArray(selected) &&
        selected.length > 1
      ) {
        console.log("its a selected element, and we have a multi select");
      }
      const { current: container } = containerRef;
      if (container && dragElement) {
        const { DIMENSION, POS, START } = dimensions(orientation);
        const { id: draggedItemId } = dragElement;
        const { [POS]: mousePos } = evt;

        const dropTargets = (measuredDropTargets.current = measureDropTargets(
          container,
          orientation,
          fullItemQuery,
          viewportRange
        ));

        const draggedItem = getItemById(dropTargets, draggedItemId);

        if (draggedItem && container) {
          const { current: range } = rangeRef;

          const targetIndex = indexOf(draggedItem);
          dropTargets.splice(targetIndex, 1);
          //TODO when our viewport is the last 'page' of a scrolling viewport
          // the viewport will scoll up by one row when we remove an item, so
          // the position of each item will move down.
          if (range?.atEnd) {
            for (let i = 0; i < dropTargets.length; i++) {
              reposition(dropTargets[i], draggedItem.size);
            }
          }
          for (let i = targetIndex; i < dropTargets.length; i++) {
            reposition(dropTargets[i], -draggedItem.size, -1);
          }

          setVizData(dropTargets);

          draggedItemRef.current = draggedItem;

          const containerRect = container.getBoundingClientRect();
          const draggableRect = draggedItem.element.getBoundingClientRect();
          mouseOffset.current = mousePos - draggedItem.start;
          const [lastItem] = dropTargets.slice(-1);
          const lastChildEnd = lastItem.end;

          dragLimits.current.start = containerRect[START];

          dragLimits.current.end = lastItem.isOverflowIndicator
            ? Math.max(lastItem.start, containerRect.right - draggedItem.size)
            : isScrollable.current
            ? containerRect[START] + containerRect[DIMENSION] - draggedItem.size
            : lastChildEnd - draggedItem.size;

          const [dropTarget, displaceFunction] = draggedItem.isLast
            ? [dropTargets[dropTargets.length - 1], displaceLastItem]
            : [dropTargets[targetIndex], displaceItem];

          dropTargetRef.current = draggedItem.isLast ? null : dropTarget;

          const dropIndicatorPosition = displaceFunction(
            dropTarget,
            draggedItem.size,
            false,
            "static",
            orientation
          ) as unknown as HTMLElement;

          const { top, left, width } =
            dropIndicatorPosition.getBoundingClientRect();
          console.log({
            position: dropIndicatorPosition.getBoundingClientRect(),
          });
          // Next render will remove the dragged item, that will offset our initial
          // dropIndicatorPosition
          const dropIndicatorRect = {
            top: draggedItem.isLast
              ? range?.atEnd && !range.atStart
                ? top + draggedItem.size - 2
                : top - 2
              : top - draggedItem.size - 2,
            left,
            width,
            height: 2,
          };

          const wrapperRect = {
            top: draggableRect.top + 6,
            left: draggableRect.left + 6,
            width: draggableRect.width,
            height: draggableRect.height,
          };
          setDragPortal(
            <>
              <Draggable
                wrapperClassName="dropIndicatorContainer"
                rect={dropIndicatorRect!}
                ref={dropIndicatorRef}
                element={createDropIndicator()}
              />
              <Draggable
                wrapperClassName={draggableClassName}
                rect={wrapperRect}
                ref={draggableRef}
                element={dragElement.cloneNode(true) as HTMLElement}
              />
            </>
          );

          setIsDragging(true);
          onDragStart?.();
        }
        document.addEventListener("mousemove", dragMouseMoveHandler, false);
        document.addEventListener("mouseup", dragMouseUpHandler, false);
      }
    },
    [
      containerRef,
      displaceItem,
      displaceLastItem,
      dragMouseMoveHandler,
      dragMouseUpHandler,
      draggableClassName,
      fullItemQuery,
      itemQuery,
      onDragStart,
      orientation,
      selected,
      setVizData,
      viewportRange,
    ]
  );

  const preDragMouseMoveHandler = useCallback(
    (evt: MouseEvent) => {
      const { POS } = dimensions(orientation);
      const { [POS]: clientPos } = evt;
      const mouseMoveDistance = Math.abs(clientPos - startPos.current);
      if (mouseMoveDistance > dragThreshold && containerRef.current) {
        if (mouseDownTimer.current) {
          window.clearTimeout(mouseDownTimer.current);
          mouseDownTimer.current = null;
        }
        document.removeEventListener("mousemove", preDragMouseMoveHandler);
        document.removeEventListener("mouseup", preDragMouseUpHandler, false);

        enterDraggingState(evt);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [containerRef, enterDraggingState, orientation]
  );

  const preDragMouseUpHandler = useCallback(() => {
    if (mouseDownTimer.current) {
      window.clearTimeout(mouseDownTimer.current);
      mouseDownTimer.current = null;
    }
    document.removeEventListener("mousemove", preDragMouseMoveHandler, false);
    document.removeEventListener("mouseup", preDragMouseUpHandler, false);
  }, [preDragMouseMoveHandler]);

  const mouseDownHandler: MouseEventHandler = useCallback(
    (evt) => {
      const { current: container } = containerRef;
      if (container && !evt.defaultPrevented) {
        const { POS, SCROLL_SIZE, CLIENT_SIZE } = dimensions(orientation);
        const { [POS]: clientPos } = evt;
        startPos.current = clientPos;
        mousePos.current = clientPos;

        const { [SCROLL_SIZE]: scrollSize, [CLIENT_SIZE]: clientSize } =
          container;
        isScrollable.current = scrollSize > clientSize;

        document.addEventListener("mousemove", preDragMouseMoveHandler, false);
        document.addEventListener("mouseup", preDragMouseUpHandler, false);

        evt.persist();

        mouseDownTimer.current = window.setTimeout(() => {
          document.removeEventListener(
            "mousemove",
            preDragMouseMoveHandler,
            false
          );
          document.removeEventListener("mouseup", preDragMouseUpHandler, false);
          enterDraggingState(evt.nativeEvent);
        }, 500);
      }
    },
    [
      containerRef,
      enterDraggingState,
      orientation,
      preDragMouseMoveHandler,
      preDragMouseUpHandler,
    ]
  );

  const draggedItemIndex = isDragging ? draggedItemRef.current?.dataIndex : -1;

  return {
    draggable: dragPortal,
    dropIndicator: null,
    draggedItemIndex,
    isDragging,
    isScrolling,
    onMouseDown: mouseDownHandler,
    revealOverflowedItems: showOverflow,
  };
};
