import { useCallback, useEffect, useRef } from "react";
import {
  ElementRef,
  getIsOverflowed,
  OverflowItem,
  ManagedListRef,
  measureContainerOverflow,
  orientationType,
  useDynamicCollapse,
  useInstantCollapse,
  useOverflow,
  useReclaimSpace,
  useResizeObserver,
} from ".";

import { OverflowCollectionHookResult } from "./overflowTypes";

const MONITORED_DIMENSIONS: { [key: string]: string[] } = {
  horizontal: ["width", "scrollHeight"],
  vertical: ["height", "scrollWidth"],
  none: [],
};

type overflowUpdate = (item1: OverflowItem, item2: OverflowItem) => void;

// we need id, just tp be abe to assign id to overflowIndicator in useOverflow
export const useOverflowLayout = (
  collectionHook: OverflowCollectionHookResult,
  orientation: orientationType,
  label = "Toolbar",
  disableOverflow = false
): [ElementRef, overflowUpdate] => {
  const ref: ElementRef = useRef(null);
  const overflowItemsRef: ManagedListRef = useRef([]);
  const measurement = useRef({ innerContainerSize: 0, rootContainerDepth: 0 });
  const { innerContainerSize } = measurement.current;

  overflowItemsRef.current = collectionHook.data;

  const overflowHook = useOverflow({
    collectionHook,
    label,
    overflowItemsRef,
    orientation,
    ref,
  });

  const hasOverflowedItems = getIsOverflowed(collectionHook.data);
  // const hasOverflowedItems = getIsOverflowed(managedItems);

  const dynamicCollapseHook = useDynamicCollapse({
    collectionHook,
    innerContainerSize,
    label,
    overflowItemsRef,
    orientation,
    ref,
  });

  const instantCollapseHook = useInstantCollapse({
    collectionHook,
    hasOverflowedItems,
    innerContainerSize,
    label,
    overflowItemsRef,
    orientation,
    ref,
  });

  const reclaimSpaceHook = useReclaimSpace({
    collectionHook,
    label,
    overflowItemsRef,
    orientation,
    ref,
  });

  const resizeHandler = useCallback(
    ({
      scrollHeight,
      height = scrollHeight,
      scrollWidth,
      width = scrollWidth,
    }) => {
      const [size, depth] =
        orientation === "horizontal" ? [width, height] : [height, width];
      const { innerContainerSize, rootContainerDepth } = measurement.current;
      measurement.current.innerContainerSize = size;
      const containerHasGrown = size > innerContainerSize;

      // if (label === "Toolbar") {
      //   console.log(
      //     `%cuseOverflowLayout resizeHandler<${label}>\n\t%ccontainer grown\t${
      //       containerHasGrown ? "✓" : "✗"
      //     } (${innerContainerSize} - ${size})\n\tisOverflowing\t${
      //       hasOverflowedItems ? "✓" : "✗"
      //     }\n\twillOverflow\t${
      //       depth > rootContainerDepth ? "✓" : "✗"
      //     }\n\tcontainerDepth\t${depth}\n\tcontainerSize\t${size}`,
      //     `color:brown;font-weight: bold;`,
      //     `color:blue;`
      //   );
      // }
      // Note: any one of these hooks may trigger a render which
      // may affect the overflow state that the next hook sees.
      // Hence, they all test for overflow independently.

      dynamicCollapseHook.onResize(size, containerHasGrown);
      instantCollapseHook.onResize(size, containerHasGrown);
      overflowHook.onResize(size, containerHasGrown);
      reclaimSpaceHook.onResize(size, containerHasGrown);
    },
    [
      dynamicCollapseHook.onResize,
      instantCollapseHook.onResize,
      overflowHook.onResize,
      reclaimSpaceHook.onResize,
    ]
  );

  const measureAndInitialize = useCallback(() => {
    const { isOverflowing, ...contentWidthAndDepth } = measureContainerOverflow(
      ref,
      orientation
    );
    measurement.current = contentWidthAndDepth;
    const { innerContainerSize } = contentWidthAndDepth;
    // TODO check this with complex combinations
    let handled = instantCollapseHook.resetMeasurements(isOverflowing);
    if (!handled) {
      handled = dynamicCollapseHook.resetMeasurements();
      if (!handled) {
        overflowHook.resetMeasurements(isOverflowing, innerContainerSize);
      }
    }
  }, [
    overflowHook.resetMeasurements,
    dynamicCollapseHook.resetMeasurements,
    instantCollapseHook.resetMeasurements,
  ]);

  const switchPriorities = useCallback(
    (item1: OverflowItem, item2: OverflowItem) => {
      const { priority: priority1 } = item1;
      const { priority: priority2 } = item2;
      if (priority1 !== priority2) {
        collectionHook.dispatch({
          type: "update-items",
          overflowItems: [
            { id: item1.id, priority: priority2 },
            { id: item2.id, priority: priority1 },
          ],
        });
        // Why do we need a timeout here when we don't inside resizeHandler ?
        setTimeout(measureAndInitialize, 0);
      }
    },
    [measureAndInitialize]
  );

  // Important that we register our resize handler before we measure and
  // initialize. The initialization may trigger changes which we want the
  // resize observer to detect (when we have nested overflowables).
  useResizeObserver(
    ref,
    MONITORED_DIMENSIONS[disableOverflow ? "none" : orientation],
    resizeHandler
  );

  // This hook runs after a measurememnt cycle, not after every single change to
  // collection data. The version attribute has been introduced specifically for this.
  useEffect(() => {
    // console.log(
    //   `[useOverflowLayout] version change detected ${collectionHook.version}
    //   ${overflowItemsRef.current.map(
    //     (i) => `\n${i.size}px Priority: ${i.priority}\t${i.label}`
    //   )}
    //   \n(${overflowItemsRef.current.length} items)`
    // );
    if (!disableOverflow) {
      measureAndInitialize();
    }
    //
  }, [collectionHook.version, measureAndInitialize]);

  return [ref, switchPriorities];
};
