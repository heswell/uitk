import { RefObject, UIEvent, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { KeySet } from './keyset';
import { CollectionItem } from '../common-hooks';
import { useIsomorphicLayoutEffect } from '@heswell/uitk-core';

/**
 * [ item key, total height before the item, next row index, CollectionItem<Item>]
 * e.g. first item: [0, 0, 1, data[0]]
 */
export type Row<Item> = [number, number, number, CollectionItem<Item>];

const byKey = ([k1]: Row<unknown>, [k2]: Row<unknown>) => k1 - k2;

const renderBuffer = 5;

interface VirtualizationHookProps<Item> {
  viewportRef: RefObject<HTMLElement>;
  data: CollectionItem<Item>[];
  itemGapSize?: number;
  onViewportScroll?: (firstVisibleRowIndex: number, lastVisibleRowIndex: number) => void;
}

interface VirtualizationHookResult<Item> {
  rows: Row<Item>[];
  contentHeight: number;
  onVerticalScroll: (e: UIEvent<HTMLElement>) => void;
}

export const useVirtualization = <Item>({
  viewportRef,
  data,
  itemGapSize = 0,
  onViewportScroll
}: VirtualizationHookProps<Item>): VirtualizationHookResult<Item> => {
  const viewportMeasures = useRef({
    contentHeight: 10000,
    firstVisibleRow: 0,
    rowCount: 0,
    rowHeight: 0,
    scrollPos: 0
  });
  const keys = useMemo(() => new KeySet(0, 1), []);
  const [viewPortRange, setViewportRange] = useState({ from: 0, to: 0 });
  const { length: itemCount } = data;

  useIsomorphicLayoutEffect(() => {
    const viewport = viewportMeasures.current;
    const viewportEl = viewportRef.current;
    if (viewportEl) {
      // TODO no reference to ListItem className
      const listItemEl = viewportEl.querySelector('.uitkListItem');
      if (listItemEl) {
        const { height: viewportHeight } = viewportEl.getBoundingClientRect();
        const { height: rowHeight } = listItemEl.getBoundingClientRect();
        viewport.rowHeight = rowHeight;
        viewport.rowCount = Math.ceil(viewportHeight / rowHeight);
        viewport.contentHeight = (rowHeight + itemGapSize) * itemCount;
        setViewportRange({ from: 0, to: viewport.rowCount });
      }
    }
  }, [itemCount, itemGapSize, keys]);

  const handleVerticalScroll = useCallback((e: UIEvent<HTMLElement>) => {
    const viewport = viewportMeasures.current;
    // TODO: check `as` cast
    const scrollTop = (e.target as HTMLElement).scrollTop;
    if (scrollTop !== viewport.scrollPos) {
      viewport.scrollPos = scrollTop;
      const firstRow = Math.floor(scrollTop / viewport.rowHeight);
      if (firstRow !== viewport.firstVisibleRow) {
        viewport.firstVisibleRow = firstRow;
        const from = firstRow;
        const to = firstRow + viewport.rowCount;
        onViewportScroll?.(from, to);
        setViewportRange({ from, to });
      }
    }
  }, []);

  const { contentHeight, rowHeight } = viewportMeasures.current;
  const rowHeightWithGap = rowHeight + itemGapSize;
  const lo = Math.max(0, viewPortRange.from - renderBuffer);
  const hi = Math.min(data.length, viewPortRange.to + renderBuffer);
  keys.reset(lo, hi);
  const rows = data
    .slice(lo, hi)
    .map(
      (value, idx) =>
        [keys.keyFor(idx + lo), (idx + lo) * rowHeightWithGap, idx + lo + 1, value] as Row<Item>
    )
    .sort(byKey);

  return {
    rows,
    contentHeight,
    onVerticalScroll: handleVerticalScroll
  };
};
