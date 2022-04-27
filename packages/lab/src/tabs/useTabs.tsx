import { ReactNode, useCallback, useState } from "react";
import { useControlled, useIdMemo } from "../utils";
import { useItemsWithIds } from "./useItemsWithIds";

export const useTabs = ({
  activeTabIndex: activeTabIndexProp,
  children,
  defaultActiveTabIndex,
  id: idProp,
  onActiveChange,
}: {
  activeTabIndex?: number;
  children: ReactNode;
  defaultActiveTabIndex?: number;
  id?: string;
  onActiveChange?: (tabIndex: number) => void;
}) => {
  const id = useIdMemo(idProp);
  const [itemsWithIds, itemById] = useItemsWithIds(children, id);

  const [activeTabIndex, setActiveTabIndex, isControlled] = useControlled({
    controlled: activeTabIndexProp,
    default:
      defaultActiveTabIndex ??
      (activeTabIndexProp === undefined ? 0 : undefined),
    name: "useTabs",
    state: "activeTabIndex",
  });

  const handleTabActivated = useCallback((tabIndex: number) => {
    setActiveTabIndex(tabIndex);
    onActiveChange?.(tabIndex);
  }, []);

  const contentItem = itemsWithIds[activeTabIndex];

  return {
    id,
    onActiveChange: handleTabActivated,
    activeTabIndex,
    tabs: itemsWithIds,
    tabPanel: contentItem?.element ?? null,
  };
};
