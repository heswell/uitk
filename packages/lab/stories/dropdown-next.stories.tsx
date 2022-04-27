import { useCallback, useRef } from "react";
import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import {
  DoubleChevronDownIcon,
  DoubleChevronUpIcon,
} from "@jpmorganchase/uitk-icons";
// import { ComponentAnatomy } from "docs/components/ComponentAnatomy";

import { Button } from "@jpmorganchase/uitk-core";
import { OverflowMenuIcon } from "@jpmorganchase/uitk-icons";
import {
  DropdownNext as Dropdown,
  DropdownList,
  DropdownButtonNext,
} from "@jpmorganchase/uitk-lab";
import { usa_states } from "./list-next.data";

import { useState, FC, ChangeEvent } from "react";

import {
  objectOptionsExampleData,
  objectOptionType,
  usStateExampleData,
} from "./exampleData";
import { Story, ComponentStory, ComponentMeta } from "@storybook/react";
import { SelectionChangeHandler } from "../src/common-hooks";

export default {
  title: "Experimental/Dropdown Next",
  component: Dropdown,
} as ComponentMeta<typeof Dropdown>;

export const DefaultDropdown: ComponentStory<typeof Dropdown> = () => {
  const handleChange = (isOpen: boolean) => {
    console.log("isOpen changed", isOpen);
  };

  const callbackRef = (el: HTMLDivElement) => {
    console.log(`ref on Button set to ${el.className}`);
  };
  return (
    <div style={{ display: "flex", gap: 20 }}>
      <Dropdown onOpenChange={handleChange} style={{ width: 180 }}>
        <DropdownButtonNext label="Bottom Start " ref={callbackRef} />
        <div style={{ backgroundColor: "red", width: 200, height: 100 }} />
      </Dropdown>
      <Dropdown
        onOpenChange={handleChange}
        placement="bottom-end"
        style={{ width: 180 }}
      >
        <DropdownButtonNext label="Bottom End" />
        <div style={{ backgroundColor: "red", width: 200, height: 100 }} />
      </Dropdown>
    </div>
  );
};

export const ControlledDropdown: ComponentStory<typeof Dropdown> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleChange: any = (open: boolean) => {
    setIsOpen(open);
  };

  const showDropdown = () => {
    setIsOpen(true);
  };
  const hideDropdown = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={showDropdown}>Show</Button>
      <Button onClick={hideDropdown}>Hide</Button>
      <Dropdown
        onOpenChange={handleChange}
        isOpen={isOpen}
        style={{ width: 180 }}
      >
        <DropdownButtonNext label="Click Here" />
        <div style={{ backgroundColor: "red", width: 200, height: 100 }} />
      </Dropdown>
    </>
  );
};

export const DefaultDropdownList: ComponentStory<typeof Dropdown> = () => {
  const handleChange: SelectionChangeHandler = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
  };
  return (
    <DropdownList
      defaultIsOpen
      id="test"
      onSelectionChange={handleChange}
      source={["Bar", "Foo", "Foo Bar", "Baz"]}
    />
  );
};

export const DisabledDropdownList: ComponentStory<typeof Dropdown> = () => {
  const handleChange: SelectionChangeHandler = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
  };
  return (
    <DropdownList
      disabled
      id="test"
      onSelectionChange={handleChange}
      source={["Bar", "Foo", "Foo Bar", "Baz"]}
      style={{ width: 180 }}
    />
  );
};

export const DropdownListCustomButton = () => {
  const handleChange: SelectionChangeHandler = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
  };
  return (
    <DropdownList
      defaultSelected={"Alaska"}
      onSelectionChange={handleChange}
      placement="bottom-end"
      source={usa_states}
      triggerComponent={
        <Button variant="secondary">
          <OverflowMenuIcon />
        </Button>
      }
    ></DropdownList>
  );
};

export const MultiSelectDropdownExample = () => {
  const handleChange: SelectionChangeHandler<string, "multiple"> = (
    _e,
    [items]
  ) => {
    console.log({ selected: items });
  };
  return (
    <DropdownList
      defaultSelected={["Alaska", "Arkansas"]}
      onSelectionChange={handleChange}
      selectionStrategy="multiple"
      source={usa_states}
      style={{ width: 180 }}
    />
  );
};

MultiSelectDropdownExample.storyName = "Multi Select Dropdown";

export const ControlledOpenDropdown = () => {
  const [isOpen, setIsOpen] = useState(true);
  const handleChange: any = (open: boolean) => {
    console.log({ openChanged: open });
  };
  const toggleDropdown = useCallback(() => {
    console.log(`toggleDropdoen isOpen = ${isOpen}`);
    setIsOpen(!isOpen);
  }, [isOpen]);
  return (
    <>
      <Button onClick={toggleDropdown}>
        {isOpen ? "Hide Dropdown" : "Show Dropdown"}
      </Button>
      <DropdownList
        isOpen={isOpen}
        defaultSelected="Alaska"
        onOpenChange={handleChange}
        source={usa_states}
        style={{ width: 180 }}
      />
    </>
  );
};
