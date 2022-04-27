import { forwardRef, ForwardedRef, ReactElement, useRef } from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { useForkRef, useIdMemo } from "../utils";
import {
  CollectionIndexer,
  isSelected,
  SelectionStrategy,
  useCollectionItems,
} from "../common-hooks";
import { useHeight } from "./useHeight";

import { ListItemNext as ListItem } from "./ListItemNext";
import { useList } from "./useList";
import { Row, useVirtualization } from "./use-virtualization";
import { ListNextProps } from "./listTypes";

import "./ListNext.css";

const defaultEmptyMessage = "No data to display";

const withBaseName = makePrefixer("uitkListNext");

export const VirtualizedList = forwardRef(function List<
  Item,
  Selection extends SelectionStrategy = "default"
>(
  {
    borderless,
    children,
    className,
    collapsibleHeaders = false,
    defaultHighlightedIndex: defaultHighlightedIdx,
    defaultSelected,
    disabled: listDisabled = false,
    disableFocus = false,
    disableTypeToSelect,
    displayedItemCount = 10,
    emptyMessage,
    getItemHeight,
    getItemId,
    height,
    highlightedIndex: highlightedIdxProp,
    id: idProp,
    itemGapSize = 1,
    itemHeight,
    itemTextHighlightPattern,
    itemToString,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    onSelect,
    onSelectionChange,
    onHighlight,
    restoreLastFocus,
    selected: selectedProp,
    selectionStrategy,
    // TODO do we still need these ?
    selectionKeys,
    showEmptyMessage = false,
    source,
    style: styleProp,
    stickyHeaders,
    tabToSelect,
    width,
    ...htmlAttributes
  }: ListNextProps<Item, Selection>,
  forwardedRef?: ForwardedRef<HTMLDivElement>
) {
  const id = useIdMemo(idProp);
  const rootRef = useRef(null);

  const collectionHook = useCollectionItems<Item>({
    id,
    label: "ListNext",
    source,
    children,
    options: {
      collapsibleHeaders,
      getItemId,
      itemToString,
    },
  });

  const { autoSize, preferredHeight } = useHeight({
    borderless,
    displayedItemCount,
    height,
    itemCount: collectionHook.data.length,
    itemGapSize,
    width,
  });
  const {
    focusVisible,
    highlightedIndex: highlightedIdx,
    listControlProps: listProps,
    selected,
  } = useList<Item, Selection>({
    collapsibleHeaders,
    collectionHook,
    containerRef: rootRef,
    defaultHighlightedIndex: defaultHighlightedIdx,
    defaultSelected: collectionHook.itemToCollectionItem(
      defaultSelected
    ) as any,
    disabled: listDisabled,
    disableTypeToSelect,
    highlightedIndex: highlightedIdxProp,
    label: id,
    onSelect,
    onSelectionChange,
    onHighlight,
    restoreLastFocus,
    selected: collectionHook.itemToCollectionItem(selectedProp) as any,
    selectionStrategy,
    selectionKeys,
    stickyHeaders,
    tabToSelect,
  });

  // TODO move into useList
  const {
    rows: data,
    contentHeight,
    onVerticalScroll: onScroll,
  } = useVirtualization<Item>({
    viewportRef: rootRef,
    data: collectionHook.data,
    itemGapSize,
  });

  const propsCommonToAllListItems = {
    role: "option",
  };

  function addItem(
    list: ReactElement[],
    row: Row<Item>,
    idx: { value: number }
  ) {
    const [key, offset, pos, item] = row;
    const index = pos - 1;
    list.push(
      <ListItem
        {...propsCommonToAllListItems}
        aria-setsize={collectionHook.data.length}
        aria-posinset={pos}
        aria-selected={isSelected<Item>(selected, item) || undefined}
        className={cx(className, {
          ["uitkListItemNext-highlighted"]: index === highlightedIdx,
          uitkFocusVisible: focusVisible === index,
        })}
        data-idx={index}
        key={key}
        data-highlighted={index === highlightedIdx || undefined}
        data-offset={offset}
        id={item.id}
        style={{
          transform: `translate3d(0px, ${offset}px, 0px)`,
        }}
      >
        {item.label}
      </ListItem>
    );
    idx.value += 1;
  }

  function renderItems(
    data: Row<Item>[],
    idx: CollectionIndexer = { value: 0 },
    end = data.length
  ) {
    const listItems: ReactElement[] = [];
    while (idx.value < end) {
      const item = data[idx.value];
      addItem(listItems, item, idx);
    }
    return listItems;
  }

  function renderEmpty() {
    if (emptyMessage || showEmptyMessage) {
      return (
        <span className={withBaseName("empty-message")}>
          {emptyMessage ?? defaultEmptyMessage}
        </span>
      );
    } else {
      return null;
    }
  }

  const renderContent = () => {
    if (data.length) {
      return renderItems(data);
    } else {
      renderEmpty();
    }
  };

  const sizeStyles = {
    minWidth,
    minHeight,
    width: width ?? "100%",
    height: height ?? "100%",
    maxWidth: maxWidth ?? width,
    "--list-max-height": `${maxHeight ?? preferredHeight}px`,
  };
  return (
    <div
      {...htmlAttributes}
      {...listProps}
      className={cx(withBaseName(), className, withBaseName("virtualized"), {
        "empty-list": collectionHook.data.length === 0,
      })}
      id={`${id}`}
      ref={useForkRef(rootRef, forwardedRef)}
      role="listbox"
      onScroll={onScroll}
      style={{ ...styleProp, ...sizeStyles }}
      tabIndex={listDisabled || disableFocus ? undefined : 0}
    >
      <div
        className={withBaseName("scrollingContentContainer")}
        style={{ height: contentHeight }}
      >
        {renderContent()}
      </div>
    </div>
  );
}) as <Item = string, Selection extends SelectionStrategy = "default">(
  props: ListNextProps<Item, Selection> & {
    ref?: ForwardedRef<HTMLDivElement>;
  }
) => ReactElement<ListNextProps<Item, Selection>>;
