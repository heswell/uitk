import type { DecoratorFn } from "@storybook/react";

import {
  ChangeEventHandler,
  CSSProperties,
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, useDensity, ToolkitProvider } from "@jpmorganchase/uitk-core";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@jpmorganchase/uitk-icons";

import {
  ContentStatus,
  FlexLayout,
  FlexItem,
  FormField,
  Input,
  ListNext,
  ListNextProps,
  ListItemGroupNext as ListItemGroup,
  ListItemNext,
  ListItemType,
  ListItemNextProps,
  ListItemHeaderNext as ListItemHeader,
  ListScrollHandles,
  VirtualizedListNext as VirtualizedList,
} from "@jpmorganchase/uitk-lab";
import { SelectionChangeHandler, SelectHandler } from "../src/common-hooks";

import {
  usa_states,
  usa_states_cities,
  groupByInitialLetter,
  // random_1000,
} from "./list-next.data";

import "./list-next.css";

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  width: "calc(100vw - 2em)",
};

const withFullViewWidth: DecoratorFn = (Story) => (
  <div style={containerStyle}>
    <Story />
  </div>
);

export default {
  title: "Experimental/List Next",
  component: ListNext,
  decorators: [withFullViewWidth],
};

type ItemWithLabel = { label: string };
const sampleData: ItemWithLabel[] = [
  { label: "list item 1" },
  { label: "list item 2" },
  { label: "list item 3" },
  { label: "list item 4" },
];

export const Sample = () => (
  <ToolkitProvider>
    <FlexLayout style={{ width: 600, height: 400 }}>
      <FlexItem>
        <ListNext<ItemWithLabel, "multiple">
          aria-label="Declarative List example"
          displayedItemCount={5}
          defaultSelected={[sampleData[1], sampleData[3]]}
          selectionStrategy="multiple"
          source={sampleData}
          width={300}
        >
          {/* <ListItemNext>Alabama</ListItemNext>
          <ListItemNext>Alaska</ListItemNext>
          <ListItemNext>Arizona</ListItemNext>
          <ListItemNext>Arkansas</ListItemNext>
          <ListItemNext>California</ListItemNext>
          <ListItemNext>Colorado</ListItemNext>
          <ListItemNext>Connecticut</ListItemNext>
          <ListItemNext>Delaware</ListItemNext>
          <ListItemNext>Florida</ListItemNext>
          <ListItemNext>Georgia</ListItemNext>
          <ListItemNext>Hawaii</ListItemNext>
          <ListItemNext>Ihado</ListItemNext> */}
        </ListNext>
      </FlexItem>
    </FlexLayout>
  </ToolkitProvider>
);

export const Default = () => {
  const handleChange: SelectionChangeHandler = (evt, selected) => {
    console.log(`selectionChanged ${selected}`);
  };

  return (
    <ListNext
      aria-label="Listbox example"
      maxWidth={292}
      onSelectionChange={handleChange}
      source={usa_states.slice(0, 5)}
    />
  );
};

export const MultiSelection = () => {
  const handleChange: SelectionChangeHandler = (evt, selected) => {
    console.log(`selectionChanged ${selected}`);
  };

  return (
    <ListNext
      aria-label="MultiSelection Listbox example"
      checkable
      maxWidth={292}
      onSelectionChange={handleChange}
      selectionStrategy="multiple"
      source={usa_states}
    />
  );
};

export const Deselectable = () => {
  const handleChange: SelectionChangeHandler = (evt, selected) => {
    console.log(`selectionChanged ${selected}`);
  };
  return (
    <ListNext
      aria-label="Deselectable List example"
      maxWidth={292}
      onSelectionChange={handleChange}
      selectionStrategy="deselectable"
      source={usa_states}
    />
  );
};

export const DisplayedItemCount = () => {
  const handleChange: SelectionChangeHandler = (evt, selected) => {
    console.log(`selectionChanged ${selected}`);
  };
  return (
    <ListNext
      aria-label="DisplayedItemCount List example"
      displayedItemCount={6}
      maxWidth={292}
      onSelectionChange={handleChange}
      source={usa_states}
    />
  );
};

