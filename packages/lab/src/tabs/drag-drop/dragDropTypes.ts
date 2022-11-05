import { MouseEventHandler, RefObject } from "react";
import { CollectionItem } from "../../common-hooks";
import { ViewportRange } from "../../list/useScrollPosition";

import { orientationType } from "../../responsive";

export type dragStrategy = "drop-indicator" | "natural-movement";

export type Direction = "fwd" | "bwd";
export const FWD: Direction = "fwd";
export const BWD: Direction = "bwd";

export type Rect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export type DragHookResult = {
  draggable: JSX.Element | null;
  dropIndicator: JSX.Element | null;
  draggedItemIndex?: number;
  isDragging: boolean;
  isScrolling: RefObject<boolean>;
  onMouseDown?: MouseEventHandler;
  revealOverflowedItems: boolean;
};

export type DragDropProps = {
  allowDragDrop?: boolean | dragStrategy;
  /** this is the className that will be assigned during drag to the dragged element  */
  draggableClassName: string;
  extendedDropZone?: boolean;
  onDragStart?: () => void;
  onDrop: (fromIndex: number, toIndex: number) => void;
  orientation: orientationType;
  containerRef: RefObject<HTMLElement>;
  itemQuery?: string;
  selected?: CollectionItem<unknown> | CollectionItem<unknown>[];
  viewportRange?: ViewportRange;
};

export type DragDropHook = (props: DragDropProps) => DragHookResult;
