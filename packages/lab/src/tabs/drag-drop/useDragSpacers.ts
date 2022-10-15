import { useCallback, useMemo, useRef } from "react";
import { MeasuredDropTarget } from "./drag-utils";
import { createDragSpacer } from "./Draggable";
import { Direction } from "./dragDropTypes";

export type DragSpacersHookResult = {
  clearDisplacedItem: () => void;
  displaceItem: (
    item: MeasuredDropTarget | null,
    size: number,
    useTransition?: boolean,
    direction?: Direction,
    orientation?: "horizontal" | "vertical"
  ) => void;
  displaceLastItem: (
    item: MeasuredDropTarget,
    size: number,
    useTransition?: boolean,
    orientation?: "horizontal" | "vertical"
  ) => void;
  clearSpacers: () => void;
};

export type DragSpacersHook = () => DragSpacersHookResult;

export const useDragSpacers: DragSpacersHook = () => {
  const animationFrame = useRef(0);
  const transitioning = useRef(false);
  const displacedItem = useRef<MeasuredDropTarget | null>(null);

  const spacers = useMemo(
    // We only need to listen for transition end on one of the spacers
    () => [createDragSpacer(transitioning), createDragSpacer()],
    []
  );

  const clearSpacers = useCallback(
    () =>
      spacers.forEach((spacer) => spacer.parentElement?.removeChild(spacer)),
    []
  );

  const animateTransition = useCallback(
    (size: number, propertyName = "width") => {
      const [spacer1, spacer2] = spacers;
      animationFrame.current = requestAnimationFrame(() => {
        transitioning.current = true;
        spacer1.style.cssText = `${propertyName}: 0px`;
        spacer2.style.cssText = `${propertyName}: ${size}px`;
        spacers[0] = spacer2;
        spacers[1] = spacer1;
      });
    },
    []
  );

  const cancelAnyPendingAnimation = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = 0;
    }
  }, []);

  const clearDisplacedItem = useCallback(() => {
    clearSpacers();
    displacedItem.current = null;
  }, []);

  const displaceItem = useCallback(
    (
      item: MeasuredDropTarget | null = null,
      size: number,
      useTransition = false,
      direction?: Direction,
      orientation: "horizontal" | "vertical" = "horizontal"
    ) => {
      if (item) {
        const propertyName = orientation === "horizontal" ? "width" : "height";
        const [spacer1, spacer2] = spacers;
        cancelAnyPendingAnimation();
        if (useTransition) {
          if (transitioning.current) {
            clearSpacers();

            spacer1.style.cssText = `${propertyName}: ${size}px`;
            spacer2.style.cssText = `${propertyName}: 0px`;

            const target =
              direction === "fwd"
                ? item.element.previousElementSibling
                : item.element.nextElementSibling;

            item.element.parentElement?.insertBefore(spacer1, target);
            item.element.parentElement?.insertBefore(spacer2, item.element);
          } else {
            item.element.parentElement?.insertBefore(spacer2, item.element);
          }
          animateTransition(size, propertyName);
        } else {
          spacer1.style.cssText = `${propertyName}: ${size}px`;
          item.element.parentElement?.insertBefore(spacer1, item.element);
        }
        displacedItem.current = item;
      }
    },
    []
  );
  const displaceLastItem = useCallback(
    (
      item: MeasuredDropTarget,
      size: number,
      useTransition = false,
      orientation: "horizontal" | "vertical" = "horizontal"
    ) => {
      const propertyName = orientation === "horizontal" ? "width" : "height";
      const [spacer1, spacer2] = spacers;

      if (item === undefined) {
        debugger;
      }
      cancelAnyPendingAnimation();
      if (useTransition) {
        if (transitioning.current) {
          clearSpacers();

          spacer1.style.cssText = `${propertyName}: ${size}px`;
          spacer2.style.cssText = `${propertyName}: 0px`;

          item.element.parentElement?.insertBefore(
            spacer1,
            item.element.previousElementSibling
          );
          item.element.parentElement?.insertBefore(
            spacer2,
            item.element.nextElementSibling
          );
        } else {
          item.element.parentElement?.insertBefore(
            spacer2,
            item.element.nextElementSibling
          );
        }
        animateTransition(size, propertyName);
      } else {
        spacer1.style.cssText = `${propertyName}: ${size}px`;
        item.element.parentElement?.insertBefore(
          spacer1,
          item.element.nextElementSibling
        );
      }
    },
    []
  );

  return {
    clearDisplacedItem,
    displaceItem,
    displaceLastItem,
    clearSpacers,
  };
};
