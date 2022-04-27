import { useMemo, useRef, useState, useCallback, Ref } from "react";
import {
  useCharacteristic,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";

export interface ListAutosizerProps {
  responsive: boolean;
  height?: number | string;
  width?: number | string;
}

interface size {
  height?: number | string;
  width?: number | string;
}

export function useListAutoSizer<Element extends HTMLElement>(
  props: ListAutosizerProps
): [Ref<Element>, size] {
  const { responsive, width, height } = props;
  const [size, setSize] = useState({ width, height });
  const ref = useRef<Element>(null);

  const handleResize = useCallback(function handleResize(contentRect: DOMRect) {
    if (contentRect.width > 0 && contentRect.height > 0) {
      setSize({
        width: contentRect.width,
        height: contentRect.height,
      });
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    setSize({ width, height });
  }, [width, height]);

  useIsomorphicLayoutEffect(() => {
    if (responsive) {
      let observer: ResizeObserver;
      if (ref.current) {
        handleResize(ref.current.getBoundingClientRect());
        observer = new ResizeObserver(
          ([{ contentRect }]: ResizeObserverEntry[]) => {
            handleResize(contentRect);
          }
        );
        observer.observe(ref.current);
      }
      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    }
  }, [handleResize, responsive]);

  return [ref, size];
}

export interface HeightHookProps {
  borderless?: boolean;
  displayedItemCount: number;
  getItemHeight?: (index: number) => number;
  height?: number | string;
  itemCount: number;
  itemGapSize: number;
  itemHeight?: number | string;
  width?: number | string;
}

export interface HeightHookResult {
  autoSize: size;
  preferredHeight: number | undefined;
}

export const useHeight = ({
  borderless,
  displayedItemCount,
  getItemHeight,
  height,
  itemCount,
  itemGapSize,
  itemHeight: itemHeightProp,
  width,
}: HeightHookProps): HeightHookResult => {
  const sizeStackable = useCharacteristic("size", "stackable-unit");
  const defaultItemHeight =
    sizeStackable === null ? 36 : parseInt(sizeStackable, 10);

  const itemHeight = itemHeightProp ?? defaultItemHeight;

  const preferredHeight = useMemo(() => {
    let result = borderless ? 0 : 2;

    // if there is no item we render with the preferred count
    const preferredItemCount =
      itemCount === 0
        ? displayedItemCount
        : Math.min(displayedItemCount, itemCount);

    if (typeof getItemHeight === "function") {
      result +=
        Array(preferredItemCount)
          .fill(0)
          .reduce<number>(
            (total, _, index) => total + getItemHeight(index) + itemGapSize,
            0
          ) -
        // We don't want gap after the last item
        itemGapSize;
    } else {
      result +=
        preferredItemCount * Number(itemHeight) +
        (preferredItemCount - 1) * itemGapSize;
    }

    // list height will be undefined if the item height can not be
    // converted to a number, for example rem or a percentage string
    return isNaN(result) ? undefined : result;
  }, [
    borderless,
    displayedItemCount,
    getItemHeight,
    itemCount,
    itemGapSize,
    itemHeight,
  ]);

  const [, autoSize] = useListAutoSizer<HTMLDivElement>({
    responsive: width === undefined || height === undefined,
    height: preferredHeight,
    width,
  });

  return {
    autoSize,
    preferredHeight,
  };
};
