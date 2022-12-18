import { useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  forwardRef,
  MutableRefObject,
  TransitionEventHandler,
  useCallback,
} from "react";
import { Rect } from "./dragDropTypes";
import { Portal } from "../../portal";

import "./Draggable.css";

const makeClassNames = (classNames: string) =>
  classNames.split(" ").map((className) => `saltDraggable-${className}`);
export const Draggable = forwardRef<
  HTMLDivElement,
  {
    wrapperClassName: string;
    element: HTMLElement;
    rect: Rect;
    scale?: number;
    onTransitionEnd?: TransitionEventHandler;
  }
>(function Draggable(
  { wrapperClassName, element, onTransitionEnd, rect, scale = 1 },
  forwardedRef
) {
  const callbackRef = useCallback(
    (el: HTMLDivElement) => {
      if (el) {
        el.innerHTML = "";
        el.appendChild(element);
        if (scale !== 1) {
          el.style.transform = `scale(${scale},${scale})`;
        }
      }
    },
    [element, scale]
  );
  const forkedRef = useForkRef<HTMLDivElement>(forwardedRef, callbackRef);

  const { left, top, width, height } = rect;

  return (
    <Portal>
      <div
        className={clsx("saltDraggable", ...makeClassNames(wrapperClassName))}
        ref={forkedRef}
        onTransitionEnd={onTransitionEnd}
        style={{ left, top, width, height }}
      />
    </Portal>
  );
});

// const colors = ["black", "red", "green", "yellow"];
// let color_idx = 0;
export const createDragSpacer = (
  transitioning?: MutableRefObject<boolean>
): HTMLElement => {
  // const idx = color_idx++ % 4;

  const spacer = document.createElement("div");
  spacer.className = "saltDraggable-spacer";
  if (transitioning) {
    spacer.addEventListener("transitionend", () => {
      transitioning.current = false;
    });
  }
  return spacer;
};

export const createDropIndicatorPosition = (): HTMLElement => {
  const spacer = document.createElement("div");
  spacer.className = "uitkDraggable-dropIndicatorPosition";
  return spacer;
};

export const createDropIndicator = (
  transitioning?: MutableRefObject<boolean>
): HTMLElement => {
  // const idx = color_idx++ % 4;
  const spacer = document.createElement("div");
  spacer.className = "uitkDraggable-dropIndicator";
  if (transitioning) {
    spacer.addEventListener("transitionend", () => {
      transitioning.current = false;
    });
  }
  return spacer;
};
