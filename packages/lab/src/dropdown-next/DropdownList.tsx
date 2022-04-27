import {
  cloneElement,
  forwardRef,
  ForwardedRef,
  ReactElement,
  useCallback,
  useRef,
} from "react";

import { ListNext, ListNextProps } from "../list-next";
import { useForkRef, useIdMemo as useId } from "../utils";
import { DropdownNext, DropdownNextProps } from "./DropdownNext";
import { DropdownButtonNext } from "./DropdownButtonNext";
import { useDropdownList } from "./useDropdownList";
import {
  CollectionItem,
  CollectionProvider,
  itemToString as defaultItemToString,
  useCollectionItems,
  SelectionStrategy,
  SelectionProps,
  SingleSelectionStrategy,
} from "../common-hooks";

export interface DropdownListProps<Item, Selection extends SelectionStrategy>
  extends DropdownNextProps,
    Pick<ListNextProps<Item, Selection>, "itemToString" | "source" | "width">,
    SelectionProps<Item, Selection> {
  ListProps?: Omit<ListNextProps<Item, Selection>, "itemToString" | "source">;
}

export const DropdownList = forwardRef(function DropdownList<
  Item = "string",
  Selection extends SelectionStrategy = "default"
>(
  {
    children,
    defaultIsOpen,
    defaultSelected,
    id: idProp,
    isOpen: isOpenProp,
    itemToString = defaultItemToString,
    onOpenChange,
    onSelectionChange,
    selected: selectedProp,
    selectionStrategy,
    source,
    triggerComponent,
    ListProps,
    width = 180,
    ...props
  }: DropdownListProps<Item, Selection>,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  const id = useId(idProp);
  const rootRef = useRef<HTMLDivElement>(null);
  const forkedRef = useForkRef<HTMLDivElement>(rootRef, forwardedRef);

  const collectionHook = useCollectionItems<Item>({
    id,
    source,
    children,
    options: {
      itemToString,
    },
  });

  const {
    highlightedIndex: highlightedIdx,
    triggerLabel,
    listHandlers,
    listControlProps,
    selected,
    ...dropdownListHook
  } = useDropdownList<Item, Selection>({
    collectionHook,
    defaultIsOpen,
    defaultSelected: collectionHook.itemToCollectionItem<
      Selection,
      typeof defaultSelected
    >(defaultSelected),
    isOpen: isOpenProp,
    itemToString,
    label: "DropdownList",
    onOpenChange,
    onSelectionChange,
    selected: collectionHook.itemToCollectionItem<
      Selection,
      typeof selectedProp
    >(selectedProp),
    selectionStrategy,
  });

  const collectionItemsToItem = useCallback(
    (
      sel?: CollectionItem<Item> | null | CollectionItem<Item>[]
    ):
      | undefined
      | (Selection extends SingleSelectionStrategy ? Item | null : Item[]) => {
      type returnType = Selection extends SingleSelectionStrategy
        ? Item | null
        : Item[];
      if (Array.isArray(sel)) {
        return sel.map((i) => i.value) as returnType;
      } else if (sel) {
        return sel.value as returnType;
      }
    },
    []
  );

  const getTriggerComponent = () => {
    if (triggerComponent) {
      return cloneElement(triggerComponent, listControlProps);
    } else {
      return <DropdownButtonNext label={triggerLabel} {...listControlProps} />;
    }
  };

  return (
    <CollectionProvider<Item> collectionHook={collectionHook}>
      <DropdownNext
        {...props}
        id={id}
        isOpen={dropdownListHook.isOpen}
        onOpenChange={dropdownListHook.onOpenChange}
        ref={forkedRef}
        width={width}
      >
        {getTriggerComponent()}
        <ListNext<Item, Selection>
          {...ListProps}
          highlightedIndex={highlightedIdx}
          listHandlers={listHandlers}
          onSelectionChange={onSelectionChange}
          selected={collectionItemsToItem(selected)}
          selectionStrategy={selectionStrategy}
        />
      </DropdownNext>
    </CollectionProvider>
  );
}) as <Item, Selection extends SelectionStrategy = "default">(
  props: DropdownListProps<Item, Selection> & {
    ref?: ForwardedRef<HTMLDivElement>;
  }
) => ReactElement<DropdownListProps<Item, Selection>>;