export const ItemRenderer = () => {
  const listExampleData = useMemo(
    () => [
      { name: "Alabama", abbrev: "AL" },
      { name: "Alaska", abbrev: "AK" },
      { name: "Arizona", abbrev: "AZ" },
      { name: "Arkansas", abbrev: "AR" },
      { name: "California", abbrev: "CA" },
      { name: "Colorado", abbrev: "CO" },
      { name: "Connecticut", abbrev: "CT" },
      { name: "Delaware", abbrev: "DE" },
      { name: "Florida", abbrev: "FL" },
      { name: "Georgia", abbrev: "GA" },
      { name: "Hawaii", abbrev: "HI" },
      { name: "Idaho", abbrev: "ID" },
      { name: "Illinois", abbrev: "IL" },
      { name: "Indiana", abbrev: "IN" },
      { name: "Iowa", abbrev: "IA" },
      { name: "Kansas", abbrev: "KS" },
      { name: "Kentucky", abbrev: "KY" },
      { name: "Louisiana", abbrev: "LA" },
      { name: "Maine", abbrev: "ME" },
      { name: "Maryland", abbrev: "MD" },
      { name: "Massachusetts", abbrev: "MA" },
      { name: "Michigan", abbrev: "MI" },
      { name: "Minnesota", abbrev: "MN" },
      { name: "Mississippi", abbrev: "MS" },
      { name: "Missouri", abbrev: "MO" },
      { name: "Montana", abbrev: "MT" },
      { name: "Nebraska", abbrev: "NE" },
      { name: "Nevada", abbrev: "NV" },
      { name: "New Hampshire", abbrev: "NH" },
      { name: "New Jersey", abbrev: "NJ" },
      { name: "New Mexico", abbrev: "NM" },
      { name: "New York", abbrev: "NY" },
      { name: "North Carolina", abbrev: "NC" },
      { name: "North Dakota", abbrev: "ND" },
      { name: "Ohio", abbrev: "OH" },
      { name: "Oklahoma", abbrev: "OK" },
      { name: "Oregon", abbrev: "OR" },
      { name: "Pennsylvania", abbrev: "PA" },
      { name: "Rhode Island", abbrev: "RI" },
      { name: "South Carolina", abbrev: "SC" },
      { name: "South Dakota", abbrev: "SD" },
      { name: "Tennessee", abbrev: "TN" },
      { name: "Texas", abbrev: "TX" },
      { name: "Utah", abbrev: "UT" },
      { name: "Vermont", abbrev: "VT" },
      { name: "Virginia", abbrev: "VA" },
      { name: "Washington", abbrev: "WA" },
      { name: "West Virginia", abbrev: "WV" },
      { name: "Wisconsin", abbrev: "WI" },
      { name: "Wyoming", abbrev: "WY" },
    ],
    []
  );

  interface State {
    name: string;
    abbrev: string;
  }

  const stateItemToString = (item?: State) =>
    item ? `${item.name} - ${item.abbrev}` : "";

  /**
   * We intentionally created this example with some "heavy" components.
   * We memoize it with its props to avoid unnecessary re-render.
   */
  const MemoizedItem = memo<{ label?: string } & ListItemNextProps>(
    function MemoizedItem({ label, ...restProps }) {
      return (
        <ListItemNext {...restProps}>
          <label>{label}</label>
        </ListItemNext>
      );
    }
  );

  const ListItem: ListItemType = ({ style: styleProp, ...props }) => {
    const style = useMemo(
      () => ({
        ...styleProp,
        fontStyle: "italic",
      }),
      [styleProp]
    );

    return <MemoizedItem style={style} {...props} />;
  };

  const handleChange: SelectionChangeHandler<State> = (evt, selected) => {
    console.log(`selectionChanged ${selected}`);
  };

  return (
    <ListNext<State>
      ListItem={ListItem}
      aria-label="Custom ItemRenderer example"
      itemToString={stateItemToString}
      maxWidth={292}
      onSelectionChange={handleChange}
      source={listExampleData}
    />
  );
};

export const Controlled = () => {
  const buttonsRef = useRef<HTMLDivElement>(null);

  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [offsetHeight, setOffsetHeight] = useState(0);

  const handleHighlight = (index: number) => {
    console.log(`onHighlight ${index}`);
  };

  useLayoutEffect(() => {
    if (buttonsRef.current) {
      setOffsetHeight(buttonsRef.current.getBoundingClientRect().height);
    }
  }, []);

  useEffect(() => {
    if (selectedItem) {
      console.log("selection changed", selectedItem);
    }
  }, [selectedItem]);

  const handleArrowDown = () => {
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.min(usa_states.length - 1, prevHighlightedIndex + 1)
    );
  };

  const handleArrowUp = () => {
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.max(0, prevHighlightedIndex - 1)
    );
  };

  const handleSelect = () => {
    setSelectedItem(usa_states[highlightedIndex] || null);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        maxWidth: 292,
      }}
    >
      <div
        ref={buttonsRef}
        style={{ display: "flex", justifyContent: "flex-end", zIndex: 1 }}
      >
        <Button
          disabled={highlightedIndex === usa_states.length - 1}
          onClick={handleArrowDown}
        >
          <ArrowDownIcon />
        </Button>
        <Button disabled={highlightedIndex <= 0} onClick={handleArrowUp}>
          <ArrowUpIcon />
        </Button>
        <Button onClick={handleSelect}>Select</Button>
      </div>
      <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
        <ListNext
          aria-label="Controlled List example"
          disableFocus
          highlightedIndex={highlightedIndex}
          onHighlight={handleHighlight}
          selected={selectedItem}
          source={usa_states}
        />
      </div>
    </div>
  );
};

