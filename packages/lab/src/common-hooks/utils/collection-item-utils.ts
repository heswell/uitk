import { isValidElement, Children, ReactElement, ReactNode } from "react";

import {
  CollectionItem,
  CollectionOptions,
  SourceGroup,
} from "../collectionTypes";
// TODO how do we configure these
import { ListItemGroup } from "../../list-next/ListItemGroup";
import { ListItemHeader } from "../../list-next/ListItemHeader";
import { itemToString as defaultItemToString } from "../itemToString";

type DisablableElement = ReactElement<{ disabled: boolean }>;
type SelectableElement = ReactElement<{ selectable: boolean }>;

export const sourceItemHasProp = (
  item: unknown,
  propertyName: string
): boolean => {
  return (
    item !== null && Object.prototype.hasOwnProperty.call(item, propertyName)
  );
};

export const isHeader = (item: unknown): boolean =>
  sourceItemHasProp(item, "header");

export const isGroupNode = (item: unknown): boolean =>
  sourceItemHasProp(item, "childNodes");

const childItemHasProp = (item: ReactElement, propertyName: string) => {
  return item && Object.prototype.hasOwnProperty.call(item.props, propertyName);
};

export const isDisabled = (item: unknown): boolean => {
  if (isValidElement(item as DisablableElement)) {
    if (childItemHasProp(item as DisablableElement, "disabled")) {
      return (item as DisablableElement).props.disabled === true;
    }
  } else if (sourceItemHasProp(item, "disabled")) {
    return (item as { disabled: boolean }).disabled === true;
  }

  return false;
};

export const countChildItems = <Item>(
  item: CollectionItem<Item>,
  items: CollectionItem<Item>[],
  idx: number
): number => {
  if (item.childNodes) {
    return item.childNodes.length;
  } else if (item.header) {
    let i = idx + 1;
    let count = 0;
    while (i < items.length && !items[i].header) {
      count++;
      i++;
    }
    return count;
  } else {
    return 0;
  }
};

export const getChildLabel = (
  element: ReactElement<{
    children?: ReactNode;
    label?: string;
    title?: string;
  }>
): string | undefined => {
  if (typeof element.props.children === "string") {
    return element.props.children;
  } else if (element.props.title) {
    return element.props.title;
  } else if (element.props.label) {
    return element.props.label;
  }
};

const childIsHeader = (child: ReactElement) =>
  child.type === ListItemHeader || childItemHasProp(child, "data-header");

export const childIsGroup = (child: ReactElement): boolean =>
  child.type === ListItemGroup || childItemHasProp(child, "data-group");

const childIsSelectable = (child: ReactElement) => {
  if (childItemHasProp(child, "selectable")) {
    return (child as SelectableElement).props.selectable === true;
  } else {
    return !childIsGroup(child) && !childIsHeader(child);
  }
};

export const getChildNodes = (
  element: ReactElement
): CollectionItem<ReactElement>[] | undefined => {
  if (childIsGroup(element)) {
    const {
      props: { children },
    } = element as ReactElement<{ children?: ReactNode }>;
    if (typeof children !== "string") {
      return childItems(children);
    }
  }
};

const mapReactElementChildren = (
  children: ReactNode,
  fn: (el: ReactElement) => CollectionItem<ReactElement>
): CollectionItem<ReactElement>[] => {
  const childElements: CollectionItem<ReactElement>[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      childElements.push(fn(child));
    }
  });
  return childElements;
};

type ListItemElementProps = {
  "data-id"?: string;
  disabled?: boolean;
  id?: string;
  "data-expanded"?: boolean;
  expanded?: boolean;
};

type UnidentifiedCollectionItem<T> = Omit<CollectionItem<T>, "id">;

export const sourceItems = <T>(
  source?: T[],
  options?: CollectionOptions<T>
): UnidentifiedCollectionItem<T>[] | undefined => {
  if (Array.isArray(source)) {
    if (source.length === 0 && options?.noChildrenLabel) {
      return [
        {
          label: options.noChildrenLabel,
          value: null,
        },
      ];
    } else {
      return source.map(
        (item: { description?: string; expanded?: boolean }, index) =>
          ({
            childNodes: sourceItems(
              (item as unknown as SourceGroup<T>).childNodes,
              options
            ),
            description: item.description,
            expanded: item.expanded,
            value: item,
            label:
              options?.itemToString?.(item as T) ?? defaultItemToString(item),
          } as UnidentifiedCollectionItem<T>)
      );
    }
  } else if (source) {
    throw Error("list-child-items expects source to be an array");
  }
};

export const childItems = (
  children: ReactNode
): CollectionItem<ReactElement>[] | undefined => {
  if (children) {
    return mapReactElementChildren(children, (child) => {
      const {
        "data-id": dataId,
        disabled,
        id = dataId,
        "data-expanded": dataExpanded,
        expanded = dataExpanded,
      } = (child as ReactElement<ListItemElementProps>).props;
      return {
        childNodes: getChildNodes(child),
        disabled,
        expanded,
        header: childIsHeader(child),
        id,
        label: getChildLabel(child),
        selectable: childIsSelectable(child),
        value: child,
      } as CollectionItem<ReactElement>;
    });
  }
};

const PathSeparators = new Set<string>(["/", "-", "."]);
// TODO where do we define or identify separators
const isPathSeparator = (char: string) => PathSeparators.has(char);

export const isParentPath = (parentPath: string, childPath: string): boolean =>
  childPath.startsWith(parentPath) &&
  isPathSeparator(childPath[parentPath.length]);

const PATH_SEPARATORS = new Set([".", "/"]);

function isDescendantOf(basePath: string, targetPath: string) {
  if (!targetPath.startsWith(basePath)) {
    return false;
  } else {
    return PATH_SEPARATORS.has(targetPath.charAt(basePath.length));
  }
}

export function replaceCollectionItem<Item>(
  nodes: CollectionItem<Item>[],
  id: string,
  props: Partial<CollectionItem<Item>>
): CollectionItem<Item>[] {
  let childNodes: CollectionItem<Item>[];
  const newNodes: CollectionItem<Item>[] = nodes.map((node) => {
    if (node.id === id) {
      return {
        ...node,
        ...props,
      };
    } else if (isDescendantOf(node.id, id) && node.childNodes) {
      childNodes = replaceCollectionItem<Item>(node.childNodes, id, props);
      return {
        ...node,
        childNodes,
      };
    } else {
      return node;
    }
  });

  return newNodes;
}
