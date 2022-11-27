import {
  DragDropHook,
  InternalDragDropProps,
  InternalDragHookResult,
  MouseOffset,
} from "./dragDropTypes";
import { useDragDropNaturalMovement } from "./useDragDropNaturalMovement";
import { useDragDropIndicator } from "./useDragDropIndicator";
import { useDragDropProvider } from "./DragDropProvider";
import {
  MouseEventHandler,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cloneElement, dimensions } from "./drag-utils";
import { useAutoScroll, ScrollStopHandler } from "./useAutoScroll";
import { Draggable } from "./Draggable";

const NULL_DRAG_DROP_RESULT = {
  beginDrag: () => undefined,
  drag: () => undefined,
  draggableRef: { current: null },
  drop: () => undefined,
  isDragging: false,
  isScrolling: false,
  handleScrollStart: () => undefined,
  handleScrollStop: () => undefined,
  revealOverflowedItems: false,
};

type DragBoundary = {
  start: number;
  end: number;
  contraStart: number;
  contraEnd: number;
};

const UNBOUNDED: DragBoundary = {
  start: 0,
  end: 1000,
  contraStart: 0,
  contraEnd: 1000,
};

type InternalHook = (props: InternalDragDropProps) => InternalDragHookResult;
const noDragDrop: InternalHook = () => NULL_DRAG_DROP_RESULT;
const dragThreshold = 3;

const getDraggableElement = (
  el: EventTarget | null,
  query: string
): HTMLElement => (el as HTMLElement).closest(query) as HTMLElement;

const getLastElement = (container: HTMLElement): [HTMLElement, boolean] => {
  const childElements = Array.from(
    container.querySelectorAll(`:not([data-overflowed="true"])`)
  );
  const lastElement = childElements.pop() as HTMLElement;
  return [lastElement, lastElement.dataset.overflowIndicator === "true"];
};

