import React, { KeyboardEvent, ReactChildren, ReactElement, Ref } from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { FormField } from "../../form-field";
import {
  isCollapsedOrCollapsing,
  isOverflowed,
  OverflowItem,
  OverflowCollectionHookResult,
  orientationType,
  useOverflowLayout,
} from "..";

import {
  OverflowButtonProps,
  // OverflowMenu,
  OverflowMenuProps,
} from "../overflow-menu";

import { OverflowDropdown } from "./OverflowDropdown";

import "./OverflowLayoutContainer.css";

const withBaseName = makePrefixer("uitkOverflowLayoutContainer");

interface OverflowLayoutContainerProps {
  className?: string;
  collectionHook: OverflowCollectionHookResult;
  label?: string;
  orientation?: orientationType;
  overflowButtonIcon?: JSX.Element;
  overflowButtonLabel?: string;
  OverflowButtonProps?: Partial<OverflowButtonProps>;
  overflowButtonRef?: Ref<HTMLDivElement>;
  renderLayoutItems?: () => ReactElement[];
}

const defaultRenderLayoutItems = (
  childItems: ReactElement[],
  managedItems: OverflowItem[]
) => {
  console.log(`defaultRenderLayoutItems`, { childItems, managedItems });
  return childItems.map((childItem, index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = childItem.props as any;

    const managedItem = managedItems.find((item) => item.index === index);

    return React.cloneElement(childItem, {
      "data-index": index,
      "data-overflowed": managedItem?.overflowed || undefined,
      "data-priority": managedItem?.priority ?? props["data-priority"] ?? "2",
    });
  });
};

export const OverflowLayoutContainer: React.FC<
  OverflowLayoutContainerProps
> = ({
  children,
  className,
  collectionHook,
  label = "",
  orientation = "horizontal",
  overflowButtonIcon,
  overflowButtonLabel,
  OverflowButtonProps,
  overflowButtonRef,
  renderLayoutItems = defaultRenderLayoutItems,
}) => {
  const [containerRef] = useOverflowLayout(collectionHook, orientation, label);
  const managedItems = collectionHook.data;
  console.log({ ref: containerRef.current, managedItems });

  const childItems = React.Children.toArray(children) as ReactElement[];

  const overflowedItems = managedItems.filter(isOverflowed);
  const collapseItems = managedItems.filter(isCollapsedOrCollapsing);
  const layoutItems = renderLayoutItems(childItems, managedItems);
  const overflowMenuItems = overflowedItems.map((i) => childItems[i.index]);

  const handleOverflowItemClick: OverflowMenuProps["onItemClick"] = (
    sourceItem,
    evt
  ) => {
    console.log(
      `[OverflowLayoutContainer] handleOverflowItemClick ${sourceItem.title}`
    );
  };

  const handleKeyDown = (evt: KeyboardEvent<HTMLElement>) => {
    console.log(`[OverflowLayoutContainer] handleKeyDown`);
  };

  return (
    <div
      className={cx(withBaseName(), className, withBaseName(orientation))}
      ref={containerRef}
      data-collapsing={
        collapseItems.findIndex((item) => item.collapsing) !== -1
      }
    >
      {layoutItems}
      {overflowedItems.length > 0 ? (
        <FormField
          ActivationIndicatorComponent={() => null}
          className={cx("uitkToolbarField", "toolbar-item", "uitkEmphasisLow", {
            "uitkToolbarField-start": OverflowButtonProps?.align === "start",
          })}
          data-index={layoutItems.length}
          data-overflow-indicator
          //   data-pad-start={alignedItemsInBar}
          data-orientation={orientation}
          data-priority={1}
          fullWidth={false}
        >
          <OverflowDropdown aria-haspopup aria-label="toolbar overflow">
            {overflowMenuItems}
          </OverflowDropdown>
          {/* <OverflowMenu
            // OverflowPanelProps={OverflowPanelProps}
            OverflowButtonProps={OverflowButtonProps}
            aria-haspopup
            aria-label="toolbar overflow"
            // className="Toolbar-overflowMenu"
            key="overflow"
            onItemClick={handleOverflowItemClick}
            onKeyDown={handleKeyDown}
            orientation={orientation}
            overflowButtonIcon={overflowButtonIcon}
            overflowButtonLabel={overflowButtonLabel}
            ref={overflowButtonRef}
            menuItems={overflowMenuItems}
          /> */}
        </FormField>
      ) : null}
    </div>
  );
};
