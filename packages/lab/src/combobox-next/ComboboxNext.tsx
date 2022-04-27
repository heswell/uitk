import {
  forwardRef,
  ForwardedRef,
  ReactElement,
  useCallback,
  useRef,
} from "react";

import { ListNext, ListNextProps } from "../list-next";
import { useForkRef, useIdMemo as useId } from "../utils";
import { DropdownNext, DropdownNextProps } from "../dropdown-next";
import { Input, InputProps } from "../input";

import { useComboboxNext } from "./useComboboxNext";
import {
  CollectionItem,
  CollectionProvider,
  useCollectionItems,
  SelectionStrategy,
  SelectionProps,
  SingleSelectionStrategy,
} from "../common-hooks";

export interface ComboboxNextProps<Item, Selection extends SelectionStrategy>
  extends Omit<
      DropdownNextProps,
      "triggerComponent" | "onBlur" | "onChange" | "onFocus"
    >,
    Pick<InputProps, "onBlur" | "onChange" | "onFocus" | "onSelect">,
    Pick<ListNextProps<Item, Selection>, "itemToString" | "source" | "width">,
    Pick<
      SelectionProps<Item, Selection>,
      "onSelectionChange" | "selectionStrategy"
    > {
  InputProps?: InputProps;
  ListProps?: Omit<ListNextProps<Item, Selection>, "itemToString" | "source">;
  allowFreeText?: boolean;
  defaultValue?: string;
  getFilterRegex?: (inputValue: string) => RegExp;
  stringToItem?: (value?: string) => Item | null | undefined;
  value?: string;
}

export const ComboboxNext = forwardRef(function ComboboxNext<
  Item = "string",
  Selection extends SelectionStrategy = "default"
>(
  {
    InputProps,
    ListProps,
    "aria-label": ariaLabel,
    allowFreeText,
    children,
    defaultIsOpen,
    defaultValue,
    disabled,
    onBlur,
    onFocus,
    onChange,
    onSelect,
    getFilterRegex,
    id: idProp,
    isOpen: isOpenProp,
    itemToString,
    onOpenChange: onOpenChangeProp,
    onSelectionChange,
    selectionStrategy,
    source,
    stringToItem,
    value: valueProp,
    width = 180,
    // TODO why is onKeyDown in here
    ...props
  }: ComboboxNextProps<Item, Selection>,
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
      filterPattern: valueProp ?? defaultValue,
      getFilterRegex,
      itemToString,
    },
  });

  const {
    focusVisible,
    highlightedIndex,
    inputProps,
    isOpen,
    listHandlers,
    listControlProps: controlProps,
    onOpenChange,
    selected,
  } = useComboboxNext<Item, Selection>({
    InputProps,
    allowFreeText,
    ariaLabel,
    collectionHook,
    defaultIsOpen,
    defaultValue,
    disabled,
    onBlur,
    onFocus,
    onChange,
    onSelect,
    id,
    isOpen: isOpenProp,
    itemToString,
    label: "DropdownList",
    onOpenChange: onOpenChangeProp,
    onSelectionChange,
    selectionStrategy,
    stringToItem,
    value: valueProp,
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
      } else {
        return sel as returnType;
      }
    },
    []
  );

  return (
    <CollectionProvider<Item> collectionHook={collectionHook}>
      <DropdownNext
        {...props}
        id={id}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        openOnFocus
        ref={forkedRef}
        width={width}
      >
        <Input
          {...inputProps}
          disabled={disabled}
          // ref={useForkRef(setInputRef, setHookInputRef)}
          {...controlProps}
        />

        <ListNext<Item, Selection>
          {...ListProps}
          focusVisible={focusVisible}
          highlightedIndex={highlightedIndex}
          itemTextHighlightPattern={inputProps.value || undefined}
          id={`${id}-list`}
          listHandlers={listHandlers}
          onSelectionChange={onSelectionChange}
          selected={collectionItemsToItem(selected)}
          selectionStrategy={selectionStrategy}
        />
      </DropdownNext>
    </CollectionProvider>
  );
}) as <Item, Selection extends SelectionStrategy = "default">(
  props: ComboboxNextProps<Item, Selection> & {
    ref?: ForwardedRef<HTMLDivElement>;
  }
) => ReactElement<ComboboxNextProps<Item, Selection>>;