export const useDragDrop: DragDropHook = ({
  allowDragDrop,
  containerRef,
  draggableClassName,
  itemQuery = "*",
  onDragStart,
  onDrop,
  onDropSettle,
  orientation,
  ...dragDropProps
}) => {
  const dragBoundaries = useRef<DragBoundary>({
    start: 0,
    end: 0,
    contraStart: 0,
    contraEnd: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragPortal, setDragPortal] = useState<JSX.Element | undefined>();
  // A ref to the draggable element
  const draggableRef = useRef<HTMLDivElement>(null);
  const mouseDownTimer = useRef<number | null>(null);
  /** do we actually have scrollable content  */
  const isScrollable = useRef(false);
  /** Distance between start (top | left) of dragged element and point where user pressed to drag */
  const mouseOffsetRef = useRef<MouseOffset>({ x: 0, y: 0 });
  /** current mouse position */
  const mousePosRef = useRef<MouseOffset>({ x: 0, y: 0 });
  /** mouse position when mousedown initiated drag */
  const startPosRef = useRef<MouseOffset>({ x: 0, y: 0 });
  /** references the dragged Item during its final 'settling' phase post drop  */
  const settlingItemRef = useRef<HTMLDivElement | null>(null);

  const dropPosRef = useRef(-1);
  const dropIndexRef = useRef(-1);

  const handleScrollStopRef = useRef<ScrollStopHandler>();

  const { isDragSource, isDropTarget, register } = useDragDropProvider(
    dragDropProps.id
  );

  if (dragDropProps.id && (isDragSource || isDropTarget)) {
    register(dragDropProps.id);
  }

  const handleDropTransitionEnd = useCallback(() => {
    const { current: toIndex } = dropIndexRef;
    dropIndexRef.current = -1;
    onDropSettle?.(toIndex);
    setDragPortal(null);
  }, [onDropSettle]);

  const getScrollDirection = useCallback(
    (mousePos) => {
      if (containerRef.current) {
        const { POS, SCROLL_POS, SCROLL_SIZE, CLIENT_SIZE } =
          dimensions(orientation);
        const {
          [SCROLL_POS]: scrollPos,
          [SCROLL_SIZE]: scrollSize,
          [CLIENT_SIZE]: clientSize,
        } = containerRef.current;

        const maxScroll = scrollSize - clientSize;
        const canScrollFwd = scrollPos < maxScroll;
        const viewportEnd = dragBoundaries.current.end;
        const bwd =
          scrollPos > 0 &&
          mousePos - mouseOffsetRef.current[POS] <=
            dragBoundaries.current.start;
        const fwd =
          canScrollFwd && mousePos - mouseOffsetRef.current[POS] >= viewportEnd;
        return bwd ? "bwd" : fwd ? "fwd" : "";
      }
    },
    [containerRef, orientation]
  );

  const useDragDropHook: InternalHook =
    allowDragDrop === true || allowDragDrop === "natural-movement"
      ? useDragDropNaturalMovement
      : allowDragDrop === "drop-indicator"
      ? useDragDropIndicator
      : noDragDrop;

  const onScrollingStopped = useCallback(
    (scrollDirection: "fwd" | "bwd", scrollPos: number, atEnd: boolean) => {
      handleScrollStopRef.current?.(scrollDirection, scrollPos, atEnd);
    },
    []
  );

  const { isScrolling, startScrolling, stopScrolling } = useAutoScroll({
    containerRef,
    onScrollingStopped,
  });

  const handleDrop = useCallback(
    (fromIndex: number, toIndex: number) => {
      console.log(`handleDrop from ${fromIndex} to ${toIndex}`);
      dropPosRef.current = toIndex;
      onDrop?.(fromIndex, toIndex);
    },
    [onDrop]
  );

  const {
    beginDrag,
    drag,
    drop,
    handleScrollStart,
    handleScrollStop,
    ...dragResult
  } = useDragDropHook({
    ...dragDropProps,
    containerRef,
    draggableRef,
    isDragging,
    isDragSource,
    isDropTarget,
    itemQuery,
    onDrop: handleDrop,
    orientation,
  });
  // To avoid circular ref between hooks
  handleScrollStopRef.current = handleScrollStop;

  const dragMouseMoveHandler = useCallback(
    (evt: MouseEvent) => {
      const { CLIENT_POS, CONTRA_CLIENT_POS, CONTRA_POS, POS, START } =
        dimensions(orientation);
      const { clientX, clientY } = evt;
      const { [CLIENT_POS]: clientPos, [CONTRA_CLIENT_POS]: clientContraPos } =
        evt;
      const lastClientPos = mousePosRef.current[POS];
      const lastClientContraPos = mousePosRef.current[CONTRA_POS];

      const dragDistance = Math.abs(lastClientPos - clientPos);
      const dragOutDistance = isDragSource
        ? Math.abs(lastClientContraPos - clientContraPos)
        : 0;

      if (dragOutDistance - dragDistance > 5) {
        console.log("DRAG AWAY");
        // remove the drag boundaries
        dragBoundaries.current = UNBOUNDED;
        // Need to notify the dragDropHook, so it can clearSpacers
        // and begin tracking draggabler coordinates for entry into a droptarget
      }

      mousePosRef.current.x = clientX;
      mousePosRef.current.y = clientY;

      if (dragBoundaries.current === UNBOUNDED && draggableRef.current) {
        const dragPosX = mousePosRef.current.x - mouseOffsetRef.current.x;
        const dragPosY = mousePosRef.current.y - mouseOffsetRef.current.y;
        draggableRef.current.style.top = `${dragPosY}px`;
        draggableRef.current.style.left = `${dragPosX}px`;
      } else if (dragDistance > 0 && draggableRef.current) {
        const mouseMoveDirection = lastClientPos < clientPos ? "fwd" : "bwd";
        const scrollDirection = getScrollDirection(clientPos);
        const dragPos = mousePosRef.current[POS] - mouseOffsetRef.current[POS];

        if (scrollDirection && isScrollable.current && !isScrolling.current) {
          handleScrollStart();
          startScrolling(scrollDirection, 1);
        } else if (!scrollDirection && isScrolling.current) {
          stopScrolling();
        }

        if (!isScrolling.current) {
          const renderDragPos = Math.max(
            dragBoundaries.current.start,
            Math.min(dragBoundaries.current.end, dragPos)
          );

          const START = orientation === "horizontal" ? "left" : "top";
          draggableRef.current.style[START] = `${dragPos}px`;

          drag(renderDragPos, mouseMoveDirection);
        }
      }
    },
    [
      drag,
      draggableRef,
      getScrollDirection,
      handleScrollStart,
      isDragSource,
      isScrolling,
      orientation,
      startScrolling,
      stopScrolling,
    ]
  );
  const dragMouseUpHandler = useCallback(() => {
    document.removeEventListener("mousemove", dragMouseMoveHandler, false);
    document.removeEventListener("mouseup", dragMouseUpHandler, false);
    settlingItemRef.current = draggableRef.current;
    drop();
    setIsDragging(false);
  }, [dragMouseMoveHandler, draggableRef, drop]);

  const dragStart = useCallback(
    (evt: MouseEvent) => {
      const { clientX, clientY, target } = evt;
      const dragElement = getDraggableElement(target, itemQuery);
      const { current: container } = containerRef;
      if (container && dragElement) {
        const {
          CONTRA,
          CONTRA_END,
          DIMENSION,
          END,
          SCROLL_SIZE,
          CLIENT_SIZE,
          START,
        } = dimensions(orientation);

        const { [SCROLL_SIZE]: scrollSize, [CLIENT_SIZE]: clientSize } =
          container;
        isScrollable.current = scrollSize > clientSize;

        const [lastElement, lastItemIsOverflowIndicator] =
          getLastElement(container);

        const containerRect = container.getBoundingClientRect();
        const draggableRect = dragElement.getBoundingClientRect();
        const draggableSize = draggableRect[DIMENSION];
        const { [START]: lastItemStart, [END]: lastItemEnd } =
          lastElement.getBoundingClientRect();

        mouseOffsetRef.current.x = clientX - draggableRect.left;
        mouseOffsetRef.current.y = clientY - draggableRect.top;

        dragBoundaries.current.start = containerRect[START];
        dragBoundaries.current.end = lastItemIsOverflowIndicator
          ? Math.max(lastItemStart, containerRect.right - draggableSize)
          : isScrollable.current
          ? containerRect[START] + containerRect[DIMENSION] - draggableSize
          : lastItemEnd - draggableSize;
        dragBoundaries.current.contraStart = containerRect[CONTRA];
        dragBoundaries.current.contraEnd = containerRect[CONTRA_END];

        beginDrag(evt);

        setDragPortal(
          <Draggable
            element={cloneElement(dragElement)}
            onTransitionEnd={handleDropTransitionEnd}
            ref={draggableRef}
            rect={draggableRect}
            wrapperClassName={draggableClassName}
          />
        );

        setIsDragging(true);
        onDragStart?.();

        document.addEventListener("mousemove", dragMouseMoveHandler, false);
        document.addEventListener("mouseup", dragMouseUpHandler, false);
      }
    },
    [
      beginDrag,
      containerRef,
      dragMouseMoveHandler,
      dragMouseUpHandler,
      draggableClassName,
      draggableRef,
      handleDropTransitionEnd,
      itemQuery,
      onDragStart,
      orientation,
    ]
  );

  const preDragMouseMoveHandler = useCallback(
    (evt: MouseEvent) => {
      const { CLIENT_POS, POS } = dimensions(orientation);
      const { [CLIENT_POS]: clientPos } = evt;
      const mouseMoveDistance = Math.abs(clientPos - startPosRef.current[POS]);
      if (mouseMoveDistance > dragThreshold && containerRef.current) {
        if (mouseDownTimer.current) {
          window.clearTimeout(mouseDownTimer.current);
          mouseDownTimer.current = null;
        }
        document.removeEventListener("mousemove", preDragMouseMoveHandler);
        document.removeEventListener("mouseup", preDragMouseUpHandler, false);

        dragStart(evt);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [containerRef, beginDrag, orientation]
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
        const { clientX, clientY } = evt;
        mousePosRef.current.x = startPosRef.current.x = clientX;
        mousePosRef.current.y = startPosRef.current.y = clientY;

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
          dragStart(evt.nativeEvent);
        }, 500);
      }
    },
    [containerRef, dragStart, preDragMouseMoveHandler, preDragMouseUpHandler]
  );

  const { current: settlingItem } = settlingItemRef;
  useLayoutEffect(() => {
    if (settlingItem && containerRef.current) {
      const dropPos = dropPosRef.current;
      const droppedItem = containerRef.current.querySelector(
        `${itemQuery}[data-idx="${dropPos}"]`
      );
      if (droppedItem) {
        const { top, left } = droppedItem.getBoundingClientRect();
        settlingItem.classList.add("settling");
        settlingItem.style.top = `${top}px`;
        settlingItem.style.left = `${left}px`;
      } else {
        console.log(`dont have the dropped item (at ${dropPos})`);
      }
      settlingItemRef.current = null;
    }
  }, [containerRef, itemQuery, settlingItem]);

  return {
    ...dragResult,
    draggable: dragPortal,
    isDragging,
    isScrolling,
    onMouseDown: mouseDownHandler,
  };
};