export const DeclarativeList = () => {
  const handleChange: SelectionChangeHandler = (evt, selected) => {
    console.log(`selectionChanged ${selected}`);
  };

  return (
    <ListNext
      aria-label="Declarative List example"
      displayedItemCount={5}
      onSelectionChange={handleChange}
      width={292}
    >
      <ListItemNext>Alabama</ListItemNext>
      <ListItemNext>Alaska</ListItemNext>
      <ListItemNext disabled>Arizona</ListItemNext>
      <ListItemNext>Arkansas</ListItemNext>
      <ListItemNext>California</ListItemNext>
      <ListItemNext>Colorado</ListItemNext>
      <ListItemNext disabled>Connecticut</ListItemNext>
      <ListItemNext>Delaware</ListItemNext>
      <ListItemNext>Florida</ListItemNext>
      <ListItemNext>Georgia</ListItemNext>
    </ListNext>
  );
};

type CustomItem = {
  label: string;
  disabled?: boolean;
};

const itemToString: ListNextProps<CustomItem>["itemToString"] = ({ label }) =>
  label;

export const DisabledList = () => {
  const source = useMemo(
    () =>
      usa_states.map(
        (label, index): CustomItem => ({
          label,
          ...(index % 4 === 3 && { disabled: true }),
        })
      ),
    [usa_states]
  );

  const buttonsRef = useRef<HTMLDivElement>(null);
  const [disabled, setDisabled] = useState(false);
  const [offsetHeight, setOffsetHeight] = useState(0);

  useLayoutEffect(() => {
    if (buttonsRef.current) {
      setOffsetHeight(buttonsRef.current.getBoundingClientRect().height);
    }
  }, []);

  const handleChange: SelectionChangeHandler<CustomItem> = (
    _,
    selectedItem
  ) => {
    console.log("selection changed", selectedItem);
  };
  const handleSelect: SelectHandler<CustomItem> = (_, selectedItem) => {
    console.log("selected", selectedItem);
  };

  const handleToggleDisabled = () => {
    setDisabled((prevDisabled) => !prevDisabled);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        maxWidth: 292,
      }}
    >
      <div
        ref={buttonsRef}
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <Button onClick={handleToggleDisabled}>
          {disabled ? "Enable" : "Disable"} list
        </Button>
      </div>
      <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
        <ListNext<CustomItem>
          disabled={disabled}
          itemToString={itemToString}
          onSelect={handleSelect}
          onSelectionChange={handleChange}
          source={source}
          width={292}
        />
      </div>
    </div>
  );
};

export const DisableTypeToSelect = () => {
  const handleChange: SelectionChangeHandler = (evt, selected) => {
    console.log(`selectionChanged ${selected}`);
  };

  return (
    <ListNext
      aria-label="Listbox example"
      disableTypeToSelect
      maxWidth={292}
      onSelectionChange={handleChange}
      source={usa_states}
    />
  );
};

const handleChange: SelectionChangeHandler<string> = (_, selectedItem) => {
  console.log("selection changed", selectedItem);
};

export const Grouped = () => (
  <>
    <style>{`#grouped-list .uitkListItemHeader {
      background: var(--uitk-color-grey-20);
      }`}</style>
    <ListNext
      aria-label="Grouped List example"
      displayedItemCount={10}
      id="grouped-list"
      maxWidth={292}
      onSelectionChange={handleChange}
      stickyHeaders
    >
      <ListItemGroup title="A">
        <ListItemNext>Alabama</ListItemNext>
        <ListItemNext>Alaska</ListItemNext>
        <ListItemNext>Arizona</ListItemNext>
        <ListItemNext>Arkansas</ListItemNext>
      </ListItemGroup>
      <ListItemGroup title="C">
        <ListItemNext>California</ListItemNext>
        <ListItemNext>Colorado</ListItemNext>
        <ListItemNext>Connecticut</ListItemNext>
      </ListItemGroup>
      <ListItemGroup title="I">
        <ListItemNext>Idaho</ListItemNext>
        <ListItemNext>Illinois</ListItemNext>
        <ListItemNext>Indiana</ListItemNext>
        <ListItemNext>Iowa</ListItemNext>
      </ListItemGroup>
      <ListItemGroup title="K">
        <ListItemNext>Kansas</ListItemNext>
        <ListItemNext>Kentucky</ListItemNext>
      </ListItemGroup>
      <ListItemGroup title="M">
        <ListItemNext>Maine</ListItemNext>
        <ListItemNext>Maryland</ListItemNext>
        <ListItemNext>Massachusetts</ListItemNext>
        <ListItemNext>Michigan</ListItemNext>
        <ListItemNext>Minnesota</ListItemNext>
        <ListItemNext>Mississippi</ListItemNext>
        <ListItemNext>Missouri</ListItemNext>
        <ListItemNext>Montana</ListItemNext>
      </ListItemGroup>
      <ListItemGroup title="N">
        <ListItemNext>Nebraska</ListItemNext>
        <ListItemNext>Nevada</ListItemNext>
        <ListItemNext>New Hampshire</ListItemNext>
        <ListItemNext>New Jersey</ListItemNext>
        <ListItemNext>New Mexico</ListItemNext>
        <ListItemNext>New York</ListItemNext>
      </ListItemGroup>
    </ListNext>
  </>
);

