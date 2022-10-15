import { MouseEventHandler, useCallback, useRef, useState } from "react";

import { DragDropHook, Direction } from "./dragDropTypes";
import { useDragSpacers } from "./useDragSpacers";

import {
  dimensions,
  getItemById,
  MeasuredDropTarget,
  measureDropTargets,
  moveDragItem,
  getNextDropTarget,
} from "./drag-utils";

import { Draggable } from "./Draggable";
import { useAutoScroll } from "./useAutoScroll";

const dragThreshold = 3;
const NOT_OVERFLOWED = ':not([data-overflowed="true"])';
const NOT_HIDDEN = ':not([aria-hidden="true"])';

export const useDragDropNaturalMovement: DragDropHook = ({
  draggableClassName,
  onDrop,
  orientation = "horizontal",
  containerRef,
  itemQuery = "*",
  viewportRange,
}) => {
  const [showOverflow, setShowOverflow] = useState(false);
  const overflowMenuShowingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPortal, setDragPortal] = useState<JSX.Element | null>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  const startPos = useRef(0);
  const previousPos = useRef(0);
  const mouseOffset = useRef(0);
  const mouseDownTimer = useRef<number | null>(null);
  const dragLimits = useRef({ start: 0, end: 0 });
  const dragDirection = useRef<Direction | undefined>();
  const isScrollable = useRef(false);
  const dropTargetRef = useRef<MeasuredDropTarget | null>(null);
  const measuredDropTargets = useRef<MeasuredDropTarget[]>([]);
  const { clearDisplacedItem, clearSpacers, displaceItem, displaceLastItem } =
    useDragSpacers();

  const draggedItemRef = useRef<MeasuredDropTarget>();
  const fullItemQuery = `:is(${itemQuery}${NOT_OVERFLOWED}${NOT_HIDDEN},[data-overflow-indicator])`;

  const { isScrolling, startScrolling, stopScrolling } = useAutoScroll({
    containerRef,
    displaceItem,
    measuredDropTargets,
    orientation,
    itemQuery: fullItemQuery,
    viewportRange,
    draggedItemRef,
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
      const { current: lastClientPos } = previousPos;
      const { current: currentDropTarget } = dropTargetRef;
      const { current: currentDraggedItem } = draggedItemRef;
      const draggedItem = currentDraggedItem
        ? getItemById(measuredDropTargets.current, currentDraggedItem.id)
        : undefined;

      if (
        draggedItem &&
        currentDraggedItem &&
        Math.abs(lastClientPos - clientPos) > 0
      ) {
        previousPos.current = clientPos;

        const moveDistance = clientPos - startPos.current;
        const scrollDirection = getScrollDirection(clientPos);
        const pos = startPos.current - mouseOffset.current + moveDistance;
        const renderPos = Math.max(
          dragLimits.current.start,
          Math.min(dragLimits.current.end, pos)
        );

        if (scrollDirection && isScrollable.current && !isScrolling.current) {
          clearDisplacedItem();
          console.log(`----------------------> start scrolling`);
          startScrolling(scrollDirection, 1);
        } else if (!scrollDirection && isScrolling.current) {
          console.log(
            `                       stop scrolling <----------------------`
          );
          stopScrolling();
        }

        if (
          !isScrolling.current &&
          draggableRef.current &&
          containerRef.current
        ) {
          // Have to redefine the following here as we're using it as a style type not a DOMRect type
          const START = orientation === "horizontal" ? "left" : "top";
          draggableRef.current.style[START] = `${renderPos}px`;

          const direction = lastClientPos < clientPos ? "fwd" : "bwd";
          const offsetPos = clientPos - mouseOffset.current;
          const leadingEdge =
            direction === "fwd" ? offsetPos + draggedItem.size : offsetPos;

          const nextDropTarget = getNextDropTarget(
            measuredDropTargets.current,
            draggedItem,
            leadingEdge,
            direction
          );

          if (
            nextDropTarget &&
            (nextDropTarget.index !== currentDropTarget?.index ||
              direction !== dragDirection.current)
          ) {
            if (nextDropTarget.isOverflowIndicator) {
              // Does this belong in here or can we abstract it out
              setShowOverflow((overflowMenuShowingRef.current = true));
            } else {
              const newDropTargets = moveDragItem(
                measuredDropTargets.current,
                nextDropTarget,
                currentDraggedItem
              );

              const draggedItem = getItemById(
                newDropTargets,
                currentDraggedItem.id
              );

              if (draggedItem) {
                const nextDisplacedItem =
                  newDropTargets[draggedItem.currentIndex + 1];
                if (nextDisplacedItem) {
                  displaceItem(
                    nextDisplacedItem,
                    draggedItem.size,
                    true,
                    direction,
                    orientation
                  );
                } else {
                  const displacedItem = newDropTargets.find(
                    (item) => item.currentIndex === draggedItem.currentIndex - 1
                  );
                  if (displacedItem) {
                    displaceLastItem(
                      displacedItem,
                      draggedItem.size,
                      true,
                      orientation
                    );
                  }
                }
              }

              measuredDropTargets.current = newDropTargets;
              setShowOverflow((overflowMenuShowingRef.current = false));
            }

            dropTargetRef.current = nextDropTarget;
            dragDirection.current = direction;
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
      startScrolling,
      stopScrolling,
    ]
  );

  const dragMouseUpHandler = useCallback(() => {
    document.removeEventListener("mousemove", dragMouseMoveHandler, false);
    document.removeEventListener("mouseup", dragMouseUpHandler, false);
    // return;
    // ==================>
    clearSpacers();
    const { current: dropTargets } = measuredDropTargets;
    const { current: currentDraggedItem } = draggedItemRef;
    const draggedItem = currentDraggedItem
      ? getItemById(dropTargets, currentDraggedItem.id)
      : undefined;
    if (draggedItem) {
      const { dataIndex = -1, index, currentIndex: toIndex } = draggedItem;

      const fromIndex = dataIndex !== -1 ? dataIndex : index;
      dropTargetRef.current = null;
      dragDirection.current = undefined;

      setDragPortal(null);

      if (overflowMenuShowingRef.current) {
        onDrop(fromIndex, -1);
      } else if (fromIndex !== toIndex) {
        onDrop(fromIndex, toIndex);
      }
    }
    setShowOverflow(false);
    setIsDragging(false);
  }, [clearSpacers, dragMouseMoveHandler, onDrop]);

  const enterDraggingState = useCallback(
    (evt: MouseEvent) => {
      const evtTarget = evt.target as HTMLElement;
      const dragElement = evtTarget.closest(itemQuery) as HTMLElement;
      const { current: container } = containerRef;
      if (container && dragElement) {
        const { DIMENSION, POS, START } = dimensions(orientation);
        const { id: draggedItemId } = dragElement;
        const { [POS]: clientPos } = evt;

        // TODO limit this to items within the viewport
        const dropTargets = measureDropTargets(
          containerRef.current as HTMLElement,
          orientation,
          fullItemQuery,
          viewportRange
        );
        const draggedItem = getItemById(dropTargets, draggedItemId);
        if (draggedItem && containerRef.current) {
          measuredDropTargets.current = dropTargets;
          draggedItemRef.current = draggedItem;
          dropTargetRef.current = draggedItem;

          const containerRect = containerRef.current.getBoundingClientRect();
          const draggableRect = draggedItem.element.getBoundingClientRect();
          mouseOffset.current = clientPos - draggedItem.start;
          const [lastItem] = dropTargets.slice(-1);
          const lastChildEnd = lastItem.end;

          dragLimits.current.start = containerRect[START];

          dragLimits.current.end = lastItem.isOverflowIndicator
            ? Math.max(lastItem.start, containerRect.right - draggedItem.size)
            : isScrollable.current
            ? containerRect[START] + containerRect[DIMENSION] - draggedItem.size
            : lastChildEnd - draggedItem.size;

          setDragPortal(
            <Draggable
              wrapperClassName={draggableClassName}
              ref={draggableRef}
              rect={draggableRect}
              element={dragElement.cloneNode(true) as HTMLElement}
            />
          );

          if (draggedItem !== lastItem) {
            const nextItem = dropTargets[draggedItem.index + 1];
            displaceItem(
              nextItem,
              draggedItem.size,
              false,
              undefined,
              orientation
            );
          } else {
            const displacedItem = dropTargets[draggedItem.index];
            displaceLastItem(
              displacedItem,
              draggedItem.size,
              false,
              orientation
            );
          }

          setIsDragging(true);
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
      orientation,
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
        previousPos.current = clientPos;

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
