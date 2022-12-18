import {
  createElement,
  KeyboardEvent,
  MouseEvent,
  RefObject,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Tab } from "./Tab";
import {
  ContainerNavigationProps,
  useKeyboardNavigation,
} from "./useKeyboardNavigation";
import { dragStrategy, useDragDrop, DragHookResult } from "./drag-drop";
import { useSelection } from "./useSelection";
import {
  ExitEditModeHandler,
  useEditableItem,
  EditableItemHookResult,
} from "./useEditableItem";
import { OverflowCollectionHookResult } from "../responsive";

import {
  composableTabProps,
  exitEditHandler,
  navigationProps,
  TabDescriptor,
  TabElement,
} from "./TabsTypes";

interface tabstripHookProps {
  activeTabIndex?: number;
  allowDragDrop?: boolean | dragStrategy;
  collectionHook: OverflowCollectionHookResult;
  defaultActiveTabIndex?: number;
  defaultTabs?: TabDescriptor[];
  editing?: boolean;
  enableAddTab: boolean;
  idRoot: string;
  innerContainerRef: RefObject<HTMLDivElement>;
  keyBoardActivation?: "manual" | "automatic";
  onActiveChange?: (tabIndex: number) => void;
  onCloseTab?: (indexPosition: number) => void;
  onEnterEditMode?: () => void;
  onExitEditMode?: ExitEditModeHandler;
  onMoveTab?: (fromIndex: number, toIndex: number) => void;
  orientation: "horizontal" | "vertical";
  promptForNewTabName?: boolean;
  tabs?: TabDescriptor[] | TabElement[];
}

interface tabstripHookResult
  extends DragHookResult,
    Pick<EditableItemHookResult, "editing"> {
  activateTab: (tabIndex: number) => void;
  activeTabIndex: number;
  addTab: (indexPosition?: number) => void;
  closeTab: (indexPosition: number) => void;
  containerProps: ContainerNavigationProps;
  controlledSelection: boolean;
  highlightedIdx: number;
  focusVisible: number;
  focusIsWithinComponent: boolean;
  focusTab: (tabIndex: number, immediateFocus?: boolean) => void;
  navigationProps: navigationProps;
  tabProps: composableTabProps;
}