const heightByDensity = {
  high: 24,
  medium: 32,
  low: 36,
  touch: 36,
};

export const VariableHeight = () => {
  const density = useDensity();

  const getItemHeight = (index: number) => {
    const height = heightByDensity[density];
    return height * ((index % 3) + 1);
  };

  const handleChange: SelectionChangeHandler<string> = (_, selectedItem) => {
    console.log("selection changed", selectedItem);
  };

  return (
    <ListNext
      aria-label="VariableHeight List example"
      displayedItemCount={6}
      getItemHeight={getItemHeight}
      maxWidth={292}
      onSelectionChange={handleChange}
      source={usa_states}
    />
  );
};

const ListPlaceholder = () => (
  <ContentStatus message="Did you hide it somewhere?" title="No source found" />
);

export const WithPlaceholder = () => {
  const buttonsRef = useRef<HTMLDivElement>(null);

  const [displaySource, setDisplaySource] = useState(true);
  const [offsetHeight, setOffsetHeight] = useState(0);

  useLayoutEffect(() => {
    if (buttonsRef.current) {
      setOffsetHeight(buttonsRef.current.getBoundingClientRect().height);
    }
  }, []);

  const handleChange: SelectionChangeHandler<string> = (_, selectedItem) => {
    console.log("selection changed", selectedItem);
  };

  const handleToggleDisplaySource = () => {
    setDisplaySource((prevDisplay) => !prevDisplay);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: 600,
        maxWidth: 292,
      }}
    >
      <div
        ref={buttonsRef}
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <Button onClick={handleToggleDisplaySource}>
          {displaySource ? "Hide" : "Display"} source
        </Button>
      </div>
      <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
        <ListNext
          ListPlaceholder={ListPlaceholder}
          aria-label="Placeholder List example"
          onSelectionChange={handleChange}
          source={displaySource ? usa_states : undefined}
        />
      </div>
    </div>
  );
};

export const TabToSelect = () => {
  const handleChange: SelectionChangeHandler<string> = (_, selectedItem) => {
    console.log("selection changed", selectedItem);
  };

  return (
    <>
      <div>
        <h4>default</h4>
        <ListNext
          aria-label="List example"
          maxWidth={292}
          onSelectionChange={handleChange}
          source={usa_states}
          tabToSelect
        />
      </div>
      <div>
        <h4>deselectable</h4>
        <ListNext
          aria-label="Deselectable List example"
          maxWidth={292}
          onSelectionChange={handleChange}
          selectionStrategy="deselectable"
          source={usa_states}
          tabToSelect
        />
      </div>
      <div>
        <h4>multiple</h4>
        <ListNext
          aria-label="MultiSelectable List example"
          maxWidth={292}
          onSelectionChange={handleChange}
          selectionStrategy="multiple"
          source={usa_states}
          tabToSelect
        />
      </div>
    </>
  );
};

export const TextTruncation = () => {
  const handleChange: SelectionChangeHandler<string> = (_, selectedItem) => {
    console.log("selection changed", selectedItem);
  };

  return (
    <ListNext
      aria-label="Truncated List example"
      maxWidth={292}
      onSelectionChange={handleChange}
    >
      <ListItemNext>69 Manchester Road, London, EC90 6QG</ListItemNext>
      <ListItemNext>1 London Road, London, N98 3LH</ListItemNext>
      <ListItemNext>2 Church Lane, London, EC36 8IO</ListItemNext>
      <ListItemNext>59 Kings Road, London, SW95 1ZO</ListItemNext>
      <ListItemNext>33 New Road, London, EC82 0HX</ListItemNext>
      <ListItemNext>19 Church Lane, London, EC53 1OW</ListItemNext>
      <ListItemNext>64 Main Street, London, EC72 4CR</ListItemNext>
      <ListItemNext>83 South Street, London, EC67 8NP</ListItemNext>
    </ListNext>
  );
};

export const RestoreLastFocus = () => {
  const handleChange: SelectionChangeHandler<string> = (_, selectedItem) => {
    console.log("selection changed", selectedItem);
  };

  return (
    <ListNext
      aria-label="RestoreLastFocus List example"
      defaultSelected={usa_states[4]}
      maxWidth={292}
      onSelectionChange={handleChange}
      restoreLastFocus
      source={usa_states}
    />
  );
};

