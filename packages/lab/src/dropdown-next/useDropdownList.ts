import { useCallback, useMemo } from "react";
import { ListHookProps, ListHookResult, useList } from "../list-next";
import { DropdownHookResult, DropdownHookProps } from "../dropdown-next";
import {
  CollectionItem,
  itemToString as defaultItemToString,
  SelectionChangeHandler,
  SelectionStrategy,
} from "../common-hooks";
import { useControlled } from "../utils";

const NULL_REF = { current: null };

export interface DropdownListHookProps<Item, Strategy extends SelectionStrategy>
  extends Partial<Omit<DropdownHookProps, "onKeyDown">>,
    Omit<ListHookProps<Item, Strategy>, "containerRef"> {
  itemToString?: (item: Item) => string;
}

export interface DropdownListHookResult<
  Item,
  Selection extends SelectionStrategy
> extends Partial<ListHookResult<Item, Selection>>,
    Partial<DropdownHookResult> {
  onOpenChange: any;
  triggerLabel?: string;
}

export const useDropdownList = <
  Item,
  Selection extends SelectionStrategy = "default"
>({
  collectionHook,
  defaultIsOpen,
  defaultSelected,
  isOpen: isOpenProp,
  itemToString = defaultItemToString,
  onOpenChange,
  onSelectionChange,
  selected,
  selectionStrategy,
}: DropdownListHookProps<Item, Selection>): DropdownListHookResult<
  Item,
  Selection
> => {
  const isMultiSelect =
    selectionStrategy === "multiple" || selectionStrategy === "extended";

  const [isOpen, setIsOpen] = useControlled<boolean>({
    controlled: isOpenProp,
    default: defaultIsOpen ?? false,
    name: "useDropdownList",
  });

  const handleSelectionChange = useCallback<
    SelectionChangeHandler<Item, Selection>
  >(
    (evt, selected) => {
      if (!isMultiSelect) {
        setIsOpen(false);
      }
      onSelectionChange?.(evt, selected);
    },
    [onSelectionChange, selectionStrategy, setIsOpen]
  );

  const listHook = useList<Item, Selection>({
    collectionHook,
    defaultHighlightedIndex: 0,
    defaultSelected,
    label: "useDropDownList",
    onSelectionChange: handleSelectionChange,
    containerRef: NULL_REF,
    selected,
    selectionStrategy,
    tabToSelect: !isMultiSelect,
  });

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  const triggerLabel = useMemo(() => {
    if (isMultiSelect && Array.isArray(listHook.selected)) {
      const selectedItems = listHook.selected as CollectionItem<Item>[];
      if (selectedItems.length === 0) {
        return undefined;
      } else if (selectedItems.length === 1) {
        const { value } = selectedItems[0];
        return value === null ? undefined : itemToString(value);
      } else {
        return `${selectedItems.length} items selected`;
      }
    } else {
      const selectedItem = listHook.selected as CollectionItem<Item>;
      return selectedItem == null || selectedItem.value === null
        ? undefined
        : itemToString(selectedItem.value);
    }
  }, [listHook.selected]);

  return {
    isOpen,
    onOpenChange: handleOpenChange,
    triggerLabel,
    ...listHook,
  };
};
