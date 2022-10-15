import { useIsomorphicLayoutEffect } from "@heswell/uitk-core";
import { UIEvent, useCallback, useMemo, useRef, useState } from "react";

export type ViewportRange = {
  from: number;
  to: number;
};

interface ScrollPositionHookProps {
  containerSize: number;
  itemCount: number;
  itemGapSize?: number;
  itemSize: number;
  onViewportScroll?: (
    firstVisibleItemIndex: number,
    lastVisibleitemIndex: number
  ) => void;
}

const getRange = (
  scrollPos: number,
  height: number,
  itemHeight: number
): ViewportRange => {
  const viewportRowCount = Math.ceil(height / itemHeight);
  const from = scrollPos / itemHeight;
  const to = from + viewportRowCount - 1;

  return { from: Math.floor(from), to: Math.ceil(to) };
};

export const useScrollPosition = ({
  containerSize: listHeight,
  itemCount: listItemCount,
  itemGapSize: listItemGapSize = 0,
  itemSize: listItemHeight,
  onViewportScroll,
}: ScrollPositionHookProps) => {
  const firstVisibleRowRef = useRef(0);
  const lastVisibleRowRef = useRef(0);
  const scrollPosRef = useRef(0);

  const range = useMemo(() => {
    return getRange(
      scrollPosRef.current,
      listHeight,
      listItemHeight + listItemGapSize
    );
  }, [listHeight, listItemHeight, listItemGapSize]);

  const [viewportRange, setViewportRange] = useState<ViewportRange>(range);

  useIsomorphicLayoutEffect(() => {
    setViewportRange(range);
  }, [range]);

  const handleVerticalScroll = useCallback(
    (e: UIEvent<HTMLElement>) => {
      const scrollTop = (e.target as HTMLElement).scrollTop;
      if (scrollTop !== scrollPosRef.current) {
        scrollPosRef.current = scrollTop;
        const itemHeight = listItemHeight + listItemGapSize;
        const range = getRange(scrollTop, listHeight, itemHeight);
        if (
          range.from !== firstVisibleRowRef.current ||
          range.to !== lastVisibleRowRef.current
        ) {
          firstVisibleRowRef.current = range.from;
          lastVisibleRowRef.current = range.to;
          onViewportScroll?.(range.from, range.to);
          setViewportRange(range);
        }
      }
    },
    [listItemHeight, listItemGapSize, listHeight, onViewportScroll]
  );

  return {
    onVerticalScroll: handleVerticalScroll,
    viewportRange,
  };
};
