import { MouseEventHandler, RefObject } from "react";
import { CollectionItem } from "../../common-hooks";
import { ViewportRange } from "../../list/useScrollPosition";
import { orientationType } from "../../responsive";

export type dragStrategy = "drop-indicator" | "natural-movement";

export type Direction = "fwd" | "bwd";
export const FWD: Direction = "fwd";
export const BWD: Direction = "bwd";

export interface MouseOffset {
  x: number;
  y: number;
}

export type Rect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export interface DragHookResult {
  draggable: JSX.Element | null;
  dropIndicator: JSX.Element | null;
  draggedItemIndex?: number;
  isDragging: boolean;
  isScrolling: RefObject<boolean>;
  onMouseDown?: MouseEventHandler;
  revealOverflowedItems: boolean;
}

export interface InternalDragHookResult
  extends Omit<DragHookResult, "isDragging" | "isScrolling"> {
  beginDrag: (evt: MouseEvent) => void;
  drag: (dragPos: number, mouseMoveDirection: "fwd" | "bwd") => void;
  draggableRef: RefObject<HTMLDivElement>;
  drop: () => void;
  handleScrollStart: () => void;
  handleScrollStop: (
    scrollDirection: "fwd" | "bwd",
    _scrollPos: number,
    atEnd: boolean
  ) => void;
}

export interface DragDropProps {
  allowDragDrop?: boolean | dragStrategy;
  /** this is the className that will be assigned during drag to the dragged element  */
  draggableClassName: string;
  extendedDropZone?: boolean;
  id?: string;
  isDragSource?: boolean;
  isDropTarget?: boolean;
  onDragStart?: () => void;
  onDrop: (fromIndex: number, toIndex: number) => void;
  onDropSettle?: (toIndex: number) => void;
  orientation: orientationType;
  containerRef: RefObject<HTMLElement>;
  itemQuery?: string;
  selected?: CollectionItem<unknown> | CollectionItem<unknown>[] | null;
  viewportRange?: ViewportRange;
}

export type DragDropHook = (props: DragDropProps) => DragHookResult;

export interface InternalDragDropProps extends DragDropProps {
  isDragging: boolean;
  isDragSource?: boolean;
  isDropTarget?: boolean;
}