export const useTabstrip = ({
  activeTabIndex: activeTabIndexProp,
  allowDragDrop = false,
  collectionHook,
  defaultActiveTabIndex,
  editing: editingProp,
  idRoot,
  innerContainerRef,
  keyBoardActivation,
  onActiveChange,
  onCloseTab,
  onEnterEditMode,
  onExitEditMode,
  onMoveTab,
  orientation = "horizontal",
  promptForNewTabName,
}: tabstripHookProps): tabstripHookResult & DragHookResult => {
  const lastSelection = useRef(
    activeTabIndexProp || defaultActiveTabIndex || 0
  );
  const pendingNewTab = useRef<string | null>(null);

  const overflowedItems = collectionHook.data.filter((item) => item.overflowed);

  const { focusTab, ...keyboardHook } = useKeyboardNavigation({
    indexPositions: collectionHook.data,
    keyBoardActivation,
    orientation,
    selectedIndex: lastSelection.current,
  });

  const selectionHook = useSelection({
    defaultSelected: defaultActiveTabIndex,
    highlightedIdx: keyboardHook.highlightedIdx,
    onSelectionChange: onActiveChange,
    selected: activeTabIndexProp,
  });

  // We need this on reEntry for navigation hook to handle focus
  lastSelection.current = selectionHook.selected;

  const handleDrop = useCallback(
    (fromIndex: number, toIndex: number) => {
      onMoveTab?.(fromIndex, toIndex);
      if (toIndex === -1) {
        // nothing to do
      } else {
        if (selectionHook.selected === fromIndex) {
          selectionHook.activateTab(toIndex);
        } else if (
          fromIndex > selectionHook.selected &&
          toIndex <= selectionHook.selected
        ) {
          selectionHook.activateTab(selectionHook.selected + 1);
        } else if (
          fromIndex < selectionHook.selected &&
          toIndex >= selectionHook.selected
        ) {
          selectionHook.activateTab(selectionHook.selected - 1);
        }
      }
    },
    [onMoveTab, selectionHook]
  );

  const { onMouseDown: dragDropMouseDown, ...dragDropHook } = useDragDrop({
    allowDragDrop,
    containerRef: innerContainerRef,
    draggableClassName: `tabstrip-${orientation}`,
    extendedDropZone: overflowedItems.length > 0,
    onDrop: handleDrop,
    orientation: "horizontal",
    itemQuery: ".saltTab",
  });

  const editableHook = useEditableItem({
    editing: editingProp,
    highlightedIdx: keyboardHook.highlightedIdx,
    indexPositions: collectionHook.data,
    onEnterEditMode,
    onExitEditMode,
  });

  const handleExitEditMode = useCallback<exitEditHandler>(
    (originalValue, editedValue, allowDeactivation, tabIndex) => {
      editableHook.onExitEditMode(
        originalValue,
        editedValue,
        allowDeactivation,
        tabIndex
      );
      if (!allowDeactivation) {
        // this indicates that Enter or Esc key has been pressed, hence we
        // want to make sure keyboardHook treats this as a keyboard event
        // (and applies focusVisible). The last parameter here does that.
        focusTab(tabIndex, false, true);
      }
    },
    [editableHook, focusTab]
  );

  const handleClick = useCallback(
    (evt: MouseEvent, tabIndex: number) => {
      // releasing the mouse at end of drag will trigger a click, ignore those
      if (!dragDropHook.isDragging) {
        keyboardHook.onClick(evt, tabIndex);
        selectionHook.onClick(evt, tabIndex);
      }
    },
    [dragDropHook.isDragging, keyboardHook, selectionHook]
  );

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent) => {
      keyboardHook.onKeyDown(evt);
      if (!evt.defaultPrevented) {
        selectionHook.onKeyDown(evt);
      }
      if (!evt.defaultPrevented) {
        editableHook.onKeyDown(evt);
      }
    },
    [keyboardHook, selectionHook, editableHook]
  );

  const navigationProps = {
    onFocus: keyboardHook.onFocus,
    onKeyDown: handleKeyDown,
  };

  const tabProps: composableTabProps = {
    onClick: handleClick,
    onEnterEditMode: editableHook.onEnterEditMode,
    onExitEditMode: handleExitEditMode,
  };

  const handleMouseDown = useCallback(
    (evt: MouseEvent<HTMLElement>) => {
      // This piece of code is a no-op in many scenarios - the
      // mousedown event will trigger focus and the focus event
      const target = evt.target as HTMLElement;
      const tab = target.closest('[role^="tab"]') as HTMLElement;
      if (tab?.getAttribute("role") === "tab") {
        const tabIndex = parseInt(tab.dataset.idx ?? "-1");
        focusTab(tabIndex, true);
      }
      dragDropMouseDown?.(evt);
    },
    [dragDropMouseDown, focusTab]
  );

  const addTab = useCallback(
    // The -1 is to account for the AddTab button - we shouldn't assume this
    (indexPosition: number = collectionHook.data.length - 1) => {
      const tabId =
        (pendingNewTab.current = `${idRoot}-${collectionHook.data.length}`);
      const overflowIndicator = collectionHook.data.find(
        (i) => i.isOverflowIndicator
      );
      const newTabs = collectionHook.data.filter((item) =>
        item.label?.startsWith("New Tab")
      );
      const count = newTabs.length + 1;
      collectionHook.dispatch({
        type: "add-child-item",
        idRoot,
        element: createElement(Tab, {
          editable: true,
          label: `New Tab ${count}`,
          id: tabId,
        }),
        indexPosition: overflowIndicator ? indexPosition - 1 : indexPosition,
      });
    },
    [collectionHook, idRoot]
  );

  const selectNewTab = useCallback(
    (tabId: string) => {
      const tab = collectionHook.data.find((item) => item.id === tabId);
      if (tab) {
        selectionHook.activateTab(tab.index);
        if (promptForNewTabName) {
          // this will take care of focus, which will be set to the editable input
          editableHook.setEditing(true);
        } else {
          focusTab(tab.index);
        }
      }
    },
    [
      collectionHook.data,
      editableHook,
      focusTab,
      promptForNewTabName,
      selectionHook,
    ]
  );

  const closeTab = useCallback(
    (indexPosition: number) => {
      if (!collectionHook.isControlled) {
        collectionHook.dispatch({
          type: "remove-item",
          indexPosition,
        });
        if (collectionHook.data.length > 1) {
          if (
            indexPosition === selectionHook.selected &&
            //TODO need to exclude overflow indicator, addButton
            indexPosition === collectionHook.data.length - 1
          ) {
            selectionHook.activateTab(indexPosition - 1);
          }
          // does this have to be here ?
          onCloseTab?.(indexPosition);
          if (indexPosition < selectionHook.selected) {
            selectionHook.activateTab(selectionHook.selected - 1);
          }
        }
      } else {
        onCloseTab?.(indexPosition);
      }
    },
    [collectionHook, onCloseTab, selectionHook]
  );

  useEffect(() => {
    if (pendingNewTab.current) {
      const { current: tabId } = pendingNewTab;
      pendingNewTab.current = null;
      selectNewTab(tabId);
    }
  }, [collectionHook.data, promptForNewTabName, selectNewTab]);

  return {
    activateTab: selectionHook.activateTab,
    addTab,
    closeTab,
    containerProps: keyboardHook.containerProps,
    controlledSelection: selectionHook.isControlled,
    editing: editableHook.editing,
    focusTab,
    focusIsWithinComponent: keyboardHook.focusIsWithinComponent,
    focusVisible: keyboardHook.focusVisible,
    highlightedIdx: keyboardHook.highlightedIdx,
    activeTabIndex: selectionHook.selected,
    navigationProps,
    tabProps,
    onMouseDown: handleMouseDown,
    ...dragDropHook,
  };
};
