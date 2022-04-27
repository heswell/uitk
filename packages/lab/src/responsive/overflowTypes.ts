// TODO rename ?
import { ReactElement, ReactNode, RefObject } from "react";
import { OverflowAction as overflowAction2 } from "./OverflowReducer";

type dimension =
  | "clientWidth"
  | "clientHeight"
  | "scrollWidth"
  | "scrollHeight";

type dimensions = {
  size: dimension;
  depth: dimension;
  scrollDepth: dimension;
};

export type dimensionsType = {
  horizontal: dimensions;
  vertical: dimensions;
};

export type orientationType = keyof dimensionsType;

export type collapsibleType = "instant" | "dynamic";

interface NonNullableRefObject<T> {
  current: T;
}

export type FilterPredicate = (item: OverflowItem) => boolean;

export type ElementRef = RefObject<HTMLDivElement>;

export type overflowItemType = "source" | "child";
// TODO I think this should extend CollectionItem
// TODO type this so that it can have a child elment OR a source item
// TODO OR do we use ReactElement | T as the generic type
export type OverflowItem<T extends overflowItemType = "child"> = {
  collapsed?: boolean;
  collapsible?: collapsibleType;
  collapsing?: boolean;
  disabled?: boolean;
  element: T extends "child" ? ReactElement : null;
  fullSize: number | null;
  id: string;
  index: number;
  isInjectedItem?: boolean;
  isOverflowIndicator?: boolean;
  label?: string;
  minSize?: number;
  overflowed?: boolean;
  position?: number;
  priority: number;
  reclaimSpace?: boolean;
  reclaimedSpace?: boolean;
  size: number;
  source: T extends "source" ? any : null;
  type: overflowItemType;

  // collection types
  editable?: boolean;
  closeable?: boolean;
};

export type OverflowItems = OverflowItem<"source" | "child">[];

export type ManagedListRef = NonNullableRefObject<OverflowItem[]>;

export type overflowState = {
  overflowIndicatorSize: number;
  visibleItems: OverflowItem[];
};

export type overflowAction = {
  type: string;
  managedItems?: OverflowItem[];
  managedItem?: OverflowItem;
};

export type overflowDispatch = (action: overflowAction2) => void;

// TODO allow editable to be a function
export type OverflowCollectionOptions = {
  closeable?: boolean;
  editable?: boolean;
  getPriority?: (item: any, index: number) => number | undefined;
};

export type OverflowCollectionHookProps<T = any> = {
  children?: ReactNode;
  defaultSource?: T[];
  id: string;
  injectedItems?: T[];
  label?: string;
  options?: OverflowCollectionOptions;
  orientation: orientationType;
  source?: T[];
};

export type OverflowCollectionHookResult = {
  data: OverflowItem[];
  dispatch: (action: overflowAction2 | { type: "reset" }) => void;
  isControlled: boolean;
  version: number;
};

export interface overflowHookProps {
  collectionHook: OverflowCollectionHookResult;
  dispatchOverflowAction?: overflowDispatch;
  innerContainerSize?: number;
  label?: string;
  ref: ElementRef;
  orientation: orientationType;
  hasOverflowedItems?: boolean;
  overflowItemsRef: ManagedListRef;
}
