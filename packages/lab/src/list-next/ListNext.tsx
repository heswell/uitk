import {
  cloneElement,
  forwardRef,
  ForwardedRef,
  isValidElement,
  ReactElement,
  useRef,
} from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { forwardCallbackProps, useIdMemo } from "../utils";
import {
  CollectionIndexer,
  CollectionItem,
  isSelected,
  ScrollingAPI,
  SelectionStrategy,
  useCollectionItems,
  useImperativeScrollingAPI,
} from "../common-hooks";
import { useHeight } from "./useHeight";

import { ListItemNext, ListItemProps } from "./ListItemNext";
import { useList } from "./useList";
import { ListNextProps } from "./listTypes";

import "./ListNext.css";

const defaultEmptyMessage = "No data to display";

const withBaseName = makePrefixer("uitkListNext");

export const ListNext = forwardRef(function List<
  Item,
  Selection extends SelectionStrategy = "default"
>(
  {
    ListItem = ListItemNext,
    ListPlaceholder,
    borderless,
    children,
    className,
    collapsibleHeaders = false,
    defaultHighlightedIndex,
    defaultSelected,
    disabled: listDisabled = false,
    disableFocus = false,
    disableTypeToSelect,
    displayedItemCount = 10,
    emptyMessage,
    focusVisible: focusVisibleProp,
    getItemHeight: getItemHeightProp,
    getItemId,
    height,
    highlightedIndex: highlightedIndexProp,
    id: idProp,
    itemGapSize = 1,
    itemHeight: itemHeightProp,
    itemTextHighlightPattern,
    itemToString,
    listHandlers: listHandlersProp,
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
    checkable = selectionStrategy === "multiple",
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
  forwardedRef?: ForwardedRef<ScrollingAPI<Item>>
) {
  const id = useIdMemo(idProp);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const collectionHook = useCollectionItems<Item>({
    id,
    label: "ListNext",
    source,
    children,
    options: {
      collapsibleHeaders,
      // Add Group ChildTypes to options
      getItemId,
      itemToString,
    },
  });

  const { autoSize, preferredHeight } = useHeight({
    borderless,
    displayedItemCount,
    getItemHeight: getItemHeightProp,
    height,
    itemCount: collectionHook.data.length,
    itemGapSize,
    itemHeight: itemHeightProp,
    width,
  });

  const {
    focusVisible,
    highlightedIndex,
    listHandlers,
    listItemHeaderHandlers,
    listControlProps,
    scrollIntoView,
    selected,
  } = useList<Item, Selection>({
    collapsibleHeaders,
    collectionHook,
    containerRef: rootRef,
    contentRef,
    defaultHighlightedIndex,
    defaultSelected: collectionHook.itemToCollectionItem<
      Selection,
      typeof defaultSelected
    >(defaultSelected),
    disabled: listDisabled,
    disableTypeToSelect,
    highlightedIndex: highlightedIndexProp,
    label: id,
    listHandlers: listHandlersProp, // should this be in context ?
    onSelect,
    onSelectionChange,
    onHighlight,
    restoreLastFocus,
    selected: collectionHook.itemToCollectionItem<
      Selection,
      typeof defaultSelected
    >(selectedProp),
    selectionStrategy,
    selectionKeys,
    stickyHeaders,
    tabToSelect,
  });

  useImperativeScrollingAPI({
    collectionHook,
    forwardedRef,
    scrollableRef: rootRef,
    scrollIntoView,
  });

  // focusVisible passes as a prop takes precedence
  const appliedFocusVisible = focusVisibleProp ?? focusVisible;

  const createHeader: (
    idx: { value: number },
    headerId: string,
    title: string,
    expanded?: boolean
  ) => ReactElement = function createHeader(idx, headerId, title, expanded) {
    const header = (
      <ListItem
        {...listItemHeaderHandlers}
        className={cx("uitkListItemHeader", "uitkListItem", {
          focusVisible: collapsibleHeaders && appliedFocusVisible === idx.value,
        })}
        aria-expanded={expanded}
        data-idx={collapsibleHeaders ? idx.value : undefined}
        data-highlighted={idx.value === highlightedIndex || undefined}
        data-sticky={stickyHeaders}
        data-selectable={false}
        id={headerId}
        key={`header-${idx.value}`}
        label={title}
        // role="presentation"
      />
    );
    idx.value += 1;
    return header;
  };

  const getItemHeight =
    getItemHeightProp === undefined ? () => itemHeightProp : getItemHeightProp;

  function addItem(
    list: ReactElement[],
    item: CollectionItem<Item>,
    idx: { value: number }
  ) {
    // Note, a number of these props are specific to ListItem. What if user
    // implements a custom ListItem but neglects to handle all these props.
    // Is that on them ?
    const { disabled, value, id: itemId, label } = item;
    const isChildItem = isValidElement(value);
    const listItemProps: ListItemProps & { key: string; "data-idx": number } = {
      className: cx({
        "uitkListItemNext-highlighted": idx.value === highlightedIndex,
        uitkFocusVisible: appliedFocusVisible === idx.value,
      }),
      disabled: disabled || listDisabled,
      id: itemId,
      item: isChildItem ? undefined : item.value,
      itemHeight: getItemHeight(idx.value),
      itemTextHighlightPattern,
      key: itemId,
      "data-idx": idx.value,
      label,
      role: "option",
      selected: isSelected<Item>(selected, item),
      showCheckbox: checkable,
    };
    list.push(
      isChildItem ? (
        cloneElement(value, forwardCallbackProps(value.props, listItemProps))
      ) : (
        <ListItem {...listItemProps} />
      )
    );

    idx.value += 1;
  }

  const addGroup: (
    list: ReactElement[],
    items: CollectionItem<Item>[],
    idx: { value: number }
  ) => void = function addGroup(
    list: ReactElement[],
    items: CollectionItem<Item>[],
    idx: { value: number }
  ) {
    const { count, id, expanded, label } = items[idx.value];
    const header = createHeader(idx, id, label!, expanded);
    const childItems: ReactElement | ReactElement[] =
      expanded !== false
        ? [header].concat(renderItems(items, idx, idx.value + count!) || [])
        : header;

    list.push(
      <div key={id} role="group">
        {childItems}
      </div>
    );
  };

  const renderItems = (
    items: CollectionItem<Item>[],
    idx: CollectionIndexer = { value: 0 },
    end = items.length
  ): ReactElement[] | undefined => {
    const listItems: ReactElement[] = [];
    while (idx.value < end) {
      const item = items[idx.value];
      if (item.header) {
        listItems.push(
          createHeader(idx, item.id, item.label!, item.expanded === false)
        );
      } else if (item.childNodes) {
        addGroup(listItems, items, idx);
      } else {
        addItem(listItems, item, idx);
      }
    }
    return listItems;
  };

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
    if (collectionHook.data.length) {
      return renderItems(collectionHook.data);
    } else {
      renderEmpty();
    }
  };

  const contentHeight = "auto";
  const sizeStyles = {
    minWidth,
    minHeight,
    width: width ?? "100%",
    height: height ?? "100%",
    maxWidth: maxWidth ?? width,
    maxHeight: maxHeight ?? preferredHeight,
  };
  return (
    <div
      aria-multiselectable={
        selectionStrategy === "multiple" ||
        selectionStrategy === "extended" ||
        selectionStrategy === "extended-multi-range" ||
        undefined
      }
      {...htmlAttributes}
      {...listHandlers}
      {...listControlProps}
      className={cx(withBaseName(), className, {
        // TODO low-emphasis
        [withBaseName("borderless")]: borderless,
        [withBaseName("disabled")]: listDisabled,
        "empty-list": collectionHook.data.length === 0,
        [withBaseName("collapsible")]: collapsibleHeaders,
      })}
      id={`${id}`}
      ref={rootRef}
      role="listbox"
      style={{ ...styleProp, ...sizeStyles }}
      tabIndex={listDisabled || disableFocus ? undefined : 0}
    >
      {collectionHook.data.length === 0 && ListPlaceholder !== undefined ? (
        <ListPlaceholder style={autoSize} />
      ) : (
        <div
          className={withBaseName("scrollingContentContainer")}
          ref={contentRef}
          style={{ height: contentHeight }}
        >
          {renderContent()}
        </div>
      )}
    </div>
  );
}) as <Item = string, Selection extends SelectionStrategy = "default">(
  props: ListNextProps<Item, Selection> & {
    ref?: ForwardedRef<ScrollingAPI<Item>>;
  }
) => ReactElement<ListNextProps<Item, Selection>>;
