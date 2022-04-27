import { ReactNode } from "react";
import { SelectionStrategy, SingleSelectionStrategy } from "./selectionTypes";

export interface CollectionIndexer {
  value: number;
}

export interface CollectionItem<T> {
  id: string;
  // Introduced null here just for the 'Empty' node in Tree - can we eliminate it ?
  value: T | null;
  // this should be childItems
  childNodes?: CollectionItem<T>[];
  count?: number;
  description?: string;
  disabled?: boolean;
  expanded?: boolean;
  header?: boolean;
  index?: number;
  label?: string;
  level?: number;
  selectable?: boolean;
}

export interface SourceGroup<T> {
  childNodes: T[];
}

export type CollectionOptions<T> = {
  // closeable?: boolean;
  // editable?: boolean;
  // getPriority?: (item: any, index: number) => number | undefined;
  collapsibleHeaders?: boolean;
  defaultExpanded?: boolean;
  filterPattern?: string;
  getFilterRegex?: (inputValue: string) => RegExp;
  getItemId?: (indexOfItem: number) => string;
  noChildrenLabel?: string;
  itemToString?: (item: T) => string;
  revealSelected?: boolean | T | T[];
};

export type CollectionHookProps<T> = {
  children?: ReactNode;
  id: string;
  label?: string;
  source?: Array<T>;
  options?: CollectionOptions<T>;
};

// export type CollectionItemWrapped<
//   T,
//   U extends T | T[] | undefined | null
// > = U extends T
//   ? CollectionItem<T>
//   : U extends T[]
//   ? CollectionItem<T>[]
//   : U extends null
//   ? null
//   : undefined;

export type CollectionHookResult<T> = {
  collapseGroupItem: (item: CollectionItem<T>) => void;
  data: CollectionItem<T>[];
  expandGroupItem: (item: CollectionItem<T>) => void;
  setFilterPattern: (pattern: undefined | string) => void;
  itemById: (id: string) => T | never;
  itemToCollectionItem: <
    Selection extends SelectionStrategy,
    U extends T | T[] | null | undefined
  >(
    item: U
  ) => Selection extends SingleSelectionStrategy
    ? CollectionItem<T> | null
    : CollectionItem<T>[];

  stringToCollectionItem: <Selection extends SelectionStrategy>(
    item: string | null | undefined
  ) => Selection extends SingleSelectionStrategy
    ? CollectionItem<T> | null
    : CollectionItem<T>[];
  toCollectionItem: (item: T) => CollectionItem<T>;
  itemToId: (item: T) => string;
};
