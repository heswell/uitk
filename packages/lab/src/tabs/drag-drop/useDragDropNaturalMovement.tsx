import { useCallback, useRef, useState } from "react";

import {
  Direction,
  InternalDragDropProps,
  InternalDragHookResult,
  MouseOffset,
} from "./dragDropTypes";
import { useDragDisplacers } from "./useDragDisplacers";

import { useListViz } from "../../../../../../showcase/src/examples/uitk/ListVisualizer";

import {
  cloneElement,
  dimensions,
  dropZone,
  getItemById,
  getNextDropTarget,
  MeasuredDropTarget,
  measureDropTargets,
  removeDraggedItem,
} from "./drag-utils";

import { ViewportRange } from "../../list/useScrollPosition";
import { Draggable } from "./Draggable";

const NOT_OVERFLOWED = ':not([data-overflowed="true"])';
const NOT_HIDDEN = ':not([aria-hidden="true"])';
export const useDragDropNaturalMovement = ({
  draggableClassName,
  id,
  onDrop,
  onDropSettle,
  orientation = "horizontal",
  containerRef,
  isDragging,
  itemQuery = "*",
  selected,
  viewportRange,
}: InternalDragDropProps): InternalDragHookResult => {
  const dragDirectionRef = useRef<Direction | undefined>();
  const draggableRef = useRef<HTMLDivElement>(null);
  const dropTargetRef = useRef<MeasuredDropTarget | null>(null);
  const dropZoneRef = useRef<dropZone | "">("");

  const isScrollable = useRef(false);
  /** Distance between start (top | left) of dragged element and point where user pressed to drag */
  const mouseOffsetRef = useRef<MouseOffset>({ x: 0, y: 0 });
  /** current mouse position */
  const mousePosRef = useRef<MouseOffset>({ x: 0, y: 0 });

  const dropIndexRef = useRef(-1);

  const measuredDropTargets = useRef<MeasuredDropTarget[]>([]);
  const overflowMenuShowingRef = useRef(false);

  const [showOverflow, setShowOverflow] = useState(false);
  const [dragPortal, setDragPortal] = useState<JSX.Element | null>(null);

  const { clearDisplacedItem, clearSpacers, displaceItem, displaceLastItem } =
    useDragDisplacers();

  const draggedItemRef = useRef<MeasuredDropTarget>();
  const fullItemQuery = `:is(${itemQuery}${NOT_OVERFLOWED}${NOT_HIDDEN},[data-overflow-indicator])`;

  const { setMeasurements: setVizData } = useListViz();

  const indexOf = (dropTarget: MeasuredDropTarget) =>
    measuredDropTargets.current.findIndex((d) => d.id === dropTarget.id);

  const reposition = (dropTarget: MeasuredDropTarget, distance: number) => {
    dropTarget.start += distance;
    dropTarget.mid += distance;
    dropTarget.end += distance;
  };

  // Shouldn't need this - but viewportRange is always stale in stopScrolling. Checked all dependencies
  // look ok. Something to do with setTimeout / scrollHandler ?
  const rangeRef = useRef<ViewportRange>();
  rangeRef.current = viewportRange;

  const handleScrollStart = useCallback(() => {
    clearDisplacedItem();
  }, [clearDisplacedItem]);

  const handleScrollStop = useCallback(
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
        setVizData?.(measuredDropTargets.current);
        const { POS } = dimensions(orientation);

        const { size } = draggedItem;
        const dragPos = mousePosRef.current[POS] - mouseOffsetRef.current[POS];
        const midPos = dragPos + size / 2;
        const { current: dropTargets } = measuredDropTargets;
        const [nextDropTarget] = getNextDropTarget(
          dropTargets,
          draggedItem,
          midPos
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
              reposition(dropTargets[i], size);
            }
          }
        }

        setVizData?.(measuredDropTargets.current);
      }
    },
    [
      containerRef,
      displaceItem,
      displaceLastItem,
      fullItemQuery,
      orientation,
      setVizData,
    ]
  );

  const handleDropTransitionEnd = useCallback(() => {
    const { current: toIndex } = dropIndexRef;
    dropIndexRef.current = -1;
    onDropSettle?.(toIndex);
    setDragPortal(null);
  }, [onDropSettle]);

  const beginDrag = useCallback(
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
        const { SCROLL_SIZE, CLIENT_SIZE } = dimensions(orientation);
        const { id: draggedItemId } = dragElement;

        const { [SCROLL_SIZE]: scrollSize, [CLIENT_SIZE]: clientSize } =
          container;
        isScrollable.current = scrollSize > clientSize;

        const dropTargets = (measuredDropTargets.current = measureDropTargets(
          container,
          orientation,
          fullItemQuery,
          viewportRange
        ));

        const draggedItem = getItemById(dropTargets, draggedItemId);

        if (draggedItem && container) {
          const targetIndex = indexOf(draggedItem);
          removeDraggedItem(dropTargets, targetIndex);
          // dropTargets.splice(targetIndex, 1);

          draggedItemRef.current = draggedItem;

          const draggableRect = draggedItem.element.getBoundingClientRect();

          setDragPortal(
            <Draggable
              element={cloneElement(dragElement)}
              onTransitionEnd={handleDropTransitionEnd}
              ref={draggableRef}
              rect={draggableRect}
              wrapperClassName={draggableClassName}
            />
          );

          const [displacedItem, dropZone, displaceFunction] = draggedItem.isLast
            ? [dropTargets[dropTargets.length - 1], "end", displaceLastItem]
            : [dropTargets[targetIndex], "start", displaceItem];

          dropTargetRef.current = null;
          dropZoneRef.current = dropZone as dropZone;

          setVizData?.(dropTargets, null, dropZone);

          displaceFunction(
            displacedItem,
            draggedItem.size,
            false,
            "static",
            orientation
          );
        }
      }
    },
    [
      containerRef,
      displaceItem,
      displaceLastItem,
      draggableClassName,
      fullItemQuery,
      handleDropTransitionEnd,
      itemQuery,
      orientation,
      selected,
      setVizData,
      viewportRange,
    ]
  );

  const drag = useCallback(
    (dragPos: number, mouseMoveDirection: "fwd" | "bwd") => {
      const { current: currentDropTarget } = dropTargetRef;
      const { current: draggedItem } = draggedItemRef;

      if (draggedItem) {
        if (draggableRef.current && containerRef.current) {
          const START = orientation === "horizontal" ? "left" : "top";
          draggableRef.current.style[START] = `${dragPos}px`;

          const { current: dropTargets } = measuredDropTargets;
          const [nextDropTarget, nextDropZone] = getNextDropTarget(
            dropTargets,
            draggedItem,
            dragPos
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
                displaceLastItem(
                  dropTarget,
                  size,
                  true,
                  mouseMoveDirection,
                  orientation
                );
                reposition(
                  dropTarget,
                  mouseMoveDirection === "fwd" ? -size : size
                );
              } else {
                displaceItem(
                  nextDropTarget,
                  size,
                  true,
                  mouseMoveDirection,
                  orientation
                );
                const restoredSize =
                  mouseMoveDirection === "fwd" ? -size : size;
                reposition(nextDropTarget, restoredSize);
              }
              setVizData?.(dropTargets, nextDropTarget, nextDropZone);

              setShowOverflow((overflowMenuShowingRef.current = false));
            }

            dropTargetRef.current = nextDropTarget;
            dropZoneRef.current = nextDropZone;
            dragDirectionRef.current = mouseMoveDirection;
          }
        }
      }
    },
    [containerRef, displaceItem, displaceLastItem, orientation, setVizData]
  );

  const drop = useCallback(() => {
    clearSpacers();
    const { current: draggedItem } = draggedItemRef;
    const { current: dropTarget } = dropTargetRef;
    if (draggedItem && dropTarget) {
      const { index: fromIndex } = draggedItem;
      const { currentIndex: toIndex } = dropTarget;
      dropTargetRef.current = null;
      dragDirectionRef.current = undefined;
      dropIndexRef.current = toIndex;
      if (overflowMenuShowingRef.current) {
        onDrop(fromIndex, -1);
      } else {
        onDrop(fromIndex, toIndex);
      }
    }
    setShowOverflow(false);

    if (containerRef.current) {
      // TODO we're not catching every scenario where we need to control
      // the final scroll position here.
      const scrollTop = containerRef.current?.scrollTop;
      if (!dropTarget?.isLast) {
        containerRef.current.scrollTop = scrollTop;
      }
    }
  }, [clearSpacers, containerRef, onDrop]);

  const draggedItemIndex = isDragging ? draggedItemRef.current?.dataIndex : -1;

  return {
    beginDrag,
    drag,
    draggable: dragPortal,
    draggableRef,
    dropIndicator: null,
    draggedItemIndex,
    drop,
    handleScrollStart,
    handleScrollStop,
    revealOverflowedItems: showOverflow,
  };
};