export const WithTextHighlight = () => {
  const inputFieldRef = useRef<HTMLDivElement>(null);

  const [highlightRegex, setHighlightIndex] = useState<RegExp>();
  const [offsetHeight, setOffsetHeight] = useState(0);

  useLayoutEffect(() => {
    if (inputFieldRef.current) {
      setOffsetHeight(inputFieldRef.current.getBoundingClientRect().height);
    }
  }, []);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputValue = event.target.value;
    setHighlightIndex(
      inputValue ? new RegExp(`(${inputValue})`, "gi") : undefined
    );
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          maxWidth: 292,
        }}
      >
        <FormField label="Type to highlight" ref={inputFieldRef}>
          <Input defaultValue="" onChange={handleInputChange} />
        </FormField>
        <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
          <ListNext
            disableFocus
            itemTextHighlightPattern={highlightRegex}
            source={usa_states}
          />
        </div>
      </div>
    </div>
  );
};

const NUMBER_REGEX = /^(|[1-9][0-9]*)$/;

export const ScrollToIndex = () => {
  const inputFieldRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<ListScrollHandles<string>>(null);

  const [offsetHeight, setOffsetHeight] = useState(0);

  useLayoutEffect(() => {
    if (inputFieldRef.current) {
      setOffsetHeight(inputFieldRef.current.getBoundingClientRect().height);
    }
  }, []);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputValue = event.target.value;

    if (inputValue.match(NUMBER_REGEX) && listRef.current) {
      listRef.current.scrollToIndex(parseInt(inputValue, 10) || 0);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        maxWidth: 292,
      }}
    >
      <FormField label="Type an index to scroll to" ref={inputFieldRef}>
        <Input
          inputProps={{
            min: 0,
            max: usa_states.length - 1,
          }}
          onChange={handleInputChange}
          type="number"
        />
      </FormField>
      <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
        <ListNext
          aria-label="ScrollToIndex List example"
          ref={listRef}
          source={usa_states}
        />
      </div>
    </div>
  );
};

export const BorderlessList = () => (
  <ListNext
    source={usa_states}
    borderless={true}
    style={{ "--uitkList-width": "292px" } as CSSProperties}
  />
);

export const DeselectableList = () => (
  <ListNext<string, "deselectable">
    selectionStrategy="deselectable"
    source={usa_states}
    width={292}
  />
);

export const ExtendedSelectionList = () => {
  const handleSelectionChange: SelectionChangeHandler = (evt, selected) => {
    console.log({ selected });
  };
  return (
    <ListNext
      width={292}
      onSelectionChange={handleSelectionChange}
      selectionStrategy="extended"
      source={usa_states}
    />
  );
};

export const WithLastFocusRestored = () => {
  const handleChange: SelectionChangeHandler = (event, selected) => {
    console.log("selection changed", selected);
  };

  return (
    <ListNext
      defaultSelected={usa_states[4]}
      width={292}
      onSelectionChange={handleChange}
      restoreLastFocus={true}
      source={usa_states}
    />
  );
};

export const WithTextHighlightDeclarative = () => {
  const inputFieldRef = useRef<HTMLDivElement>(null);

  const [highlightRegex, setHighlightIndex] = useState<RegExp>();
  const [offsetHeight, setOffsetHeight] = useState(0);

  useLayoutEffect(() => {
    if (inputFieldRef.current) {
      setOffsetHeight(inputFieldRef.current.getBoundingClientRect().height);
    }
  }, []);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputValue = event.target.value;
    setHighlightIndex(
      inputValue ? new RegExp(`(${inputValue})`, "gi") : undefined
    );
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          maxWidth: 292,
        }}
      >
        <FormField label="Type to highlight" ref={inputFieldRef}>
          <Input defaultValue="" onChange={handleInputChange} />
        </FormField>
        <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
          <ListNext disableFocus itemTextHighlightPattern={highlightRegex}>
            <ListItemNext>
              <span>Alabama</span>
            </ListItemNext>
            <ListItemNext>Alaska</ListItemNext>
            <ListItemNext disabled>Arizona</ListItemNext>
            <ListItemNext>Arkansas</ListItemNext>
            <ListItemNext>California</ListItemNext>
            <ListItemNext>Colorado</ListItemNext>
            <ListItemNext disabled>Connecticut</ListItemNext>
            <ListItemNext>Delaware</ListItemNext>
            <ListItemNext>Florida</ListItemNext>
            <ListItemNext>Georgia</ListItemNext>
          </ListNext>
        </div>
      </div>
    </div>
  );
};

// export const SimpleListDefaultHighlight = () => {
//   return (
//     <div
//       style={{
//         ...fullWidthHeight,
//       }}
//     >
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ListNext defaultHighlightedIdx={3} source={usa_states} />
//       </div>
//     </div>
//   );
// };

