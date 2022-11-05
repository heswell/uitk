import { DragDropHook } from "./dragDropTypes";
import { useDragDropNaturalMovement } from "./useDragDropNaturalMovement";
import { useDragDropIndicator } from "./useDragDropIndicator";

const NULL_DRAG_DROP_RESULT = {
  draggable: null,
  isDragging: false,
  isScrolling: { current: false },
  dropIndicator: null,
  revealOverflowedItems: false,
};
const noDragDrop: DragDropHook = () => NULL_DRAG_DROP_RESULT;

export const useDragDrop: DragDropHook = ({
  allowDragDrop,
  ...dragDropProps
}) => {
  const useDragDropHook: DragDropHook =
    allowDragDrop === true || allowDragDrop === "natural-movement"
      ? useDragDropNaturalMovement
      : allowDragDrop === "drop-indicator"
      ? useDragDropIndicator
      : noDragDrop;

  return useDragDropHook(dragDropProps);
};
