import { useCallback, useRef } from "react";
import {
  addAll,
  allExceptOverflowIndicator,
  getIsOverflowed,
  getOverflowIndicator,
  isOverflowed,
  notOverflowed,
  popNextItemByPriority,
} from "./overflowUtils";
import { OverflowItem, overflowHookProps } from "./overflowTypes";
import { partition } from "../utils";

const NO_OVERFLOW_INDICATOR = { size: 0 };

const getPriority = (item: OverflowItem) => item.priority;

const popNextOverflowedItem = (items: OverflowItem[]) => {
  const minPriority = Math.min(...items.map(getPriority));
  for (let i = 0; i < items.length; i++) {
    if (!items[i].isOverflowIndicator && items[i].priority === minPriority) {
      return items.splice(i, 1)[0];
    }
  }
  return null;
};

export const useOverflow = ({
  collectionHook,
  label = "Toolbar",
  overflowItemsRef,
  ref,
  orientation,
}: overflowHookProps) => {
  // We need to detect when we enter/exit the overflowed state
  const overflowed = useRef(false);
  const innerContainerSizeRef = useRef(0);
  const overflowIndicatorSize = useRef(0);

  const setContainerMinSize = useCallback(
    (size?: number) => {
      const isHorizontal = orientation === "horizontal";
      if (size === undefined) {
        const dimension = isHorizontal ? "width" : "height";
        // eslint-disable-next-line no-param-reassign
        ({ [dimension]: size } = ref.current!.getBoundingClientRect());
      }
      const styleDimension = isHorizontal ? "minWidth" : "minHeight";
      ref.current!.style[styleDimension] = `${size}px`;
    },
    [orientation]
  );

  const getAllOverflowedItems = useCallback(
    (renderedSize, availableSpace) => {
      const { current: allItems } = overflowItemsRef;
      let overflowedItems = [];
      const items = allItems.slice();
      while (renderedSize > availableSpace) {
        const overflowedItem = popNextItemByPriority(items);
        if (overflowedItem === null) {
          break;
        }
        // eslint-disable-next-line no-param-reassign
        renderedSize -= overflowedItem.size;
        overflowedItems.push({
          ...overflowedItem,
          overflowed: true,
        });
      }
      return overflowedItems;
    },
    [setContainerMinSize]
  );

  const getOverflowedItems = useCallback(
    (visibleContentSize, containerSize) => {
      let newlyOverflowedItems = [];
      const { current: managedItems } = overflowItemsRef;
      const visibleItems = managedItems.filter(notOverflowed);
      while (visibleContentSize > containerSize) {
        const overflowedItem = popNextItemByPriority(visibleItems);
        if (overflowedItem === null) {
          // unable to overflow, all items are collapsed, this is our minimum width,
          // enforce it ...
          // TODO what if density changes
          // TODO probably not right, now we overflow even collapsed items, min width should be
          // overflow indicator width plus width of any non-overflowable items
          // setContainerMinSize(visibleContentSize);
          break;
        }
        // eslint-disable-next-line no-param-reassign
        visibleContentSize -= overflowedItem.size;
        newlyOverflowedItems.push({
          ...overflowedItem,
          overflowed: true,
        });
      }
      return newlyOverflowedItems;
    },
    [setContainerMinSize]
  );

  const getReinstatedItems = useCallback(
    (containerSize): [number, OverflowItem[]] => {
      let reinstatedItems: OverflowItem[] = [];
      const { current: managedItems } = overflowItemsRef;

      const [overflowedItems, visibleItems] = partition(
        managedItems,
        isOverflowed
      );
      const overflowCount = overflowedItems.length;
      // TODO calculate this without using fullWidth if we have OVERFLOW
      // Need a loop here where we first remove OVERFLOW, then potentially remove
      // COLLAPSE too
      // We want to re-introduce overflowed items before we start to restore collapsed items
      // When we are dealing with overflowed items, we just use the current width of collapsed items.
      let visibleContentSize = visibleItems.reduce(
        allExceptOverflowIndicator,
        0
      );
      let diff = containerSize - visibleContentSize;
      const { size: overflowSize = 0 } =
        getOverflowIndicator(managedItems) || NO_OVERFLOW_INDICATOR;

      while (overflowedItems.length > 0) {
        const nextItem = popNextOverflowedItem(overflowedItems);
        if (nextItem && diff >= nextItem.size) {
          // we have enough free space to reinstate this overflowed item
          // we can only ignore the width of overflow Indicator if either there is only one remaining
          // overflow item (so overflowIndicator will be removed) or diff is big enough to accommodate
          // the overflow Ind.
          if (
            overflowedItems.length === 0 ||
            diff >= nextItem.size + overflowSize
          ) {
            visibleContentSize += nextItem.size;
            diff = diff - nextItem.size;
            reinstatedItems.push({
              ...nextItem,
              overflowed: false,
            });
          } else {
            break;
          }
        } else {
          break;
        }
      }
      return [overflowCount, reinstatedItems];
    },
    []
  );

  const resetMeasurements = useCallback(
    (isOverflowing, innerContainerSize) => {
      if (isOverflowing) {
        const { current: managedItems } = overflowItemsRef;
        const renderedSize = managedItems.reduce(allExceptOverflowIndicator, 0);
        const overflowIndicator = managedItems.find(
          (i) => i.isOverflowIndicator
        );
        if (
          overflowIndicator &&
          overflowIndicator.size !== overflowIndicatorSize.current
        ) {
          overflowIndicatorSize.current = overflowIndicator.size;
          setContainerMinSize(overflowIndicator.size);
        }
        const existingOverflow = managedItems.filter(isOverflowed);
        const updates = getAllOverflowedItems(
          renderedSize,
          innerContainerSize - overflowIndicatorSize.current
        );

        existingOverflow.forEach((item) => {
          if (!updates.some((i) => i.index === item.index)) {
            updates.push({
              ...item,
              overflowed: false,
            });
          }
        });

        const overflowAdded = !existingOverflow.length && updates.length;

        if (updates.length > 0) {
          if (overflowAdded) {
            collectionHook.dispatch({
              type: "update-items-add-overflow-indicator",
              overflowItems: updates,
              overflowItem: {
                fullSize: null,
                id: "blah",
                index: managedItems.length,
                isOverflowIndicator: true,
                label: "Overflow Menu",
                priority: 1,
                source: {},
              } as OverflowItem<"source">,
            });
          } else {
            collectionHook.dispatch({
              type: "update-items",
              overflowItems: updates,
            });
          }
          return true;
        } else {
          return false;
        }
      }
    },
    [getAllOverflowedItems]
  );

  const updateOverflow = useCallback(
    (containerSize, renderedSize) => {
      if (containerSize < renderedSize) {
        const overflowItems = getOverflowedItems(renderedSize, containerSize);
        if (overflowItems.length) {
          collectionHook.dispatch({
            type: "update-items",
            overflowItems,
          });
        }
      }
    },
    [getOverflowedItems]
  );

  const removeOverflow = useCallback(
    (containerSize) => {
      const [overflowCount, reinstated] = getReinstatedItems(containerSize);
      if (reinstated.length) {
        if (overflowCount === reinstated.length) {
          collectionHook.dispatch({
            type: "update-items-remove-overflow-indicator",
            overflowItems: reinstated,
          });
        } else {
          collectionHook.dispatch({
            type: "update-items",
            overflowItems: reinstated,
          });
        }
      }
    },
    [getReinstatedItems]
  );

  const handleResize = useCallback(
    (size, containerHasGrown) => {
      const { current: managedItems } = overflowItemsRef;
      const isOverflowing = getIsOverflowed(managedItems);
      innerContainerSizeRef.current = size;
      const renderedSize = managedItems.reduce(allExceptOverflowIndicator, 0);
      const willOverflow = renderedSize > size;

      if (!isOverflowing && willOverflow) {
        // entering overflow
        // TODO if client is not using an overflow indicator, there is nothing to do here,
        // just let nature take its course. How do we know this ?
        // This is when we need to add width to measurements we are tracking
        resetMeasurements(true, size);
      } else if (isOverflowing && containerHasGrown) {
        // Note: it must have been previously overflowing, too
        // check to see if we can reinstate one or more items
        removeOverflow(size);
      } else if (isOverflowing && willOverflow) {
        // Note: container must have shrunk
        // still overflowing, possibly more overflowing than before
        const renderedSize = managedItems
          .filter(notOverflowed)
          .reduce(addAll, 0);
        updateOverflow(size, renderedSize);
      }
    },
    [resetMeasurements, updateOverflow]
  );

  return {
    onResize: handleResize,
    resetMeasurements,
  };
};