// export const SimpleListDefaultSelection = () => {
//   return (
//     <div
//       style={{
//         ...fullWidthHeight,
//       }}
//     >
//       <input type="text" />
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ListNext defaultSelected={["California"]} source={usa_states} />
//       </div>
//       <input type="text" />
//     </div>
//   );
// };

// export const SimpleListWithHeaders = () => {
//   const wrapperStyle = {
//     width: 150,
//     height: 400,
//     maxHeight: 400,
//     position: "relative",
//     border: "solid 1px #ccc",
//   };
//   return (
//     <div
//       style={{
//         ...fullWidthHeight,
//         display: "flex",
//         gap: 50,
//         alignItems: "flex-start",
//       }}
//     >
//       <input type="text" />
//       <div style={wrapperStyle}>
//         <ListNext source={groupByInitialLetter(usa_states, "headers-only")} />
//       </div>
//       <div style={wrapperStyle}>
//         <ListNext
//           collapsibleHeaders
//           source={groupByInitialLetter(usa_states, "headers-only")}
//         />
//       </div>
//       <div style={wrapperStyle}>
//         <ListNext
//           collapsibleHeaders
//           selection="none"
//           source={groupByInitialLetter(usa_states, "headers-only")}
//         />
//       </div>
//       <input type="text" />
//     </div>
//   );
// };

export const SimpleListWithStickyHeaders = () => {
  return (
    <div
      style={{
        width: 350,
        maxHeight: 400,
        position: "relative",
        border: "solid 1px #ccc",
      }}
    >
      <ListNext
        source={groupByInitialLetter(usa_states, "headers-only")}
        stickyHeaders
      />
    </div>
  );
};

// export const SimpleListWithGroups = () => {
//   return (
//     <div
//       style={{
//         width: 900,
//         height: 900,
//         display: "flex",
//         gap: 50,
//         alignItems: "flex-start",
//       }}
//     >
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ComponentAnatomy>
//           <ListNext
//             collapsibleHeaders
//             source={groupByInitialLetter(usa_states, "groups-only")}
//             style={{ maxHeight: 500 }}
//           />
//         </ComponentAnatomy>
//       </div>
//     </div>
//   );
// };

// export const SimpleListWithNestedGroups = () => {
//   return (
//     <div
//       style={{
//         width: 900,
//         height: 900,
//         display: "flex",
//         gap: 50,
//         alignItems: "flex-start",
//       }}
//     >
//       <input type="text" />
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ComponentAnatomy>
//           <ListNext
//             collapsibleHeaders
//             source={groupByInitialLetter(usa_states_cities, "groups-only")}
//             style={{ maxHeight: 500 }}
//           />
//         </ComponentAnatomy>
//       </div>
//       <input type="text" />
//     </div>
//   );
// };

// export const MultiSelectList = () => {
//   return (
//     <div
//       style={{
//         width: 900,
//         height: 900,
//         display: "flex",
//         gap: 50,
//         alignItems: "flex-start",
//       }}
//     >
//       <div
//         style={{
//           width: 200,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ListNext selection="multi" source={usa_states} />
//       </div>
//       <div
//         style={{
//           width: 200,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <VirtualizedList selection="multi" source={usa_states} />
//       </div>
//     </div>
//   );
// };

// export const CheckboxSelectList = () => {
//   return (
//     <div
//       style={{
//         width: 900,
//         height: 900,
//         display: "flex",
//         gap: 50,
//         alignItems: "flex-start",
//       }}
//     >
//       <input type="text" />
//       <div
//         style={{
//           width: 250,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ListNext selection="checkbox" source={usa_states} />
//       </div>
//       <div
//         style={{
//           width: 250,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <VirtualizedList selection="checkbox" source={usa_states} />
//       </div>
//       <input type="text" />
//     </div>
//   );
// };

// export const CheckboxOnlySelectList = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <>
//       <input type="text" />
//       <div
//         style={{
//           width: 300,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ListNext
//           onChange={(value) => setSelectedValue(value)}
//           selection="checkbox-only"
//           source={usa_states}
//         />
//       </div>
//       <input type="text" />
//       <div>{usa_states[selectedValue]}</div>
//     </>
//   );
// };

// export const ExtendedSelectList = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <div
//       style={{
//         ...fullWidthHeight,
//         display: "flex",
//         gap: 50,
//         alignItems: "flex-start",
//       }}
//     >
//       <input type="text" />
//       <div
//         style={{
//           width: 300,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ListNext
//           onChange={(value) => setSelectedValue(value)}
//           selection="extended"
//           source={usa_states}
//         />
//       </div>
//       <input type="text" />
//       <div>{usa_states[selectedValue]}</div>
//     </div>
//   );
// };

// export const ControlledList = () => {
//   const [selected, setSelected] = useState([]);
//   const [hilitedIdx, setHilitedIdx] = useState(-1);

