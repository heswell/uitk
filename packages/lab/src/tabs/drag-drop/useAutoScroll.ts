import { RefObject, useCallback, useRef } from "react";

export const useAutoScroll = ({
  containerRef,
  onScrollingStopped,
}: {
  containerRef: RefObject<HTMLElement>;
  onScrollingStopped?: (
    scrollDirection: "fwd" | "bwd",
    scrollPos: number,
    atEnd: boolean
  ) => void;
}) => {
  const scrollTimer = useRef<number | null>(null);
  const isScrolling = useRef(false);
  const scrollPosRef = useRef(0);
  const lastScrollDirectionRef = useRef<"fwd" | "bwd">("fwd");

  const stopScrolling = useCallback(
    (atEnd = false) => {
      console.log("[useAutoScroll] stopScrolling");
      if (scrollTimer.current !== null) {
        clearTimeout(scrollTimer.current);
        scrollTimer.current = null;
      }
      isScrolling.current = false;
      onScrollingStopped?.(
        lastScrollDirectionRef.current,
        scrollPosRef.current,
        atEnd
      );
    },
    [onScrollingStopped]
  );

  const startScrolling = useCallback(
    (direction, scrollRate, scrollUnit = 30) => {
      const { current: container } = containerRef;
      if (container) {
        //TODO do not assume vertical orientation
        const { scrollTop, scrollHeight, clientHeight } = container;
        const maxScroll =
          direction === "fwd"
            ? scrollHeight - clientHeight - scrollTop
            : scrollTop;
        const nextScroll = Math.min(maxScroll, scrollUnit);

        if (direction === "fwd") {
          lastScrollDirectionRef.current = "fwd";
          container.scrollTop = scrollPosRef.current = scrollTop + nextScroll;
        } else {
          lastScrollDirectionRef.current = "bwd";
          container.scrollTop = scrollPosRef.current = scrollTop - nextScroll;
        }

        if (nextScroll === maxScroll) {
          stopScrolling(true);
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