//   const handleChangeController = (evt, newSelected) => {
//     console.log(`handleChangeController`);
//     setSelected(newSelected);
//   };
//   const handleChangeControlled = (idx) => {
//     console.log(`handleChangeControlled`);
//     console.log(`controlled clicked ${idx}`);
//   };

//   return (
//     <div style={{ display: "flex", height: 600 }}>
//       <div>
//         <input type="text" />
//         <ListNext
//           id="controller"
//           source={usa_states}
//           onChange={handleChangeController}
//           onHighlight={(idx) => setHilitedIdx(idx)}
//         />
//         <input type="text" />
//       </div>
//       <div>
//         <input type="text" />
//         <ListNext
//           id="controlled"
//           highlightedIdx={hilitedIdx}
//           selected={selected}
//           source={usa_states}
//           onChange={handleChangeControlled}
//         />
//         <input type="text" />
//       </div>
//     </div>
//   );
// };

// export const FullyControlledList = () => {
//   const [selected, setSelected] = useState([]);
//   const [hilitedIdx, setHilitedIdx] = useState(-1);

//   const handleChangeController = (evt, newSelected) => {
//     console.log(`handleChangeController`);
//     setSelected(newSelected);
//   };
//   const handleChangeControlled = (idx) => {
//     console.log(`handleChangeControlled`);
//     console.log(`controlled clicked ${idx}`);
//   };

//   const moveUp = () => {
//     setHilitedIdx((val) => Math.max(0, val - 1));
//   };

//   const selectCurrent = () => {
//     const [selectedIdx] = selected;
//     const newSelection =
//       selectedIdx === hilitedIdx || hilitedIdx === -1 ? [] : [hilitedIdx];
//     setSelected(newSelection);
//   };

//   const moveDown = () => {
//     setHilitedIdx((val) => Math.min(usa_states.length - 1, val + 1));
//   };

//   return (
//     <div style={{ height: 600 }}>
//       <div style={{ display: "flex", gap: 12 }}>
//         <Button onClick={moveDown}>Highlight down</Button>
//         <Button onClick={moveUp}>Highlight up</Button>
//         <Button onClick={selectCurrent}>Select</Button>
//       </div>
//       <div style={{ height: 600 }}>
//         <ListNext
//           id="controlled"
//           highlightedIdx={hilitedIdx}
//           selected={selected}
//           source={usa_states}
//           onChange={handleChangeControlled}
//         />
//       </div>
//     </div>
//   );
// };

// export const VirtualizedExample = () => {
//   const data = useMemo(() => {
//     const data = [];
//     for (let i = 0; i < 1000; i++) {
//       data.push(`Item ${i + 1}`);
//     }
//     return data;
//   }, []);

//   const style = {
//     "--hwList-max-height": "300px",
//     boxSizing: "content-box",
//     width: 200,
//   };

//   return (
//     <div style={style}>
//       <VirtualizedList source={data} />
//     </div>
//   );
// };

// export const DeclarativeList2 = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <>
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ListNext onChange={(value) => setSelectedValue(value)}>
//           <ListItem
//             onClick={() => console.log("click 1")}
//             style={{ backgroundColor: "red" }}
//           >
//             Value 1
//           </ListItem>
//           <ListItem>Value 2</ListItem>
//           <ListItem onClick={() => console.log("click 3")}>Value 3</ListItem>
//           <ListItem>Value 4</ListItem>
//         </ListNext>
//       </div>
//       <div>{usa_states[selectedValue]}</div>
//     </>
//   );
// };

// export const DeclarativeListUsingDivs = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <>
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ListNext onChange={(value) => setSelectedValue(value)}>
//           <div>
//             <span>Value 1</span>
//           </div>
//           <div>
//             <span>Value 2</span>
//           </div>
//           <div>Value 3</div>
//           <div>Value 4</div>
//         </ListNext>
//       </div>
//       <div>{usa_states[selectedValue]}</div>
//     </>
//   );
// };

// export const DeclarativeListWithHeadersUsingDivs = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <>
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ListNext
//           onChange={(value) => setSelectedValue(value)}
//           collapsibleHeaders
//         >
//           <div data-header label="Group 1" />
//           <div>
//             <span>Value 1</span>
//           </div>
//           <div>
//             <span>Value 2</span>
//           </div>
//           <div data-header>Group 2</div>
//           <div>Value 3</div>
//           <div>Value 4</div>
//         </ListNext>
//       </div>
//       <div>{usa_states[selectedValue]}</div>
//     </>
//   );
// };

// export const DeclarativeListWithGroups = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <>
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ListNext
//           onChange={(value) => setSelectedValue(value)}
//           collapsibleHeaders
//           stickyHeaders
//         >
//           <ListItemGroup title="Group 1">
//             <ListItem>Value 1.1</ListItem>
//             <ListItem>Value 1.2</ListItem>
//             <ListItem>Value 1.3</ListItem>
//             <ListItem>Value 1.4</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 2">
//             <ListItem>Value 2.1</ListItem>
//             <ListItem>Value 2.2</ListItem>
//             <ListItem>Value 2.3</ListItem>
//             <ListItem>Value 2.4</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 3">
//             <ListItem>Value 3.1</ListItem>
//             <ListItem>Value 3.2</ListItem>
//             <ListItem>Value 3.3</ListItem>
//             <ListItem>Value 3.4</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 4">
//             <ListItem>Value 4.1</ListItem>
//             <ListItem>Value 4.2</ListItem>
//             <ListItem>Value 4.3</ListItem>
//             <ListItem>Value 4.4</ListItem>
//             <ListItem>Value 4.5</ListItem>
//             <ListItem>Value 4.6</ListItem>
//             <ListItem>Value 4.7</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 5">
//             <ListItem>Value 5.1</ListItem>
//             <ListItem>Value 5.2</ListItem>
//             <ListItem>Value 5.3</ListItem>
//             <ListItem>Value 5.4</ListItem>
//           </ListItemGroup>
//         </ListNext>
//       </div>
//       <div>{usa_states[selectedValue]}</div>
//     </>
//   );
// };

// export const DeclarativeListWithNestedGroups = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <>
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ListNext
//           onChange={(value) => setSelectedValue(value)}
//           collapsibleHeaders
//           stickyHeaders
//         >
//           <ListItemGroup title="Group 1">
//             <ListItem>Value 1.1</ListItem>
//             <ListItem>Value 1.2</ListItem>
//             <ListItem>Value 1.3</ListItem>
//             <ListItem>Value 1.4</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 2">
//             <ListItemGroup title="Group 2.1">
//               <ListItem>Value 2.1.1</ListItem>
//               <ListItem>Value 2.1.2</ListItem>
//               <ListItem>Value 2.1.3</ListItem>
//               <ListItem>Value 2.1.4</ListItem>
//             </ListItemGroup>
//             <ListItem>Value 2.2</ListItem>
//             <ListItem>Value 2.3</ListItem>
//             <ListItem>Value 2.4</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 3">
//             <ListItem>Value 3.1</ListItem>
//             <ListItem>Value 3.2</ListItem>
//             <ListItem>Value 3.3</ListItem>
//             <ListItem>Value 3.4</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 4">
//             <ListItem>Value 4.1</ListItem>
//             <ListItem>Value 4.2</ListItem>
//             <ListItem>Value 4.3</ListItem>
//             <ListItem>Value 4.4</ListItem>
//             <ListItem>Value 4.5</ListItem>
//             <ListItem>Value 4.6</ListItem>
//             <ListItem>Value 4.7</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 5">
//             <ListItem>Value 5.1</ListItem>
//             <ListItem>Value 5.2</ListItem>
//             <ListItem>Value 5.3</ListItem>
//             <ListItem>Value 5.4</ListItem>
//           </ListItemGroup>
//         </ListNext>
//       </div>
//       <div>{usa_states[selectedValue]}</div>
//     </>
//   );
// };

// export const DeclarativeListWithHeaders = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <>
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ListNext
//           stickyHeaders
//           collapsibleHeaders
//           onChange={(value) => setSelectedValue(value)}
//         >
//           <ListItemHeader id="1">Group 1</ListItemHeader>
//           <ListItem>Value 1.1</ListItem>
//           <ListItem>Value 1.2</ListItem>
//           <ListItem>Value 1.3</ListItem>
//           <ListItem>Value 1.4</ListItem>
//           <ListItemHeader id="2">Group 2</ListItemHeader>
//           <ListItem>Value 2.1</ListItem>
//           <ListItem>Value 2.2</ListItem>
//           <ListItem>Value 2.3</ListItem>
//           <ListItem>Value 2.4</ListItem>
//           <ListItemHeader id="3">Group 3</ListItemHeader>
//           <ListItem>Value 3.1</ListItem>
//           <ListItem>Value 3.2</ListItem>
//           <ListItem>Value 3.3</ListItem>
//           <ListItem>Value 3.4</ListItem>
//         </ListNext>
//       </div>
//       <div>{usa_states[selectedValue]}</div>
//     </>
//   );
// };

// export const SimpleListDelayedContent = () => {
//   const [source, setSource] = useState([]);

//   const loadSource = () => {
//     console.log("load source");
//     setSource(usa_states);
//   };

//   return (
//     <div
//       style={{
//         alignItems: "flex-start",
//         display: "flex",
//         flexDirection: "column",
//         gap: 6,
//         ...fullWidthHeight,
//       }}
//     >
//       <Button onClick={loadSource}>Load States</Button>
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <ListNext source={source} />
//       </div>
//     </div>
//   );
// };
